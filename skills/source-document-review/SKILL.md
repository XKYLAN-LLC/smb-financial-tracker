---
name: source-document-review
description: Use when reviewing user-provided CSVs, PDFs, bank statements, receipts, invoices, spreadsheets, or exports with the SMB financial tracker.
---

# Source Document Review

Review source documents to create durable, private context for ledger rows and accountant handoff. Do not commit source files or private extracted details.

## Read First

- `docs/agent-workflows.md`
- `docs/private-data.md`
- `examples/source-document-manifest.example.json`
- `examples/agent-notes.example.md`
- `AGENT_GUIDE.md`

For real work, also read private copies when present:

- `private/source-documents/source-document-manifest.json`
- `private/profile/business-profile.json`
- `private/profile/classification-policy.json`
- `private/agent-notes/session-log.md`

## Review Steps

1. Inventory the files and assign safe source ids.
2. Record local path hints under `private/`.
3. Capture document type, source label, period, review status, and what each document supports.
4. Extract facts with evidence pointers such as page labels, CSV row hashes, or receipt names.
5. Link facts to ledger rows or review questions.
6. Keep uncertain facts in the review queue.
7. Update private agent notes with what was reviewed and what remains open.

## Safety

- Do not paste private source contents into public files.
- Do not store account numbers, addresses, emails, phone numbers, tax IDs, application IDs, or exact private statement data in public examples.
- Do not treat every bank deposit as revenue without reconciling transfers, refunds, reimbursements, loans, and owner contributions.
- Do not treat every card charge as deductible without business purpose and support.

## Output

Summarize:

- documents reviewed;
- source manifest entries added or changed;
- extracted facts;
- ledger rows created or updated;
- missing support;
- review questions;
- next actions for the user or accountant.
