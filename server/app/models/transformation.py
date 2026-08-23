"""
FormatFlow — Transformation Model
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Transformation(Base):
    __tablename__ = "transformations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    source_image_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("images.id"))
    preset_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_width: Mapped[int] = mapped_column(Integer)
    target_height: Mapped[int] = mapped_column(Integer)
    fit_mode: Mapped[str] = mapped_column(String(32))   # cover | contain | crop | fit
    output_format: Mapped[str] = mapped_column(String(16))  # jpeg | png | webp | avif
    quality: Mapped[int] = mapped_column(Integer, default=85)
    storage_key: Mapped[str] = mapped_column(String(512), unique=True)
    public_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
