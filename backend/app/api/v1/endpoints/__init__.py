from backend.app.api.v1.endpoints.health import router as health_router
from backend.app.api.v1.endpoints.jobs import router as jobs_router
from backend.app.api.v1.endpoints.image import router as image_router
from backend.app.api.v1.endpoints.video import router as video_router
from backend.app.api.v1.endpoints.audio import router as audio_router
from backend.app.api.v1.endpoints.downloaders import router as downloaders_router
from backend.app.api.v1.endpoints.pdf import router as pdf_router
from backend.app.api.v1.endpoints.qr import router as qr_router

__all__ = [
    "health_router",
    "jobs_router",
    "image_router",
    "video_router",
    "audio_router",
    "downloaders_router",
    "pdf_router",
    "qr_router",
]
