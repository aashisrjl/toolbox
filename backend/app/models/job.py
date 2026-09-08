import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text
from backend.app.db.base import Base


class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_slug = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="queued")  # queued, processing, completed, failed
    progress = Column(Integer, nullable=False, default=0)

    input_filename = Column(String(255), nullable=True)
    input_path = Column(String(1024), nullable=True)

    output_filename = Column(String(255), nullable=True)
    output_path = Column(String(1024), nullable=True)
    output_mime = Column(String(100), nullable=True)

    error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
