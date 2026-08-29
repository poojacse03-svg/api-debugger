import json
import subprocess
import sys
import os

WORKSPACE = "/workspace"
TARGET_TEST = "demo/test_cases/test_checkout.py"
PATCH_FILE = "/workspace/sandbox/candidate.patch"
REGRESSION_TEST_FILE = "/workspace/demo/test_cases/test_generated_regression.py"


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


def run_replay_check() -> dict:
    """Calls the demo function directly with the original failing input,
    before and after the patch, and reports whether the failure is gone."""
    sys.path.insert(0, os.path.join(WORKSPACE, "demo", "vulnerable_app"))
    replay_result = {"original_status": None, "replay_status": None, "failure_reproduced": None}
    try:
        import checkout
        checkout.get_checkout_email(999)
        replay_result["replay_status"] = 200
    except Exception as e:
        replay_result["replay_status"] = 500
        replay_result["replay_error"] = str(e)

    replay_result["failure_reproduced"] = replay_result["replay_status"] == 500
    return replay_result


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
        "replay": None,
        "regression_test": None,
    }

    before = run_pytest(TARGET_TEST)
    output["error_reproduced"] = before["returncode"] != 0
    if not output["error_reproduced"]:
        output["verification_message"] = "Could not reproduce original failure — aborting."
        print(json.dumps(output))
        return

    applied, patch_log = apply_patch()
    output["patch_applied"] = applied
    if not applied:
        output["stderr"] = patch_log
        output["verification_message"] = "Patch failed to apply."
        print(json.dumps(output))
        return

    # Replay check — call the patched function directly with the original bad input
    output["replay"] = run_replay_check()

    # Run generated regression test if present, plus the full suite
    test_targets = "demo/test_cases/"
    after = run_pytest(test_targets)
    output["stdout"] = after["stdout"]
    output["stderr"] = after["stderr"]

    if os.path.exists(REGRESSION_TEST_FILE):
        output["regression_test"] = {"ran": True, "included_in_suite": True}
    else:
        output["regression_test"] = {"ran": False}

    passed = after["stdout"].count(" PASSED")
    failed = after["stdout"].count(" FAILED")
    output["tests_passed"] = passed
    output["tests_failed"] = failed
    output["total_tests"] = passed + failed

    output["verified"] = (
        after["returncode"] == 0
        and failed == 0
        and passed > 0
        and not output["replay"]["failure_reproduced"]
    )
    output["verification_message"] = (
        "Patch resolved the reproduced failure, replay confirmed the fix, and all tests passed."
        if output["verified"]
        else "Patch applied but verification checks did not all pass."
    )

    print(json.dumps(output))


if __name__ == "__main__":
    main()