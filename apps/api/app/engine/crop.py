"""
FormatFlow — Image Engine Cropping Module
Provides crop box utilities and canvas padding support.
"""

import logging
from PIL import Image as PILImage

logger = logging.getLogger(__name__)

def crop_pillow(img: PILImage.Image, left: int, top: int, width: int, height: int) -> PILImage.Image:
    """
    Crops Pillow image to box boundaries.
    """
    return img.crop((left, top, left + width, top + height))

def crop_pyvips(img, left: int, top: int, width: int, height: int) -> any:
    """
    Crops pyvips image to box boundaries.
    """
    return img.crop(left, top, width, height)

def pad_pillow(img: PILImage.Image, target_width: int, target_height: int) -> PILImage.Image:
    """
    Pads the Pillow image to the target canvas size, centering it.
    """
    background_color = (0, 0, 0, 0) if img.mode == "RGBA" else (240, 240, 240)
    canvas = PILImage.new(img.mode, (target_width, target_height), background_color)
    
    left = (target_width - img.width) // 2
    top = (target_height - img.height) // 2
    canvas.paste(img, (left, top))
    return canvas

def pad_pyvips(img, target_width: int, target_height: int) -> any:
    """
    Pads the pyvips image to the target canvas size, centering it.
    """
    left = (target_width - img.width) // 2
    top = (target_height - img.height) // 2
    
    # Background color [r, g, b, a] or [r, g, b]
    bg_color = [0, 0, 0, 0] if img.hasalpha else [240, 240, 240]
    
    return img.embed(
        left, top, target_width, target_height,
        extend="background",
        background=bg_color
    )
