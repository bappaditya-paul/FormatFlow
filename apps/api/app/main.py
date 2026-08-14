"""
FormatFlow API — Main Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1 import router as v1_router
from app.db.database import db_manager, Base
from app.models.user import User
from app.models.image import Image
from app.models.transformation import Transformation
from app.models.share import ShareLink

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Universal image transformation platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Database Table Autocreate on Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    try:
        # Test connection and create tables on primary database
        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("DatabaseConnectionManager: Connected to primary database successfully.")
    except Exception as e:
        logger.error(
            f"DatabaseConnectionManager: Connection to primary database failed: {e}. "
            "Triggering SQLite fallback..."
        )
        db_manager.switch_to_sqlite()
        async with db_manager.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("DatabaseConnectionManager: Local SQLite fallback database initialized successfully.")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static Files serving for local storage fallback
# ---------------------------------------------------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(v1_router, prefix="/v1")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint — confirms the API is alive."""
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/", tags=["root"])
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME} API"}
