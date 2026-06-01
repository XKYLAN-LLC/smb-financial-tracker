# Local-First Financial Tracker Prototype

This repository contains a local-first financial tracker prototype. The immediate demo use case is a sample freelance business tracking income, expenses, Schedule C support, and an income-threshold program scenario. The broader product direction is an agent-first tool that helps individuals and small business owners keep accountant-ready financial records without manually rebuilding the same packet every year.

This is not tax, legal, benefits, or insurance advice. The tracker organizes records, performs transparent calculations, cites program thresholds, and flags review items for a CPA or other qualified reviewer.

## Files

| File | Purpose |
|---|---|
| `index.html` | Local static UI for the current tracker. It reads saved browser state first, then falls back to the sample seed JSON. |
| `sample-tracker.seed.json` | Synthetic seed ledger and settings for demos, tests, and future OSS examples. |
| `covered-ca-medi-cal-ca-2026.program.json` | Program threshold configuration with source citations and effective year. |
| `docs/v1-scope.md` | Scope and roadmap notes, including reusable open-source product direction. |
| `docs/private-data.md` | Public-repo privacy rules and local-only folder guidance. |
| `docs/roadmap.md` | Simple V1/V2/V3 product roadmap. |
| `AGENT_GUIDE.md` | Operating guide for AI agents manipulating tracker data. |
| `DATA_MODEL.md` | Ledger, source, provenance, program, and export schema notes. |
| `PRODUCT_SPEC.md` | Product requirements and future architecture direction. |
| `skills/financial-tracker/SKILL.md` | Concise skill instructions for agents maintaining this repo. |
| `skills/import-csv/SKILL.md` | CSV import rules for reviewable ledger rows. |
| `scripts/validate-sample-json.py` | Dependency-free validator for public sample JSON and obvious private-data patterns. |
| `.gitignore` | Starter privacy guardrails for raw imports, exports, PDFs, screenshots, and private seed data. |

## Current Workflow

1. Open the tracker through a local server:

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1
   ```

2. Visit `http://127.0.0.1:8765/index.html`.
3. Update ledger rows, imports, or settings.
4. Export CPA CSV or accountant Markdown.
5. Save source documents and support in a local ignored folder such as `private/source-documents/`.

The UI stores edits in browser `localStorage` under `local-financial-tracker-v1`. If you need to reload from the JSON seed, use the Reset button or clear that localStorage key.

## Validation

Run the sample validator before committing public data or agent changes:

```bash
python3 scripts/validate-sample-json.py
```

For publication work, also run a targeted privacy scan and inspect the diff manually for raw imports, generated exports, screenshots, PDFs, backups, and private records.

## Privacy Warning

Before adding real user data to this repo:

- Remove personal name, address, contact details, SSN fragments, case/application IDs, client names, and exact private financial records.
- Replace the private seed JSON with `sample-tracker.seed.json` or another synthetic fixture.
- Keep real tax returns, health-insurance PDFs, brokerage statements, bank statements, and Monarch exports out of Git. Use ignored local folders under `private/` instead.
- Review `.gitignore` before creating a public repository.

## Open-Source Direction

The reusable project should become an agent-first, local-first financial operating system:

- Local ledger/database with transparent provenance.
- CSV import adapters first; permissioned MCP/import adapters later.
- Pluggable program threshold configs with citations and effective dates.
- Review queues for uncertain classifications.
- Accountant-ready exports for P&L, Schedule C buckets, and supporting notes.
- Conservative calculations with explicit review flags, not authoritative tax or benefits determinations.
