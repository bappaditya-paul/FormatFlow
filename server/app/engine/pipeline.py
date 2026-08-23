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
        from app.engine.metadata import auto_orient_pillow
        from app.engine.resize import resize_pillow
        from app.engine.crop import crop_pillow, pad_pillow
        from app.engine.format import prepare_pillow_format
        from app.engine.compression import compress_pillow

        # 1. Open and auto-orient
        img = PILImage.open(io.BytesIO(image_bytes))
        img = auto_orient_pillow(img)
        
        # 2. Resize / crop based on FitMode
        orig_w, orig_h = img.size
        tar_w, tar_h = config.target_width, config.target_height

        if config.fit_mode == FitMode.FIT:
            img = resize_pillow(img, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.COVER:
            ratio_w = tar_w / orig_w
            ratio_h = tar_h / orig_h
            scale = max(ratio_w, ratio_h)
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            img = resize_pillow(img, new_w, new_h)
            
            left = (new_w - tar_w) // 2
            top = (new_h - tar_h) // 2
            img = crop_pillow(img, left, top, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.CONTAIN:
            ratio_w = tar_w / orig_w
            ratio_h = tar_h / orig_h
            scale = min(ratio_w, ratio_h)
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            img = resize_pillow(img, new_w, new_h)
            img = pad_pillow(img, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.CROP:
            tar_ratio = tar_w / tar_h
            orig_ratio = orig_w / orig_h
            if orig_ratio > tar_ratio:
                crop_w = int(orig_h * tar_ratio)
                left = (orig_w - crop_w) // 2
                img = crop_pillow(img, left, 0, crop_w, orig_h)
            else:
                crop_h = int(orig_w / tar_ratio)
                top = (orig_h - crop_h) // 2
                img = crop_pillow(img, 0, top, orig_w, crop_h)
            img = resize_pillow(img, tar_w, tar_h)

        # 3. Format conversion
        img = prepare_pillow_format(img, config.output_format.value)

        # 4. Compression & export
        processed_data = compress_pillow(img, config.output_format.value, config.quality)
        
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
        from app.engine.metadata import auto_orient_pyvips
        from app.engine.resize import resize_pyvips
        from app.engine.crop import crop_pyvips, pad_pyvips
        from app.engine.format import prepare_pyvips_format
        from app.engine.compression import compress_pyvips

        # 1. Load image and auto-orient
        loader = pyvips.Image.new_from_buffer(image_bytes, "")
        img = auto_orient_pyvips(loader)
        
        orig_w = img.width
        orig_h = img.height
        tar_w, tar_h = config.target_width, config.target_height

        # 2. Resize / crop based on FitMode
        if config.fit_mode == FitMode.FIT:
            img = resize_pyvips(img, tar_w / orig_w, tar_h / orig_h)
            
        elif config.fit_mode == FitMode.COVER:
            scale = max(tar_w / orig_w, tar_h / orig_h)
            img = resize_pyvips(img, scale)
            left = (img.width - tar_w) // 2
            top = (img.height - tar_h) // 2
            img = crop_pyvips(img, left, top, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.CONTAIN:
            scale = min(tar_w / orig_w, tar_h / orig_h)
            img = resize_pyvips(img, scale)
            img = pad_pyvips(img, tar_w, tar_h)
            
        elif config.fit_mode == FitMode.CROP:
            tar_ratio = tar_w / tar_h
            orig_ratio = orig_w / orig_h
            if orig_ratio > tar_ratio:
                crop_w = int(orig_h * tar_ratio)
                left = (orig_w - crop_w) // 2
                img = crop_pyvips(img, left, 0, crop_w, orig_h)
            else:
                crop_h = int(orig_w / tar_ratio)
                top = (orig_h - crop_h) // 2
                img = crop_pyvips(img, 0, top, orig_w, crop_h)
            img = resize_pyvips(img, tar_w / img.width, tar_h / img.height)

        # 3. Format conversion
        img = prepare_pyvips_format(img, config.output_format.value)

        # 4. Compression & export
        processed_data = compress_pyvips(img, config.output_format.value, config.quality)
        
        return TransformResult(
            data=processed_data,
            width=tar_w,
            height=tar_h,
            format=config.output_format.value,
            size_bytes=len(processed_data)
        )
