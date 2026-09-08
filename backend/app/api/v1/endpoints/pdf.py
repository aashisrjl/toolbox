from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.errors import FileValidationError
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.workers.tasks import (
    image_to_pdf_task,
    run_image_to_pdf_job,
    merge_pdf_task,
    run_merge_pdf_job,
    pdf_to_word_task,
    run_pdf_to_word_job,
    word_to_pdf_task,
    run_word_to_pdf_job,
    protect_pdf_task,
    run_protect_pdf_job,
)
from backend.app.workers.runner import dispatch_job
from backend.app.schemas.job import JobRead

router = APIRouter()

ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/bmp",
    "image/tiff",
}

ALLOWED_PDF_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
}

ALLOWED_WORD_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

MAX_IMAGE_MB = 25
MAX_DOC_MB = 50


def validate_image_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    valid_exts = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif", ".bmp", ".tiff")
    filename = (file.filename or "").lower()
    if content_type in ALLOWED_IMAGE_MIME_TYPES or any(filename.endswith(ext) for ext in valid_exts):
        return

    raise FileValidationError(
        f"Unsupported image file type: '{content_type or filename}'. Please upload a PNG, JPG, or WEBP image."
    )


def validate_pdf_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    if content_type in ALLOWED_PDF_MIME_TYPES or filename.endswith(".pdf"):
        return

    raise FileValidationError(
        f"Unsupported file type: '{content_type or filename}'. Please upload a valid PDF document."
    )


def validate_word_mime(file: UploadFile) -> None:
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    if content_type in ALLOWED_WORD_MIME_TYPES or filename.endswith(".docx") or filename.endswith(".doc"):
        return

    raise FileValidationError(
        f"Unsupported file type: '{content_type or filename}'. Please upload a Word document (.docx or .doc)."
    )


@router.post(
    "/image-to-pdf",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["PDF Tools"],
)
async def convert_image_to_pdf(
    background_tasks: BackgroundTasks,
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    page_size: str = Form("fit"),
    orientation: str = Form("auto"),
    margin: int = Form(0),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert one or more uploaded images into a single unified PDF document."""
    upload_list: List[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file and file not in upload_list:
        upload_list.append(file)

    if not upload_list:
        raise FileValidationError("Please upload at least one image file.")

    for f in upload_list:
        validate_image_mime(f)

    first_filename = upload_list[0].filename or "image.png"
    job = job_service.create_job(
        db=db,
        tool_slug="image-to-pdf",
        input_filename=first_filename,
    )

    try:
        saved_paths: List[str] = []
        for f in upload_list:
            saved_p = await storage_service.save_upload_file(job.id, f, max_size_mb=MAX_IMAGE_MB)
            saved_paths.append(str(saved_p))

        job.input_path = saved_paths[0]
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_image_to_pdf_job,
            celery_task=image_to_pdf_task,
            job_id=job.id,
            background_tasks=background_tasks,
            file_paths=saved_paths,
            page_size=page_size,
            orientation=orientation,
            margin=margin,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/merge-pdf",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["PDF Tools"],
)
async def merge_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> JobRead:
    """Merge two or more PDF documents into a single PDF document."""
    if not files or len(files) < 2:
        raise FileValidationError("Please select at least two PDF files to merge.")

    for f in files:
        validate_pdf_mime(f)

    job = job_service.create_job(
        db=db,
        tool_slug="merge-pdf",
        input_filename=f"merge_{len(files)}_files.pdf",
    )

    try:
        saved_paths: List[str] = []
        for f in files:
            p = await storage_service.save_upload_file(job.id, f, max_size_mb=MAX_DOC_MB)
            saved_paths.append(str(p))

        job.input_path = saved_paths[0]
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_merge_pdf_job,
            celery_task=merge_pdf_task,
            job_id=job.id,
            background_tasks=background_tasks,
            file_paths=saved_paths,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/pdf-to-word",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["PDF Tools"],
)
async def convert_pdf_to_word(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert an uploaded PDF document into an editable Microsoft Word (.docx) file."""
    validate_pdf_mime(file)

    job = job_service.create_job(
        db=db,
        tool_slug="pdf-to-word",
        input_filename=file.filename or "document.pdf",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_DOC_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_pdf_to_word_job,
            celery_task=pdf_to_word_task,
            job_id=job.id,
            background_tasks=background_tasks,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/word-to-pdf",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["PDF Tools"],
)
async def convert_word_to_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> JobRead:
    """Convert a Microsoft Word document (.docx or .doc) into a clean PDF."""
    validate_word_mime(file)

    job = job_service.create_job(
        db=db,
        tool_slug="word-to-pdf",
        input_filename=file.filename or "document.docx",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_DOC_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_word_to_pdf_job,
            celery_task=word_to_pdf_task,
            job_id=job.id,
            background_tasks=background_tasks,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise


@router.post(
    "/protect-pdf",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["PDF Tools"],
)
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
) -> JobRead:
    """Encrypt and password-protect a PDF document using AES-256 encryption."""
    validate_pdf_mime(file)
    clean_pwd = password.strip()
    if not clean_pwd:
        raise FileValidationError("Password cannot be empty.")

    job = job_service.create_job(
        db=db,
        tool_slug="protect-pdf",
        input_filename=file.filename or "document.pdf",
    )

    try:
        input_path = await storage_service.save_upload_file(job.id, file, max_size_mb=MAX_DOC_MB)
        job.input_path = str(input_path)
        db.commit()
        db.refresh(job)

        dispatch_job(
            task_fn=run_protect_pdf_job,
            celery_task=protect_pdf_task,
            job_id=job.id,
            background_tasks=background_tasks,
            password=clean_pwd,
        )
        return job_service.to_schema(job)
    except Exception as e:
        job_service.fail_job(db, job.id, str(e))
        raise
