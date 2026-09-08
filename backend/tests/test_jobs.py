from backend.app.services.job_service import job_service


def test_get_job_not_found(client):
    response = client.get("/api/v1/jobs/non-existent-uuid")
    assert response.status_code == 404
    data = response.json()
    assert data["code"] == "NOT_FOUND"


def test_job_lifecycle(client, db_session):
    # Create a job via service
    job = job_service.create_job(db_session, tool_slug="test-tool")
    assert job.status == "queued"
    assert job.progress == 0

    # Poll job status via API
    response = client.get(f"/api/v1/jobs/{job.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == job.id
    assert data["status"] == "queued"
    assert data["progress"] == 0
    assert data["download_url"] is None

    # Attempt download when not completed
    dl_response = client.get(f"/api/v1/jobs/{job.id}/download")
    assert dl_response.status_code == 400

    # Cancel/Delete job
    del_response = client.delete(f"/api/v1/jobs/{job.id}")
    assert del_response.status_code == 200

    # Verify deleted
    verify_response = client.get(f"/api/v1/jobs/{job.id}")
    assert verify_response.status_code == 404
