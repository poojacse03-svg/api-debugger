import os
import re
import logging

logger = logging.getLogger("blast_radius_service")
logging.basicConfig(level=logging.INFO)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

CRITICAL_PATH_KEYWORDS = ["checkout", "payment", "auth", "login", "billing"]


def _extract_function_names(patch_text: str) -> list[str]:
    """Pull function names touched by the patch (best-effort, regex-based)."""
    names = set()
    for line in patch_text.split("\n"):
        match = re.search(r"def\s+(\w+)\s*\(", line)
        if match:
            names.add(match.group(1))
    return list(names)


def _find_callers(function_names: list[str], changed_files: list[str], search_root: str) -> list[str]:
    """Scan the repo for files that call any of the given function names."""
    callers = set()
    changed_abs = {os.path.abspath(os.path.join(search_root, f)) for f in changed_files}

    for dirpath, _, filenames in os.walk(search_root):
        if "venv" in dirpath or ".git" in dirpath or "node_modules" in dirpath:
            continue
        for filename in filenames:
            if not filename.endswith(".py"):
                continue
            filepath = os.path.join(dirpath, filename)
            if os.path.abspath(filepath) in changed_abs:
                continue
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except OSError:
                continue

            for fn in function_names:
                if re.search(rf"\b{re.escape(fn)}\s*\(", content):
                    rel_path = os.path.relpath(filepath, search_root)
                    callers.add(rel_path)

    return list(callers)


def _classify_risk(caller_count: int, changed_files_count: int, is_critical_path: bool) -> str:
    if is_critical_path and caller_count >= 2:
        return "HIGH"
    if caller_count >= 3 or changed_files_count > 1:
        return "HIGH"
    if caller_count >= 1:
        return "MEDIUM"
    return "LOW"


def analyze_blast_radius(patch_text: str, affected_files: list[str]) -> dict:
    function_names = _extract_function_names(patch_text)
    callers = _find_callers(function_names, affected_files, PROJECT_ROOT)

    is_critical_path = any(
        any(keyword in f.lower() for keyword in CRITICAL_PATH_KEYWORDS)
        for f in affected_files
    )

    risk = _classify_risk(len(callers), len(affected_files), is_critical_path)

    reason_parts = []
    if function_names:
        reason_parts.append(f"Changed function(s): {', '.join(function_names)}")
    reason_parts.append(f"Used by {len(callers)} other file(s)" if callers else "No external callers found")
    if is_critical_path:
        reason_parts.append("touches a critical path (checkout/payment/auth)")

    return {
        "affected_files": affected_files + callers,
        "affected_functions": function_names,
        "caller_count": len(callers),
        "risk_level": risk,
        "reason": "; ".join(reason_parts),
    }


def calculate_blast_radius(incident_or_patch, affected_files=None):
    if affected_files is None:
        return {
            "affected_files": [],
            "affected_functions": [],
            "caller_count": 0,
            "risk_level": "UNKNOWN",
            "reason": "No patch analyzed yet for this incident.",
        }
    return analyze_blast_radius(incident_or_patch, affected_files)