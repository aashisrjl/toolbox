from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.services.video_service import video_service
from backend.app.workers.tasks import (
    remove_video_bg_task,
    run_remove_video_bg_job,
    convert_video_task,
    run_convert_video_job,
    trim_video_task,
    run_trim_video_job,
    extract_audio_task,
    run_extract_audio_job,
)
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()

ALLOWED_VIDEO_MIME_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/mpeg",
    "video/ogg",
    "video/3gpp",
    "video/avi",
}

MAX_VIDEO_MB = 100


def validate_video_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    # If mime is unknown or generic application/octet-stream, check file extension
    valid_exts = (".mp4", ".mov", ".webm", ".avi", ".mkv", ".mpeg", ".mpg")
    filename = (file.filename or "").lower()
    if content_type in ALLOWED_VIDEO_MIME_TYPES or any(filename.endswith(ext) for ext in valid_exts):
        return

    raise FileValidationError(
        f"Unsupported video file type: '{content_type or filename}'. Please upload an MP4, MOV, WEBM, or AVI video."
    )


@router.post(
    "/video/remove-background",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Video Tools"],
)
async def remove_video_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str = Form("u2net"),
    smooth_edges: str = Form("true"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Remove video background frame-by-frame and return transparent WEBM."""
    validate_video_mime(file)

    job = job_service.create_job(
        db=db,
        tool_slug="remove-video-bg",
        input_filename=file.filename or "video.mp4",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_VIDEO_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        is_smooth = smooth_edges.lower().strip() in ("true", "1", "yes")

        dispatch_job(
            task_fn=run_remove_video_bg_job,
            celery_task=remove_video_bg_task,
            job_id=job.id,
            background_tasks=background_tasks,
            model=model,
            alpha_matting=is_smooth,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/video/convert",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Video Tools"],
)
async def convert_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("mp4"),
    quality: str = Form("medium"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert video between MP4, WEBM, MOV, and animated GIF formats."""
    validate_video_mime(file)

    target_fmt = format.lower().strip()
    if target_fmt not in ("mp4", "webm", "mov", "gif"):
        raise FileValidationError(f"Unsupported format: '{format}'. Choose MP4, WEBM, MOV, or GIF.")

    job = job_service.create_job(
        db=db,
        tool_slug="convert-video",
        input_filename=file.filename or "video.mp4",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_VIDEO_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_convert_video_job,
            celery_task=convert_video_task,
            job_id=job.id,
            background_tasks=background_tasks,
            target_format=target_fmt,
            quality=quality,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/video/trim",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Video Tools"],
)
async def trim_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    start_time: str = Form("0"),
    end_time: Optional[str] = Form(None),
    db: Session = Depends(get_db),
) -> JobRead:
    """Cut a specific timestamp segment out of a video."""
    validate_video_mime(file)

    job = job_service.create_job(
        db=db,
        tool_slug="trim-video",
        input_filename=file.filename or "video.mp4",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_VIDEO_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_trim_video_job,
            celery_task=trim_video_task,
            job_id=job.id,
            background_tasks=background_tasks,
            start_time=start_time,
            end_time=end_time if end_time and end_time.strip() else None,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/video/extract-audio",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Video Tools"],
)
async def extract_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("mp3"),
    bitrate: str = Form("192k"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Extract audio track from video to MP3, WAV, AAC, or OGG."""
    validate_video_mime(file)

    target_fmt = format.lower().strip()
    if target_fmt not in ("mp3", "wav", "aac", "ogg"):
        raise FileValidationError(f"Unsupported audio format: '{format}'. Choose MP3, WAV, AAC, or OGG.")

    job = job_service.create_job(
        db=db,
        tool_slug="extract-audio",
        input_filename=file.filename or "video.mp4",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_VIDEO_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        if not video_service.has_audio_stream(input_path):
            raise FileValidationError(
                "The uploaded video does not contain an audio track. Please upload a video with recorded sound."
            )

        dispatch_job(
            task_fn=run_extract_audio_job,
            celery_task=extract_audio_task,
            job_id=job.id,
            background_tasks=background_tasks,
            target_format=target_fmt,
            bitrate=bitrate,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
