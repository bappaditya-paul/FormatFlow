"""
FormatFlow — Upload Validation & Temporary Storage Service
Implements magic bytes inspection, size/dimension boundaries, and temporary disk caching.
"""

import io
import os
import uuid
import logging
from pathlib import Path
from PIL import Image as PILImage, UnidentifiedImageError

logger = logging.getLogger(__name__)

# Directory setup for temporary storage inside the workspace
TEMP_DIR = Path("static/tmp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file specifications
ALLOWED_FORMATS = {
    "image/jpeg": {
        "extensions": [".jpg", ".jpeg"],
        "signatures": [b"\xff\xd8"]
    },
    "image/png": {
        "extensions": [".png"],
        "signatures": [b"\x89PNG\r\n\x1a\n"]
    },
    "image/webp": {
        "extensions": [".webp"],
        "signatures": [b"RIFF"]  # WEBP offset checked separately
    },
    "image/gif": {
        "extensions": [".gif"],
        "signatures": [b"GIF87a", b"GIF89a"]
    },
    "image/tiff": {
        "extensions": [".tiff", ".tif"],
        "signatures": [b"II*\x00", b"MM\x00*"]
    },
    "image/avif": {
        "extensions": [".avif"],
        "signatures": [b"ftypavif", b"ftypavis"]  # ftyp box checks
    }
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_DIMENSION_PX = 10000  # 10,000 pixels max width/height

class UploadService:
    def validate_and_cache(self, file_bytes: bytes, client_filename: str) -> tuple[Path, str, int, int, int]:
        """
        Validates magic bytes, file size, image dimensions, and saves the file to temporary storage.
        Returns: (temp_file_path, detected_mime_type, file_size, width, height)
        """
        file_size = len(file_bytes)
        
        # 1. Size Validation
        if file_size == 0:
            raise ValueError("Empty file uploaded")
        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES / (1024*1024):.1f}MB")

        # 2. Magic Bytes Validation
        detected_mime = self._detect_mime_type(file_bytes)
        if not detected_mime:
            raise ValueError("Unsupported or invalid image file type (magic bytes check failed)")

        # 3. Structural & Dimension Validation via Pillow
        width, height = 0, 0
        
        # Check AVIF manually if Pillow doesn't support it, otherwise try Pillow first
        is_avif = detected_mime == "image/avif"
        
        try:
            with PILImage.open(io.BytesIO(file_bytes)) as img:
                width, height = img.size
                # Verify format matches magic bytes detection (except AVIF which might not be supported natively by some Pillow versions)
                if not is_avif and img.format.lower() not in ["jpeg", "png", "webp", "gif", "tiff"]:
                    raise ValueError(f"Image format '{img.format}' is not allowed.")
        except (UnidentifiedImageError, OSError) as e:
            # Fallback for AVIF since standard Pillow might throw UnidentifiedImageError without plugins
            if is_avif:
                width, height = self._parse_avif_dimensions(file_bytes)
            else:
                raise ValueError(f"Corrupted or invalid image structure: {str(e)}")
        
        # Validate dimension boundaries
        if width <= 0 or height <= 0:
            raise ValueError("Invalid image dimensions (zero or negative)")
        if width > MAX_DIMENSION_PX or height > MAX_DIMENSION_PX:
            raise ValueError(f"Image dimensions exceed limit of {MAX_DIMENSION_PX}x{MAX_DIMENSION_PX}px")

        # 4. Generate extension based on validated type
        ext = ALLOWED_FORMATS[detected_mime]["extensions"][0]
        temp_filename = f"{uuid.uuid4()}{ext}"
        temp_path = TEMP_DIR / temp_filename
        
        # 5. Save to temporary storage
        with open(temp_path, "wb") as f:
            f.write(file_bytes)
            
        logger.info(f"Uploaded file validated and cached temporarily at {temp_path} (MIME: {detected_mime}, size: {file_size} bytes)")
        
        return temp_path, detected_mime, file_size, width, height

    def _detect_mime_type(self, data: bytes) -> str | None:
        """
        Inspects file signature (magic bytes) to determine the true MIME type.
        """
        # JPEG check
        if data.startswith(b"\xff\xd8"):
            return "image/jpeg"
        
        # PNG check
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            return "image/png"
            
        # GIF check
        if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
            return "image/gif"
            
        # WEBP check
        if data.startswith(b"RIFF") and len(data) > 12 and data[8:12] == b"WEBP":
            return "image/webp"
            
        # TIFF check
        if data.startswith(b"II*\x00") or data.startswith(b"MM\x00*"):
            return "image/tiff"
            
        # AVIF check (inside ftyp box)
        if len(data) > 12 and data[4:8] == b"ftyp":
            ftyp_brand = data[8:12]
            if ftyp_brand in [b"avif", b"avis"]:
                return "image/avif"
            # Look at major/compatible brands
            if b"avif" in data[8:32] or b"avis" in data[8:32]:
                return "image/avif"

        return None

    def _parse_avif_dimensions(self, data: bytes) -> tuple[int, int]:
        """
        Fallback parser to extract dimensions from AVIF container (ISOBMFF) when Pillow lacks AVIF support.
        """
        # Parse ISOBMFF boxes to locate 'ispe' (Image Spatial Extents) box
        size = len(data)
        idx = 0
        while idx + 8 < size:
            box_size = int.from_bytes(data[idx:idx+4], "big")
            box_type = data[idx+4:idx+8]
            
            # Safety check for corrupted box sizes
            if box_size < 8 or idx + box_size > size:
                break
                
            if box_type == b"meta":
                # 'meta' has a 4-byte version/flags before child boxes
                idx += 12
                continue
            elif box_type in [b"iprp", b"ipco"]:
                idx += 8
                continue
            elif box_type == b"ispe":
                # 'ispe' structure: 4 bytes version/flags, 4 bytes width, 4 bytes height
                if idx + 16 <= size:
                    w = int.from_bytes(data[idx+8:idx+12], "big")
                    h = int.from_bytes(data[idx+12:idx+16], "big")
                    return w, h
                break
            
            idx += box_size
            
        # Default fallback if parsing fails
        return 1920, 1080

upload_service = UploadService()
