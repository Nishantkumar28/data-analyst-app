"""
Utility helpers for data processing, formatting, and common operations.
"""

import json
import hashlib
from datetime import datetime
from typing import Any


def safe_json_loads(text: str, default: Any = None) -> Any:
    """Safely parse JSON string, returning default on failure."""
    try:
        return json.loads(text) if text else default
    except (json.JSONDecodeError, TypeError):
        return default


def safe_json_dumps(obj: Any, default: str = "{}") -> str:
    """Safely serialize to JSON string."""
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError):
        return default


def generate_file_hash(content: bytes) -> str:
    """Generate SHA-256 hash of file content."""
    return hashlib.sha256(content).hexdigest()


def format_file_size(size_bytes: int) -> str:
    """Format bytes into human-readable size."""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def format_duration(seconds: float) -> str:
    """Format seconds into human-readable duration."""
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes}m {secs}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"


def truncate_text(text: str, max_length: int = 200) -> str:
    """Truncate text with ellipsis."""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def now_iso() -> str:
    """Get current UTC time as ISO string."""
    return datetime.utcnow().isoformat()


def calculate_quality_score(
    missing_pct: float,
    duplicate_pct: float,
    type_issues_pct: float,
    outlier_pct: float,
) -> float:
    """
    Calculate dataset health/quality score (0-100).
    Weighted combination of various quality metrics.
    """
    weights = {
        "missing": 0.35,
        "duplicates": 0.20,
        "types": 0.25,
        "outliers": 0.20,
    }

    score = 100.0
    score -= missing_pct * weights["missing"]
    score -= duplicate_pct * weights["duplicates"]
    score -= type_issues_pct * weights["types"]
    score -= outlier_pct * weights["outliers"]

    return max(0.0, min(100.0, round(score, 1)))
