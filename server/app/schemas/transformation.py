from enum import Enum
from pydantic import BaseModel
from typing import Optional, List

class ExpansionMethod(str, Enum):
    AI_OUTPAINTING = "AI Outpainting"
    RESIZE_NEAREST = "Resize: Nearest Neighbor"
    RESIZE_BILINEAR = "Resize: Bilinear"
    BORDER_REPLICATE = "Border: Replicate"
    BORDER_REFLECT = "Border: Reflect"
    BORDER_WRAP = "Border: Wrap"

class OutputFormat(str, Enum):
    PNG = "PNG"
    JPEG = "JPEG"
    WEBP = "WEBP"

class TransformationResponse(BaseModel):
    status: str
    output_url: str
    file_id: str
    action_taken: str
    target_width: int
    target_height: int
    expansion_method: str
    execution_time_seconds: float
    output_format: Optional[str] = "PNG"
    message: Optional[str] = None

class VariantItem(BaseModel):
    expansion_method: str
    output_url: str
    action_taken: str
    execution_time_seconds: float

class BatchTransformationResponse(BaseModel):
    status: str
    file_id: str
    target_width: int
    target_height: int
    output_format: str
    total_execution_time_seconds: float
    variants: List[VariantItem]
    message: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    service: str

