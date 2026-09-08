import subprocess
import pytest
from pathlib import Path
from backend.app.workers.tasks import (
    run_convert_video_job,
    run_trim_video_job,
    run_extract_audio_job,
    run_remove_video_bg_job,
)
from backend.app.services.video_service import VideoService


def generate_test_video(path: Path, duration_sec: int = 1) -> Path:
    """Generates a tiny valid 160x120 synthetic MP4 video with audio using ffmpeg."""
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"testsrc=size=160x120:rate=10",
        "-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=8000",
        "-t", str(duration_sec),
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        str(path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return path


@pytest.fixture
def sample_video(tmp_path) -> Path:
    vid_path = tmp_path / "sample.mp4"
    return generate_test_video(vid_path, duration_sec=1)


def test_video_invalid_mime(client):
    response = client.post(
        "/api/v1/video/convert",
        files={"file": ("test.txt", b"plain text", "text/plain")},
        data={"format": "mp4"},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "FILE_VALIDATION_ERROR"


def test_convert_video_to_gif(client, sample_video):
    with open(sample_video, "rb") as f:
        response = client.post(
            "/api/v1/video/convert",
            files={"file": ("sample.mp4", f.read(), "video/mp4")},
            data={"format": "gif"},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_convert_video_job(job_id, target_format="gif")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "image/gif"
    assert len(dl_resp.content) > 0


def test_trim_video_execution(client, sample_video):
    with open(sample_video, "rb") as f:
        response = client.post(
            "/api/v1/video/trim",
            files={"file": ("sample.mp4", f.read(), "video/mp4")},
            data={"start_time": "0", "end_time": "0.5"},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_trim_video_job(job_id, start_time="0", end_time="0.5")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 0


def test_trim_webm_video(client, tmp_path):
    webm_path = tmp_path / "test.webm"
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "testsrc=size=160x120:rate=10",
        "-t", "2",
        "-c:v", "libvpx",
        "-an",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    with open(webm_path, "rb") as f:
        response = client.post(
            "/api/v1/video/trim",
            files={"file": ("test.webm", f.read(), "video/webm")},
            data={"start_time": "0", "end_time": "1"},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_trim_video_job(job_id, start_time="0", end_time="1")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 0
    assert dl_resp.headers["content-type"] == "video/webm"


def test_extract_audio_mp3(client, sample_video):
    with open(sample_video, "rb") as f:
        response = client.post(
            "/api/v1/video/extract-audio",
            files={"file": ("sample.mp4", f.read(), "video/mp4")},
            data={"format": "mp3", "bitrate": "128k"},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_extract_audio_job(job_id, target_format="mp3", bitrate="128k")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "audio/mpeg"


def test_remove_video_background_execution(client, sample_video, monkeypatch):
    # Mock video_service.remove_background to avoid running full neural matting in unit test
    def mock_remove_bg(input_path, output_path, *args, **kwargs):
        # Transcode directly to VP9 WEBM
        cmd = [
            "ffmpeg", "-y", "-i", str(input_path),
            "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30",
            str(output_path),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_path, "video/webm"

    monkeypatch.setattr(VideoService, "remove_background", staticmethod(mock_remove_bg))

    with open(sample_video, "rb") as f:
        response = client.post(
            "/api/v1/video/remove-background",
            files={"file": ("clip.mp4", f.read(), "video/mp4")},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_remove_video_bg_job(job_id)

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "video/webm"


def test_extract_audio_no_audio_stream(client, tmp_path):
    # Generate a video without any audio stream (-an)
    silent_video = tmp_path / "silent.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "testsrc=size=160x120:rate=10",
        "-t", "1",
        "-c:v", "libx264",
        "-an",
        str(silent_video),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    with open(silent_video, "rb") as f:
        response = client.post(
            "/api/v1/video/extract-audio",
            files={"file": ("silent.mp4", f.read(), "video/mp4")},
            data={"format": "mp3"},
        )
    assert response.status_code == 422
    assert "does not contain an audio track" in response.json()["error"]
