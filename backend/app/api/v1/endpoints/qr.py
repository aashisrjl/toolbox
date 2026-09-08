from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, BackgroundTasks, status, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.workers.tasks import generate_qr_task, run_generate_qr_job
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()


class QrGenerateRequest(BaseModel):
    data: str
    format: Optional[str] = "png"
    scale: Optional[int] = 10
    border: Optional[int] = 4
    foreground_color: Optional[str] = "#000000"
    background_color: Optional[str] = "#ffffff"
    error_correction: Optional[str] = "m"


@router.post(
    "/qr-code-generator",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["QR Tools"],
)
async def generate_qr_code(
    req: QrGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JobRead:
    """Generate a high-resolution customizable QR code."""
    data = req.data.strip()
    if not data:
        raise FileValidationError("Please enter text or a URL to generate a QR code.")

    job = job_service.create_job(
        db=db,
        tool_slug="qr-code-generator",
        input_filename=data[:50],
    )

    try:
        dispatch_job(
            task_fn=run_generate_qr_job,
            celery_task=generate_qr_task,
            job_id=job.id,
            background_tasks=background_tasks,
            data=data,
            format_choice=req.format or "png",
            scale=req.scale or 10,
            border=req.border or 4,
            foreground_color=req.foreground_color or "#000000",
            background_color=req.background_color or "#ffffff",
            error_correction=req.error_correction or "m",
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
