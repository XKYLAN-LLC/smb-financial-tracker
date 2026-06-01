---
name: import-csv
description: Use when importing bank, Monarch, Zoho, Stripe, brokerage, invoice, payment processor, or spreadsheet CSV exports into reviewable ledger rows for this local-first financial tracker.
---

# Import CSV

CSV import should create reviewable ledger rows with provenance. It should not silently create final tax, legal, benefits, or insurance conclusions.

## Source Files

- Keep raw CSV files outside Git, usually under `private/imports/`.
- Do not commit real CSV exports, generated import backups, screenshots, or spreadsheets.
- Use synthetic CSV examples only when a public fixture is needed.

## Parser Rules

- Use a real CSV parser, not line splitting.
- Preserve original source fields that are useful for review: date, merchant/payee, original description, source category, amount, account/source name when safe, notes, tags, and transaction id/hash when available.
- Normalize ledger `amount` values to positive numbers.
- Use `type` to decide how a row affects totals: `Revenue`, `Expense`, `Investment / other income`, `Above-line deduction`, or `Info only`.
- Keep transfers, duplicate rows, raw mixed-use inputs, and uncertain support as `Info only` or `Exclude` until reviewed.

## Ledger Mapping

For each imported row, include:

- stable `id`;
- ISO `date`;
- normalized `type`;
- concise `description`;
- positive `amount`;
- Schedule C `bucket` or `Not Schedule C`;
- internal `subcategory`;
- `businessPct`;
- conservative `status`;
- review-oriented `notes`;
- `source` metadata with source system, kind, local filename, and row hash when possible;
- `provenance` entry describing the import or classification step when the model supports it.

## Classification Defaults

- Use `Needs support` when a row looks plausible but needs receipt, statement, invoice, or business-purpose support.
- Use `CPA review` for mixed-use, home-office, vehicle, hardware/capitalization, education, meals, travel, and other judgment-heavy items.
- Use `Info only` for raw support inputs that should not directly affect totals.
- Use `Exclude` for personal items, transfers, reimbursements, and duplicates.
- Use `Supported` only when the source and treatment are clear enough for the current workflow.

## Review Output

After import, summarize:

- number of rows imported;
- rows excluded or marked info-only;
- rows needing support;
- rows needing CPA review;
- any columns that were missing or ambiguous;
- duplicate or transfer candidates.
