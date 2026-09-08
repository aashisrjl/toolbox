from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

JobStatusType = Literal["queued", "processing", "completed", "failed"]


class JobBase(BaseModel):
    job_id: str
    status: JobStatusType
    progress: int = Field(default=0, ge=0, le=100)
    download_url: Optional[str] = None
    error: Optional[str] = None


class JobRead(JobBase):
    tool_slug: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class JobCreateResponse(JobBase):
    pass
