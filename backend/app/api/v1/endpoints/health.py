from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Health check endpoint for monitoring uptime and status."""
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        services={
            "database": "connected",
            "celery_enabled": settings.USE_CELERY,
        },
    )
