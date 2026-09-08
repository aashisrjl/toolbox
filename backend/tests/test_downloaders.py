from unittest.mock import patch
from pathlib import Path
from backend.app.workers.tasks import run_download_media_job


def test_youtube_invalid_domain(client):
    response = client.post(
        "/download-youtube-videos",
        json={"url": "https://example.com/watch?v=12345", "format": "video"},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_instagram_invalid_domain(client):
    response = client.post(
        "/download-instagram-videos",
        json={"url": "https://twitter.com/post/123", "format": "video"},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_tiktok_invalid_domain(client):
    response = client.post(
        "/download-tiktok-videos",
        json={"url": "https://vimeo.com/12345", "format": "video"},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_facebook_invalid_domain(client):
    response = client.post(
        "/download-facebook-reels",
        json={"url": "https://vimeo.com/12345", "format": "video"},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def fake_download(url: str, output_dir: Path, platform: str = "generic", format_choice: str = "video"):
    ext = "mp3" if format_choice == "audio" else "mp4"
    out_file = output_dir / f"downloaded_media.{ext}"
    out_file.write_bytes(b"dummy downloaded video content")
    mime = "audio/mpeg" if format_choice == "audio" else "video/mp4"
    return out_file, out_file.name, mime


@patch("backend.app.services.downloader_service.DownloaderService.download", side_effect=fake_download)
def test_tiktok_download_job(mock_dl, client):
    # Test top-level route /download-tiktok-videos
    response = client.post(
        "/download-tiktok-videos",
        json={"url": "https://www.tiktok.com/@user/video/7123456789", "format": "video"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_download_media_job(job_id, url="https://www.tiktok.com/@user/video/7123456789", platform="tiktok", format_choice="video")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.content == b"dummy downloaded video content"


@patch("backend.app.services.downloader_service.DownloaderService.download", side_effect=fake_download)
def test_facebook_reels_download_job(mock_dl, client):
    # Test top-level route /download-facebook-reels
    response = client.post(
        "/download-facebook-reels",
        json={"url": "https://www.facebook.com/reel/123456789", "format": "video"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_download_media_job(job_id, url="https://www.facebook.com/reel/123456789", platform="facebook", format_choice="video")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.content == b"dummy downloaded video content"
