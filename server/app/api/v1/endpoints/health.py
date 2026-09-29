from fastapi import APIRouter
from app.schemas.transformation import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(status="ok", service="formatflow-backend")
