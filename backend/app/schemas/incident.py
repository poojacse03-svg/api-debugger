from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class IncidentCreate(BaseModel):
    timestamp: Optional[str] = None
    method: str
    endpoint: str
    statusCode: int
    responseTime: Optional[float] = None
    errorMessage: Optional[str] = None
    stack: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class IncidentResponse(BaseModel):
    incident_id: str
    status: str

    class Config:
        from_attributes = True


class IncidentDetail(BaseModel):
    incident_id: str
    method: str
    endpoint: str
    status_code: int
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    stack: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True