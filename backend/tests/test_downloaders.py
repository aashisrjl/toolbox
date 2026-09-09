from unittest.mock import patch, MagicMock
from pathlib import Path
import pytest
from backend.app.core.errors import ProcessingError
from backend.app.services.downloader_service import downloader_service, DownloaderService
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


def test_youtube_bot_detection_error_handling(tmp_path):
    bot_error = Exception("ERROR: [youtube] XPo0p4r3bH4: Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies for the authentication.")
    with patch("yt_dlp.YoutubeDL") as mock_ydl:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = bot_error
        mock_ydl.return_value.__enter__.return_value = mock_instance

        with pytest.raises(ProcessingError) as exc_info:
            DownloaderService.download(
                url="https://www.youtube.com/watch?v=XPo0p4r3bH4",
                output_dir=tmp_path,
                platform="youtube",
                format_choice="audio",
            )
        assert "Sign in to confirm you’re not a bot" in str(exc_info.value)
        assert "cookies.txt" in str(exc_info.value)


def test_youtube_extractor_args_and_cookies(tmp_path):
    fake_cookie_file = tmp_path / "cookies.txt"
    fake_cookie_file.write_text("# Netscape HTTP Cookie File\n")

    captured_opts = {}

    def capture_init(opts):
        captured_opts.update(opts)
        mock = MagicMock()
        fake_file = tmp_path / "test.mp3"
        fake_file.write_bytes(b"audio content")
        mock.extract_info.return_value = {"title": "test"}
        mock.prepare_filename.return_value = str(fake_file)
        mock_ctx = MagicMock()
        mock_ctx.__enter__.return_value = mock
        return mock_ctx

    with patch("yt_dlp.YoutubeDL", side_effect=capture_init):
        with patch.object(DownloaderService, "_find_cookie_file", return_value=fake_cookie_file):
            path, filename, mime = DownloaderService.download(
                url="https://www.youtube.com/watch?v=XPo0p4r3bH4",
                output_dir=tmp_path,
                platform="youtube",
                format_choice="audio",
            )
            assert captured_opts.get("cookiefile") == str(fake_cookie_file)
            assert "extractor_args" in captured_opts
            assert "youtube" in captured_opts["extractor_args"]
            assert "player_client" in captured_opts["extractor_args"]["youtube"]
            assert "android" in captured_opts["extractor_args"]["youtube"]["player_client"]

