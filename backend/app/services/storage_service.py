import os
import shutil
import time
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from backend.app.core.config import settings
from backend.app.core.errors import FileValidationError


class StorageService:
    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or settings.storage_path
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def get_job_dir(self, job_id: str) -> Path:
        job_dir = self.base_dir / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        return job_dir

    async def save_upload_file(
        self,
        job_id: str,
        upload_file: UploadFile,
        max_size_mb: int = settings.MAX_FILE_SIZE_MB,
    ) -> Path:
        job_dir = self.get_job_dir(job_id)
        original_name = Path(upload_file.filename or "uploaded_file").name
        dest_path = job_dir / f"input_{original_name}"

        max_bytes = max_size_mb * 1024 * 1024
        total_size = 0

        with open(dest_path, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
                total_size += len(chunk)
                if total_size > max_bytes:
                    dest_path.unlink(missing_ok=True)
                    raise FileValidationError(
                        f"File size exceeds the maximum allowed limit of {max_size_mb} MB"
                    )
                f.write(chunk)

        return dest_path

    def get_output_path(self, job_id: str, filename: str) -> Path:
        job_dir = self.get_job_dir(job_id)
        return job_dir / filename

    def delete_job_files(self, job_id: str) -> None:
        job_dir = self.base_dir / job_id
        if job_dir.exists():
            shutil.rmtree(job_dir, ignore_errors=True)

    def cleanup_expired_files(self, max_age_hours: int = settings.FILE_TTL_HOURS) -> int:
        now = time.time()
        max_age_seconds = max_age_hours * 3600
        removed_count = 0

        if not self.base_dir.exists():
            return 0

        for item in self.base_dir.iterdir():
            if item.is_dir():
                mtime = item.stat().st_mtime
                if now - mtime > max_age_seconds:
                    shutil.rmtree(item, ignore_errors=True)
                    removed_count += 1

        return removed_count


storage_service = StorageService()
