import json
import logging
import shutil
import subprocess
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)

VIDEO_FORMAT_MAP = {
    "mp4": ("video/mp4", ".mp4"),
    "webm": ("video/webm", ".webm"),
    "mov": ("video/quicktime", ".mov"),
    "gif": ("image/gif", ".gif"),
}

AUDIO_FORMAT_MAP = {
    "mp3": ("audio/mpeg", ".mp3"),
    "wav": ("audio/wav", ".wav"),
    "aac": ("audio/aac", ".aac"),
    "ogg": ("audio/ogg", ".ogg"),
}


class VideoService:
    @staticmethod
    def _run_cmd(cmd: list[str]) -> str:
        logger.info("Executing command: %s", " ".join(cmd))
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if proc.returncode != 0:
            logger.error("FFmpeg error (code %d): %s", proc.returncode, proc.stderr)
            stderr_text = proc.stderr or ""
            if "does not contain any stream" in stderr_text:
                raise ProcessingError("The uploaded video does not contain an audio track to extract.")
            raise ProcessingError(f"Video processing failed: {stderr_text[-500:] if stderr_text else 'Unknown error'}")
        return proc.stdout

    @classmethod
    def has_audio_stream(cls, input_path: Path) -> bool:
        """Checks if a video file has at least one audio stream."""
        cmd = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "a",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
            str(input_path),
        ]
        try:
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return bool(proc.stdout.strip())
        except Exception:
            return True

    @classmethod
    def get_video_info(cls, input_path: Path) -> Dict[str, Any]:
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(input_path),
        ]
        try:
            output = cls._run_cmd(cmd)
            return json.loads(output)
        except Exception:
            return {}

    @classmethod
    def convert(
        cls,
        input_path: Path,
        output_path: Path,
        target_format: str = "mp4",
        quality: str = "medium",
    ) -> Tuple[Path, str]:
        fmt = target_format.lower().strip()
        mime_type, _ = VIDEO_FORMAT_MAP.get(fmt, ("video/mp4", ".mp4"))

        crf = "23"
        if quality == "high":
            crf = "18"
        elif quality == "low":
            crf = "28"

        if fmt == "gif":
            # High-fidelity two-pass GIF generator
            filter_str = "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
            cmd = ["ffmpeg", "-y", "-i", str(input_path), "-vf", filter_str, str(output_path)]
        elif fmt == "webm":
            cmd = [
                "ffmpeg", "-y", "-i", str(input_path),
                "-c:v", "libvpx-vp9",
                "-crf", crf,
                "-b:v", "0",
                "-c:a", "libopus",
                str(output_path),
            ]
        elif fmt == "mov":
            cmd = [
                "ffmpeg", "-y", "-i", str(input_path),
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", crf,
                "-c:a", "aac",
                str(output_path),
            ]
        else:  # mp4 default
            cmd = [
                "ffmpeg", "-y", "-i", str(input_path),
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", crf,
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",
                str(output_path),
            ]

        cls._run_cmd(cmd)
        return output_path, mime_type

    @classmethod
    def trim(
        cls,
        input_path: Path,
        output_path: Path,
        start_time: str = "0",
        end_time: Optional[str] = None,
    ) -> Tuple[Path, str]:
        ext = output_path.suffix.lower()
        mime_type = "video/mp4"
        for k, (m, e) in VIDEO_FORMAT_MAP.items():
            if e == ext:
                mime_type = m
                break

        # 1. Try fast stream copy without re-encoding
        copy_cmd = ["ffmpeg", "-y", "-ss", str(start_time)]
        if end_time:
            copy_cmd.extend(["-to", str(end_time)])
        copy_cmd.extend([
            "-i", str(input_path),
            "-c", "copy",
            str(output_path),
        ])

        try:
            cls._run_cmd(copy_cmd)
            return output_path, mime_type
        except Exception as e:
            logger.warning("Stream copy failed (%s), falling back to re-encoding", e)
            if output_path.exists():
                output_path.unlink(missing_ok=True)

        # 2. Fallback: container-aware re-encoding
        has_audio = cls.has_audio_stream(input_path)
        encode_cmd = ["ffmpeg", "-y", "-ss", str(start_time)]
        if end_time:
            encode_cmd.extend(["-to", str(end_time)])
        encode_cmd.extend(["-i", str(input_path)])

        if ext == ".webm":
            encode_cmd.extend(["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30"])
            if has_audio:
                encode_cmd.extend(["-c:a", "libopus"])
            else:
                encode_cmd.append("-an")
        else:
            encode_cmd.extend(["-c:v", "libx264", "-preset", "fast", "-crf", "23"])
            if has_audio:
                encode_cmd.extend(["-c:a", "aac"])
            else:
                encode_cmd.append("-an")

        encode_cmd.append(str(output_path))
        cls._run_cmd(encode_cmd)
        return output_path, mime_type

    @classmethod
    def extract_audio(
        cls,
        input_path: Path,
        output_path: Path,
        target_format: str = "mp3",
        bitrate: str = "192k",
    ) -> Tuple[Path, str]:
        if not cls.has_audio_stream(input_path):
            raise ProcessingError("The uploaded video does not contain an audio track to extract.")

        fmt = target_format.lower().strip()
        mime_type, _ = AUDIO_FORMAT_MAP.get(fmt, ("audio/mpeg", ".mp3"))

        cmd = ["ffmpeg", "-y", "-i", str(input_path), "-vn"]
        if fmt == "wav":
            cmd.extend(["-c:a", "pcm_s16le"])
        elif fmt == "aac":
            cmd.extend(["-c:a", "aac", "-b:a", bitrate])
        elif fmt == "ogg":
            cmd.extend(["-c:a", "libvorbis", "-b:a", bitrate])
        else:  # mp3 default
            cmd.extend(["-c:a", "libmp3lame", "-b:a", bitrate])

        cmd.append(str(output_path))
        cls._run_cmd(cmd)
        return output_path, mime_type

    @classmethod
    def remove_background(
        cls,
        input_path: Path,
        output_path: Path,
        max_frames: int = 150,
        fps: int = 24,
        model: str = "u2net",
        alpha_matting: bool = False,
    ) -> Tuple[Path, str]:
        """
        Extracts frames, matts each frame with rembg using a persistent session,
        post-process mask, and alpha matting, and compiles transparent VP9 WEBM.
        """
        import rembg
        from PIL import Image

        temp_dir = output_path.parent / f"frames_{output_path.stem}"
        temp_dir.mkdir(parents=True, exist_ok=True)
        matted_dir = output_path.parent / f"matted_{output_path.stem}"
        matted_dir.mkdir(parents=True, exist_ok=True)

        try:
            # 1. Extract frames from video
            extract_cmd = [
                "ffmpeg", "-y",
                "-i", str(input_path),
                "-vframes", str(max_frames),
                "-vf", f"fps={fps}",
                str(temp_dir / "frame_%05d.png"),
            ]
            cls._run_cmd(extract_cmd)

            frame_files = sorted(list(temp_dir.glob("frame_*.png")))
            if not frame_files:
                raise ProcessingError("Failed to extract any video frames for matting.")

            # 2. Process background removal with persistent session and edge refinement
            model_name = (model or "u2net").strip()
            try:
                session = rembg.new_session(model_name)
            except Exception as e:
                logger.warning("Failed to initialize session for %s: %s, falling back to u2net", model_name, e)
                session = rembg.new_session("u2net")

            for f in frame_files:
                with Image.open(f) as img:
                    try:
                        nobg = rembg.remove(
                            img,
                            session=session,
                            post_process_mask=True,
                            alpha_matting=alpha_matting,
                        )
                    except Exception:
                        nobg = rembg.remove(
                            img,
                            session=session,
                            post_process_mask=True,
                        )
                    nobg.save(matted_dir / f.name, format="PNG")

            # 3. Compile matted frames into transparent VP9 WEBM
            compile_cmd = [
                "ffmpeg", "-y",
                "-framerate", str(fps),
                "-i", str(matted_dir / "frame_%05d.png"),
                "-c:v", "libvpx-vp9",
                "-pix_fmt", "yuva420p",
                "-auto-alt-ref", "0",
                "-b:v", "0",
                "-crf", "26",
                str(output_path),
            ]
            cls._run_cmd(compile_cmd)

            return output_path, "video/webm"
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
            shutil.rmtree(matted_dir, ignore_errors=True)


video_service = VideoService()
