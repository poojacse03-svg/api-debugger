import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.incident import Incident
from backend.app.services.ai_service import analyze_incident
from backend.app.services.sandbox_service import verify_patch
from backend.app.services.blast_radius_service import calculate_blast_radius
from backend.app.services.github_service import create_branch, commit_file, create_pull_request

router = APIRouter()


@router.post("/api/incidents/{incident_id}/create-pr")
def create_pr(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    analysis_result = analyze_incident(incident)
    verification_result = verify_patch(incident, analysis_result["patch"])
    risk_result = calculate_blast_radius(incident)

    if verification_result["status"] != "verified":
        raise HTTPException(status_code=400, detail="Patch is not verified yet. Cannot create PR.")

    branch_name = f"fix/{incident.incident_id.lower()}"
    if not analysis_result.get("affected_files"):
        raise HTTPException(status_code=422, detail="Analysis did not return any affected files to patch.")

    affected_file = analysis_result["affected_files"][0]

    try:
        create_branch(branch_name)
    except requests.exceptions.HTTPError as e:
        if e.response is not None and e.response.status_code == 422:
            raise HTTPException(
                status_code=409,
                detail=f"Branch '{branch_name}' may already exist. Try a different incident or delete the existing branch.",
            )
        raise HTTPException(status_code=502, detail=f"GitHub branch creation failed: {str(e)}")

    try:
        commit_file(
            branch_name=branch_name,
            file_path=affected_file,
            file_content=analysis_result["patch"],
            commit_message=f"fix: resolve {incident.incident_id} - {analysis_result['root_cause']}",
        )
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"GitHub commit failed: {str(e)}")

    pr_title = f"Fix for {incident.incident_id}: {analysis_result['root_cause']}"
    pr_body = f"""## Root Cause
{analysis_result['root_cause']}

## Explanation
{analysis_result['explanation']}

## Changed Files
{', '.join(analysis_result['affected_files'])}

## Verification Evidence
- Status: {verification_result['status']}
- Error reproduced: {verification_result['error_reproduced']}
- Patch applied: {verification_result['patch_applied']}
- Tests passed: {verification_result['tests_passed']}/{verification_result['total_tests']}
- Attempts: {verification_result['attempts']}

## Blast Radius
- Affected files: {', '.join(risk_result['affected_files'])}
- Affected functions: {', '.join(risk_result['affected_functions'])}
- Risk score: {risk_result['risk_score']}

## Rollback
Revert this PR to roll back the change.
"""

    try:
        pr_result = create_pull_request(branch_name, pr_title, pr_body)
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"GitHub PR creation failed: {str(e)}")

    incident.status = "pr_created"
    db.commit()

    return {
        "pr_url": pr_result["html_url"],
        "branch": branch_name,
        "status": "created",
    }