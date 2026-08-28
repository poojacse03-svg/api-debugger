from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.incident import Incident
from backend.app.services.ai_service import analyze_incident
from backend.app.services.sandbox_service import verify_patch
from backend.app.services.blast_radius_service import calculate_blast_radius

router = APIRouter()


@router.post("/api/incidents/{incident_id}/verify")
def verify(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    analysis_result = analyze_incident(incident)
    verification_result = verify_patch(incident, analysis_result["patch"])

    incident.status = verification_result["status"]
    db.commit()

    return verification_result