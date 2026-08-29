import re
import json
from sqlalchemy.orm import Session

from backend.app.schemas.replay import RequestSnapshot, ResponseSnapshot
from backend.app.models.replay_artifact import ReplayArtifact

SENSITIVE_KEY_PATTERNS = [
    "password", "passwd", "secret", "token", "access_token", "refresh_token",
    "api_key", "apikey", "authorization", "cookie", "credit_card",
    "card_number", "cvv",
]


def _is_sensitive_key(key: str) -> bool:
    key_lower = key.lower()
    return any(pattern in key_lower for pattern in SENSITIVE_KEY_PATTERNS)


def sanitize(value):
    """Recursively redact sensitive keys in a dict/list structure. Non-dict values pass through unchanged."""
    if isinstance(value, dict):
        result = {}
        for k, v in value.items():
            if _is_sensitive_key(k):
                result[k] = "[REDACTED]"
            else:
                result[k] = sanitize(v)
        return result
    elif isinstance(value, list):
        return [sanitize(item) for item in value]
    else:
        return value


def capture_request(
    method: str,
    path: str,
    query_params: dict = None,
    headers: dict = None,
    body=None,
    content_type: str = None,
    timestamp: str = None,
    incident_id: str = None,
) -> RequestSnapshot:
    """Builds a RequestSnapshot from raw incoming request data, with sensitive fields redacted."""
    return RequestSnapshot(
        method=method,
        path=path,
        query_params=sanitize(query_params or {}),
        headers=sanitize(headers or {}),
        body=sanitize(body),
        content_type=content_type,
        timestamp=timestamp,
        incident_id=incident_id,
    )


def capture_response(
    status_code: int,
    headers: dict = None,
    body=None,
    error_message: str = None,
    timestamp: str = None,
) -> ResponseSnapshot:
    """Builds a ResponseSnapshot from raw response data."""
    return ResponseSnapshot(
        status_code=status_code,
        headers=headers or {},
        body=body,
        error_message=error_message,
        timestamp=timestamp,
    )


def save_replay_artifact(
    db: Session,
    incident_id: str,
    request: RequestSnapshot,
    response: ResponseSnapshot,
) -> ReplayArtifact:
    """Persists a sanitized request/response pair for an incident. Overwrites any existing artifact for that incident."""
    existing = db.query(ReplayArtifact).filter(ReplayArtifact.incident_id == incident_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    artifact = ReplayArtifact(
        incident_id=incident_id,
        request_method=request.method,
        request_path=request.path,
        request_query_params=json.dumps(request.query_params),
        request_headers=json.dumps(request.headers),
        request_body=json.dumps(request.body),
        request_content_type=request.content_type,
        original_status_code=response.status_code,
        original_response_headers=json.dumps(response.headers),
        original_response_body=json.dumps(response.body) if response.body is not None else None,
        original_error_message=response.error_message,
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact


def get_replay_artifact(db: Session, incident_id: str) -> ReplayArtifact | None:
    """Retrieves the stored replay artifact for an incident, if one exists."""
    return db.query(ReplayArtifact).filter(ReplayArtifact.incident_id == incident_id).first()