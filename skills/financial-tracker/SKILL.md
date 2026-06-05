---
name: financial-tracker
description: Use when maintaining this repo's local-first small business financial tracker, including ledger JSON, dashboard calculations, sample data, privacy guardrails, accountant exports, and agent workflows.
---

# Financial Tracker

Use this skill inside the SMB financial tracker repository. The goal is a simple, local-first tool that helps a small business owner keep a clean, reviewable financial picture without exposing private data.

## Read First

Before editing data, calculations, docs, or agent workflows, read:

- `README.md`
- `DATA_MODEL.md`
- `AGENT_GUIDE.md`
- `docs/agent-surface.md`
- `docs/agent-workflows.md`
- `docs/classification.md`
- `docs/accountant-package.md`
- `docs/private-data.md`
- `docs/roadmap.md`

## Operating Rules

- Use synthetic sample data in Git. Keep private records in ignored local folders.
- Preserve provenance for material numbers: source system, source file, row id/hash, import date, original description, original category, and classification changes when available.
- Read private business profile, classification policy, source manifest, and agent notes when present.
- Keep calculations traceable back to ledger rows and program configs.
- Use conservative statuses: `Supported`, `Estimate`, `Needs support`, `CPA review`, or `Exclude`.
- Flag uncertain tax, benefits, insurance, or legal treatment for human review.
- Do not invent income, deductions, expenses, support, or eligibility facts.
- Do not claim to replace a CPA, attorney, benefits worker, or insurance professional.
- Do not overbuild deterministic ingestion, bank integration, OAuth, CSV-routing, or PDF-parsing logic unless the user explicitly asks for that layer.

## Data Handling

- Treat `sample-tracker.seed.json` as the public synthetic fixture.
- Treat exported backups, raw imports, PDFs, screenshots, spreadsheets, statements, receipts, tax forms, and real financial records as private local data.
- Use `private/imports/`, `private/source-documents/`, `private/exports/`, and `private/backups/` for local work with real records.
- Use `private/profile/` and `private/agent-notes/` for durable local context that future sessions can reuse.
- Do not add secrets, account numbers, SSNs, addresses, emails, phone numbers, application IDs, or client/customer identifiers to public files.

## Safe Agent Work

Agents should:

- organize ledger rows and source notes;
- calculate transparent totals from existing rows;
- preserve raw source context and provenance;
- identify duplicates, transfers, missing support, and review flags;
- maintain source-document and accountant-package manifests;
- prepare accountant-ready summaries for user review.

Agents should not:

- submit forms or contact institutions without explicit user confirmation at action time;
- scrape private accounts without source-specific permission for the session;
- classify personal spending as business spending without support;
- make authoritative tax, legal, benefits, or insurance determinations.

## Before Committing

Run the sample validator and a targeted privacy scan. Inspect the diff manually for accidental private data, generated exports, raw imports, screenshots, PDFs, and local backups.
