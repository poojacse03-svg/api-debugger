import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.services.orchestrator import run_verification_pipeline

error_message = "AttributeError: 'NoneType' object has no attribute 'email'"
stack_trace = """Traceback (most recent call last):
  File "checkout.py", line 15, in get_checkout_email
    email = user.email
AttributeError: 'NoneType' object has no attribute 'email'"""

with open("demo/vulnerable_app/checkout.py") as f:
    checkout_code = f.read()

source_files = {
    "demo/vulnerable_app/checkout.py": checkout_code
}

result = run_verification_pipeline(
    error_message=error_message,
    stack_trace=stack_trace,
    source_files=source_files,
    target_file_relative_path="demo/vulnerable_app/checkout.py",
)

import json
print(json.dumps(result, indent=2))

from app.services.blast_radius_service import analyze_blast_radius

blast = analyze_blast_radius(result["patch"], result["affected_files"])
print("\n--- BLAST RADIUS ---")
print(json.dumps(blast, indent=2))