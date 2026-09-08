from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.workers.tasks import download_media_task, run_download_media_job
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()


class UrlDownloadRequest(BaseModel):
    url: str
    format: Optional[str] = "video"  # "video" or "audio"


@router.post(
    "/download-youtube-videos",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
@router.post(
    "/youtube/download",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
async def download_youtube_media(
    req: UrlDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JobRead:
    """Download video or audio from a public YouTube URL."""
    url = req.url.strip()
    if not any(domain in url.lower() for domain in ("youtube.com", "youtu.be")):
        raise FileValidationError("Please provide a valid YouTube link (youtube.com or youtu.be).")

    job = job_service.create_job(
        db=db,
        tool_slug="download-youtube-videos",
        input_filename=url,
    )

    try:
        dispatch_job(
            task_fn=run_download_media_job,
            celery_task=download_media_task,
            job_id=job.id,
            background_tasks=background_tasks,
            url=url,
            platform="youtube",
            format_choice=req.format or "video",
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/download-instagram-videos",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
@router.post(
    "/instagram/download",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
async def download_instagram_media(
    req: UrlDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JobRead:
    """Download reels, posts, or stories from a public Instagram URL."""
    url = req.url.strip()
    if "instagram.com" not in url.lower():
        raise FileValidationError("Please provide a valid Instagram link (instagram.com).")

    job = job_service.create_job(
        db=db,
        tool_slug="download-instagram-videos",
        input_filename=url,
    )

    try:
        dispatch_job(
            task_fn=run_download_media_job,
            celery_task=download_media_task,
            job_id=job.id,
            background_tasks=background_tasks,
            url=url,
            platform="instagram",
            format_choice=req.format or "video",
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/download-tiktok-videos",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
@router.post(
    "/tiktok/download",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
async def download_tiktok_media(
    req: UrlDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JobRead:
    """Download watermark-free video or audio from a public TikTok URL."""
    url = req.url.strip()
    if "tiktok.com" not in url.lower():
        raise FileValidationError("Please provide a valid TikTok link (tiktok.com).")

    job = job_service.create_job(
        db=db,
        tool_slug="download-tiktok-videos",
        input_filename=url,
    )

    try:
        dispatch_job(
            task_fn=run_download_media_job,
            celery_task=download_media_task,
            job_id=job.id,
            background_tasks=background_tasks,
            url=url,
            platform="tiktok",
            format_choice=req.format or "video",
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/download-facebook-reels",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
@router.post(
    "/facebook/download",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Downloaders"],
)
async def download_facebook_media(
    req: UrlDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JobRead:
    """Download public reels or videos from Facebook URL."""
    url = req.url.strip()
    if not any(domain in url.lower() for domain in ("facebook.com", "fb.watch", "fb.com")):
        raise FileValidationError("Please provide a valid Facebook link (facebook.com or fb.watch).")

    job = job_service.create_job(
        db=db,
        tool_slug="download-facebook-reels",
        input_filename=url,
    )

    try:
        dispatch_job(
            task_fn=run_download_media_job,
            celery_task=download_media_task,
            job_id=job.id,
            background_tasks=background_tasks,
            url=url,
            platform="facebook",
            format_choice=req.format or "video",
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
