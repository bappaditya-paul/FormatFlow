"""
FormatFlow — Image Service
Handles saving uploaded files, parsing metadata, and database operations.
"""

import uuid
import struct
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.image import Image
from app.schemas.image import ImageMetadata
from app.services.storage_service import storage_service

class ImageService:
    async def create_image(
        self, 
        db: AsyncSession, 
        file_bytes: bytes, 
        filename: str, 
        mime_type: str,
        width: int | None = None,
        height: int | None = None,
        format: str | None = None,
        orientation: int | None = None,
        color_profile: str | None = None,
        exif: dict | None = None
    ) -> Image:
        """
        Parses image metadata, saves raw file to storage, and registers the image in database.
        """
        # Parse dimensions if not provided
        if width is None or height is None:
            width, height = self._get_image_dimensions(file_bytes, mime_type)
        
        # Upload file to storage (R2 or Local)
        public_url = await storage_service.upload_file(file_bytes, filename, mime_type)
        
        # Extract storage key (the filename portion of the URL)
        storage_key = public_url.split("/")[-1]
        
        # Create DB record
        db_image = Image(
            id=uuid.uuid4(),
            original_filename=filename,
            storage_key=storage_key,
            mime_type=mime_type,
            width=width,
            height=height,
            file_size_bytes=len(file_bytes),
            public_url=public_url,
            format=format or mime_type.split("/")[-1],
            orientation=orientation or 1,
            color_profile=color_profile,
            exif=exif or {},
            created_at=datetime.utcnow()
        )
        
        db.add(db_image)
        await db.commit()
        await db.refresh(db_image)
        return db_image

    async def get_image(self, db: AsyncSession, image_id: uuid.UUID) -> Image | None:
        """
        Fetches an image by its ID.
        """
        result = await db.execute(select(Image).where(Image.id == image_id))
        return result.scalars().first()

    def _get_image_dimensions(self, data: bytes, mime_type: str) -> tuple[int, int]:
        """
        Parses dimensions from raw image headers (JPEG, PNG, WebP, GIF) without external library.
        """
        size = len(data)
        try:
            # PNG
            if mime_type == "image/png" or data.startswith(b"\x89PNG\r\n\x1a\n"):
                if size >= 24:
                    w, h = struct.unpack(">II", data[16:24])
                    return w, h

            # GIF
            elif mime_type == "image/gif" or data.startswith(b"GIF89a") or data.startswith(b"GIF87a"):
                if size >= 10:
                    w, h = struct.unpack("<HH", data[6:10])
                    return w, h

            # WebP
            elif mime_type == "image/webp" or (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
                if size >= 30:
                    # Simple WebP header check
                    if data[12:16] == b"VP8 ":
                        w, h = struct.unpack("<HH", data[26:30])
                        return w & 0x3fff, h & 0x3fff
                    elif data[12:16] == b"VP8L":
                        # Lossless WebP
                        b = data[21:25]
                        w = 1 + (((b[1] & 0x3F) << 8) | b[0])
                        h = 1 + (((b[3] & 0xF) << 10) | (b[2] << 2) | ((b[1] & 0xC0) >> 6))
                        return w, h
                    elif data[12:16] == b"VP8X":
                        # Extended WebP
                        w = 1 + struct.unpack("<I", data[24:27] + b"\x00")[0]
                        h = 1 + struct.unpack("<I", data[27:30] + b"\x00")[0]
                        return w, h

            # JPEG
            elif mime_type in ["image/jpeg", "image/jpg"] or data.startswith(b"\xff\xd8"):
                index = 2
                while index < size:
                    # Search for start of frame marker
                    while index < size and data[index] != 0xff:
                        index += 1
                    while index < size and data[index] == 0xff:
                        index += 1
                    if index < size and 0xc0 <= data[index] <= 0xc3:
                        # SOF0, SOF1, SOF2 markers contain dimensions
                        if index + 8 < size:
                            _, h, w = struct.unpack(">BHH", data[index+2:index+7])
                            return w, h
                    index += 1
        except Exception:
            pass
            
        # Default fallback
        return 800, 600

image_service = ImageService()
