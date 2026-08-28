from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.incident import Incident
from backend.app.services.blast_radius_service import calculate_blast_radius

router = APIRouter()


@router.get("/api/incidents")
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    result = []
    for incident in incidents:
        result.append({
            "incident_id": incident.incident_id,
            "method": incident.method,
            "endpoint": incident.endpoint,
            "status_code": incident.status_code,
            "response_time": incident.response_time,
            "error_message": incident.error_message,
            "status": incident.status,
            "created_at": incident.created_at.isoformat() if incident.created_at else None,
        })

    return {"incidents": result}


@router.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    risk_result = calculate_blast_radius(incident)

    return {
        "incident_id": incident.incident_id,
        "error": {
            "method": incident.method,
            "endpoint": incident.endpoint,
            "status_code": incident.status_code,
            "response_time": incident.response_time,
            "error_message": incident.error_message,
            "stack": incident.stack,
        },
        "analysis": None,
        "verification": None,
        "risk": risk_result,
        "pull_request": None,
    }