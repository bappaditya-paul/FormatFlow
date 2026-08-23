"""
FormatFlow — Share Schemas
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


class ShareCreateRequest(BaseModel):
    transformation_id: uuid.UUID | None = None


class ShareLinkResponse(BaseModel):
    token: str
    share_url: str
    expires_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
