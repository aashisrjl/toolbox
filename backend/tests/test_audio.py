import subprocess
import pytest
from pathlib import Path
from backend.app.workers.tasks import run_convert_audio_job


def generate_test_audio(path: Path, duration_sec: int = 1) -> Path:
    """Generates a tiny valid synthetic audio file using ffmpeg."""
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"sine=frequency=1000:sample_rate=8000:duration={duration_sec}",
        "-c:a", "pcm_s16le",
        str(path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return path


@pytest.fixture
def sample_audio(tmp_path) -> Path:
    audio_path = tmp_path / "sample.wav"
    return generate_test_audio(audio_path, duration_sec=1)


def test_audio_invalid_mime(client):
    response = client.post(
        "/api/v1/audio/convert",
        files={"file": ("test.txt", b"plain text", "text/plain")},
        data={"format": "mp3"},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "FILE_VALIDATION_ERROR"


def test_convert_audio_endpoint_and_job(client, sample_audio):
    with open(sample_audio, "rb") as f:
        response = client.post(
            "/api/v1/audio/convert",
            files={"file": ("sample.wav", f.read(), "audio/wav")},
            data={"format": "mp3", "bitrate": "128k"},
        )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_convert_audio_job(job_id, target_format="mp3", bitrate="128k")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 0
