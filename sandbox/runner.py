"""
Runs INSIDE the Docker container.
Responsibilities:
1. Reproduce the original failing test (confirm bug exists).
2. Apply the candidate patch.
3. Re-run the same test (confirm it now passes).
4. Run the broader test suite (regression check).
5. Print a single JSON result line to stdout.
"""
import json
import subprocess
import sys
import os

WORKSPACE = "/workspace"
TARGET_TEST = "demo/test_cases/test_checkout.py"
PATCH_FILE = "/workspace/sandbox/candidate.patch"


def run_pytest(test_path: str) -> dict:
    result = subprocess.run(
        ["python", "-m", "pytest", test_path, "-v"],
        cwd=WORKSPACE,
        capture_output=True,
        text=True,
        timeout=60,
    )
    return {
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def apply_patch() -> tuple[bool, str]:
    if not os.path.exists(PATCH_FILE):
        return False, "No patch file found at sandbox/candidate.patch"

    result = subprocess.run(
        ["patch", "-p1", "--fuzz=3", "--ignore-whitespace", "--input", PATCH_FILE],
        cwd=WORKSPACE,
        capture_output=True,
        text=True,
    )
    
    success = result.returncode == 0
    return success, (result.stdout + result.stderr)


def main():
    output = {
        "error_reproduced": False,
        "patch_applied": False,
        "tests_passed": 0,
        "tests_failed": 0,
        "total_tests": 0,
        "verified": False,
        "stdout": "",
        "stderr": "",
        "verification_message": "",
    }

    # Step 1: reproduce original failure
    before = run_pytest(TARGET_TEST)
    output["error_reproduced"] = before["returncode"] != 0
    if not output["error_reproduced"]:
        output["verification_message"] = "Could not reproduce original failure — aborting."
        print(json.dumps(output))
        return

    # Step 2: apply patch
    applied, patch_log = apply_patch()
    output["patch_applied"] = applied
    if not applied:
        output["stderr"] = patch_log
        output["verification_message"] = "Patch failed to apply."
        print(json.dumps(output))
        return

    # Step 3: re-run target test + broader suite
    after = run_pytest("demo/test_cases/")
    output["stdout"] = after["stdout"]
    output["stderr"] = after["stderr"]

    passed = after["stdout"].count(" PASSED")
    failed = after["stdout"].count(" FAILED")
    output["tests_passed"] = passed
    output["tests_failed"] = failed
    output["total_tests"] = passed + failed

    output["verified"] = (after["returncode"] == 0) and (failed == 0) and (passed > 0)
    output["verification_message"] = (
        "Patch resolved the reproduced failure and all tests passed."
        if output["verified"]
        else "Patch applied but tests still failing."
    )

    print(json.dumps(output))


if __name__ == "__main__":
    main()