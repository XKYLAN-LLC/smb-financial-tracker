# AI Agent Surface

This repository is an AI-assisted financial tracking surface, not a traditional data-ingestion product.

The expected workflow is that a user works with an AI assistant, attaches or points to local source material, adds context in conversation, and asks the assistant to help maintain the ledger, review queue, and accountant package. The repo provides the stable shape, guardrails, examples, and validation that keep that work reviewable.

## What The Surface Provides

- A local static dashboard for reviewing ledger rows, calculations, flags, and exports.
- A simple JSON ledger model that agents can edit with provenance.
- A source-document manifest shape for PDFs, CSVs, statements, receipts, invoices, and notes.
- Business profile, classification policy, and agent-note examples for durable private context.
- An accountant-package manifest shape for tracking what should be included in a year-end handoff.
- Skills and docs that tell agents how to stay conservative, privacy-aware, and review-oriented.
- Validation scripts and CI checks that make public examples safer to maintain.

## What Agents Do

Agents should help the user:

- turn user-provided context into reviewable ledger rows;
- preserve source references without committing private source files;
- use private profile and policy files to keep categories and business-use percentages consistent over time;
- build a review queue for missing support, duplicates, mixed-use items, and professional-review questions;
- maintain a manifest of source documents and final package contents;
- summarize totals and questions for an accountant.

Agents may use reasoning and user context to classify records, but every uncertain item should remain visible through `Needs support`, `CPA review`, `Exclude`, or row type `Info only`.

## What This Repo Should Not Build Yet

- No bank integrations.
- No OAuth.
- No production PDF extraction engine.
- No full CSV categorization/routing engine.
- No backend service.
- No workflow that requires committing private financial records.

The point is to give the assistant and user a shared, auditable surface. The assistant can use attached source files and conversation context during a session, but the public repo should only store synthetic examples and safe structure.

## Local Private Workspace

Use ignored folders for real work:

- `private/imports/` for CSVs, spreadsheets, and raw exports.
- `private/profile/` for business facts, user-approved classification rules, and allocation notes.
- `private/source-documents/` for PDFs, receipts, screenshots, invoices, and statements.
- `private/agent-notes/` for future-session notes and unresolved assumptions.
- `private/exports/` for accountant packets and generated handoffs.
- `private/backups/` for local JSON backups and snapshots.

When a user shares a source file with an AI assistant, the agent should reference it in a local manifest instead of committing the file.

## Agent Handoff Pattern

For each source document, capture:

- safe source id;
- local storage hint;
- document type;
- institution/source label;
- tax year or period;
- what the user says it proves;
- whether the document has been reviewed;
- related ledger row ids or review items.

For each accountant package, capture:

- package year;
- included ledger/export files;
- source document checklist;
- open questions;
- review flags;
- privacy notes;
- final user approval state.
