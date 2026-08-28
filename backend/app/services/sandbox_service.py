import subprocess
import json
import os
import logging

logger = logging.getLogger("sandbox_service")
logging.basicConfig(level=logging.INFO)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PATCH_FILE_PATH = os.path.join(PROJECT_ROOT, "sandbox", "candidate.patch")
IMAGE_NAME = "api-debugger-sandbox"


def write_patch(patch_text: str) -> None:
    """Write the AI-generated patch to the file the sandbox will apply, forcing LF endings."""
    normalized = patch_text.replace("\r\n", "\n")
    if not normalized.endswith("\n"):
        normalized += "\n"
    with open(PATCH_FILE_PATH, "w", newline="\n") as f:
        f.write(normalized)


def run_sandbox() -> dict:
    """
    Runs the Docker sandbox container against the current project state.
    Returns the parsed JSON result from runner.py.
    """
    try:
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{PROJECT_ROOT}:/workspace",
                IMAGE_NAME,
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )
    except subprocess.TimeoutExpired:
        return {
            "verified": False,
            "error_reproduced": False,
            "patch_applied": False,
            "tests_passed": 0,
            "tests_failed": 0,
            "total_tests": 0,
            "stdout": "",
            "stderr": "Sandbox execution timed out.",
            "verification_message": "Sandbox timed out after 120s.",
        }

    stdout = result.stdout.strip()
    lines = [line for line in stdout.split("\n") if line.strip().startswith("{")]

    if not lines:
        logger.error(f"Sandbox produced no JSON output. stdout={result.stdout} stderr={result.stderr}")
        return {
            "verified": False,
            "error_reproduced": False,
            "patch_applied": False,
            "tests_passed": 0,
            "tests_failed": 0,
            "total_tests": 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "verification_message": "Sandbox produced no parseable output.",
        }

    try:
        return json.loads(lines[-1])
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse sandbox output: {e}")
        return {
            "verified": False,
            "error_reproduced": False,
            "patch_applied": False,
            "tests_passed": 0,
            "tests_failed": 0,
            "total_tests": 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "verification_message": f"Failed to parse sandbox output: {e}",
        }


def revert_patched_file(original_content: str, file_relative_path: str) -> None:
    """Restore the source file to its pre-patch state after a sandbox run."""
    file_path = os.path.join(PROJECT_ROOT, file_relative_path)
    with open(file_path, "w", newline="\n") as f:
        f.write(original_content)

