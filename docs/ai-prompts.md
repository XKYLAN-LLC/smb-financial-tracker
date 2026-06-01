# AI Assistant Prompts

Use these prompts with an AI assistant while working in a private local checkout. Attach or point the assistant at private files only when you are comfortable sharing them in that session. Do not commit those files.

## Set Up A Workspace

```text
You are helping me maintain this local-first financial tracker.

Read README.md, DATA_MODEL.md, AGENT_GUIDE.md, docs/agent-surface.md, docs/private-data.md, docs/accountant-package.md, and examples/agent-workspace.example.json.

Create or update a private source-document manifest under private/ for my 2026 records. Do not commit private source files or generated exports. Keep uncertain items marked Needs support, CPA review, Info only, or Exclude.
```

## Review Attached Source Files

```text
I am attaching private financial source files for review in this session.

Please help me:
- identify what each file appears to support;
- update my private source-document manifest;
- suggest reviewable ledger rows;
- preserve source references;
- flag ambiguous items for CPA review;
- avoid final tax, legal, benefits, or insurance conclusions.

Do not build a parser or integration. Use the files and my context to produce a reviewable local update.
```

## Build A Review Queue

```text
Using my ledger and source-document manifest, build a review queue for missing support, duplicates, transfers, mixed-use items, home-office items, vehicle items, and anything that should go to my CPA.

Keep the output concise and trace each question back to row ids or source ids.
```

## Assemble An Accountant Package

```text
Use docs/accountant-package.md and examples/accountant-package.example.json.

Help me assemble a private accountant package under private/exports/YEAR-accountant-package/.

Include:
- ledger backup checklist;
- accountant Markdown summary checklist;
- CPA CSV checklist;
- source document checklist;
- open questions;
- items still needing support.

Do not call the package complete until I confirm the source files and review flags.
```

## Public Repo Safety Check

```text
Before we commit, inspect the diff for private financial records, raw CSVs, PDFs, screenshots, exports, backups, SSNs, tax IDs, account numbers, addresses, phone numbers, emails, application IDs, secrets, tokens, and cookies.

Run the validators and report exactly what passed.
```
