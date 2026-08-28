import logging
from app.services import ai_service, sandbox_service

logger = logging.getLogger("orchestrator")
logging.basicConfig(level=logging.INFO)

MAX_ATTEMPTS = 3


def run_verification_pipeline(
    error_message: str,
    stack_trace: str,
    source_files: dict[str, str],
    target_file_relative_path: str,
) -> dict:
    """
    Full golden path:
    AI analyze -> write patch -> run sandbox -> verify -> retry on failure (max 3) -> final result
    """
    original_content = source_files[target_file_relative_path]
    previous_attempt = None
    last_sandbox_result = None
    last_analysis = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        logger.info(f"Attempt {attempt}/{MAX_ATTEMPTS}")

        analysis = ai_service.analyze_error(
            error_message=error_message,
            stack_trace=stack_trace,
            source_files=source_files,
            previous_attempt=previous_attempt,
        )
        last_analysis = analysis

        sandbox_service.write_patch(analysis["patch"])
        sandbox_result = sandbox_service.run_sandbox()
        last_sandbox_result = sandbox_result

        # Always restore the file to original state so the next attempt starts clean
        sandbox_service.revert_patched_file(original_content, target_file_relative_path)

        if sandbox_result.get("verified"):
            return {
                "status": "verified",
                "attempts": attempt,
                "error_reproduced": sandbox_result.get("error_reproduced"),
                "patch_applied": sandbox_result.get("patch_applied"),
                "tests_passed": sandbox_result.get("tests_passed"),
                "tests_failed": sandbox_result.get("tests_failed"),
                "total_tests": sandbox_result.get("total_tests"),
                "verification_message": sandbox_result.get("verification_message"),
                "root_cause": analysis["root_cause"],
                "affected_files": analysis["affected_files"],
                "affected_lines": analysis["affected_lines"],
                "explanation": analysis["explanation"],
                "patch": analysis["patch"],
            }

        # Prepare info for next attempt's self-correction
        previous_attempt = {
            "candidate_patch": analysis["patch"],
            "verification_error": sandbox_result.get("verification_message"),
            "stderr": sandbox_result.get("stderr"),
        }

    # All attempts exhausted
    return {
        "status": "unverified",
        "attempts": MAX_ATTEMPTS,
        "error_reproduced": last_sandbox_result.get("error_reproduced") if last_sandbox_result else False,
        "patch_applied": last_sandbox_result.get("patch_applied") if last_sandbox_result else False,
        "tests_passed": last_sandbox_result.get("tests_passed") if last_sandbox_result else 0,
        "tests_failed": last_sandbox_result.get("tests_failed") if last_sandbox_result else 0,
        "total_tests": last_sandbox_result.get("total_tests") if last_sandbox_result else 0,
        "verification_message": last_sandbox_result.get("verification_message") if last_sandbox_result else "No sandbox result",
        "root_cause": last_analysis["root_cause"] if last_analysis else None,
        "affected_files": last_analysis["affected_files"] if last_analysis else [],
        "affected_lines": last_analysis["affected_lines"] if last_analysis else [],
        "explanation": last_analysis["explanation"] if last_analysis else None,
        "patch": last_analysis["patch"] if last_analysis else None,
    }