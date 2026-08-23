"""
FormatFlow — Image Engine Resizing Module
Handles high-quality scaling using Lanczos interpolation.
"""

import logging
from PIL import Image as PILImage

logger = logging.getLogger(__name__)

def resize_pillow(img: PILImage.Image, width: int, height: int) -> PILImage.Image:
    """
    Resizes Pillow image using Lanczos resampling.
    """
    return img.resize((width, height), PILImage.Resampling.LANCZOS)

def resize_pyvips(img, scale_x: float, scale_y: float = None) -> any:
    """
    Resizes pyvips image using a high-quality scaling factor.
    """
    if scale_y is None or scale_x == scale_y:
        return img.resize(scale_x)
    else:
        return img.resize(scale_x, vscale=scale_y)
