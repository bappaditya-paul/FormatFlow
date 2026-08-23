"""
FormatFlow — Image Engine Format Conversion Module
Prepares image color profiles and handles alpha channels.
"""

import logging
from PIL import Image as PILImage

logger = logging.getLogger(__name__)

def prepare_pillow_format(img: PILImage.Image, output_format: str) -> PILImage.Image:
    """
    Cleans up Pillow transparency channels based on destination format.
    """
    fmt = output_format.lower()
    
    # JPEG does not support transparency. Flatten with a clean background.
    if fmt in ["jpeg", "jpg"]:
        if img.mode in ("RGBA", "LA", "P"):
            background = PILImage.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.convert("RGBA").split()[3]) # paste using alpha channel mask
            return background
        return img.convert("RGB")
        
    # PNG, WEBP, AVIF support transparency
    if img.mode in ("RGBA", "LA"):
        return img
    elif img.mode == "P":
        return img.convert("RGBA")
        
    return img

def prepare_pyvips_format(img, output_format: str) -> any:
    """
    Cleans up pyvips transparency channels based on destination format.
    """
    fmt = output_format.lower()
    
    # JPEG does not support transparency. Flatten with white background.
    if fmt in ["jpeg", "jpg"]:
        if img.hasalpha:
            # Flatten alpha channel
            background = [255, 255, 255]
            return img.flatten(background=background)
        return img
        
    return img
