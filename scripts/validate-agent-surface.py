#!/usr/bin/env python3
"""Validate public AI-agent surface examples and required docs."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "AGENTS.md",
    "SUPPORT.md",
    "docs/README.md",
    "docs/agent-surface.md",
    "docs/accountant-package.md",
    "docs/ai-prompts.md",
    "docs/concepts.md",
    "docs/private-data.md",
    "docs/project-status.md",
    "docs/roadmap.md",
    "docs/walkthrough.md",
    "docs/assets/video/README.md",
    "docs/assets/screenshots/dashboard-overview.png",
    "docs/assets/screenshots/ledger-review.png",
    "docs/assets/screenshots/accountant-export.png",
    "docs/assets/video/smb-financial-tracker-walkthrough.mp4",
    "skills/financial-tracker/SKILL.md",
    "skills/import-csv/SKILL.md",
    "scripts/capture-screenshots.mjs",
    "examples/agent-workspace.example.json",
    "examples/accountant-package.example.json",
    "examples/README.md",
    ".github/dependabot.yml",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/ISSUE_TEMPLATE/docs_improvement.md",
]

PRIVATE_PATTERNS = {
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "email": re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    "phone": re.compile(r"\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b"),
    "live_api_key": re.compile(
        r"\b(?:sk_live|pk_live|rk_live|whsec|xox[baprs]-|ghp_|github_pat_|AKIA[0-9A-Z]{16})[A-Za-z0-9_\-]*\b"
    ),
    "long_account_like_number": re.compile(r"\b(?:\d[ -]?){12,}\b"),
}


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        errors.append(f"{path}: file not found")
    except json.JSONDecodeError as exc:
        errors.append(f"{path}: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")
    return None


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
                errors.append(f"{label}: possible private data pattern '{pattern_label}' at {path}")


def require_string(obj: dict[str, Any], key: str, label: str, errors: list[str]) -> None:
    if not isinstance(obj.get(key), str) or not obj[key]:
        errors.append(f"{label}.{key} must be a non-empty string")


def require_list(obj: dict[str, Any], key: str, label: str, errors: list[str]) -> list[Any]:
    value = obj.get(key)
    if not isinstance(value, list) or not value:
        errors.append(f"{label}.{key} must be a non-empty list")
        return []
    return value


def validate_workspace(data: Any, errors: list[str]) -> None:
    label = "examples/agent-workspace.example.json"
    if not isinstance(data, dict):
        errors.append(f"{label}: root must be an object")
        return

    require_string(data, "schemaVersion", label, errors)
    workspace = data.get("workspace")
    if not isinstance(workspace, dict):
        errors.append(f"{label}.workspace must be an object")
    else:
        for key in ("id", "name", "privacy", "defaultLedger"):
            require_string(workspace, key, f"{label}.workspace", errors)

    source_ids: set[str] = set()
    for index, source in enumerate(require_list(data, "sourceDocuments", label, errors)):
        item_label = f"{label}.sourceDocuments[{index}]"
        if not isinstance(source, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "kind", "system", "localPathHint", "period", "status", "proves", "notes"):
            require_string(source, key, item_label, errors)
        if isinstance(source.get("id"), str):
            source_ids.add(source["id"])
        if isinstance(source.get("localPathHint"), str) and not source["localPathHint"].startswith("private/"):
            errors.append(f"{item_label}.localPathHint must point under private/")

    for index, item in enumerate(require_list(data, "reviewQueue", label, errors)):
        item_label = f"{label}.reviewQueue[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "status", "question", "nextAction"):
            require_string(item, key, item_label, errors)
        for source_id in item.get("relatedSources", []):
            if source_id not in source_ids:
                errors.append(f"{item_label}.relatedSources references unknown source id {source_id!r}")


def validate_package(data: Any, errors: list[str]) -> None:
    label = "examples/accountant-package.example.json"
    if not isinstance(data, dict):
        errors.append(f"{label}: root must be an object")
        return

    require_string(data, "schemaVersion", label, errors)
    package = data.get("package")
    if not isinstance(package, dict):
        errors.append(f"{label}.package must be an object")
    else:
        for key in ("id", "businessLabel", "localPathHint", "status", "privacy"):
            require_string(package, key, f"{label}.package", errors)
        if not isinstance(package.get("year"), int):
            errors.append(f"{label}.package.year must be an integer")
        if isinstance(package.get("localPathHint"), str) and not package["localPathHint"].startswith("private/"):
            errors.append(f"{label}.package.localPathHint must point under private/")

    for section in ("includedFiles", "sourceDocumentChecklist", "openQuestions", "agentChecklist"):
        require_list(data, section, label, errors)


def main() -> int:
    errors: list[str] = []

    for relative in REQUIRED_FILES:
        path = ROOT / relative
        if not path.exists():
            errors.append(f"Missing required AI surface file: {relative}")

    workspace = load_json(ROOT / "examples/agent-workspace.example.json", errors)
    package = load_json(ROOT / "examples/accountant-package.example.json", errors)

    if workspace is not None:
        validate_workspace(workspace, errors)
        scan_private_patterns("examples/agent-workspace.example.json", workspace, errors)
    if package is not None:
        validate_package(package, errors)
        scan_private_patterns("examples/accountant-package.example.json", package, errors)

    if errors:
        print("Agent surface validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("AI agent surface examples and docs are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
