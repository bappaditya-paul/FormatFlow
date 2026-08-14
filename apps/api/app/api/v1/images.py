"""
FormatFlow — Images Routes
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.image_service import image_service
from app.services.transform_service import transform_service
from app.services.share_service import share_service
from app.services.storage_service import storage_service
from app.schemas.image import ImageMetadata
from app.schemas.share import ShareCreateRequest, ShareLinkResponse

router = APIRouter()

@router.get("/{image_id}", response_model=ImageMetadata)
async def get_image_metadata(
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch upload image details or transformation details by ID.
    """
    # 1. Search in original uploads
    image = await image_service.get_image(db, image_id)
    if image:
        return ImageMetadata(
            id=image.id,
            original_filename=image.original_filename,
            mime_type=image.mime_type,
            width=image.width,
            height=image.height,
            file_size_bytes=image.file_size_bytes,
            public_url=image.public_url,
            created_at=image.created_at
        )

    # 2. Fallback search in transformations
    transformation = await transform_service.get_transformation(db, image_id)
    if transformation:
        # Resolve original image for filename context
        orig_image = await image_service.get_image(db, transformation.source_image_id)
        filename = f"transformed-{orig_image.original_filename if orig_image else 'image'}.{transformation.output_format}"
        
        return ImageMetadata(
            id=transformation.id,
            original_filename=filename,
            mime_type=f"image/{transformation.output_format}",
            width=transformation.target_width,
            height=transformation.target_height,
            file_size_bytes=0, # not stored directly, can be defaulted
            public_url=transformation.public_url,
            created_at=transformation.created_at
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Image or transformation resource not found"
    )

@router.get("/{image_id}/download")
async def download_image(
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Download the raw image or transformed file directly.
    """
    # 1. Try downloading from original uploads
    image = await image_service.get_image(db, image_id)
    if image:
        try:
            file_bytes = await storage_service.get_file(image.storage_key)
            return Response(
                content=file_bytes,
                media_type=image.mime_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{image.original_filename}"'
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to download original image file: {str(e)}"
            )

    # 2. Try downloading from transformations
    transformation = await transform_service.get_transformation(db, image_id)
    if transformation:
        try:
            file_bytes = await storage_service.get_file(transformation.storage_key)
            orig_image = await image_service.get_image(db, transformation.source_image_id)
            filename = f"transformed-{orig_image.original_filename if orig_image else 'image'}.{transformation.output_format}"
            
            return Response(
                content=file_bytes,
                media_type=f"image/{transformation.output_format}",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to download transformed image file: {str(e)}"
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Resource not found"
    )

@router.post("/{image_id}/share", response_model=ShareLinkResponse)
async def create_share_link(
    image_id: uuid.UUID,
    payload: ShareCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a public shareable URL token for a specific transformation.
    """
    # Verify transformation exists
    transformation = await transform_service.get_transformation(db, payload.transformation_id)
    if not transformation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transformation target not found"
        )
        
    try:
        db_share = await share_service.create_share_link(
            db=db,
            transformation_id=payload.transformation_id,
            expires_in_hours=24  # Default 24h expiration
        )
        
        share_url = f"http://localhost:8001/v1/share/{db_share.token}"
        
        return ShareLinkResponse(
            token=db_share.token,
            share_url=share_url,
            expires_at=db_share.expires_at,
            created_at=db_share.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate share link: {str(e)}"
        )
