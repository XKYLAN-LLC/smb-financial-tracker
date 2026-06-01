# Roadmap

This project should stay small, local-first, and privacy-safe while the data model stabilizes.

## V1: Local JSON And Dashboard

- Keep the static dashboard easy to run with a local server.
- Use `sample-tracker.seed.json` as the synthetic public fixture.
- Keep the ledger model clear enough for agents to edit safely.
- Preserve source metadata and review status on ledger rows.
- Export simple CSV and Markdown summaries for accountant review.
- Validate sample JSON and scan public files before commits.

## V2: AI-Assisted Source Review

- Let users attach or point an AI assistant at local CSVs, PDFs, receipts, statements, invoices, and notes.
- Maintain source-document manifests and review queues rather than building a full parser/routing engine.
- Preserve source ids, local path hints, row hashes when useful, user context, and import/review timestamps.
- Normalize AI-assisted findings into reviewable ledger rows rather than final tax conclusions.
- Add accountant-package manifests so users can hand off one organized local package at year end.
- Expand validation for calculations, manifests, review queues, package checklists, and privacy checks.

## V3: Richer Agent Workflows

- Add explicit agent commands for imports, classifications, reconciliation, missing-document lists, threshold watches, and accountant exports.
- Consider a small local database only after the JSON model is stable.
- Add permissioned source adapters only when AI-assisted local file review becomes the bottleneck.
- Keep all private source material local by default.

## Non-Goals For Now

- No live bank integrations.
- No OAuth.
- No real Stripe, Zoho, Monarch, brokerage, or tax-provider API connections.
- No PDF parsing engine.
- No full CSV categorization or bucket-routing engine.
- No complex backend.
- No workflow that requires committing real private data.
