"""
FormatFlow — Transformation Schemas
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


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


class TransformRequest(BaseModel):
    source_image_id: uuid.UUID
    preset_name: str | None = None
    target_width: int = Field(..., gt=0, le=8000)
    target_height: int = Field(..., gt=0, le=8000)
    fit_mode: FitMode = FitMode.COVER
    output_format: OutputFormat = OutputFormat.WEBP
    quality: int = Field(default=85, ge=1, le=100)


class TransformResponse(BaseModel):
    transformation_id: uuid.UUID
    public_url: str
    width: int
    height: int
    format: str
    created_at: datetime

    model_config = {"from_attributes": True}
