# SMB Financial Tracker

SMB Financial Tracker is a small, local-first financial tracking project for freelancers, consultants, and small business owners.

The current version is a static dashboard with synthetic sample data. The goal is to make it easy to track income, expenses, deductions, review items, and accountant-ready exports without putting private financial records into Git.

This is not tax, legal, benefits, or insurance advice. It is a recordkeeping and planning tool. Final tax treatment should be reviewed by a qualified professional.

## Project Goals

- Give small business owners a simple dashboard for income, expenses, deductions, review queues, P&L, and planning scenarios.
- Keep data local-first, transparent, and easy to audit.
- Provide synthetic public examples while keeping real user data private.
- Make CSV/PDF import workflows easier to build over time.
- Preserve provenance so imported or edited records can be reviewed later.
- Export clean summaries that make accountant handoff easier.

## Files

| File | Purpose |
|---|---|
| `index.html` | Local static UI for the current tracker. It reads saved browser state first, then falls back to the sample seed JSON. |
| `sample-tracker.seed.json` | Synthetic seed ledger and settings for demos, tests, and future OSS examples. |
| `covered-ca-medi-cal-ca-2026.program.json` | Program threshold configuration with source citations and effective year. |
| `docs/v1-scope.md` | Scope and roadmap notes, including reusable open-source product direction. |
| `docs/private-data.md` | Public-repo privacy rules and local-only folder guidance. |
| `docs/roadmap.md` | Simple V1/V2/V3 product roadmap. |
| `AGENT_GUIDE.md` | Workflow guide for assisted data updates and imports. |
| `DATA_MODEL.md` | Ledger, source, provenance, program, and export schema notes. |
| `PRODUCT_SPEC.md` | Product requirements and future architecture direction. |
| `skills/financial-tracker/SKILL.md` | Concise skill instructions for agents maintaining this repo. |
| `skills/import-csv/SKILL.md` | CSV import rules for reviewable ledger rows. |
| `scripts/validate-sample-json.py` | Dependency-free validator for public sample JSON and obvious private-data patterns. |
| `.gitignore` | Starter privacy guardrails for raw imports, exports, PDFs, screenshots, and private seed data. |
| `LICENSE` | MIT license. |
| `NOTICE` | Short project attribution note. |
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
5. Save source documents and support in a local ignored folder such as `private/source-documents/`.

The UI stores edits in browser `localStorage` under `local-financial-tracker-v1`. To reload from the sample JSON seed, use Reset or clear that localStorage key.

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

## Contribution And Review Policy

All meaningful changes should be made through pull requests and receive at least one review before merging to `main`.

Repository administrators should enable GitHub branch protection or a ruleset for `main` with:

- Require a pull request before merging.
- Require at least 1 approving review.
- Require review from Code Owners after `.github/CODEOWNERS` is updated with a real user or team.
- Do not allow force pushes.
- Do not allow deletions.

## License And Credits

This project is released under the MIT License. You can use, copy, modify, merge, publish, distribute, sublicense, and sell copies, as long as the copyright and license notice are included with copies or substantial portions of the software.

If you build on this project, please keep the license notice and link back to the repository when practical:

https://github.com/XKYLAN-LLC/smb-financial-tracker

## Roadmap

The project is intentionally simple right now. Future work may add:

- Local ledger/database with transparent provenance.
- CSV import helpers.
- PDF/source-document review workflows.
- Pluggable program configs with citations and effective dates.
- Review queues for uncertain classifications.
- Accountant-ready exports for P&L, Schedule C buckets, and supporting notes.
- Conservative calculations with explicit review flags.
