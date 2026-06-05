# Core Concepts

SMB Financial Tracker is a local-first framework surface for financial review. The repo does not try to ingest every source automatically. Instead, it gives a user and an AI assistant a shared shape for records, source context, review status, and accountant handoff.

## Framework Surface

The important pieces are small:

- Ledger rows: reviewable income, expense, transfer, owner contribution, and owner draw records.
- Review statuses: simple labels that keep uncertain items visible.
- Source documents: local-only PDFs, CSVs, receipts, statements, invoices, notes, or exports referenced by safe IDs.
- Provenance: source IDs, row hashes when useful, notes, timestamps, and user context that explain where a row came from.
- Business profile: private durable facts about the business, accounting assumptions, and open professional-review questions.
- Classification policy: private user-approved or CPA-approved category and allocation guidance.
- Accountant packages: a local checklist of exports, source documents, and open questions for year-end review.
- Agent notes: private future-session notes that preserve what an agent reviewed, changed, and left unresolved.
- Program configs: cited threshold or planning data with effective dates.
- Skills and prompts: instructions that help AI agents work conservatively and consistently.
- Validation: small checks that keep public examples shaped correctly and free of obvious private-data patterns.

## How AI Fits

The assistant can use user-provided files and conversation context during a session. The repository should store the durable, reviewable result: rows, flags, source references, package checklists, and notes.

That means the repo should not spend early effort on heavy deterministic import logic. CSVs and PDFs can be attached to an AI session or placed in ignored local folders, then represented in the public-safe model through manifests and reviewable ledger rows.

## Review Statuses

Use review statuses to keep uncertainty visible:

- `Supported`: support is present and the treatment looks straightforward.
- `Needs support`: a source document, receipt, invoice, or explanation is missing.
- `CPA review`: the item needs professional review before final tax treatment.
- `Info only`: useful context, but not part of deductible or taxable totals.
- `Exclude`: should remain visible but stay out of business totals.

## Local-First Boundary

Public repo files should be synthetic. Private work belongs under ignored folders such as:

- `private/imports/`
- `private/profile/`
- `private/source-documents/`
- `private/agent-notes/`
- `private/exports/`
- `private/backups/`

The goal is a clean public framework and a private local workspace, not a hosted financial-data service.
