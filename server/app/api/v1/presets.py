"""
FormatFlow — Presets Route
"""

from fastapi import APIRouter
from app.services.preset_service import list_presets, Preset

router = APIRouter()

@router.get("", response_model=list[dict])
async def get_presets():
    """
    Retrieve all predefined image transformation templates.
    """
    presets = list_presets()
    return [
        {
            "name": p.name,
            "label": p.label,
            "width": p.width,
            "height": p.height,
            "fit": p.fit,
            "format": p.format,
            "quality": p.quality,
            "ratio": f"{p.width}:{p.height}"
        }
        for p in presets
    ]
