from backend.app.api import health, logs, incidents, analysis, verification, github
from backend.app.db.database import Base, engine
from backend.app.models import incident
from backend.app.models import replay_artifact
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.api import health, logs, incidents, analysis, verification, github

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )


app.include_router(health.router)
app.include_router(logs.router)
app.include_router(incidents.router)
app.include_router(analysis.router)
app.include_router(verification.router)
app.include_router(github.router)

@app.get("/")
def read_root():
    return {"message": "API Debugger backend is running"}