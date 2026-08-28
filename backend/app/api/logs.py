import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.incident import Incident
from backend.app.schemas.incident import IncidentCreate, IncidentResponse

router = APIRouter()


@router.post("/api/logs", response_model=IncidentResponse)
def create_log(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"

    new_incident = Incident(
        incident_id=incident_id,
        method=payload.method,
        endpoint=payload.endpoint,
        status_code=payload.statusCode,
        response_time=payload.responseTime,
        error_message=payload.errorMessage,
        stack=payload.stack,
        status="received",
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return IncidentResponse(incident_id=new_incident.incident_id, status=new_incident.status)