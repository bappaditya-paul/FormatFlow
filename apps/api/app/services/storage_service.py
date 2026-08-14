"""
FormatFlow — Storage Service
Handles uploading files to Cloudflare R2 or falling back to local disk storage.
"""

import os
import uuid
import logging
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)

# Ensure local static directory exists for fallback
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

class StorageService:
    def __init__(self):
        self.use_r2 = all([
            settings.R2_ACCOUNT_ID,
            settings.R2_ACCESS_KEY_ID,
            settings.R2_SECRET_ACCESS_KEY,
            settings.R2_BUCKET_NAME
        ])
        
        self.s3_client = None
        if self.use_r2:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                )
                logger.info("StorageService: R2 client initialized successfully.")
            except Exception as e:
                logger.error(f"StorageService: Failed to initialize R2 client: {e}. Falling back to local storage.")
                self.use_r2 = False

    async def upload_file(self, file_bytes: bytes, filename: str, mime_type: str) -> str:
        """
        Uploads a file and returns the public download URL.
        """
        file_ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4()}{file_ext}"
        
        if self.use_r2 and self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=settings.R2_BUCKET_NAME,
                    Key=unique_name,
                    Body=file_bytes,
                    ContentType=mime_type,
                )
                if settings.R2_PUBLIC_URL:
                    return f"{settings.R2_PUBLIC_URL.rstrip('/')}/{unique_name}"
                return f"https://{settings.R2_BUCKET_NAME}.r2.cloudflarestorage.com/{unique_name}"
            except ClientError as e:
                logger.error(f"StorageService: R2 upload failed: {e}. Saving locally instead.")
        
        # Local Fallback
        local_path = STATIC_DIR / unique_name
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        
        # Local URL structure (assuming API runs on localhost:8001 or similar)
        return f"http://localhost:8001/static/{unique_name}"

    async def get_file(self, storage_key: str) -> bytes:
        """
        Retrieves file bytes from storage.
        """
        if self.use_r2 and self.s3_client:
            try:
                response = self.s3_client.get_object(
                    Bucket=settings.R2_BUCKET_NAME,
                    Key=storage_key,
                )
                return response["Body"].read()
            except ClientError as e:
                logger.error(f"StorageService: R2 read failed: {e}. Attempting local read.")
        
        # Local Fallback read
        local_path = STATIC_DIR / storage_key
        if local_path.exists():
            with open(local_path, "rb") as f:
                return f.read()
        
        raise FileNotFoundError(f"File not found in storage: {storage_key}")

storage_service = StorageService()
