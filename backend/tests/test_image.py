import io
import pytest
from PIL import Image, ImageDraw
from backend.app.workers.tasks import (
    run_remove_background_job,
    run_compress_image_job,
    run_convert_image_job,
    run_resize_image_job,
    run_image_collage_job,
)
from backend.app.services.image_service import ImageService


@pytest.fixture(autouse=True)
def mock_background_removal(monkeypatch):
    """Mocks actual ONNX inference in unit tests to ensure fast, 100% offline test execution."""
    def mock_remove(input_path, output_path):
        with Image.open(input_path) as img:
            rgba = img.convert("RGBA")
            rgba.save(output_path, format="PNG")
        return output_path

    monkeypatch.setattr(ImageService, "remove_background", staticmethod(mock_remove))


def create_test_image_bytes(format="PNG", color=(255, 0, 0), size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color=color)
    draw = ImageDraw.Draw(img)
    draw.rectangle([15, 15, size[0] - 15, size[1] - 15], fill=(0, 255, 0))
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


def test_upload_invalid_mime(client):
    file_bytes = b"Hello, this is not an image."
    response = client.post(
        "/api/v1/image/remove-background",
        files={"file": ("test.txt", file_bytes, "text/plain")},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "FILE_VALIDATION_ERROR"


def test_upload_valid_image(client):
    img_bytes = create_test_image_bytes(format="PNG")
    response = client.post(
        "/api/v1/image/remove-background",
        files={"file": ("sample.png", img_bytes, "image/png")},
    )
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] in ("queued", "processing", "completed")


def test_remove_background_worker_execution(client):
    img_bytes = create_test_image_bytes(format="PNG")
    response = client.post(
        "/api/v1/image/remove-background",
        files={"file": ("subject.png", img_bytes, "image/png")},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_remove_background_job(job_id)

    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    job_data = status_response.json()
    assert job_data["status"] == "completed"
    assert job_data["progress"] == 100

    dl_response = client.get(job_data["download_url"])
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "image/png"
    result_img = Image.open(io.BytesIO(dl_response.content))
    assert result_img.format == "PNG"


def test_compress_image_execution(client):
    img_bytes = create_test_image_bytes(format="PNG", size=(200, 200))
    response = client.post(
        "/api/v1/image/compress",
        files={"file": ("large.png", img_bytes, "image/png")},
        data={"quality": "60", "format": "webp"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_compress_image_job(job_id, quality=60, target_format="webp")

    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    job_data = status_response.json()
    assert job_data["status"] == "completed"

    dl_response = client.get(job_data["download_url"])
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "image/webp"
    result_img = Image.open(io.BytesIO(dl_response.content))
    assert result_img.format == "WEBP"


def test_convert_image_execution(client):
    img_bytes = create_test_image_bytes(format="JPEG", size=(100, 100))
    response = client.post(
        "/api/v1/image/convert",
        files={"file": ("photo.jpg", img_bytes, "image/jpeg")},
        data={"format": "png"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_convert_image_job(job_id, target_format="png")

    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    job_data = status_response.json()
    assert job_data["status"] == "completed"

    dl_response = client.get(job_data["download_url"])
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "image/png"
    result_img = Image.open(io.BytesIO(dl_response.content))
    assert result_img.format == "PNG"


def test_convert_image_avif(client):
    img_bytes = create_test_image_bytes(format="PNG", size=(80, 80))
    response = client.post(
        "/api/v1/image/convert",
        files={"file": ("input.png", img_bytes, "image/png")},
        data={"format": "avif"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_convert_image_job(job_id, target_format="avif")

    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    job_data = status_response.json()
    assert job_data["status"] == "completed"
    assert job_data["download_url"] is not None

    dl_response = client.get(job_data["download_url"])
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "image/avif"


def test_resize_crop_image_execution(client):
    img_bytes = create_test_image_bytes(format="PNG", size=(400, 200))
    # Test crop mode
    response = client.post(
        "/api/v1/image/resize",
        files={"file": ("banner.png", img_bytes, "image/png")},
        data={"mode": "crop", "width": "150", "height": "150", "keep_aspect": "true"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_resize_image_job(job_id, mode="crop", width=150, height=150, keep_aspect=True)

    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    job_data = status_response.json()
    assert job_data["status"] == "completed"

    dl_response = client.get(job_data["download_url"])
    assert dl_response.status_code == 200
    result_img = Image.open(io.BytesIO(dl_response.content))
    assert result_img.size == (150, 150)


def test_image_collage_validation_fails_for_invalid_count(client):
    img_bytes = create_test_image_bytes(format="PNG", size=(100, 100))

    # Test with 1 photo (should fail)
    res_one = client.post(
        "/api/v1/image-collage",
        files=[("files", ("img1.png", img_bytes, "image/png"))],
    )
    assert res_one.status_code == 422
    assert res_one.json()["code"] == "FILE_VALIDATION_ERROR"
    assert "strictly requires 2, 3, or 4 photos" in res_one.json()["error"]

    # Test with 5 photos (should fail)
    files_5 = [("files", (f"img{i}.png", img_bytes, "image/png")) for i in range(5)]
    res_five = client.post(
        "/api/v1/image-collage",
        files=files_5,
    )
    assert res_five.status_code == 422
    assert res_five.json()["code"] == "FILE_VALIDATION_ERROR"
    assert "strictly requires 2, 3, or 4 photos" in res_five.json()["error"]


def test_image_collage_2_photos_execution(client):
    img1 = create_test_image_bytes(color=(255, 0, 0), size=(200, 200))
    img2 = create_test_image_bytes(color=(0, 0, 255), size=(200, 200))

    res = client.post(
        "/api/v1/image-collage",
        files=[
            ("files", ("p1.png", img1, "image/png")),
            ("files", ("p2.png", img2, "image/png")),
        ],
        data={
            "layout": "side_by_side",
            "spacing": "12",
            "border_radius": "8",
            "bg_color": "#ffffff",
            "aspect_ratio": "1:1",
            "format": "png",
        },
    )
    assert res.status_code == 202
    job_id = res.json()["job_id"]

    run_image_collage_job(
        job_id=job_id,
        file_paths=res.json().get("file_paths", []),
        layout="side_by_side",
        spacing=12,
        border_radius=8,
        bg_color="#ffffff",
        aspect_ratio="1:1",
        format="png",
    )

    status_res = client.get(f"/api/v1/jobs/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "completed"

    dl_res = client.get(status_res.json()["download_url"])
    assert dl_res.status_code == 200
    out_img = Image.open(io.BytesIO(dl_res.content))
    assert out_img.size == (1200, 1200)


def test_image_collage_3_photos_execution(client):
    img1 = create_test_image_bytes(color=(255, 0, 0), size=(150, 150))
    img2 = create_test_image_bytes(color=(0, 255, 0), size=(150, 150))
    img3 = create_test_image_bytes(color=(0, 0, 255), size=(150, 150))

    res = client.post(
        "/image-collage",
        files=[
            ("files", ("p1.png", img1, "image/png")),
            ("files", ("p2.png", img2, "image/png")),
            ("files", ("p3.png", img3, "image/png")),
        ],
        data={
            "layout": "top1_bottom2",
            "spacing": "10",
            "border_radius": "4",
            "bg_color": "#000000",
            "aspect_ratio": "16:9",
            "format": "jpg",
        },
    )
    assert res.status_code == 202
    job_id = res.json()["job_id"]

    run_image_collage_job(
        job_id=job_id,
        file_paths=[],
        layout="top1_bottom2",
        spacing=10,
        border_radius=4,
        bg_color="#000000",
        aspect_ratio="16:9",
        format="jpg",
    )

    status_res = client.get(f"/api/v1/jobs/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "completed"

    dl_res = client.get(status_res.json()["download_url"])
    assert dl_res.status_code == 200
    out_img = Image.open(io.BytesIO(dl_res.content))
    assert out_img.size == (1280, 720)


def test_image_collage_4_photos_execution(client):
    img = create_test_image_bytes(format="PNG", size=(100, 100))
    res = client.post(
        "/image-college",
        files=[("files", (f"img_{i}.png", img, "image/png")) for i in range(4)],
        data={"layout": "grid_2x2", "aspect_ratio": "4:3"},
    )
    assert res.status_code == 202
    job_id = res.json()["job_id"]

    run_image_collage_job(job_id=job_id, file_paths=[], layout="grid_2x2", aspect_ratio="4:3")

    status_res = client.get(f"/api/v1/jobs/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "completed"
