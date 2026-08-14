"""
FormatFlow — Upload Routes
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.image_service import image_service
from app.schemas.image import ImageUploadResponse, ImageMetadata

router = APIRouter()

@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a raw image file. Parses dimensions, saves bytes, and registers it.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not supported. Please upload an image."
        )
        
    try:
        file_bytes = await file.read()
        
        # Max limit check (e.g. 50MB)
        max_bytes = 50 * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file size exceeds the 50MB limit."
            )
            
        db_image = await image_service.create_image(
            db=db,
            file_bytes=file_bytes,
            filename=file.filename or "upload.jpg",
            mime_type=file.content_type
        )
        
        # Map to Pydantic Response Schema
        metadata = ImageMetadata(
            id=db_image.id,
            original_filename=db_image.original_filename,
            mime_type=db_image.mime_type,
            width=db_image.width,
            height=db_image.height,
            file_size_bytes=db_image.file_size_bytes,
            public_url=db_image.public_url,
            created_at=db_image.created_at
        )
        
        return ImageUploadResponse(image=metadata, message="Image uploaded successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
