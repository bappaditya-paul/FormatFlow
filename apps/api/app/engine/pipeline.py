"""
FormatFlow — Transformation Engine Pipeline
Combines high-performance pyvips logic with a robust PIL/Pillow fallback.
"""

import io
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

# Try to import pyvips, but catch failures when libvips system library is missing
PYVIPS_AVAILABLE = False
try:
    import pyvips
    PYVIPS_AVAILABLE = True
except Exception as e:
    logger.warning(f"pyvips not available: {e}. Falling back to Pillow for image transformations.")

# Import Pillow (always available as fallback)
from PIL import Image as PILImage

class FitMode(str, Enum):
    COVER = "cover"
    CONTAIN = "contain"
    CROP = "crop"
    FIT = "fit"

class OutputFormat(str, Enum):
    JPEG = "jpeg"
    PNG = "png"
    WEBP = "webp"
    AVIF = "avif"

@dataclass
class TransformConfig:
    target_width: int
    target_height: int
    fit_mode: FitMode = FitMode.COVER
    output_format: OutputFormat = OutputFormat.WEBP
    quality: int = 85

@dataclass
class TransformResult:
    data: bytes
    width: int
    height: int
    format: str
    size_bytes: int

class TransformationPipeline:
    def process(self, image_bytes: bytes, config: TransformConfig) -> TransformResult:
        """
        Processes image bytes using pyvips if available, otherwise falling back to Pillow.
        """
        if PYVIPS_AVAILABLE:
            try:
                return self._process_pyvips(image_bytes, config)
            except Exception as e:
                logger.error(f"pyvips processing failed: {e}. Falling back to Pillow.")
        
        return self._process_pillow(image_bytes, config)

    def _process_pillow(self, image_bytes: bytes, config: TransformConfig) -> TransformResult:
        """
        PIL/Pillow transformation implementation.
        """
        img = PILImage.open(io.BytesIO(image_bytes))
        
        # Keep original transparency if PNG/WebP, otherwise convert to RGB
        if img.mode in ("RGBA", "LA", "P") and config.output_format in (OutputFormat.PNG, OutputFormat.WEBP, OutputFormat.AVIF):
            pass
        else:
            img = img.convert("RGB")
            
        orig_w, orig_h = img.size
        tar_w, tar_h = config.target_width, config.target_height

        # Fit Mode processing
        if config.fit_mode == FitMode.FIT:
            # Stretch to fit
            img = img.resize((tar_w, tar_h), PILImage.Resampling.LANCZOS)
        
        elif config.fit_mode == FitMode.COVER:
            # Scale to cover target, crop center
            ratio_w = tar_w / orig_w
            ratio_h = tar_h / orig_h
            scale = max(ratio_w, ratio_h)
            
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            img = img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
            
            # Crop
            left = (new_w - tar_w) // 2
            top = (new_h - tar_h) // 2
            img = img.crop((left, top, left + tar_w, top + tar_h))
            
        elif config.fit_mode == FitMode.CONTAIN:
            # Fit inside boundaries with padded background
            ratio_w = tar_w / orig_w
            ratio_h = tar_h / orig_h
            scale = min(ratio_w, ratio_h)
            
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            img = img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
            
            # Create background canvas
            background_color = (0, 0, 0, 0) if img.mode == "RGBA" else (240, 240, 240)
            canvas = PILImage.new(img.mode, (tar_w, tar_h), background_color)
            
            # Paste scaled image in center
            left = (tar_w - new_w) // 2
            top = (tar_h - new_h) // 2
            canvas.paste(img, (left, top))
            img = canvas
            
        elif config.fit_mode == FitMode.CROP:
            # Simple center crop to match aspect ratio, then scale
            tar_ratio = tar_w / tar_h
            orig_ratio = orig_w / orig_h
            
            if orig_ratio > tar_ratio:
                # Source is wider, crop left/right
                crop_w = int(orig_h * tar_ratio)
                left = (orig_w - crop_w) // 2
                img = img.crop((left, 0, left + crop_w, orig_h))
            else:
                # Source is taller, crop top/bottom
                crop_h = int(orig_w / tar_ratio)
                top = (orig_h - crop_h) // 2
                img = img.crop((0, top, orig_w, top + crop_h))
                
            img = img.resize((tar_w, tar_h), PILImage.Resampling.LANCZOS)

        # Output conversion & save
        out_buf = io.BytesIO()
        fmt_str = config.output_format.value.upper()
        
        # Match output format
        if fmt_str == "JPEG":
            fmt_str = "JPEG"
        elif fmt_str == "WEBP":
            fmt_str = "WEBP"
        elif fmt_str == "AVIF":
            fmt_str = "AVIF"
            
        save_kwargs = {}
        if fmt_str in ("JPEG", "WEBP", "AVIF"):
            save_kwargs["quality"] = config.quality
            
        img.save(out_buf, format=fmt_str, **save_kwargs)
        processed_data = out_buf.getvalue()
        
        return TransformResult(
            data=processed_data,
            width=img.width,
            height=img.height,
            format=config.output_format.value,
            size_bytes=len(processed_data)
        )

    def _process_pyvips(self, image_bytes: bytes, config: TransformConfig) -> TransformResult:
        """
        High-performance pyvips transformation implementation.
        """
        # Load image from bytes buffer
        loader = pyvips.Image.new_from_buffer(image_bytes, "")
        
        # Keep clean color profiles & auto-orient based on EXIF tag
        img = loader.autorot
        
        orig_w = img.width
        orig_h = img.height
        tar_w, tar_h = config.target_width, config.target_height

        # Fit Mode processing
        if config.fit_mode == FitMode.FIT:
            img = img.resize(tar_w / orig_w, vscale=tar_h / orig_h)
            
        elif config.fit_mode == FitMode.COVER:
            scale = max(tar_w / orig_w, tar_h / orig_h)
            img = img.resize(scale)
            # Crop center
            left = (img.width - tar_w) // 2
            top = (img.height - tar_h) // 2
            img = img.crop(left, top, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.CONTAIN:
            scale = min(tar_w / orig_w, tar_h / orig_h)
            img = img.resize(scale)
            
            # Pad canvas to match targets
            left = (tar_w - img.width) // 2
            top = (tar_h - img.height) // 2
            img = img.embed(
                left, top, tar_w, tar_h,
                extend="background",
                background=[240, 240, 240]
            )
            
        elif config.fit_mode == FitMode.CROP:
            tar_ratio = tar_w / tar_h
            orig_ratio = orig_w / orig_h
            
            if orig_ratio > tar_ratio:
                crop_w = int(orig_h * tar_ratio)
                left = (orig_w - crop_w) // 2
                img = img.crop(left, 0, crop_w, orig_h)
            else:
                crop_h = int(orig_w / tar_ratio)
                top = (orig_h - crop_h) // 2
                img = img.crop(0, top, orig_w, crop_h)
                
            img = img.resize(tar_w / img.width, vscale=tar_h / img.height)

        # Output conversion & save
        ext = f".{config.output_format.value}"
        save_options = {}
        if config.output_format in (OutputFormat.JPEG, OutputFormat.WEBP, OutputFormat.AVIF):
            save_options["Q"] = config.quality
            
        processed_data = img.write_to_buffer(ext, **save_options)
        
        return TransformResult(
            data=processed_data,
            width=tar_w,
            height=tar_h,
            format=config.output_format.value,
            size_bytes=len(processed_data)
        )
