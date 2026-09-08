from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.workers.tasks import convert_audio_task, run_convert_audio_job
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()

ALLOWED_AUDIO_MIME_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/flac",
    "audio/x-flac",
    "audio/aac",
    "audio/ogg",
    "audio/m4a",
    "audio/x-m4a",
}

MAX_AUDIO_MB = 50


def validate_audio_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    valid_exts = (".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a")
    filename = (file.filename or "").lower()
    if content_type in ALLOWED_AUDIO_MIME_TYPES or any(filename.endswith(ext) for ext in valid_exts):
        return

    raise FileValidationError(
        f"Unsupported audio file type: '{content_type or filename}'. Please upload an MP3, WAV, FLAC, or AAC audio file."
    )


@router.post(
    "/audio/convert",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Audio Tools"],
)
async def convert_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("mp3"),
    bitrate: str = Form("192k"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert audio between MP3, WAV, FLAC, and AAC with bitrate control."""
    validate_audio_mime(file)

    target_fmt = format.lower().strip()
    if target_fmt not in ("mp3", "wav", "flac", "aac", "ogg"):
        raise FileValidationError(f"Unsupported audio format: '{format}'. Choose MP3, WAV, FLAC, or AAC.")

    job = job_service.create_job(
        db=db,
        tool_slug="convert-audio",
        input_filename=file.filename or "audio.mp3",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_AUDIO_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_convert_audio_job,
            celery_task=convert_audio_task,
            job_id=job.id,
            background_tasks=background_tasks,
            target_format=target_fmt,
            bitrate=bitrate,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
