from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.incident import Incident
from backend.app.services.ai_service import analyze_incident

router = APIRouter()


@router.post("/api/incidents/{incident_id}/analyze")
def analyze(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    result = analyze_incident(incident)

    incident.status = "analyzed"
    db.commit()

    return result