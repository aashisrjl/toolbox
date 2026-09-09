import json
import os
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Toolbox Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(i).strip() for i in parsed if str(i).strip()]
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v if str(i).strip()]
        return ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./toolshub.db"

    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    USE_CELERY: bool = False

    # Storage settings
    STORAGE_DIR: str = "./storage/temp"
    MAX_FILE_SIZE_MB: int = 20
    FILE_TTL_HOURS: int = 1

    # Base URL for public links (if reverse-proxied or custom host)
    BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def storage_path(self) -> Path:
        p = Path(self.STORAGE_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()

# Ensure AI models are cached inside the project storage directory
models_dir = Path(__file__).resolve().parent.parent.parent.parent / "storage" / "models"
models_dir.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("U2NET_HOME", str(models_dir))
