# Agent Workflows

This repo works best when the agent follows a repeatable review loop. The agent does not need a custom parser for every source. It needs clear local context, conservative classification rules, and durable notes that future sessions can reuse.

## Private Workspace Setup

For real work, create private local copies of the public examples:

| Public example | Private working copy |
|---|---|
| `examples/business-profile.example.json` | `private/profile/business-profile.json` |
| `examples/classification-policy.example.json` | `private/profile/classification-policy.json` |
| `examples/source-document-manifest.example.json` | `private/source-documents/source-document-manifest.json` |
| `examples/agent-notes.example.md` | `private/agent-notes/session-log.md` |
| `examples/accountant-package.example.json` | `private/exports/{year}-accountant-package/package-manifest.json` |

Private copies may contain business-specific context. Public examples must stay synthetic.

## Review Loop

1. Read the current profile, classification policy, source manifest, and agent notes.
2. Inventory new user-provided documents before changing ledger rows.
3. Add or update source-document entries with local path hints, periods, document type, review status, and what each source supports.
4. Extract reviewable facts with evidence pointers such as CSV row hash, statement page, receipt label, or user note.
5. Create or update ledger rows with positive amounts, normalized row types, category, business percentage, status, source metadata, and notes.
6. Apply classification rules conservatively.
7. Reconcile totals across source systems where possible.
8. Add unresolved questions to the review queue and accountant package.
9. Write a short future-session note describing what changed, what remains open, and what assumptions were used.

## Document Inventory

For each new source file, capture:

- source id;
- local path hint under `private/`;
- source type such as CSV, PDF, statement, receipt, invoice, spreadsheet, or note;
- source system or institution label;
- tax year or period;
- what the user says it proves;
- whether it has been reviewed;
- related ledger row ids or review questions;
- hash or row hash when available and useful.

Do not copy source contents into public docs. The manifest should point to private files, not contain them.

## Classification Loop

For each candidate row:

1. Decide whether the row is revenue, expense, deduction, info-only context, transfer, owner movement, duplicate, or personal.
2. Use `docs/classification.md` and the private classification policy before inventing a category.
3. Keep the amount positive.
4. Set `businessPct` to a documented value from the profile, classification policy, user context, or source support.
5. Use `Needs support` if the likely category is clear but evidence is missing.
6. Use `CPA review` for mixed-use, meals, travel, vehicle, home-office, equipment, education, and other judgment-heavy items.
7. Use `Info only` or `Exclude` for transfers, personal items, duplicate rows, raw context rows, and unsupported items that should not affect totals.
8. Add notes explaining the reason for the category and status.

## Business Percentage Rules

Agents should never guess a business-use percentage just to make totals look complete.

Use:

- `100` only when the item is clearly business and supported.
- `0` for confirmed personal items, duplicates, and excluded transfers.
- A user-confirmed or CPA-approved allocation when the item is mixed-use.
- `CPA review` when the item needs a tax-treatment or allocation decision.

When using an allocation, record the source in the private business profile or policy notes.

## Reconciliation

Agents should look for:

- invoice totals that do not match bank deposits;
- payment processor fees that are netted from revenue;
- duplicate rows from both CSV and statement sources;
- transfers between accounts;
- refunds, reimbursements, loans, and owner contributions that should not be treated as revenue;
- expenses without support;
- source documents referenced by ledger rows but missing from the local manifest.

## Future-Session Notes

At the end of a meaningful session, update private agent notes with:

- documents reviewed;
- rows added or changed;
- classification rules applied;
- user-confirmed facts;
- open questions;
- missing support;
- recommended next actions.

This gives the next AI session continuity without exposing private data in the public repo.
