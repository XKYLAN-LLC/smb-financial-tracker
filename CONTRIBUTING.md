# Contributing

Thanks for considering a contribution to SMB Financial Tracker.

## Good First Contributions

- Improve documentation for local setup and private data handling.
- Add synthetic sample data.
- Add validation for JSON seed files and program configs.
- Improve AI-assisted source-review scaffolding for CSVs, PDFs, receipts, statements, and invoices.
- Add workflow docs that explain safe source manifests, review queues, and accountant packages.
- Improve accountant-ready exports.
- Add tests for calculations.

## Before Opening A Pull Request

1. Keep examples synthetic.
2. Do not commit private financial data.
3. Run a privacy scan for personal identifiers and raw source files.
4. Run any validation scripts or tests that exist.
5. Keep the pull request focused.
6. Explain what changed and what remains uncertain.

## Privacy Rules

Do not commit:

- SSNs, tax IDs, account numbers, addresses, phone numbers, or emails
- bank, brokerage, insurance, benefits, tax, or health-care application IDs
- private PDFs, screenshots, CSV exports, spreadsheets, statements, receipts, or tax returns
- private seed JSON or local browser backups
- secrets, tokens, cookies, or credential files

Use synthetic data in public examples. Keep real user data in ignored local folders.

## Automated Or Assisted Contributions

Tool-assisted changes are welcome, but they should be reviewed carefully. Contributions should preserve provenance, flag uncertainty, and avoid authoritative tax, legal, benefits, or insurance advice.

This project expects AI assistants to help users interpret user-provided context and attached private files. Avoid building heavy deterministic ingestion, bucket-routing, bank integration, OAuth, or PDF parsing systems until the local review surface is clearly stable.

## Pull Request Reviews

All pull requests should receive at least one review before merging.
