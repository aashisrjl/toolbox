import io
import pytest
from PIL import Image
from pypdf import PdfReader
from backend.app.workers.tasks import (
    run_image_to_pdf_job,
    run_merge_pdf_job,
    run_pdf_to_word_job,
    run_protect_pdf_job,
)


@pytest.fixture
def sample_image_bytes() -> bytes:
    img = Image.new("RGB", (200, 200), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sample_pdf_bytes(sample_image_bytes) -> bytes:
    img = Image.open(io.BytesIO(sample_image_bytes))
    buf = io.BytesIO()
    img.save(buf, format="PDF")
    return buf.getvalue()


def test_pdf_invalid_mime(client):
    response = client.post(
        "/api/v1/image-to-pdf",
        files={"file": ("test.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_image_to_pdf_job_execution(client, sample_image_bytes):
    response = client.post(
        "/image-to-pdf",
        files={"file": ("photo.png", sample_image_bytes, "image/png")},
        data={"page_size": "a4", "orientation": "portrait", "margin": "10"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_image_to_pdf_job(job_id, page_size="a4", orientation="portrait", margin=10)

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/pdf"
    assert dl_resp.content.startswith(b"%PDF")


def test_merge_pdf_validation(client, sample_pdf_bytes):
    # Only 1 file provided
    response = client.post(
        "/merge-pdf",
        files=[("files", ("one.pdf", sample_pdf_bytes, "application/pdf"))],
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_merge_pdf_job_execution(client, sample_pdf_bytes):
    response = client.post(
        "/merge-pdf",
        files=[
            ("files", ("one.pdf", sample_pdf_bytes, "application/pdf")),
            ("files", ("two.pdf", sample_pdf_bytes, "application/pdf")),
        ],
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    job_data = status_resp.json()
    assert job_data["status"] == "completed"

    dl_resp = client.get(job_data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/pdf"
    assert dl_resp.content.startswith(b"%PDF")

    reader = PdfReader(io.BytesIO(dl_resp.content))
    assert len(reader.pages) == 2


def test_pdf_to_word_validation(client):
    response = client.post(
        "/pdf-to-word",
        files={"file": ("notes.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_pdf_to_word_job_execution(client, sample_pdf_bytes):
    response = client.post(
        "/pdf-to-word",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_pdf_to_word_job(job_id)

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    # DOCX is a zip archive starting with PK\x03\x04
    assert dl_resp.content.startswith(b"PK\x03\x04")


def test_word_to_pdf_validation(client):
    response = client.post(
        "/word-to-pdf",
        files={"file": ("notes.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_protect_pdf_validation(client, sample_pdf_bytes):
    response = client.post(
        "/protect-pdf",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": "   "},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_protect_pdf_job_execution(client, sample_pdf_bytes):
    response = client.post(
        "/protect-pdf",
        files={"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")},
        data={"password": "SecretPassword123!"},
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_protect_pdf_job(job_id, password="SecretPassword123!")

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.content.startswith(b"%PDF")

    # Verify that the PDF is encrypted and requires the password
    reader = PdfReader(io.BytesIO(dl_resp.content))
    assert reader.is_encrypted is True
    assert reader.decrypt("SecretPassword123!") != 0
