# Private Data

This is a public repository. Keep it useful for demos, forks, and agent work by committing only synthetic data and public documentation.

## Never Commit

- Tax returns, tax forms, benefit notices, health-insurance documents, bank statements, brokerage statements, invoices, receipts, screenshots, CSV exports, PDFs, or spreadsheets containing real records.
- SSNs, EINs, account numbers, routing numbers, application IDs, policy IDs, case numbers, client names, customer names, addresses, emails, phone numbers, or exact private financial history.
- API keys, OAuth tokens, session cookies, recovery codes, application secrets, `.env` files, browser profiles, or downloaded account backups.
- Generated accountant exports, local browser backups, private seed JSON, or any file derived from real user records unless it has been fully anonymized and reviewed.

## Local-Only Folders

Create these folders locally when working with private data. They are intentionally ignored by Git through `private/`.

- `private/imports/` for raw CSV exports from banks, Monarch, Zoho, Stripe, or spreadsheets.
- `private/source-documents/` for PDFs, statements, receipts, invoices, screenshots, tax forms, and benefit notices.
- `private/exports/` for accountant packets, CSV exports, Markdown summaries, and review handoffs generated from real data.
- `private/backups/` for browser JSON backups, local database snapshots, and private working copies.

Keep filenames boring and non-identifying. Prefer `bank-export-2026-05.csv` over names that include a client, account, address, or application number.

## Public Sample Data

Public samples should be synthetic and clearly labeled as synthetic. Use fake merchants, fake invoice systems, rounded numbers, and generic business descriptions. Do not preserve real transaction timing, exact amounts, client labels, or source filenames from a private export.

If a sample is meant to demonstrate provenance, use safe placeholders like `sample-bank-export.csv`, `Sample invoice app`, or a stable fake row hash. Do not include real account metadata.

## Agent Rules

Agents may organize, calculate, normalize, preserve provenance, and flag records for review. Agents must not claim to replace a CPA, attorney, benefits worker, or insurance professional.

Before committing, agents should:

1. Check `git status --short`.
2. Run the sample validator.
3. Run a targeted privacy scan for secrets and personal identifiers.
4. Inspect the staged diff for raw exports, generated backups, screenshots, PDFs, and private records.
