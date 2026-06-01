# Roadmap

This project should stay small, local-first, and privacy-safe while the data model stabilizes.

## V1: Local JSON And Dashboard

- Keep the static dashboard easy to run with a local server.
- Use `sample-tracker.seed.json` as the synthetic public fixture.
- Keep the ledger model clear enough for agents to edit safely.
- Preserve source metadata and review status on ledger rows.
- Export simple CSV and Markdown summaries for accountant review.
- Validate sample JSON and scan public files before commits.

## V2: CSV And PDF Helper Workflows

- Add deterministic CSV import helpers before any live account integrations.
- Normalize imports into reviewable ledger rows rather than final tax conclusions.
- Preserve raw source fields, row hashes, source filenames, and import timestamps.
- Add helper workflows for PDF/source-document review, but do not silently turn PDFs into final ledger entries.
- Expand tests for calculations, import normalization, review queues, and privacy checks.

## V3: Richer Agent Workflows

- Add explicit agent commands for imports, classifications, reconciliation, missing-document lists, threshold watches, and accountant exports.
- Consider a small local database only after the JSON model is stable.
- Add permissioned source adapters only when manual exports become the bottleneck.
- Keep all private source material local by default.

## Non-Goals For Now

- No live bank integrations.
- No OAuth.
- No real Stripe, Zoho, Monarch, brokerage, or tax-provider API connections.
- No PDF parsing engine.
- No complex backend.
- No workflow that requires committing real private data.
