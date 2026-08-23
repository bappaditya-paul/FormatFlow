"""
FormatFlow — Transform Service
Coordinates loading original images, processing transformations, and registering output details.
"""

import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.transformation import Transformation
from app.models.image import Image
from app.engine.pipeline import TransformationPipeline, TransformConfig, FitMode, OutputFormat
from app.services.storage_service import storage_service

class TransformService:
    def __init__(self):
        self.pipeline = TransformationPipeline()

    async def get_transformation(self, db: AsyncSession, transform_id: uuid.UUID) -> Transformation | None:
        """
        Fetches a transformation by its ID.
        """
        result = await db.execute(select(Transformation).where(Transformation.id == transform_id))
        return result.scalars().first()

    async def execute_transform(
        self,
        db: AsyncSession,
        source_image: Image,
        preset_name: str | None,
        target_width: int,
        target_height: int,
        fit_mode: str,
        output_format: str,
        quality: int
    ) -> Transformation:
        """
        Retrieves the original file, executes the crop/resize pipeline, saves output, and logs database entry.
        """
        # Download source file bytes
        source_bytes = await storage_service.get_file(source_image.storage_key)
        
        # Build configuration
        config = TransformConfig(
            target_width=target_width,
            target_height=target_height,
            fit_mode=FitMode(fit_mode),
            output_format=OutputFormat(output_format),
            quality=quality
        )
        
        # Run transformation
        result = self.pipeline.process(source_bytes, config)
        
        # Save output file to storage
        output_filename = f"transformed-{source_image.original_filename}"
        public_url = await storage_service.upload_file(
            result.data, 
            output_filename, 
            f"image/{result.format}"
        )
        
        storage_key = public_url.split("/")[-1]
        
        # Write DB entry
        transformation = Transformation(
            id=uuid.uuid4(),
            source_image_id=source_image.id,
            preset_name=preset_name,
            target_width=result.width,
            target_height=result.height,
            fit_mode=fit_mode,
            output_format=result.format,
            quality=quality,
            storage_key=storage_key,
            public_url=public_url,
            created_at=datetime.utcnow()
        )
        
        db.add(transformation)
        await db.commit()
        await db.refresh(transformation)
        
        return transformation

transform_service = TransformService()
