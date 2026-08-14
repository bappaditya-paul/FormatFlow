"""
FormatFlow — Share Service
Handles generating public sharing tokens and retrieving mapping links.
"""

import uuid
import secrets
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.share import ShareLink
from app.models.transformation import Transformation

class ShareService:
    async def create_share_link(
        self, 
        db: AsyncSession, 
        transformation_id: uuid.UUID,
        expires_in_hours: int | None = None
    ) -> ShareLink:
        """
        Creates a public share token for a specific image transformation.
        """
        token = secrets.token_urlsafe(16)
        
        expires_at = None
        if expires_in_hours:
            expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
            
        share_link = ShareLink(
            id=uuid.uuid4(),
            token=token,
            transformation_id=transformation_id,
            expires_at=expires_at,
            created_at=datetime.utcnow()
        )
        
        db.add(share_link)
        await db.commit()
        await db.refresh(share_link)
        
        return share_link

    async def get_share_by_token(self, db: AsyncSession, token: str) -> ShareLink | None:
        """
        Retrieves a share link record by token.
        """
        result = await db.execute(select(ShareLink).where(ShareLink.token == token))
        share = result.scalars().first()
        
        # Verify expiration
        if share and share.expires_at and share.expires_at < datetime.utcnow():
            return None
            
        return share

    async def get_share_by_id(self, db: AsyncSession, share_id: uuid.UUID) -> ShareLink | None:
        """
        Retrieves a share link record by UUID.
        """
        result = await db.execute(select(ShareLink).where(ShareLink.id == share_id))
        share = result.scalars().first()
        
        # Verify expiration
        if share and share.expires_at and share.expires_at < datetime.utcnow():
            return None
            
        return share

share_service = ShareService()
