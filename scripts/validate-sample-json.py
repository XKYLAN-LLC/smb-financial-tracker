#!/usr/bin/env python3
"""Validate public sample JSON for shape and obvious private-data leakage."""

from __future__ import annotations

import datetime as dt
import json
import math
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_PATH = ROOT / "sample-tracker.seed.json"
PROGRAM_PATH = ROOT / "covered-ca-medi-cal-ca-2026.program.json"

ROW_TYPES = {
    "Revenue",
    "Expense",
    "Investment / other income",
    "Above-line deduction",
    "Info only",
}

STATUSES = {
    "Supported",
    "Estimate",
    "Needs support",
    "CPA review",
    "Exclude",
}

REQUIRED_ROW_FIELDS = {
    "id",
    "use",
    "date",
    "type",
    "description",
    "amount",
    "bucket",
    "subcategory",
    "businessPct",
    "status",
    "notes",
}

PRIVATE_PATTERNS = {
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "email": re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    "phone": re.compile(r"\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b"),
    "live_api_key": re.compile(
        r"\b(?:sk_live|pk_live|rk_live|whsec|xox[baprs]-|ghp_|github_pat_|AKIA[0-9A-Z]{16})[A-Za-z0-9_\-]*\b"
    ),
    "long_account_like_number": re.compile(r"\b(?:\d[ -]?){12,}\b"),
}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        fail(errors, f"{path.name}: file not found")
    except json.JSONDecodeError as exc:
        fail(errors, f"{path.name}: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")
    return None


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def is_iso_date(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        dt.date.fromisoformat(value)
    except ValueError:
        return False
    return True


def walk_strings(value: Any, path: str = "$") -> list[tuple[str, str]]:
    if isinstance(value, str):
        return [(path, value)]
    if isinstance(value, list):
        found: list[tuple[str, str]] = []
        for index, item in enumerate(value):
            found.extend(walk_strings(item, f"{path}[{index}]"))
        return found
    if isinstance(value, dict):
        found = []
        for key, item in value.items():
            found.extend(walk_strings(item, f"{path}.{key}"))
        return found
    return []


def scan_private_patterns(label: str, value: Any, errors: list[str]) -> None:
    for path, text in walk_strings(value):
        for pattern_label, pattern in PRIVATE_PATTERNS.items():
            if pattern.search(text):
                fail(errors, f"{label}: possible private data pattern '{pattern_label}' at {path}")


def validate_sample(sample: Any, errors: list[str]) -> None:
    if not isinstance(sample, dict):
        fail(errors, "sample-tracker.seed.json: root must be an object")
        return

    if not isinstance(sample.get("schemaVersion"), str):
        fail(errors, "sample-tracker.seed.json: schemaVersion must be a string")
    if not isinstance(sample.get("profile"), dict):
        fail(errors, "sample-tracker.seed.json: profile must be an object")

    settings = sample.get("settings")
    if not isinstance(settings, dict):
        fail(errors, "sample-tracker.seed.json: settings must be an object")
    else:
        for key in ("threshold", "coveredCaProjected", "coveredCaNext12"):
            if not is_number(settings.get(key)):
                fail(errors, f"sample-tracker.seed.json: settings.{key} must be numeric")
        if not is_iso_date(settings.get("reviewDate")):
            fail(errors, "sample-tracker.seed.json: settings.reviewDate must be an ISO date")
        if not isinstance(settings.get("programId"), str) or not settings["programId"]:
            fail(errors, "sample-tracker.seed.json: settings.programId must be a non-empty string")

    rows = sample.get("rows")
    if not isinstance(rows, list) or not rows:
        fail(errors, "sample-tracker.seed.json: rows must be a non-empty list")
        return

    ids: set[str] = set()
    for index, row in enumerate(rows):
        row_label = f"sample-tracker.seed.json: rows[{index}]"
        if not isinstance(row, dict):
            fail(errors, f"{row_label} must be an object")
            continue

        missing = REQUIRED_ROW_FIELDS - set(row)
        if missing:
            fail(errors, f"{row_label} missing required fields: {', '.join(sorted(missing))}")

        row_id = row.get("id")
        if not isinstance(row_id, str) or not row_id:
            fail(errors, f"{row_label}.id must be a non-empty string")
        elif row_id in ids:
            fail(errors, f"{row_label}.id duplicates {row_id}")
        else:
            ids.add(row_id)

        if not isinstance(row.get("use"), bool):
            fail(errors, f"{row_label}.use must be boolean")
        if not is_iso_date(row.get("date")):
            fail(errors, f"{row_label}.date must be an ISO date")
        if row.get("type") not in ROW_TYPES:
            fail(errors, f"{row_label}.type is not allowed: {row.get('type')!r}")
        if row.get("status") not in STATUSES:
            fail(errors, f"{row_label}.status is not allowed: {row.get('status')!r}")
        if not isinstance(row.get("description"), str):
            fail(errors, f"{row_label}.description must be a string")
        if not isinstance(row.get("bucket"), str) or not row.get("bucket"):
            fail(errors, f"{row_label}.bucket must be a non-empty string")
        if not isinstance(row.get("subcategory"), str):
            fail(errors, f"{row_label}.subcategory must be a string")
        if not isinstance(row.get("notes"), str):
            fail(errors, f"{row_label}.notes must be a string")
        if not is_number(row.get("amount")) or row.get("amount") < 0:
            fail(errors, f"{row_label}.amount must be a non-negative number")
        if not is_number(row.get("businessPct")) or not 0 <= row.get("businessPct") <= 100:
            fail(errors, f"{row_label}.businessPct must be a number from 0 to 100")
        if "source" in row and row["source"] is not None and not isinstance(row["source"], dict):
            fail(errors, f"{row_label}.source must be an object or null")
        if "provenance" in row and not isinstance(row["provenance"], list):
            fail(errors, f"{row_label}.provenance must be a list")


def validate_program(program: Any, errors: list[str]) -> None:
    if not isinstance(program, dict):
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: root must be an object")
        return

    for key in ("schemaVersion", "programId", "name", "jurisdiction", "disclaimer"):
        if not isinstance(program.get(key), str) or not program.get(key):
            fail(errors, f"covered-ca-medi-cal-ca-2026.program.json: {key} must be a non-empty string")

    if not isinstance(program.get("effectiveYear"), int):
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: effectiveYear must be an integer")
    if not isinstance(program.get("householdSize"), int):
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: householdSize must be an integer")
    if not isinstance(program.get("incomeView"), dict):
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: incomeView must be an object")

    citations = program.get("citations")
    citation_ids: set[str] = set()
    if not isinstance(citations, list) or not citations:
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: citations must be a non-empty list")
    else:
        for index, citation in enumerate(citations):
            label = f"covered-ca-medi-cal-ca-2026.program.json: citations[{index}]"
            if not isinstance(citation, dict):
                fail(errors, f"{label} must be an object")
                continue
            for key in ("id", "title", "url", "retrieved"):
                if not isinstance(citation.get(key), str) or not citation.get(key):
                    fail(errors, f"{label}.{key} must be a non-empty string")
            if isinstance(citation.get("id"), str):
                citation_ids.add(citation["id"])
            if isinstance(citation.get("url"), str) and not citation["url"].startswith(("https://", "http://")):
                fail(errors, f"{label}.url must start with http:// or https://")
            if citation.get("retrieved") and not is_iso_date(citation.get("retrieved")):
                fail(errors, f"{label}.retrieved must be an ISO date")

    thresholds = program.get("thresholds")
    if not isinstance(thresholds, list) or not thresholds:
        fail(errors, "covered-ca-medi-cal-ca-2026.program.json: thresholds must be a non-empty list")
    else:
        for index, threshold in enumerate(thresholds):
            label = f"covered-ca-medi-cal-ca-2026.program.json: thresholds[{index}]"
            if not isinstance(threshold, dict):
                fail(errors, f"{label} must be an object")
                continue
            for key in ("name", "period", "sourceId"):
                if not isinstance(threshold.get(key), str) or not threshold.get(key):
                    fail(errors, f"{label}.{key} must be a non-empty string")
            if not is_number(threshold.get("amount")) or threshold.get("amount") <= 0:
                fail(errors, f"{label}.amount must be a positive number")
            if citation_ids and threshold.get("sourceId") not in citation_ids:
                fail(errors, f"{label}.sourceId does not match a citation id")


def main() -> int:
    errors: list[str] = []
    sample = load_json(SAMPLE_PATH, errors)
    program = load_json(PROGRAM_PATH, errors)

    if sample is not None:
        validate_sample(sample, errors)
        scan_private_patterns(SAMPLE_PATH.name, sample, errors)
    if program is not None:
        validate_program(program, errors)
        scan_private_patterns(PROGRAM_PATH.name, program, errors)

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Sample financial tracker JSON is valid and privacy scan passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
