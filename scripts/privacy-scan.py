#!/usr/bin/env python3
"""Scan tracked public files for obvious private-data patterns."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_SUFFIXES = {
    ".gif",
    ".ico",
    ".jpg",
    ".jpeg",
    ".mov",
    ".mp4",
    ".pdf",
    ".png",
    ".webp",
    ".zip",
}

PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("email address", re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)),
    ("SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("phone number", re.compile(r"\b\d{3}[-. ]\d{3}[-. ]\d{4}\b|\(\d{3}\)\s*\d{3}[-. ]\d{4}")),
    ("live payment token", re.compile(r"\b(?:sk|pk|rk)_live_[0-9A-Za-z_]+\b")),
    ("GitHub token", re.compile(r"\bgh[pousr]_[0-9A-Za-z_]{20,}\b")),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("account-like digit string", re.compile(r"\b\d(?:[ -]?\d){11,18}\b")),
]


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    paths = [Path(item) for item in result.stdout.decode("utf-8").split("\0") if item]
    return [ROOT / path for path in paths]


def is_scannable(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() not in SKIP_SUFFIXES


def scan_file(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
      return []
    findings: list[str] = []
    for label, pattern in PATTERNS:
        for match in pattern.finditer(text):
            line = text.count("\n", 0, match.start()) + 1
            findings.append(f"{path.relative_to(ROOT)}:{line}: possible {label}")
    return findings


def main() -> int:
    findings: list[str] = []
    for path in tracked_files():
        if is_scannable(path):
            findings.extend(scan_file(path))
    if findings:
        print("Privacy scan failed. Review these public tracked-file matches:", file=sys.stderr)
        for finding in findings:
            print(f"- {finding}", file=sys.stderr)
        return 1
    print("Tracked-file privacy scan passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
