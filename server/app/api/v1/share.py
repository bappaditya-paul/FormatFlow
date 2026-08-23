"""
FormatFlow — Share Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.share_service import share_service
from app.services.transform_service import transform_service
from app.schemas.transform import TransformResponse

router = APIRouter()

@router.get("/{share_id}", response_model=TransformResponse)
async def get_shared_transformation(
    share_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve shared transformation metadata and CDN url by token string or UUID.
    """
    share = await share_service.get_share_by_token(db, share_id)
    if not share:
        # Fallback to look up by UUID in case share_id is a database ID
        try:
            share_uuid = list(map(int, share_id.split("-"))) # simple check for valid format
            share = await share_service.get_share_by_id(db, share_id)
        except Exception:
            pass
            
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared link not found, expired, or invalid."
        )
        
    transformation = await transform_service.get_transformation(db, share.transformation_id)
    if not transformation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transformed image resource not found"
        )
        
    return TransformResponse(
        transformation_id=transformation.id,
        public_url=transformation.public_url or "",
        width=transformation.target_width,
        height=transformation.target_height,
        format=transformation.output_format,
        created_at=transformation.created_at
    )
