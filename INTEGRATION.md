# AI Verification Module — Integration Guide

## What Team Member 2 (backend) calls

### 1. Full analyze + verify pipeline

```python
from app.services.orchestrator import run_verification_pipeline

result = run_verification_pipeline(
    error_message="AttributeError: 'NoneType' object has no attribute 'email'",
    stack_trace="<full stack trace string>",
    source_files={
        "demo/vulnerable_app/checkout.py": "<file content as string>"
    },
    target_file_relative_path="demo/vulnerable_app/checkout.py",
)
```

Returns (matches POST /api/incidents/{id}/verify contract, plus analysis fields):

```json
{
  "status": "verified" | "unverified",
  "attempts": 1,
  "error_reproduced": true,
  "patch_applied": true,
  "tests_passed": 2,
  "tests_failed": 0,
  "total_tests": 2,
  "verification_message": "...",
  "root_cause": "...",
  "affected_files": ["..."],
  "affected_lines": [14],
  "explanation": "...",
  "patch": "<unified diff string>"
}
```

### 2. Blast radius (call separately after verification, using the patch + affected_files from the result above)

```python
from app.services.blast_radius_service import analyze_blast_radius

blast = analyze_blast_radius(result["patch"], result["affected_files"])
```

Returns:

```json
{
  "affected_files": ["...", "..."],
  "affected_functions": ["..."],
  "caller_count": 1,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "reason": "..."
}
```

## Requirements
- Docker Desktop must be running on whatever machine calls this (sandbox runs in a container).
- `.env` must have `GEMINI_API_KEY` set (not committed to git — each dev needs their own or share via secure channel, NOT Slack/chat in plaintext).
- Image `api-debugger-sandbox` must be built once via: