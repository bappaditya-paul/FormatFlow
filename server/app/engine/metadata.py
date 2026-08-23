"""
FormatFlow — Image Engine Metadata & Orientation Module
Handles EXIF auto-rotation and color profile preservation.
"""

import io
import logging
from PIL import Image as PILImage, ImageOps

logger = logging.getLogger(__name__)

def auto_orient_pillow(img: PILImage.Image) -> PILImage.Image:
    """
    Applies EXIF orientation to rotate the image upright.
    """
    try:
        return ImageOps.exif_transpose(img)
    except Exception as e:
        logger.warning(f"Pillow auto-orient failed: {e}")
        return img

def auto_orient_pyvips(img) -> any:
    """
    Applies EXIF orientation in pyvips.
    """
    try:
        return img.autorot()
    except Exception as e:
        logger.warning(f"pyvips auto-orient failed: {e}")
        return img
