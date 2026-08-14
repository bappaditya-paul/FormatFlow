"""
FormatFlow — Image Engine Compression Module
Optimizes encoding, applies target qualities, and outputs binary files.
"""

import io
import logging
from PIL import Image as PILImage

logger = logging.getLogger(__name__)

def compress_pillow(img: PILImage.Image, output_format: str, quality: int) -> bytes:
    """
    Saves and compresses Pillow image into bytes.
    """
    out_buf = io.BytesIO()
    fmt = output_format.lower()
    
    # Map to Pillow formats
    pillow_format = "JPEG"
    if fmt == "png":
        pillow_format = "PNG"
    elif fmt == "webp":
        pillow_format = "WEBP"
    elif fmt == "avif":
        pillow_format = "AVIF"
    elif fmt == "gif":
        pillow_format = "GIF"
    elif fmt == "tiff":
        pillow_format = "TIFF"
        
    save_kwargs = {}
    if pillow_format in ["JPEG", "WEBP", "AVIF"]:
        save_kwargs["quality"] = quality
        
    # Extra performance optimizations for Pillow exports
    if pillow_format == "JPEG":
        save_kwargs["optimize"] = True
        save_kwargs["progressive"] = True
    elif pillow_format == "PNG":
        save_kwargs["optimize"] = True
        
    img.save(out_buf, format=pillow_format, **save_kwargs)
    return out_buf.getvalue()

def compress_pyvips(img, output_format: str, quality: int) -> bytes:
    """
    Saves and compresses pyvips image into bytes.
    """
    fmt = output_format.lower()
    ext = f".{fmt}"
    
    save_options = {}
    if fmt in ["jpeg", "jpg"]:
        save_options["Q"] = quality
        save_options["optimize_coding"] = True
        save_options["interlace"] = True  # progressive loading
    elif fmt == "webp":
        save_options["Q"] = quality
        save_options["effort"] = 4  # default balanced compression speed/size
    elif fmt == "avif":
        save_options["Q"] = quality
        save_options["effort"] = 4
        
    return img.write_to_buffer(ext, **save_options)
