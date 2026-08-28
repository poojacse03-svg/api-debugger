from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from backend.app.db.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    method = Column(String)
    endpoint = Column(String)
    status_code = Column(Integer)
    response_time = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    stack = Column(Text, nullable=True)
    status = Column(String, default="received")
    created_at = Column(DateTime(timezone=True), server_default=func.now())