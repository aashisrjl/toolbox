import os
import shutil
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Override environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_toolshub.db"
os.environ["STORAGE_DIR"] = "./test_storage/temp"
os.environ["USE_CELERY"] = "false"

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app

# Setup test DB engine
test_engine = create_engine("sqlite:///./test_toolshub.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    Base.metadata.create_all(bind=test_engine)
    Path("./test_storage/temp").mkdir(parents=True, exist_ok=True)
    yield
    Base.metadata.drop_all(bind=test_engine)
    # Clean up test db and storage
    if os.path.exists("./test_toolshub.db"):
        os.remove("./test_toolshub.db")
    shutil.rmtree("./test_storage", ignore_errors=True)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
