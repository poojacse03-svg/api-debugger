from pydantic import BaseModel
from typing import Optional, Any


class RequestSnapshot(BaseModel):
    method: str
    path: str
    query_params: dict[str, Any] = {}
    headers: dict[str, str] = {}
    body: Optional[Any] = None
    content_type: Optional[str] = None
    timestamp: Optional[str] = None
    incident_id: Optional[str] = None


class ResponseSnapshot(BaseModel):
    status_code: int
    headers: dict[str, str] = {}
    body: Optional[Any] = None
    error_message: Optional[str] = None
    timestamp: Optional[str] = None