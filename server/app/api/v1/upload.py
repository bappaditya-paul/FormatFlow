"""
FormatFlow — Upload Routes
"""

import httpx
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.image_service import image_service
from app.schemas.image import ImageUploadResponse, ImageMetadata, UrlUploadRequest

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
        temp_path, mime_type, file_size, width, height, format_name, orientation, color_profile, exif = upload_service.validate_and_cache(
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
                mime_type=mime_type,
                width=width,
                height=height,
                format=format_name,
                orientation=orientation,
                color_profile=color_profile,
                exif=exif
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
            format=db_image.format,
            orientation=db_image.orientation,
            color_profile=db_image.color_profile,
            exif=db_image.exif,
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

@router.post("/upload/url", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image_url(
    payload: UrlUploadRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Download an image from a URL, parse it, save it, and register it.
    """
    url_str = str(payload.url)
    try:
        async with httpx.AsyncClient() as client:
            # First, do a HEAD request to check content length
            try:
                head_resp = await client.head(url_str, follow_redirects=True, timeout=5.0)
                if head_resp.status_code == 200:
                    content_length = head_resp.headers.get("Content-Length")
                    if content_length and int(content_length) > 25 * 1024 * 1024:
                        raise ValueError(f"Image at URL exceeds maximum size of 25MB (size: {int(content_length)/1024/1024:.1f}MB)")
            except httpx.RequestError:
                pass  # Ignore HEAD failure and try GET directly
            
            # Fetch the actual image bytes
            resp = await client.get(url_str, follow_redirects=True, timeout=10.0)
            resp.raise_for_status()
            
            file_bytes = resp.content
            if len(file_bytes) > 25 * 1024 * 1024:
                raise ValueError("Image at URL exceeds maximum size of 25MB")
                
        # Perform validation and save to temporary storage
        from app.services.upload_service import upload_service
        filename = url_str.split("/")[-1].split("?")[0] or "url_upload"
        if not filename:
            filename = "url_upload"
            
        temp_path, mime_type, file_size, width, height, format_name, orientation, color_profile, exif = upload_service.validate_and_cache(
            file_bytes, filename
        )
        
        try:
            with open(temp_path, "rb") as f:
                cached_bytes = f.read()
                
            db_image = await image_service.create_image(
                db=db,
                file_bytes=cached_bytes,
                filename=filename,
                mime_type=mime_type,
                width=width,
                height=height,
                format=format_name,
                orientation=orientation,
                color_profile=color_profile,
                exif=exif
            )
        finally:
            if temp_path.exists():
                temp_path.unlink()
                
        metadata = ImageMetadata(
            id=db_image.id,
            original_filename=db_image.original_filename,
            mime_type=db_image.mime_type,
            width=db_image.width,
            height=db_image.height,
            file_size_bytes=db_image.file_size_bytes,
            public_url=db_image.public_url,
            format=db_image.format,
            orientation=db_image.orientation,
            color_profile=db_image.color_profile,
            exif=db_image.exif,
            created_at=db_image.created_at
        )
        
        return ImageUploadResponse(image=metadata, message="Image downloaded and uploaded successfully")
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fetch image: HTTP {e.response.status_code}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch image: connection error")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"URL Upload failed: {str(e)}")
