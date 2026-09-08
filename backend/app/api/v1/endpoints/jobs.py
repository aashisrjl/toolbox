from pathlib import Path
from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import NotFoundError, AppException
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.schemas.job import JobRead

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=JobRead, tags=["Jobs"])
def get_job_status(job_id: str, db: Session = Depends(get_db)) -> JobRead:
    """Retrieves the status, progress, and download URL for a given job."""
    job = job_service.get_job_or_404(db, job_id)
    return job_service.to_schema(job)


@router.get("/jobs/{job_id}/download", tags=["Jobs"])
def download_job_result(job_id: str, db: Session = Depends(get_db)):
    """Downloads the completed output file from a job."""
    job = job_service.get_job_or_404(db, job_id)

    if job.status != "completed" or not job.output_path:
        raise AppException(
            message=f"Job is not completed yet (current status: {job.status})",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="JOB_NOT_COMPLETED",
        )

    output_path = Path(job.output_path)
    if not output_path.exists():
        raise NotFoundError("The requested output file was not found on the server or has expired.")

    return FileResponse(
        path=str(output_path),
        filename=job.output_filename or "download",
        media_type=job.output_mime or "application/octet-stream",
    )


@router.delete("/jobs/{job_id}", response_model=JobRead, tags=["Jobs"])
def cancel_or_delete_job(job_id: str, db: Session = Depends(get_db)) -> JobRead:
    """Cancels and deletes a job and its associated files."""
    job = job_service.get_job_or_404(db, job_id)
    storage_service.delete_job_files(job_id)
    response_schema = job_service.to_schema(job)
    job_service.delete_job(db, job_id)
    return response_schema
