# Agent Instructions

This repository is a public, local-first financial tracking surface. Public files must stay synthetic and safe to share.

## Before Editing

Read these files first:

- `README.md`
- `docs/README.md`
- `docs/agent-surface.md`
- `docs/agent-workflows.md`
- `docs/classification.md`
- `docs/private-data.md`
- `DATA_MODEL.md`
- `AGENT_GUIDE.md`

## Working Rules

- Keep real financial records, exports, PDFs, screenshots, account data, and private identifiers out of Git.
- Use ignored local folders under `private/` for user-provided source files.
- Preserve provenance when adding or changing ledger rows.
- Use conservative review statuses when support is incomplete or classification is uncertain.
- Use private business profiles, classification policies, source manifests, and agent notes when present.
- Keep calculations traceable to rows, assumptions, and source notes.
- Prefer small documentation, validation, and dashboard improvements over new infrastructure.
- Do not add live bank integrations, OAuth, real payment-provider integrations, PDF parsing engines, or heavy CSV routing logic.

## Agent Role

Agents should help users organize records, calculate summaries, preserve source context, flag questions, and prepare reviewable exports. Agents should not claim to replace a CPA, attorney, benefits worker, insurance professional, or financial advisor.

## Validation

Before publishing changes, run the relevant checks:

```bash
python3 scripts/validate-sample-json.py
python3 scripts/validate-agent-surface.py
python3 -m py_compile scripts/validate-sample-json.py scripts/validate-agent-surface.py
node --check scripts/capture-screenshots.mjs
git diff --check
```

Also run a targeted privacy scan for SSNs, emails, phone numbers, account-like numbers, and live API keys before opening a pull request.
