"""
FormatFlow — v1 API Router
Aggregates all route modules.
"""

from fastapi import APIRouter

from app.api.v1.upload import router as upload_router
from app.api.v1.transform import router as transform_router
from app.api.v1.images import router as images_router
from app.api.v1.presets import router as presets_router
from app.api.v1.share import router as share_router

router = APIRouter()

# Health route under /v1
@router.get("/ping", tags=["v1"])
async def v1_ping() -> dict:
    return {"pong": True, "api_version": "v1"}

# Mounting sub-routers
router.include_router(upload_router, prefix="/images", tags=["images"])
router.include_router(transform_router, prefix="/images", tags=["transform"])
router.include_router(images_router, prefix="/images", tags=["images"])
router.include_router(presets_router, prefix="/presets", tags=["presets"])
router.include_router(share_router, prefix="/share", tags=["share"])
