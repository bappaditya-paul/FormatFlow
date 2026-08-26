"""
FormatFlow — Image Schemas
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class ImageMetadata(BaseModel):
    id: uuid.UUID
    original_filename: str
    mime_type: str
    width: int
    height: int
    file_size_bytes: int
    public_url: str | None = None
    format: str | None = None
    orientation: int | None = None
    color_profile: str | None = None
    exif: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ImageUploadResponse(BaseModel):
    image: ImageMetadata
    message: str = "Image uploaded successfully"


class UrlUploadRequest(BaseModel):
    url: HttpUrl

