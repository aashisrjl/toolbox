from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.workers.tasks import (
    remove_background_task,
    run_remove_background_job,
    compress_image_task,
    run_compress_image_job,
    convert_image_task,
    run_convert_image_job,
    resize_image_task,
    run_resize_image_job,
    image_collage_task,
    run_image_collage_job,
)
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/avif",
    "image/tiff",
}


def validate_image_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise FileValidationError(
            f"Unsupported file type: '{content_type}'. Please upload a PNG, JPEG, WEBP, or AVIF image."
        )


@router.post(
    "/image/remove-background",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
async def remove_image_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("png"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Upload an image to remove its background and return a transparent PNG."""
    validate_image_mime(file)

    job = job_service.create_job(
        db=db,
        tool_slug="remove-image-bg",
        input_filename=file.filename or "image.png",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_remove_background_job,
            celery_task=remove_background_task,
            job_id=job.id,
            background_tasks=background_tasks,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/image/compress",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
async def compress_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: str = Form("75"),
    format: str = Form("auto"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Compress an image file to reduce file size while maintaining quality."""
    validate_image_mime(file)

    try:
        quality_int = int(quality)
    except ValueError:
        quality_int = 75

    job = job_service.create_job(
        db=db,
        tool_slug="compress-image",
        input_filename=file.filename or "image.jpg",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_compress_image_job,
            celery_task=compress_image_task,
            job_id=job.id,
            background_tasks=background_tasks,
            quality=quality_int,
            target_format=format,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/image/convert",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
async def convert_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("webp"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert an image to a different format (PNG, JPG, WEBP, AVIF)."""
    validate_image_mime(file)

    target_fmt = format.lower().strip()
    if target_fmt not in ("png", "jpg", "jpeg", "webp", "avif"):
        raise FileValidationError(f"Unsupported target format: '{format}'. Choose PNG, JPG, WEBP, or AVIF.")

    job = job_service.create_job(
        db=db,
        tool_slug="convert-image",
        input_filename=file.filename or "image.png",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_convert_image_job,
            celery_task=convert_image_task,
            job_id=job.id,
            background_tasks=background_tasks,
            target_format=target_fmt,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/image/resize",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
async def resize_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form("resize"),
    width: str = Form("1280"),
    height: str = Form("720"),
    keep_aspect: str = Form("true"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Resize or crop an image to specified dimensions."""
    validate_image_mime(file)

    try:
        width_int = max(1, min(int(width), 10000))
        height_int = max(1, min(int(height), 10000))
    except ValueError:
        raise FileValidationError("Width and height must be valid integers between 1 and 10000.")

    keep_aspect_bool = keep_aspect.lower() in ("true", "1", "yes")

    job = job_service.create_job(
        db=db,
        tool_slug="resize-image",
        input_filename=file.filename or "image.png",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_resize_image_job,
            celery_task=resize_image_task,
            job_id=job.id,
            background_tasks=background_tasks,
            mode=mode,
            width=width_int,
            height=height_int,
            keep_aspect=keep_aspect_bool,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/image/collage",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
@router.post(
    "/image-collage",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
@router.post(
    "/image-college",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Image Tools"],
)
async def create_image_collage(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    layout: str = Form("auto"),
    spacing: str = Form("16"),
    border_radius: str = Form("0"),
    bg_color: str = Form("#ffffff"),
    aspect_ratio: str = Form("1:1"),
    format: str = Form("png"),
    db: Session = Depends(get_db),
) -> JobRead:
    """Create an aesthetic image collage from strictly 2, 3, or 4 photos."""
    if not files or len(files) not in (2, 3, 4):
        raise FileValidationError(
            f"Image collage strictly requires 2, 3, or 4 photos. Received {len(files) if files else 0}."
        )

    for f in files:
        validate_image_mime(f)

    try:
        spacing_int = max(0, min(int(spacing), 80))
    except ValueError:
        spacing_int = 16

    try:
        border_radius_int = max(0, min(int(border_radius), 80))
    except ValueError:
        border_radius_int = 0

    job = job_service.create_job(
        db=db,
        tool_slug="image-collage",
        input_filename=f"collage_{len(files)}_photos.png",
    )

    try:
        saved_paths: List[str] = []
        for f in files:
            p = await storage_service.save_upload_file(job.id, f, max_size_mb=25)
            saved_paths.append(str(p))

        job.input_path = saved_paths[0]
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_image_collage_job,
            celery_task=image_collage_task,
            job_id=job.id,
            background_tasks=background_tasks,
            file_paths=saved_paths,
            layout=layout,
            spacing=spacing_int,
            border_radius=border_radius_int,
            bg_color=bg_color,
            aspect_ratio=aspect_ratio,
            format=format,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
