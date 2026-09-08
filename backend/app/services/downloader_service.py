import logging
import mimetypes
from pathlib import Path
from typing import Tuple, Optional
import yt_dlp
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)


class DownloaderService:
    @staticmethod
    def download(
        url: str,
        output_dir: Path,
        platform: str = "generic",
        format_choice: str = "video",
    ) -> Tuple[Path, str, str]:
        """
        Downloads a media file from a URL using yt-dlp.
        Returns: (output_path, filename, mime_type)
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        outtmpl = str(output_dir / "%(title).100s.%(ext)s")

        ydl_opts = {
            "outtmpl": outtmpl,
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
        }

        if format_choice == "audio":
            ydl_opts["format"] = "bestaudio/best"
            ydl_opts["postprocessors"] = [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ]
        else:
            ydl_opts["format"] = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
            ydl_opts["merge_output_format"] = "mp4"

        try:
            logger.info(f"Downloading from {platform}: {url}")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                downloaded_file = ydl.prepare_filename(info)

                path = Path(downloaded_file)
                if format_choice == "audio" and not path.exists():
                    path = path.with_suffix(".mp3")

                if not path.exists():
                    # Look for any file generated in output_dir
                    files = list(output_dir.glob("*.*"))
                    if files:
                        path = files[0]
                    else:
                        raise ProcessingError("Download completed but no file was written.")

                mime_type, _ = mimetypes.guess_type(path.name)
                if not mime_type:
                    mime_type = "audio/mpeg" if path.suffix == ".mp3" else "video/mp4"

                return path, path.name, mime_type

        except Exception as e:
            logger.exception(f"Error downloading from {url}: {e}")
            raise ProcessingError(f"Download failed: {str(e)}")


downloader_service = DownloaderService()
