import sys
import os
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.services.orchestrator import run_verification_pipeline
from app.services.blast_radius_service import analyze_blast_radius


def section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def main():
    section("1. INCOMING PRODUCTION ERROR")
    with open("demo/sample_logs/error_log.json") as f:
        log = json.load(f)
    print(f"Endpoint: {log['endpoint']}")
    print(f"Status: {log['statusCode']}")
    print(f"Error: {log['errorMessage']}")

    with open("demo/vulnerable_app/checkout.py") as f:
        checkout_code = f.read()

    section("2. AI ROOT CAUSE ANALYSIS + SANDBOX VERIFICATION (running...)")
    result = run_verification_pipeline(
        error_message=log["errorMessage"],
        stack_trace=log["stack"],
        source_files={"demo/vulnerable_app/checkout.py": checkout_code},
        target_file_relative_path="demo/vulnerable_app/checkout.py",
    )

    print(f"\nRoot cause: {result['root_cause']}")
    print(f"Affected files: {result['affected_files']}")
    print(f"\nGenerated patch:\n{result['patch']}")

    section("3. VERIFICATION RESULT")
    print(f"Status: {result['status'].upper()}")
    print(f"Attempts: {result['attempts']}")
    print(f"Original error reproduced: {result['error_reproduced']}")
    print(f"Patch applied: {result['patch_applied']}")
    print(f"Tests passed: {result['tests_passed']}/{result['total_tests']}")
    print(f"Message: {result['verification_message']}")

    section("4. BLAST RADIUS + REGRESSION RISK")
    blast = analyze_blast_radius(result["patch"], result["affected_files"])
    print(f"Changed function(s): {blast['affected_functions']}")
    print(f"Callers found: {blast['caller_count']}")
    print(f"Risk level: {blast['risk_level']}")
    print(f"Reason: {blast['reason']}")

    section("DONE — Ready for PR" if result["status"] == "verified" else "DONE — Unverified, would not auto-PR")


if __name__ == "__main__":
    main()