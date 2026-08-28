import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.services.ai_service import analyze_error

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

result = analyze_error(error_message, stack_trace, source_files)

import json
print(json.dumps(result, indent=2))