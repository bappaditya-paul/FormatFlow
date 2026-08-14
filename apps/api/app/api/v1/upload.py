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
    try:
        file_bytes = await file.read()
        
        # Perform validation and save to temporary storage
        from app.services.upload_service import upload_service
        temp_path, mime_type, file_size, width, height = upload_service.validate_and_cache(
            file_bytes, file.filename or "upload"
        )
        
        try:
            # Read from temporary storage to verify caching
            with open(temp_path, "rb") as f:
                cached_bytes = f.read()
                
            # Perform permanent registration
            db_image = await image_service.create_image(
                db=db,
                file_bytes=cached_bytes,
                filename=file.filename or f"upload.{mime_type.split('/')[-1]}",
                mime_type=mime_type
            )
        finally:
            # Clean up temporary cached file
            if temp_path.exists():
                temp_path.unlink()
                
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
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
