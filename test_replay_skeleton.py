import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from backend.app.db.database import SessionLocal, Base, engine
from backend.app.models import incident, replay_artifact
from backend.app.services.replay_service import capture_request, capture_response, save_replay_artifact, get_replay_artifact

Base.metadata.create_all(bind=engine)

db = SessionLocal()

req = capture_request(
    method="POST",
    path="/checkout",
    body={"user_id": None, "password": "secret123"},
    incident_id="INC-TEST",
)
resp = capture_response(status_code=500, error_message="AttributeError: 'NoneType' object has no attribute 'email'")

saved = save_replay_artifact(db, "INC-TEST", req, resp)
print("Saved artifact ID:", saved.id)

retrieved = get_replay_artifact(db, "INC-TEST")
print("Retrieved request body:", retrieved.request_body)
print("Retrieved status code:", retrieved.original_status_code)

db.close()