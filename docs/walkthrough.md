# Walkthrough

This walkthrough uses only synthetic sample data. Real business records, source documents, exports, and backups should stay under ignored local folders such as `private/`.

Short video walkthrough: [`assets/video/smb-financial-tracker-walkthrough.mp4`](assets/video/smb-financial-tracker-walkthrough.mp4)

## 1. Open The Local Dashboard

Run a local server:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/index.html`.

![Dashboard overview](assets/screenshots/dashboard-overview.png)

The dashboard uses a local app-shell layout with sidebar navigation, compact planning metrics, threshold settings, source references, and the AI Workbench immediately visible.

## 2. Use The Action Center

![Action Center](assets/screenshots/action-center.png)

The Action Center turns ledger rows into a prioritized review queue, evidence gap list, and handoff snapshot. Use it before editing rows so the next task is obvious.

Useful buttons:

- Copy Agent Brief: gives another AI session a concise worklist with totals, flagged rows, source-document tasks, and safety instructions.
- Copy Source Manifest Starter: creates a JSON starter for `private/source-documents/source-document-manifest.json`.
- Status filter buttons: jump the ledger to rows marked `Needs support`, `CPA review`, or `Estimate`.

## 3. Review The Ledger

![Ledger review](assets/screenshots/ledger-review.png)

Ledger rows are the shared surface between the user and the AI assistant. The assistant can help update descriptions, buckets, support notes, source references, and review statuses from user-provided context.

Keep uncertain items visible:

- `Needs support` for missing receipts, statements, or business-purpose notes.
- `CPA review` for home office, vehicle, capitalization, mixed-use, meals, travel, or tax judgment.
- row type `Info only` for source records that should not affect totals yet.
- `Exclude` for transfers, duplicates, reimbursements, or personal records.

## 4. Track The Accountant Package

Use `examples/agent-workspace.example.json` and `examples/accountant-package.example.json` as the public synthetic shapes for local manifests.

In a real workflow, an AI assistant can help maintain:

- a private source-document checklist;
- a review queue;
- package contents;
- open accountant questions;
- final export status.

See `docs/accountant-package.md` for the local folder pattern.

## 5. Export Review Materials

![Accountant export](assets/screenshots/accountant-export.png)

The dashboard can export a CPA CSV and accountant Markdown summary. Those generated files should go under `private/exports/`, not Git.

## 6. Validate Before Publishing

Run:

```bash
python3 scripts/validate-sample-json.py
python3 scripts/validate-agent-surface.py
```

Then run a targeted privacy scan before committing public changes.
