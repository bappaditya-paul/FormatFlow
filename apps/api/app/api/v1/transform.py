"""
FormatFlow — Transform Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.image_service import image_service
from app.services.transform_service import transform_service
from app.schemas.transform import TransformRequest, TransformResponse

router = APIRouter()

@router.post("/transform", response_model=TransformResponse)
async def transform_image(
    payload: TransformRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Apply crop, resize, and format conversions to an uploaded image.
    """
    # Fetch source image metadata
    source_image = await image_service.get_image(db, payload.source_image_id)
    if not source_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source image not found"
        )
        
    try:
        # Run transformation pipeline
        db_transform = await transform_service.execute_transform(
            db=db,
            source_image=source_image,
            preset_name=payload.preset_name,
            target_width=payload.target_width,
            target_height=payload.target_height,
            fit_mode=payload.fit_mode.value,
            output_format=payload.output_format.value,
            quality=payload.quality
        )
        
        return TransformResponse(
            transformation_id=db_transform.id,
            public_url=db_transform.public_url or "",
            width=db_transform.target_width,
            height=db_transform.target_height,
            format=db_transform.output_format,
            created_at=db_transform.created_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transformation execution failed: {str(e)}"
        )
