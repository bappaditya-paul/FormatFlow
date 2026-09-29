"""
Lazy-loaded Stable Diffusion Inpainting model manager.
"""

import os
import torch
from PIL import Image
from diffusers import StableDiffusionInpaintPipeline
from typing import Optional

_model_instance: Optional["InpaintingModel"] = None

def get_inpainting_model() -> "InpaintingModel":
    """Lazy-loads and returns the singleton InpaintingModel instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = InpaintingModel()
    return _model_instance

class InpaintingModel:
    MODEL_ID: str = "runwayml/stable-diffusion-inpainting"
    LOCAL_MODEL_PATH: str = "./models/runwayml/stable-diffusion-inpainting"

    def __init__(self) -> None:
        self.device: str = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if self.device == "cuda" else torch.float32

        if os.path.exists(self.LOCAL_MODEL_PATH):
            model_path = self.LOCAL_MODEL_PATH
            print(f"[ai_model] Loading local model from: {model_path}")
        else:
            model_path = self.MODEL_ID
            print(f"[ai_model] Loading model from HuggingFace: {model_path}")

        print(f"[ai_model] Running on Device: {self.device} | Dtype: {dtype}")

        self.pipe = StableDiffusionInpaintPipeline.from_pretrained(
            model_path,
            torch_dtype=dtype,
        )
        self.pipe = self.pipe.to(self.device)

        if self.device == "cuda":
            self.pipe.enable_attention_slicing()

        print("[ai_model] Model successfully pre-warmed & ready.")

    def generate(
        self,
        image: Image.Image,
        mask: Image.Image,
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_inference_steps: int = 50,
        guidance_scale: float = 7.5,
        target_size: Optional[tuple] = None,
    ) -> Image.Image:
        image = image.convert("RGB")
        mask = mask.convert("RGB")

        if negative_prompt is None or not negative_prompt.strip():
            negative_prompt = "blurry, low quality, distorted, artifacts, watermark, text, logo"

        print(f"[ai_model] Outpainting starting (steps: {num_inference_steps}, CFG: {guidance_scale})...")

        result = self.pipe(
            prompt=prompt,
            image=image,
            mask_image=mask,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            negative_prompt=negative_prompt,
        ).images[0]

        if target_size is not None:
            result = result.resize(target_size, Image.LANCZOS)

        print("[ai_model] Outpainting complete.")
        return result
