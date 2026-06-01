# Product Spec

## Working Name

Local-first financial tracker for small business recordkeeping and planning.

## Product Thesis

Individuals and small business owners already have the raw materials their accountant needs: bank exports, invoices, payment processor records, brokerage statements, tax forms, receipts, and notes. The hard part is turning those fragments into a clean ledger, a review queue, and accountant-ready exports without paying for a full accounting system or manually rebuilding the same spreadsheet every year.

This product should provide the durable skeleton:

- a local ledger with transparent calculations
- importer and normalization contracts
- scriptable commands
- provenance on every material number
- conservative review states for tax, benefits, and insurance uncertainty
- export formats that a CPA or human reviewer can actually use

Automation can help with repetitive gathering, classification, reconciliation, and explanation work. The product should keep those workflows constrained, auditable, and reversible.

## Primary Users

- Self-employed individuals and single-member LLC owners.
- Freelancers with mixed personal/business accounts.
- People preparing annual tax packets for a CPA.
- People tracking income-threshold programs such as health coverage subsidies, Medi-Cal, CalFresh, student loan programs, or local assistance programs.

## Non-Goals

- Do not replace a CPA, attorney, benefits worker, or licensed insurance professional.
- Do not file taxes or submit government applications without explicit user confirmation.
- Do not make authoritative eligibility determinations.
- Do not scrape private accounts without explicit user permission.
- Do not optimize by inventing deductions, hiding income, or classifying personal expenses as business expenses.

## MVP

The first real version should solve the current local workflow well:

1. Import a CSV export from a personal finance app or bank.
2. Import or manually enter invoice/payment totals.
3. Maintain a JSON-backed ledger of income, expenses, deductions, transfers, and info-only records.
4. Preserve source metadata for imported rows.
5. Classify likely business expenses into Schedule C buckets.
6. Flag ambiguous items for human or CPA review.
7. Calculate gross receipts, Schedule C expense candidates, net self-employment income, other income, above-line deduction scenarios, and a program-specific planning income view.
8. Track a cited threshold program config.
9. Export accountant-ready CSV and Markdown summaries.
10. Keep all data local by default.

## Data Architecture

The prototype uses flat JSON files because they are transparent and easy to edit. A mature version can migrate the same model into SQLite or another local database.

Core objects:

- `SourceDocument`: uploaded/imported PDF, CSV, statement, screenshot, invoice, receipt, or manual observation.
- `SourceRecord`: a row, page, line item, or extracted value from a source document.
- `LedgerEntry`: normalized income, expense, transfer, deduction, asset, or info-only row.
- `ClassificationEvent`: user, rule, or agent change to a row.
- `ProgramConfig`: threshold program rules, citations, effective dates, and calculation view.
- `Scenario`: a named planning view with toggles and assumptions.
- `ExportRun`: generated accountant packet with timestamp, inputs, and warnings.

Every calculated number should be traceable back to ledger rows, and every ledger row should be traceable back to a source or marked as a manual estimate.

## Scriptable API Surface

Automation should interact through explicit commands instead of free-form file edits whenever possible:

- `import_source(path, source_type)`
- `list_sources(year)`
- `normalize_transactions(source_id)`
- `classify_transactions(year, policy)`
- `build_review_queue(year)`
- `reconcile_income(year, sources)`
- `calculate_profit_and_loss(year, scenario_id)`
- `calculate_program_income(program_id, scenario_id)`
- `watch_threshold(program_id, scenario_id)`
- `generate_accountant_export(year, format)`
- `list_missing_documents(year)`

Each command should return structured output with warnings and citations where relevant.

## Import Sources

CSV import should come first because it is deterministic and easy to inspect. Later importers can support PDFs and browser/MCP-based retrieval when the user grants access.

Initial sources:

- Monarch or bank transaction CSV
- Zoho/Stripe invoice and payment exports
- brokerage realized gain and dividend summaries
- 1099 forms
- W-2 forms
- student loan interest statements
- insurance premium records
- receipts and invoices

PDF extraction should produce reviewable source records, not silently create final ledger entries.

## Classification Policy

Classifications should be conservative:

- Use `Supported` only when the source and treatment are clear.
- Use `Needs support` when an item needs a receipt, statement, or business-purpose note.
- Use `CPA review` when treatment depends on facts or tax judgment.
- Use `Exclude` for personal items, transfers, duplicates, and non-deductible records.

The system may suggest categories, but it should preserve the original source category and the reason for every change.

## Benefits And Threshold Programs

Program rules should be pluggable JSON/config, not hard-coded assumptions. Each config should include:

- jurisdiction
- year or effective date range
- household/entity assumptions
- threshold values
- income concept used
- included/excluded income and deduction categories
- citations with URLs and retrieval dates
- disclaimer and review notes

The product should support "watch" behavior: show current estimate, buffer, no-action scenario, and what changed since the last review.

## UI Requirements

The UI should feel like a small business operating dashboard, not a marketing page:

- dense but readable
- restrained color
- clear status labels
- accountant/export controls visible
- review queue easy to scan
- no nested decorative cards
- no decorative gradients as the main visual idea
- responsive enough for laptop and mobile review

Core views:

- Overview
- Ledger
- Imports
- Review Queue
- P&L
- Program Thresholds
- Scenarios
- Accountant Export

## Security And Privacy

Default posture:

- local-first storage
- no secrets in logs
- no raw tax returns or statements in public repos
- synthetic sample data for OSS demos
- explicit user approval for browser/account access
- redact SSNs, account numbers, application IDs, addresses, phone numbers, and emails from shareable exports unless the user explicitly asks otherwise

## Open-Source Readiness

Before publication:

- Move private data into ignored local files.
- Replace seed data with synthetic examples.
- Add `.gitignore` for raw imports, exports, PDFs, screenshots, and local backups.
- Add automated tests for calculations and import normalization.
- Document the agent command contract.
- Include sample program configs with citations.
- Include a threat model for local data and agent access.

## Near-Term Build Plan

1. Keep the static prototype as a validated reference UI.
2. Move seed data into structured JSON and stop hard-coding private values in UI code.
3. Add importer scripts for CSV files.
4. Add deterministic calculation tests.
5. Add a CLI for safe import, validation, and export operations.
6. Split private data from public sample data.
7. Convert to a small local app when the data model stabilizes.
