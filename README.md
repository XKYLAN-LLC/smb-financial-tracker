# SMB Financial Tracker

SMB Financial Tracker is a local-first, agent-friendly financial tracking project for small business owners and self-employed people.

The current version is a simple static dashboard with synthetic sample data. The broader goal is to become a downloadable/forkable workspace where users can keep private financial records out of Git while agents help organize source files, maintain a ledger, build review queues, calculate financial scenarios, and prepare accountant-ready exports.

This is not tax, legal, benefits, or insurance advice. The tracker organizes records, performs transparent calculations, cites program thresholds, and flags review items for a CPA or other qualified reviewer.

## Project Goals

- Give small business owners a simple dashboard for income, expenses, deductions, review queues, P&L, and threshold-program scenarios.
- Keep data local-first, transparent, and easy to audit.
- Provide synthetic public examples while keeping real user data private.
- Create reusable agent instructions and skills for safe CSV/PDF/browser-assisted financial workflows.
- Preserve provenance so imported or agent-edited records can be reviewed later.
- Export clean summaries that make accountant handoff easier.

## Files

| File | Purpose |
|---|---|
| `index.html` | Local static UI for the current tracker. It reads saved browser state first, then falls back to the sample seed JSON. |
| `sample-tracker.seed.json` | Synthetic seed ledger and settings for demos, tests, and future OSS examples. |
| `covered-ca-medi-cal-ca-2026.program.json` | Program threshold configuration with source citations and effective year. |
| `docs/v1-scope.md` | Scope and roadmap notes, including reusable open-source product direction. |
| `AGENT_GUIDE.md` | Operating guide for AI agents manipulating tracker data. |
| `DATA_MODEL.md` | Ledger, source, provenance, program, and export schema notes. |
| `PRODUCT_SPEC.md` | Product requirements and future architecture direction. |
| `.gitignore` | Starter privacy guardrails for raw imports, exports, PDFs, screenshots, and private seed data. |
| `CONTRIBUTING.md` | Contribution guide and privacy requirements. |
| `SECURITY.md` | Security and sensitive-data reporting policy. |
| `GOVERNANCE.md` | Project governance and decision-making model. |

## Current Workflow

1. Open the tracker through a local server:

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1
   ```

2. Visit `http://127.0.0.1:8765/index.html`.
3. Update ledger rows, imports, or settings.
4. Export CPA CSV or accountant Markdown.
5. Save source documents and support in the tax folder.

The UI stores edits in browser `localStorage` under `local-financial-tracker-v1`. If you need to reload from the JSON seed, use the Reset button or clear that localStorage key.

## Privacy Warning

Before adding real user data to this repo:

- Remove personal name, address, contact details, SSN fragments, case/application IDs, client names, and exact private financial records.
- Replace the private seed JSON with `sample-tracker.seed.json` or another synthetic fixture.
- Keep real tax returns, health-insurance PDFs, brokerage statements, bank statements, and Monarch exports out of Git.
- Review `.gitignore` before creating a public repository.

## Contribution And Review Policy

All meaningful changes should be made through pull requests and receive at least one review before merging to `main`.

Repository administrators should enable GitHub branch protection or a ruleset for `main` with:

- Require a pull request before merging.
- Require at least 1 approving review.
- Require review from Code Owners after `.github/CODEOWNERS` is updated with a real user or team.
- Do not allow force pushes.
- Do not allow deletions.

## Open-Source Direction

The reusable project should become an agent-first, local-first financial operating system:

- Local ledger/database with transparent provenance.
- CSV import adapters first; permissioned MCP/import adapters later.
- Pluggable program threshold configs with citations and effective dates.
- Review queues for uncertain classifications.
- Accountant-ready exports for P&L, Schedule C buckets, and supporting notes.
- Conservative calculations with explicit review flags, not authoritative tax or benefits determinations.
