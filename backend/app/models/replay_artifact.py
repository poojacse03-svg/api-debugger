from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.app.db.database import Base


class ReplayArtifact(Base):
    __tablename__ = "replay_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)

    request_method = Column(String)
    request_path = Column(String)
    request_query_params = Column(Text)
    request_headers = Column(Text)
    request_body = Column(Text)
    request_content_type = Column(String, nullable=True)

    original_status_code = Column(Integer)
    original_response_headers = Column(Text)
    original_response_body = Column(Text, nullable=True)
    original_error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())