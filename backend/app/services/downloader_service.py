import logging
import mimetypes
from pathlib import Path
from typing import Tuple, Optional
import yt_dlp
from backend.app.core.config import settings
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)


class DownloaderService:
    @staticmethod
    def _find_cookie_file() -> Optional[Path]:
        """Locates an existing cookies.txt file if configured or present."""
        candidates = []
        if settings.YTDLP_COOKIES_FILE:
            candidates.append(Path(settings.YTDLP_COOKIES_FILE))

        # Check standard project locations
        base_dir = Path(__file__).resolve().parent.parent.parent
        candidates.extend([
            Path("cookies.txt"),
            base_dir / "cookies.txt",
            base_dir / "storage" / "cookies.txt",
            base_dir.parent / "cookies.txt",
        ])

        for path in candidates:
            try:
                if path and path.is_file() and path.stat().st_size > 0:
                    return path.resolve()
            except Exception:
                continue
        return None

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

        # Check for cookies configuration
        cookie_file = DownloaderService._find_cookie_file()
        if cookie_file:
            ydl_opts["cookiefile"] = str(cookie_file)
            logger.info(f"Using yt-dlp cookie file: {cookie_file}")
        elif settings.YTDLP_COOKIES_FROM_BROWSER:
            ydl_opts["cookiesfrombrowser"] = (settings.YTDLP_COOKIES_FROM_BROWSER,)
            logger.info(f"Using yt-dlp cookies from browser: {settings.YTDLP_COOKIES_FROM_BROWSER}")

        is_youtube = platform == "youtube" or any(d in url.lower() for d in ("youtube.com", "youtu.be"))
        if is_youtube:
            # Prefer mobile and alternate clients (android, ios, mweb) which often bypass YouTube bot detection
            ydl_opts["extractor_args"] = {
                "youtube": {
                    "player_client": ["android", "ios", "mweb", "web"]
                }
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
            err_msg = str(e)
            if "confirm you’re not a bot" in err_msg or "confirm you're not a bot" in err_msg.lower():
                raise ProcessingError(
                    "YouTube requested bot verification ('Sign in to confirm you’re not a bot'). "
                    "To resolve this, export your YouTube cookies to a 'cookies.txt' file in the backend directory "
                    "or configure YTDLP_COOKIES_FILE / YTDLP_COOKIES_FROM_BROWSER in your environment."
                )
            raise ProcessingError(f"Download failed: {err_msg}")


downloader_service = DownloaderService()
