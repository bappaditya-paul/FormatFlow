import io
import time
import base64
from PIL import Image, ImageOps
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.core.storage import save_raw_file, save_processed_file
from app.schemas.transformation import (
    TransformationResponse,
    BatchTransformationResponse,
    VariantItem,
    ExpansionMethod,
    OutputFormat
)
from app.ml.image_utils import (
    process_image,
    expand_with_opencv,
    resize_with_algorithm
)

# Register HEIC / HEIF opener for iPhone camera photos
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

router = APIRouter()

def load_image_safely(raw_bytes: bytes) -> Image.Image:
    """Safely decodes image bytes, handling Base64 headers, HEIC/HEIF (iPhone), EXIF rotation, and fallback formats."""
    if not raw_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image file uploaded. Please select a valid photo."
        )

    # Handle base64 ASCII strings uploaded from mobile webviews / canvas data URLs
    try:
        header_sample = raw_bytes[:100].decode("utf-8", errors="ignore").strip()
        if "base64," in header_sample:
            base64_str = raw_bytes.split(b"base64,")[-1]
            raw_bytes = base64.b64decode(base64_str)
        elif header_sample.startswith("data:") or header_sample.startswith("/9j/") or header_sample.startswith("iVBORw0KG"):
            try:
                raw_bytes = base64.b64decode(raw_bytes)
            except Exception:
                pass
    except Exception:
        pass

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img = ImageOps.exif_transpose(img)
        return img.convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot identify image file. Please upload a valid PNG, JPG, WEBP, or HEIC photo. ({str(e)})"
        )

def encode_image_bytes(img: Image.Image, output_format: str = "PNG") -> bytes:
    """Encodes a PIL image into bytes according to output_format (PNG, JPEG, WEBP)."""
    fmt = output_format.upper().strip()
    if fmt in ["JPG", "JPEG"]:
        save_fmt = "JPEG"
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
    elif fmt == "WEBP":
        save_fmt = "WEBP"
    else:
        save_fmt = "PNG"

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format=save_fmt, quality=95)
    return img_byte_arr.getvalue()

@router.post(
    "/transform",
    response_model=TransformationResponse,
    status_code=status.HTTP_200_OK,
    summary="Universal Image Transformation Engine",
    description="Transforms image dimensions via OpenCV borders (Replicate/Reflect/Wrap), Manual Resizing (Nearest/Bilinear), or Generative AI Outpainting (Stable Diffusion)."
)
async def transform_image(
    file: UploadFile = File(..., description="Uploaded source image file (PNG, JPEG, WebP)"),
    target_w: int = Form(768, description="Target canvas width in pixels"),
    target_h: int = Form(768, description="Target canvas height in pixels"),
    expansion_method: ExpansionMethod = Form(
        ExpansionMethod.BORDER_REPLICATE,
        description="Transformation mode: 'Border: Replicate', 'Border: Reflect', 'Border: Wrap', 'Resize: Nearest Neighbor', 'Resize: Bilinear', or 'AI Outpainting'"
    ),
    output_format: OutputFormat = Form(
        OutputFormat.PNG,
        description="Output image format: PNG, JPEG, or WEBP"
    ),
    prompt: str = Form("high quality seamless extension", description="Text description for AI Outpainting"),
    negative_prompt: str = Form("blurry, low quality, distorted, watermark", description="Negative prompt for AI Outpainting"),
    num_inference_steps: int = Form(50, description="Diffusion steps for AI Outpainting"),
    guidance_scale: float = Form(7.5, description="Classifier-free guidance scale for AI Outpainting")
):
    """Unified Image Transformation API Route."""
    start_time = time.perf_counter()
    try:
        raw_bytes = await file.read()
        if not raw_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file uploaded. Please select a valid image."
            )

        filename = file.filename or "uploaded_image.png"
        file_id, _ = save_raw_file(raw_bytes, filename)

        init_image = load_image_safely(raw_bytes)
        orig_w, orig_h = init_image.size
        method_str = expansion_method.value
        action_taken = "transform"

        if target_w <= orig_w and target_h <= orig_h:
            result_img = init_image.resize((target_w, target_h), Image.LANCZOS)
            action_taken = "shrink"

        elif method_str.startswith("Resize:"):
            algo = "nearest" if "Nearest" in method_str else "bilinear"
            result_img, _ = resize_with_algorithm(init_image, target_w, target_h, algo)
            action_taken = f"resize_{algo}"

        elif method_str.startswith("Border:"):
            border_mode = method_str.split(": ")[-1].lower()
            result_img = expand_with_opencv(init_image, target_w, target_h, border_mode)
            action_taken = f"border_{border_mode}"

        else:
            if not prompt.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A text prompt is required when using AI Outpainting."
                )

            from app.ml.ai_model import get_inpainting_model
            model = get_inpainting_model()

            proc_data = process_image(init_image, target_w, target_h)
            
            output = model.generate(
                image=proc_data["model_input"],
                mask=proc_data["model_mask"],
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                target_size=proc_data["target_size"]
            )

            output.paste(init_image, proc_data["offset"])
            result_img = output
            action_taken = "ai_outpaint"

        processed_bytes = encode_image_bytes(result_img, output_format.value)
        _, public_url = save_processed_file(processed_bytes, file_id, extension=output_format.value)

        elapsed = round(time.perf_counter() - start_time, 4)

        return TransformationResponse(
            status="success",
            output_url=public_url,
            file_id=file_id,
            action_taken=action_taken,
            target_width=target_w,
            target_height=target_h,
            expansion_method=method_str,
            execution_time_seconds=elapsed,
            output_format=output_format.value,
            message=f"Successfully processed image via {method_str} in {elapsed}s"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transformation Error: {str(e)}"
        )


@router.post(
    "/transform/batch",
    response_model=BatchTransformationResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Expansion Engine (All 5 Non-AI Methods)",
    description="Generates all 5 expansion variations (Resize: Nearest Neighbor, Resize: Bilinear, Border: Replicate, Border: Reflect, Border: Wrap) in a single ultra-fast execution (<0.1s)."
)
async def transform_image_batch(
    file: UploadFile = File(..., description="Uploaded source image file"),
    target_w: int = Form(768, description="Target canvas width in pixels"),
    target_h: int = Form(768, description="Target canvas height in pixels"),
    output_format: OutputFormat = Form(
        OutputFormat.PNG,
        description="Output image format: PNG, JPEG, or WEBP"
    )
):
    """Processes all 5 non-AI expansion methods in parallel/batch."""
    batch_start = time.perf_counter()
    try:
        raw_bytes = await file.read()
        if not raw_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file uploaded."
            )

        filename = file.filename or "uploaded_image.png"
        file_id, _ = save_raw_file(raw_bytes, filename)
        init_image = load_image_safely(raw_bytes)
        orig_w, orig_h = init_image.size

        # Define all 5 non-AI expansion methods
        methods_to_run = [
            ("Resize: Nearest Neighbor", "resize_nearest"),
            ("Resize: Bilinear", "resize_bilinear"),
            ("Border: Replicate", "border_replicate"),
            ("Border: Reflect", "border_reflect"),
            ("Border: Wrap", "border_wrap")
        ]

        variant_results = []

        for method_name, slug in methods_to_run:
            var_start = time.perf_counter()
            
            if target_w <= orig_w and target_h <= orig_h:
                res_img = init_image.resize((target_w, target_h), Image.LANCZOS)
                action = "shrink"
            elif method_name == "Resize: Nearest Neighbor":
                res_img, _ = resize_with_algorithm(init_image, target_w, target_h, "nearest")
                action = "resize_nearest"
            elif method_name == "Resize: Bilinear":
                res_img, _ = resize_with_algorithm(init_image, target_w, target_h, "bilinear")
                action = "resize_bilinear"
            elif method_name == "Border: Replicate":
                res_img = expand_with_opencv(init_image, target_w, target_h, "replicate")
                action = "border_replicate"
            elif method_name == "Border: Reflect":
                res_img = expand_with_opencv(init_image, target_w, target_h, "reflect")
                action = "border_reflect"
            else:  # Border: Wrap
                res_img = expand_with_opencv(init_image, target_w, target_h, "wrap")
                action = "border_wrap"

            var_bytes = encode_image_bytes(res_img, output_format.value)
            _, pub_url = save_processed_file(var_bytes, file_id, extension=output_format.value, suffix=slug)
            var_elapsed = round(time.perf_counter() - var_start, 4)

            variant_results.append(
                VariantItem(
                    expansion_method=method_name,
                    output_url=pub_url,
                    action_taken=action,
                    execution_time_seconds=var_elapsed
                )
            )

        total_elapsed = round(time.perf_counter() - batch_start, 4)

        return BatchTransformationResponse(
            status="success",
            file_id=file_id,
            target_width=target_w,
            target_height=target_h,
            output_format=output_format.value,
            total_execution_time_seconds=total_elapsed,
            variants=variant_results,
            message=f"Generated {len(variant_results)} variants in {total_elapsed}s"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch Transformation Error: {str(e)}"
        )

