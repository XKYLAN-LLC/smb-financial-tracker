# Agent Guide

This guide is for AI agents working with the local financial tracker. The agent should be conservative, provenance-first, and privacy-aware.

## Core Rules

- Do not invent income, expenses, deductions, or eligibility facts.
- Do not classify personal spending as business spending without support.
- Do not submit tax, insurance, benefits, or financial forms unless the user explicitly asks and confirms at action time.
- Do not scrape private accounts or browser pages without explicit user permission for that source and session.
- Preserve raw source records and provenance when importing, classifying, or editing data.
- Flag ambiguous transactions for human/CPA review instead of forcing a category.
- Keep secrets, account numbers, SSNs, application IDs, and private statement data out of logs, docs, commits, and public exports.

## Data Entry Contract

Primary editable data lives in `sample-tracker.seed.json`.

The HTML tracker can also produce a JSON backup through the UI. If browser `localStorage` exists, it overrides the seed JSON. To test a seed JSON change, clear the localStorage key or press Reset in the UI.

When adding or changing a row, include:

- `id`: stable machine-readable row id.
- `use`: whether the row is currently included.
- `date`: ISO date.
- `type`: `Revenue`, `Expense`, `Investment / other income`, `Above-line deduction`, or `Info only`.
- `description`: short human-readable item.
- `amount`: positive number.
- `bucket`: Schedule C top-level bucket or `Not Schedule C`.
- `subcategory`: stable internal detail.
- `businessPct`: included business-use percentage.
- `status`: `Supported`, `Estimate`, `Needs support`, `CPA review`, or `Exclude`.
- `notes`: short evidence or review note.
- `source`: optional structured source metadata.
- `provenance`: optional event list showing who/what changed the row and why.

## Agent-Friendly Operations

Future agents should expose operations like:

- `list_missing_docs(year)`
- `import_transactions(source_file)`
- `classify_uncategorized_transactions()`
- `reconcile_revenue(zoho_export, bank_export, stripe_export)`
- `calculate_pl(statement_view)`
- `calculate_magi_scenario(program_id, overrides)`
- `watch_threshold(program_id)`
- `generate_accountant_export(format)`
- `build_review_queue()`
- `update_source_manifest(source_context)`
- `build_accountant_package_manifest(year)`

For now, implement those operations by editing the JSON seed, using the tracker UI, or exporting from the UI.

Do not build source-specific CSV/PDF parsers or live integrations unless the user explicitly asks. The expected workflow is that the user supplies private files and context to the AI assistant, and the assistant updates the local ledger, source manifest, review queue, and package manifest in a reviewable way.

## Classification Standard

Use only these Schedule C top-level headings:

- Advertising
- Car and truck expenses
- Parking fees and tolls
- Commissions and fees
- Contract labor
- Employee benefit programs and health insurance (other than pension/profit-sharing)
- Insurance (other than health)
- Interest - mortgage
- Interest - other
- Legal and professional fees
- Office expense
- Pension and profit-sharing plans
- Rent or lease - vehicles, machinery and equipment
- Rent or lease - other business property
- Repairs and maintenance
- Supplies
- Taxes and licenses
- Travel
- Meals
- Entertainment
- Utilities
- Wages
- Dependent care benefits
- Other expenses
- Property & equipment tracking

Stable internal subcategories include:

- Software subscriptions
- Hosting & infrastructure
- Domains & DNS
- Processor fees
- Education & certifications
- Legal/accounting
- Business insurance
- Office supplies
- Hardware / fixed assets

## Review Queue Rules

Use `CPA review` for:

- Home-office allocations.
- Vehicle expenses where mileage vs actual-expense method is unclear.
- Hardware/equipment capitalization questions.
- Education, certification, or real-estate-related expenses.
- Mixed-use personal/business items.

Use `Needs support` for:

- Items that look plausible but need a receipt, invoice, statement, or clear business-purpose note.

Use `Exclude` for:

- Confirmed personal items.
- Duplicate imports.
- Transfers or reimbursements that should not affect income/expense totals.

## Program Config Rules

Program requirements belong in JSON config files like `covered-ca-medi-cal-ca-2026.program.json`.

Each program config should include:

- program id
- jurisdiction
- effective dates/year
- household or entity assumptions
- threshold values
- calculation view
- citation ids, URLs, and retrieval dates
- disclaimer

Do not hard-code benefits thresholds in UI logic unless they are also represented in a cited config.
