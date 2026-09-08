import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.errors import NotFoundError
from backend.app.models.job import JobModel
from backend.app.schemas.job import JobRead, JobStatusType


class JobService:
    @staticmethod
    def create_job(
        db: Session,
        tool_slug: str,
        input_filename: Optional[str] = None,
        input_path: Optional[str] = None,
    ) -> JobModel:
        job_id = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.FILE_TTL_HOURS)
        job = JobModel(
            id=job_id,
            tool_slug=tool_slug,
            status="queued",
            progress=0,
            input_filename=input_filename,
            input_path=input_path,
            expires_at=expires_at,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def get_job(db: Session, job_id: str) -> Optional[JobModel]:
        return db.query(JobModel).filter(JobModel.id == job_id).first()

    @staticmethod
    def get_job_or_404(db: Session, job_id: str) -> JobModel:
        job = JobService.get_job(db, job_id)
        if not job:
            raise NotFoundError(f"Job with ID '{job_id}' not found")
        return job

    @staticmethod
    def update_progress(
        db: Session,
        job_id: str,
        progress: int,
        status: JobStatusType = "processing",
    ) -> Optional[JobModel]:
        job = JobService.get_job(db, job_id)
        if job:
            job.progress = min(max(progress, 0), 100)
            job.status = status
            db.commit()
            db.refresh(job)
        return job

    @staticmethod
    def complete_job(
        db: Session,
        job_id: str,
        output_path: str,
        output_filename: str,
        output_mime: str = "application/octet-stream",
    ) -> Optional[JobModel]:
        job = JobService.get_job(db, job_id)
        if job:
            job.status = "completed"
            job.progress = 100
            job.output_path = output_path
            job.output_filename = output_filename
            job.output_mime = output_mime
            db.commit()
            db.refresh(job)
        return job

    @staticmethod
    def fail_job(db: Session, job_id: str, error_message: str) -> Optional[JobModel]:
        job = JobService.get_job(db, job_id)
        if job:
            job.status = "failed"
            job.error = error_message
            db.commit()
            db.refresh(job)
        return job

    @staticmethod
    def delete_job(db: Session, job_id: str) -> bool:
        job = JobService.get_job(db, job_id)
        if job:
            db.delete(job)
            db.commit()
            return True
        return False

    @staticmethod
    def to_schema(job: JobModel) -> JobRead:
        download_url = None
        if job.status == "completed" and job.output_path:
            download_url = f"{settings.API_V1_STR}/jobs/{job.id}/download"

        return JobRead(
            job_id=job.id,
            status=job.status,  # type: ignore
            progress=job.progress,
            download_url=download_url,
            error=job.error,
            tool_slug=job.tool_slug,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )


job_service = JobService()
