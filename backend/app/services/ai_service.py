import os
import json
import re
import logging
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

logger = logging.getLogger("ai_service")
logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing. Add it to your .env file.")

genai.configure(api_key=API_KEY)
MODEL_NAME = "gemini-3.6-flash"


SYSTEM_PROMPT = """You are a senior software engineer performing automated root cause analysis and patch generation.

You will be given:
- An error message
- A stack trace
- Relevant source code

You MUST respond with ONLY valid JSON, no markdown fences, no explanation text outside the JSON.

Respond in exactly this JSON shape:
{
  "root_cause": "one or two sentence explanation of the actual root cause",
  "affected_files": ["path/to/file.py"],
  "affected_lines": [14],
  "explanation": "clear explanation of why this happens",
  "patch": "a unified diff (--- a/file / +++ b/file / @@ ... format) that fixes the issue",
  "confidence_basis": "why you believe this is the correct fix"
}

Rules:
- affected_files must ONLY contain files that were actually shown to you in the provided source code.
- patch must be a valid unified diff format.
- Do not invent files or line numbers that weren't shown to you.
- If you are asked to revise a patch after a failed verification, produce a NEW corrected patch, not the same one.
"""


def _extract_json(raw_text: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    text = raw_text.strip()
    text = re.sub(r"^```(json)?", "", text.strip())
    text = re.sub(r"```$", "", text.strip())
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI JSON output: {e}\nRaw text: {raw_text}")
        raise ValueError(f"AI returned invalid JSON: {e}")


def _validate_analysis(data: dict, known_files: list[str]) -> dict:
    """Validate structure and guard against hallucinated files/fields."""
    required_fields = ["root_cause", "affected_files", "affected_lines", "explanation", "patch", "confidence_basis"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"AI response missing required field: {field}")

    if not isinstance(data["affected_files"], list):
        raise ValueError("affected_files must be a list")

    hallucinated = [f for f in data["affected_files"] if f not in known_files]
    if hallucinated:
        logger.warning(f"AI referenced files not in provided context: {hallucinated}")
        data["affected_files"] = [f for f in data["affected_files"] if f in known_files]

    if not data["patch"] or not isinstance(data["patch"], str):
        raise ValueError("AI did not return a usable patch")

    return data


def analyze_error(
    error_message: str,
    stack_trace: str,
    source_files: dict[str, str],
    previous_attempt: dict | None = None,
) -> dict:
    """
    source_files: dict of {relative_path: file_content}
    previous_attempt: optional dict with keys candidate_patch, verification_error, stderr
                       (used for retry/self-correction)
    Returns validated analysis dict matching the API contract.
    """
    known_files = list(source_files.keys())

    context_block = "\n\n".join(
        f"FILE: {path}\n---\n{content}" for path, content in source_files.items()
    )

    prompt = f"""ERROR MESSAGE:
{error_message}

STACK TRACE:
{stack_trace}

SOURCE FILES:
{context_block}
"""

    if previous_attempt:
        prompt += f"""

PREVIOUS ATTEMPT FAILED VERIFICATION. Fix this and generate a NEW, DIFFERENT patch.

Previous candidate patch:
{previous_attempt.get('candidate_patch')}

Verification error:
{previous_attempt.get('verification_error')}

Stderr from failed test run:
{previous_attempt.get('stderr')}
"""

    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )

    logger.info("Calling Gemini for root cause analysis...")
    response = model.generate_content(prompt)
    raw_text = response.text

    data = _extract_json(raw_text)
    data = _validate_analysis(data, known_files)

    logger.info(f"Root cause identified: {data['root_cause']}")
    return data

# Alias for backend teammate's expected function name
# Accepts the SQLAlchemy Incident object directly and pulls demo source context
def analyze_incident(incident) -> dict:
    demo_file_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "demo", "vulnerable_app", "checkout.py"
    )
    with open(demo_file_path, "r") as f:
        checkout_code = f.read()

    source_files = {
        "demo/vulnerable_app/checkout.py": checkout_code
    }

    return analyze_error(
        error_message=incident.error_message,
        stack_trace=incident.stack,
        source_files=source_files,
    )

def generate_regression_test(error_message: str, root_cause: str, patch: str, existing_test_code: str) -> str:
    """Asks Gemini to generate a pytest test that guards against this specific bug recurring."""
    prompt = f"""You are generating a regression test for a Python codebase that uses pytest.

The bug that was fixed:
{root_cause}

Original error:
{error_message}

The patch that fixed it:
{patch}

Here is an example of the existing test style/conventions to match:
{existing_test_code}

Write ONE new pytest test function that specifically verifies this exact bug cannot happen again.
Respond with ONLY the Python test code, no markdown fences, no explanation, no imports beyond what's shown in the example style above (assume the same imports already exist).
The function name must start with test_ and be different from any existing test names shown.
"""
    model = genai.GenerativeModel(model_name=MODEL_NAME)
    response = model.generate_content(prompt)
    code = response.text.strip()
    code = re.sub(r"^```(python)?", "", code).strip()
    code = re.sub(r"```$", "", code).strip()
    return code
