import logging
import subprocess
from pathlib import Path
from typing import Tuple
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)

AUDIO_FORMAT_MAP = {
    "mp3": ("audio/mpeg", ".mp3"),
    "wav": ("audio/wav", ".wav"),
    "flac": ("audio/flac", ".flac"),
    "aac": ("audio/aac", ".aac"),
    "ogg": ("audio/ogg", ".ogg"),
}


class AudioService:
    @staticmethod
    def _run_cmd(cmd: list[str]) -> None:
        logger.info("Executing audio ffmpeg command: %s", " ".join(cmd))
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if proc.returncode != 0:
            logger.error("FFmpeg audio error (code %d): %s", proc.returncode, proc.stderr)
            raise ProcessingError(f"Audio conversion failed: {proc.stderr[-500:] if proc.stderr else 'Unknown error'}")

    @classmethod
    def convert(
        cls,
        input_path: Path,
        output_path: Path,
        target_format: str = "mp3",
        bitrate: str = "192k",
    ) -> Tuple[Path, str]:
        fmt = target_format.lower().strip()
        mime_type, _ = AUDIO_FORMAT_MAP.get(fmt, ("audio/mpeg", ".mp3"))

        cmd = ["ffmpeg", "-y", "-i", str(input_path)]

        if fmt == "wav":
            cmd.extend(["-c:a", "pcm_s16le"])
        elif fmt == "flac":
            cmd.extend(["-c:a", "flac"])
        elif fmt == "aac":
            cmd.extend(["-c:a", "aac", "-b:a", bitrate])
        elif fmt == "ogg":
            cmd.extend(["-c:a", "libvorbis", "-b:a", bitrate])
        else:  # mp3 default
            cmd.extend(["-c:a", "libmp3lame", "-b:a", bitrate])

        cmd.append(str(output_path))
        cls._run_cmd(cmd)
        return output_path, mime_type


audio_service = AudioService()
