import logging
from pathlib import Path
from backend.app.db.session import SessionLocal
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.services.image_service import image_service, FORMAT_MAP
from backend.app.services.video_service import video_service, VIDEO_FORMAT_MAP, AUDIO_FORMAT_MAP
from backend.app.services.audio_service import audio_service, AUDIO_FORMAT_MAP as AUDIO_CONVERT_FORMAT_MAP
from backend.app.services.downloader_service import downloader_service
from backend.app.services.pdf_service import pdf_service
from backend.app.services.qr_service import qr_service
from backend.app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_remove_background_job(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "image").stem
        output_filename = f"{stem}_nobg.png"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        image_service.remove_background(input_path, output_path)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime="image/png",
        )
        logger.info(f"Background removal job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_compress_image_job(job_id: str, quality: int = 75, target_format: str = "auto") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=25, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "image").stem

        fmt_key = target_format.lower()
        if fmt_key == "auto" or not fmt_key:
            ext = input_path.suffix or ".jpg"
        else:
            _, _, ext = FORMAT_MAP.get(fmt_key, ("JPEG", "image/jpeg", ".jpg"))

        output_filename = f"{stem}_compressed{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = image_service.compress(input_path, output_path, quality, target_format)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Compression job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_convert_image_job(job_id: str, target_format: str = "webp") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=25, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "image").stem

        fmt_key = target_format.lower()
        _, _, ext = FORMAT_MAP.get(fmt_key, ("WEBP", "image/webp", ".webp"))
        output_filename = f"{stem}_converted{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=60, status="processing")
        _, mime_type = image_service.convert(input_path, output_path, target_format)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Conversion job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_resize_image_job(
    job_id: str,
    mode: str = "resize",
    width: int = 1280,
    height: int = 720,
    keep_aspect: bool = True,
) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=25, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "image").stem
        ext = input_path.suffix or ".png"

        suffix = f"_{mode}_{width}x{height}"
        output_filename = f"{stem}{suffix}{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=60, status="processing")
        _, mime_type = image_service.resize(input_path, output_path, mode, width, height, keep_aspect)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Resize/crop job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


# Celery task registrations
@celery_app.task(name="tasks.remove_background")
def remove_background_task(job_id: str) -> None:
    run_remove_background_job(job_id)


@celery_app.task(name="tasks.compress_image")
def compress_image_task(job_id: str, quality: int = 75, target_format: str = "auto") -> None:
    run_compress_image_job(job_id, quality, target_format)


@celery_app.task(name="tasks.convert_image")
def convert_image_task(job_id: str, target_format: str = "webp") -> None:
    run_convert_image_job(job_id, target_format)


@celery_app.task(name="tasks.resize_image")
def resize_image_task(
    job_id: str,
    mode: str = "resize",
    width: int = 1280,
    height: int = 720,
    keep_aspect: bool = True,
) -> None:
    run_resize_image_job(job_id, mode, width, height, keep_aspect)


def run_remove_video_bg_job(
    job_id: str,
    model: str = "u2net",
    alpha_matting: bool = False,
) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=15, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "video").stem
        output_filename = f"{stem}_nobg.webm"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=40, status="processing")
        _, mime_type = video_service.remove_background(
            input_path, output_path, model=model, alpha_matting=alpha_matting
        )

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Video background removal job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_convert_video_job(job_id: str, target_format: str = "mp4", quality: str = "medium") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "video").stem

        fmt_key = target_format.lower().strip()
        _, ext = VIDEO_FORMAT_MAP.get(fmt_key, ("video/mp4", ".mp4"))
        output_filename = f"{stem}_converted{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = video_service.convert(input_path, output_path, target_format, quality)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Video conversion job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_trim_video_job(job_id: str, start_time: str = "0", end_time: str = None) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "video").stem
        ext = input_path.suffix or ".mp4"

        output_filename = f"{stem}_trimmed{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = video_service.trim(input_path, output_path, start_time, end_time)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Video trimming job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_extract_audio_job(job_id: str, target_format: str = "mp3", bitrate: str = "192k") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "video").stem

        fmt_key = target_format.lower().strip()
        _, ext = AUDIO_FORMAT_MAP.get(fmt_key, ("audio/mpeg", ".mp3"))
        output_filename = f"{stem}_audio{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = video_service.extract_audio(input_path, output_path, target_format, bitrate)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Audio extraction job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.remove_video_bg")
def remove_video_bg_task(
    job_id: str,
    model: str = "u2net",
    alpha_matting: bool = False,
) -> None:
    run_remove_video_bg_job(job_id, model=model, alpha_matting=alpha_matting)


@celery_app.task(name="tasks.convert_video")
def convert_video_task(job_id: str, target_format: str = "mp4", quality: str = "medium") -> None:
    run_convert_video_job(job_id, target_format, quality)


@celery_app.task(name="tasks.trim_video")
def trim_video_task(job_id: str, start_time: str = "0", end_time: str = None) -> None:
    run_trim_video_job(job_id, start_time, end_time)


@celery_app.task(name="tasks.extract_audio")
def extract_audio_task(job_id: str, target_format: str = "mp3", bitrate: str = "192k") -> None:
    run_extract_audio_job(job_id, target_format, bitrate)


def run_convert_audio_job(job_id: str, target_format: str = "mp3", bitrate: str = "192k") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "audio").stem

        fmt_key = target_format.lower().strip()
        mime_type, ext = AUDIO_CONVERT_FORMAT_MAP.get(fmt_key, ("audio/mpeg", ".mp3"))
        output_filename = f"{stem}_converted{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = audio_service.convert(input_path, output_path, target_format, bitrate)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Audio conversion job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


def run_download_media_job(job_id: str, url: str, platform: str = "generic", format_choice: str = "video") -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        job_service.update_progress(db, job_id, progress=15, status="processing")
        job_dir = storage_service.get_job_dir(job_id)

        job_service.update_progress(db, job_id, progress=40, status="processing")
        output_path, filename, mime_type = downloader_service.download(
            url=url,
            output_dir=job_dir,
            platform=platform,
            format_choice=format_choice,
        )

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=filename,
            output_mime=mime_type,
        )
        logger.info(f"Download job {job_id} for {platform} completed successfully: {filename}")
    except Exception as e:
        logger.exception(f"Download job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.convert_audio")
def convert_audio_task(job_id: str, target_format: str = "mp3", bitrate: str = "192k") -> None:
    run_convert_audio_job(job_id, target_format, bitrate)


@celery_app.task(name="tasks.download_media")
def download_media_task(job_id: str, url: str, platform: str = "generic", format_choice: str = "video") -> None:
    run_download_media_job(job_id, url, platform, format_choice)


def run_image_to_pdf_job(
    job_id: str,
    file_paths: list[str] | None = None,
    page_size: str = "fit",
    orientation: str = "auto",
    margin: int = 0,
) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or (not job.input_path and not file_paths):
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        if file_paths and len(file_paths) > 0:
            input_paths = [Path(p) for p in file_paths]
        else:
            input_paths = [Path(job.input_path)]

        stem = Path(job.input_filename or "document").stem
        output_filename = f"{stem}.pdf"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = pdf_service.images_to_pdf(
            image_paths=input_paths,
            output_path=output_path,
            page_size=page_size,
            orientation=orientation,
            margin=margin,
        )

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Image to PDF job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.image_to_pdf")
def image_to_pdf_task(
    job_id: str,
    file_paths: list[str] | None = None,
    page_size: str = "fit",
    orientation: str = "auto",
    margin: int = 0,
) -> None:
    run_image_to_pdf_job(job_id, file_paths, page_size, orientation, margin)


def run_generate_qr_job(
    job_id: str,
    data: str,
    format_choice: str = "png",
    scale: int = 10,
    border: int = 4,
    foreground_color: str = "#000000",
    background_color: str = "#ffffff",
    error_correction: str = "m",
) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        ext = ".png" if format_choice.lower() == "png" else ".svg"
        output_filename = f"qr_code_{job_id[:8]}{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = qr_service.generate_qr(
            data=data,
            output_path=output_path,
            format_choice=format_choice,
            scale=scale,
            border=border,
            foreground_color=foreground_color,
            background_color=background_color,
            error_correction=error_correction,
        )

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"QR code job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.generate_qr")
def generate_qr_task(
    job_id: str,
    data: str,
    format_choice: str = "png",
    scale: int = 10,
    border: int = 4,
    foreground_color: str = "#000000",
    background_color: str = "#ffffff",
    error_correction: str = "m",
) -> None:
    run_generate_qr_job(
        job_id=job_id,
        data=data,
        format_choice=format_choice,
        scale=scale,
        border=border,
        foreground_color=foreground_color,
        background_color=background_color,
        error_correction=error_correction,
    )


def run_merge_pdf_job(job_id: str, file_paths: list[str]) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        paths = [Path(p) for p in file_paths]
        output_filename = "merged_document.pdf"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = pdf_service.merge_pdfs(paths, output_path)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Merge PDF job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.merge_pdf")
def merge_pdf_task(job_id: str, file_paths: list[str]) -> None:
    run_merge_pdf_job(job_id, file_paths)


def run_pdf_to_word_job(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "document").stem
        output_filename = f"{stem}.docx"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = pdf_service.pdf_to_word(input_path, output_path)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"PDF to Word job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.pdf_to_word")
def pdf_to_word_task(job_id: str) -> None:
    run_pdf_to_word_job(job_id)


def run_word_to_pdf_job(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "document").stem
        output_filename = f"{stem}.pdf"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = pdf_service.word_to_pdf(input_path, output_path)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Word to PDF job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.word_to_pdf")
def word_to_pdf_task(job_id: str) -> None:
    run_word_to_pdf_job(job_id)


def run_protect_pdf_job(job_id: str, password: str) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job or not job.input_path:
            logger.error(f"Job {job_id} not found or missing input_path")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        input_path = Path(job.input_path)
        stem = Path(job.input_filename or "document").stem
        output_filename = f"{stem}_protected.pdf"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = pdf_service.protect_pdf(input_path, output_path, password)

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Protect PDF job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.protect_pdf")
def protect_pdf_task(job_id: str, password: str) -> None:
    run_protect_pdf_job(job_id, password)


def run_image_collage_job(
    job_id: str,
    file_paths: list[str] = None,
    layout: str = "auto",
    spacing: int = 16,
    border_radius: int = 0,
    bg_color: str = "#ffffff",
    aspect_ratio: str = "1:1",
    format: str = "png",
) -> None:
    db = SessionLocal()
    try:
        job = job_service.get_job(db, job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        job_service.update_progress(db, job_id, progress=20, status="processing")
        if file_paths:
            paths = [Path(p) for p in file_paths]
        else:
            job_dir = storage_service.get_job_dir(job_id)
            paths = sorted([
                p for p in job_dir.glob("*")
                if p.is_file() and not p.name.startswith("collage_") and not p.name.startswith("output_")
            ])

        ext = "jpg" if format.lower() in ("jpg", "jpeg") else format.lower()
        output_filename = f"collage_{len(paths)}_photos.{ext}"
        output_path = storage_service.get_output_path(job_id, output_filename)

        job_service.update_progress(db, job_id, progress=50, status="processing")
        _, mime_type = image_service.create_collage(
            image_paths=paths,
            output_path=output_path,
            layout=layout,
            spacing=spacing,
            border_radius=border_radius,
            bg_color=bg_color,
            aspect_ratio=aspect_ratio,
            output_format=format,
        )

        job_service.update_progress(db, job_id, progress=90, status="processing")
        job_service.complete_job(
            db=db,
            job_id=job_id,
            output_path=str(output_path),
            output_filename=output_filename,
            output_mime=mime_type,
        )
        logger.info(f"Image collage job {job_id} completed successfully")
    except Exception as e:
        logger.exception(f"Image collage job {job_id} failed: {e}")
        job_service.fail_job(db, job_id, str(e))
    finally:
        db.close()


@celery_app.task(name="tasks.image_collage")
def image_collage_task(
    job_id: str,
    file_paths: list[str],
    layout: str = "auto",
    spacing: int = 16,
    border_radius: int = 0,
    bg_color: str = "#ffffff",
    aspect_ratio: str = "1:1",
    format: str = "png",
) -> None:
    run_image_collage_job(
        job_id=job_id,
        file_paths=file_paths,
        layout=layout,
        spacing=spacing,
        border_radius=border_radius,
        bg_color=bg_color,
        aspect_ratio=aspect_ratio,
        format=format,
    )


