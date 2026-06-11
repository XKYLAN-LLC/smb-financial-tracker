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
    "docs/agent-workflows.md",
    "docs/accountant-package.md",
    "docs/ai-prompts.md",
    "docs/classification.md",
    "docs/concepts.md",
    "docs/private-data.md",
    "docs/project-status.md",
    "docs/roadmap.md",
    "docs/walkthrough.md",
    "docs/assets/video/README.md",
    "docs/assets/screenshots/dashboard-overview.png",
    "docs/assets/screenshots/action-center.png",
    "docs/assets/screenshots/ledger-review.png",
    "docs/assets/screenshots/accountant-export.png",
    "docs/assets/video/smb-financial-tracker-walkthrough.mp4",
    "skills/financial-tracker/SKILL.md",
    "skills/import-csv/SKILL.md",
    "skills/classify-records/SKILL.md",
    "skills/source-document-review/SKILL.md",
    "scripts/capture-screenshots.mjs",
    "examples/agent-workspace.example.json",
    "examples/accountant-package.example.json",
    "examples/agent-notes.example.md",
    "examples/business-profile.example.json",
    "examples/classification-policy.example.json",
    "examples/README.md",
    "examples/source-document-manifest.example.json",
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

LEDGER_STATUSES = {"Supported", "Estimate", "Needs support", "CPA review", "Exclude"}
ROW_TYPES = {"Revenue", "Expense", "Investment / other income", "Above-line deduction", "Info only"}


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


def scan_text_private_patterns(label: str, text: str, errors: list[str]) -> None:
    for pattern_label, pattern in PRIVATE_PATTERNS.items():
        if pattern.search(text):
            errors.append(f"{label}: possible private data pattern '{pattern_label}'")


def require_string(obj: dict[str, Any], key: str, label: str, errors: list[str]) -> None:
    if not isinstance(obj.get(key), str) or not obj[key]:
        errors.append(f"{label}.{key} must be a non-empty string")


def require_list(obj: dict[str, Any], key: str, label: str, errors: list[str]) -> list[Any]:
    value = obj.get(key)
    if not isinstance(value, list) or not value:
        errors.append(f"{label}.{key} must be a non-empty list")
        return []
    return value


def require_dict(obj: dict[str, Any], key: str, label: str, errors: list[str]) -> dict[str, Any]:
    value = obj.get(key)
    if not isinstance(value, dict) or not value:
        errors.append(f"{label}.{key} must be a non-empty object")
        return {}
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


def validate_business_profile(data: Any, errors: list[str]) -> None:
    label = "examples/business-profile.example.json"
    if not isinstance(data, dict):
        errors.append(f"{label}: root must be an object")
        return

    require_string(data, "schemaVersion", label, errors)
    profile = require_dict(data, "profile", label, errors)
    for key in ("id", "label", "entityType", "accountingMethod", "country", "state", "privacy"):
        require_string(profile, key, f"{label}.profile", errors)
    if not isinstance(profile.get("taxYear"), int):
        errors.append(f"{label}.profile.taxYear must be an integer")

    preferred_paths = require_dict(data, "preferredLocalPaths", label, errors)
    for key, value in preferred_paths.items():
        if not isinstance(value, str) or not value.startswith("private/"):
            errors.append(f"{label}.preferredLocalPaths.{key} must point under private/")

    for index, fact in enumerate(require_list(data, "operatingFacts", label, errors)):
        item_label = f"{label}.operatingFacts[{index}]"
        if not isinstance(fact, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "statement", "source", "status"):
            require_string(fact, key, item_label, errors)
        require_list(fact, "appliesTo", item_label, errors)

    review_defaults = require_dict(data, "reviewDefaults", label, errors)
    for key, value in review_defaults.items():
        if key.endswith("Status") and value not in LEDGER_STATUSES:
            errors.append(f"{label}.reviewDefaults.{key} must be a ledger status")
    raw_context_type = review_defaults.get("rawContextType")
    if raw_context_type not in ROW_TYPES:
        errors.append(f"{label}.reviewDefaults.rawContextType must be a valid row type")
    require_list(data, "agentInstructions", label, errors)


def validate_classification_policy(data: Any, errors: list[str]) -> None:
    label = "examples/classification-policy.example.json"
    if not isinstance(data, dict):
        errors.append(f"{label}: root must be an object")
        return

    require_string(data, "schemaVersion", label, errors)
    policy = require_dict(data, "policy", label, errors)
    for key in ("id", "label", "currency", "privacy"):
        require_string(policy, key, f"{label}.policy", errors)
    if not isinstance(policy.get("taxYear"), int):
        errors.append(f"{label}.policy.taxYear must be an integer")

    require_dict(data, "amountRules", label, errors)
    statuses = require_list(data, "statuses", label, errors)
    status_set = {item for item in statuses if isinstance(item, str)}
    for required_status in LEDGER_STATUSES:
        if required_status not in status_set:
            errors.append(f"{label}.statuses must include {required_status!r}")

    for index, rule in enumerate(require_list(data, "categoryRules", label, errors)):
        item_label = f"{label}.categoryRules[{index}]"
        if not isinstance(rule, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "label", "type", "bucket", "subcategory", "defaultStatus"):
            require_string(rule, key, item_label, errors)
        default_pct = rule.get("defaultBusinessPct")
        if default_pct is not None and not (
            isinstance(default_pct, (int, float)) and 0 <= default_pct <= 100
        ):
            errors.append(f"{item_label}.defaultBusinessPct must be null or a number from 0 to 100")
        if isinstance(rule.get("defaultStatus"), str) and rule["defaultStatus"] not in status_set:
            errors.append(f"{item_label}.defaultStatus must be listed in statuses")
        require_list(rule, "supportExamples", item_label, errors)
        require_list(rule, "reviewTriggers", item_label, errors)

    require_list(data, "decisionRules", label, errors)


def validate_source_manifest(data: Any, errors: list[str]) -> None:
    label = "examples/source-document-manifest.example.json"
    if not isinstance(data, dict):
        errors.append(f"{label}: root must be an object")
        return

    require_string(data, "schemaVersion", label, errors)
    manifest = require_dict(data, "manifest", label, errors)
    for key in ("id", "label", "localRootHint", "privacy"):
        require_string(manifest, key, f"{label}.manifest", errors)
    if not isinstance(manifest.get("taxYear"), int):
        errors.append(f"{label}.manifest.taxYear must be an integer")
    if isinstance(manifest.get("localRootHint"), str) and not manifest["localRootHint"].startswith("private/"):
        errors.append(f"{label}.manifest.localRootHint must point under private/")

    document_ids: set[str] = set()
    for index, document in enumerate(require_list(data, "documents", label, errors)):
        item_label = f"{label}.documents[{index}]"
        if not isinstance(document, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "kind", "system", "localPathHint", "period", "status", "storageStatus", "hashHint", "notes"):
            require_string(document, key, item_label, errors)
        if isinstance(document.get("id"), str):
            if document["id"] in document_ids:
                errors.append(f"{item_label}.id must be unique")
            document_ids.add(document["id"])
        if isinstance(document.get("localPathHint"), str) and not document["localPathHint"].startswith("private/"):
            errors.append(f"{item_label}.localPathHint must point under private/")
        require_list(document, "supports", item_label, errors)

    for index, fact in enumerate(require_list(data, "extractedFacts", label, errors)):
        item_label = f"{label}.extractedFacts[{index}]"
        if not isinstance(fact, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "sourceDocumentId", "factType", "valueLabel", "value", "evidencePointer", "confidence", "reviewStatus"):
            require_string(fact, key, item_label, errors)
        if fact.get("sourceDocumentId") not in document_ids:
            errors.append(f"{item_label}.sourceDocumentId references an unknown document")

    for index, question in enumerate(require_list(data, "reviewQuestions", label, errors)):
        item_label = f"{label}.reviewQuestions[{index}]"
        if not isinstance(question, dict):
            errors.append(f"{item_label} must be an object")
            continue
        for key in ("id", "question", "status"):
            require_string(question, key, item_label, errors)
        for source_id in question.get("relatedSources", []):
            if source_id not in document_ids:
                errors.append(f"{item_label}.relatedSources references unknown source id {source_id!r}")


def main() -> int:
    errors: list[str] = []

    for relative in REQUIRED_FILES:
        path = ROOT / relative
        if not path.exists():
            errors.append(f"Missing required AI surface file: {relative}")

    workspace = load_json(ROOT / "examples/agent-workspace.example.json", errors)
    package = load_json(ROOT / "examples/accountant-package.example.json", errors)
    business_profile = load_json(ROOT / "examples/business-profile.example.json", errors)
    classification_policy = load_json(ROOT / "examples/classification-policy.example.json", errors)
    source_manifest = load_json(ROOT / "examples/source-document-manifest.example.json", errors)

    if workspace is not None:
        validate_workspace(workspace, errors)
        scan_private_patterns("examples/agent-workspace.example.json", workspace, errors)
    if package is not None:
        validate_package(package, errors)
        scan_private_patterns("examples/accountant-package.example.json", package, errors)
    if business_profile is not None:
        validate_business_profile(business_profile, errors)
        scan_private_patterns("examples/business-profile.example.json", business_profile, errors)
    if classification_policy is not None:
        validate_classification_policy(classification_policy, errors)
        scan_private_patterns("examples/classification-policy.example.json", classification_policy, errors)
    if source_manifest is not None:
        validate_source_manifest(source_manifest, errors)
        scan_private_patterns("examples/source-document-manifest.example.json", source_manifest, errors)

    agent_notes_path = ROOT / "examples/agent-notes.example.md"
    if agent_notes_path.exists():
        scan_text_private_patterns(
            "examples/agent-notes.example.md",
            agent_notes_path.read_text(encoding="utf-8"),
            errors,
        )

    if errors:
        print("Agent surface validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("AI agent surface examples and docs are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
