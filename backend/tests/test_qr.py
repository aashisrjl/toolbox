from backend.app.workers.tasks import run_generate_qr_job


def test_qr_empty_data(client):
    response = client.post(
        "/api/v1/qr-code-generator",
        json={"data": "   "},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "FILE_VALIDATION_ERROR"


def test_qr_generator_job_execution(client):
    # Test top-level route /qr-code-generator
    response = client.post(
        "/qr-code-generator",
        json={
            "data": "https://example.com",
            "format": "png",
            "scale": 10,
            "border": 4,
            "foreground_color": "#000000",
            "background_color": "#ffffff",
            "error_correction": "m",
        },
    )
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    run_generate_qr_job(
        job_id=job_id,
        data="https://example.com",
        format_choice="png",
        scale=10,
        border=4,
        foreground_color="#000000",
        background_color="#ffffff",
        error_correction="m",
    )

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "completed"
    assert data["download_url"] is not None

    dl_resp = client.get(data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "image/png"
    assert len(dl_resp.content) > 0
