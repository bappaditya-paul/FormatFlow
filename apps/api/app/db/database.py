"""
FormatFlow — Database Connection
Async SQLAlchemy setup with robust runtime SQLite fallback when PostgreSQL is unreachable or fails authentication.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseConnectionManager:
    def __init__(self):
        self.db_url = settings.DATABASE_URL
        self.engine = None
        self.session_maker = None
        self.initialize_engine()

    def initialize_engine(self):
        # Initial check for missing driver
        if "postgresql+asyncpg" in self.db_url:
            try:
                import asyncpg
            except ImportError:
                logger.warning("asyncpg module not found. Overriding connection to SQLite.")
                self.db_url = "sqlite+aiosqlite:///formatflow.db"

        if "sqlite" in self.db_url:
            self.engine = create_async_engine(
                self.db_url,
                echo=False,
                connect_args={"check_same_thread": False}
            )
        else:
            self.engine = create_async_engine(
                self.db_url,
                echo=False,
                pool_pre_ping=True,
            )

        self.session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    def switch_to_sqlite(self):
        logger.warning("DatabaseConnectionManager: Switching database connection to local SQLite fallback.")
        self.db_url = "sqlite+aiosqlite:///formatflow.db"
        self.initialize_engine()

db_manager = DatabaseConnectionManager()
engine = db_manager.engine  # for compatibility

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:  # type: ignore[return]
    """FastAPI dependency that yields a database session."""
    async with db_manager.session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
