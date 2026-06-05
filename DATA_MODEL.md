# Data Model

This tracker uses a small JSON model that can later become a local database schema. The design goal is simple editing with transparent provenance.

## State Object

```json
{
  "schemaVersion": "0.1.0",
  "profile": {},
  "settings": {},
  "rows": []
}
```

## Settings

```json
{
  "threshold": 22025,
  "coveredCaProjected": 17215.15,
  "coveredCaNext12": 17548.48,
  "reviewDate": "2026-06-01",
  "programId": "covered-ca-medi-cal-ca-2026-hh1"
}
```

Settings are currently simple. In a full product, threshold values should come from a program config and scenario calculations should reference the program id.

## Ledger Row

```json
{
  "id": "row-stable-id",
  "use": true,
  "date": "2026-06-01",
  "type": "Expense",
  "description": "Software subscription",
  "amount": 100,
  "bucket": "Other expenses",
  "subcategory": "Software subscriptions",
  "businessPct": 100,
  "status": "Needs support",
  "notes": "Imported from Monarch CSV. Needs receipt.",
  "source": {
    "system": "Monarch",
    "kind": "csv-row",
    "file": "monarch-export.csv",
    "rowHash": "optional-stable-hash"
  },
  "provenance": [
    {
      "actor": "agent",
      "action": "classified",
      "at": "2026-06-01T12:00:00-07:00",
      "note": "Matched merchant to software subscription rule."
    }
  ]
}
```

Amounts are positive. The `type` controls whether the amount is treated as revenue, expense, other income, deduction, or information only.

## Row Types

| Type | Use |
|---|---|
| `Revenue` | Gross receipts / business income. |
| `Expense` | Schedule C expense candidate. `businessPct` controls included amount. |
| `Investment / other income` | Capital gains, dividends, interest, and similar non-Schedule C income. |
| `Above-line deduction` | Traditional IRA, student loan interest, SEHI, and similar planning deductions. |
| `Info only` | Raw support, transfer, mixed-use input, or non-calculation record. |

## Statuses

| Status | Meaning |
|---|---|
| `Supported` | Evidence is present and treatment is not currently disputed. |
| `Estimate` | Useful forecast, not final support. |
| `Needs support` | Likely useful, but missing receipt, statement, or business-purpose support. |
| `CPA review` | Treatment is uncertain or professional review is needed. |
| `Exclude` | Do not include in calculations. |

## Program Config

Program configs should be separate JSON files.

```json
{
  "programId": "covered-ca-medi-cal-ca-2026-hh1",
  "name": "California Medi-Cal MAGI threshold tracker",
  "jurisdiction": "California",
  "effectiveYear": 2026,
  "householdSize": 1,
  "thresholds": [],
  "incomeView": {},
  "citations": []
}
```

This lets the product track other income-threshold programs later without rewriting the tracker.

## Provenance Requirements

Every imported record should retain:

- source system
- source file or page
- import date
- row id or row hash when possible
- raw merchant/description
- raw category
- original amount
- any agent/user classification changes

The current HTML prototype does not enforce all of this yet, but the JSON shape leaves room for it.

## Source Document Manifest

Public examples live in `examples/agent-workspace.example.json` and `examples/source-document-manifest.example.json`. Real manifests should live under `private/`.

A source document entry should capture:

- safe source id
- document kind such as CSV, PDF, receipt, statement, invoice, note, or spreadsheet
- local path hint under `private/`
- period or tax year
- what the user says the document proves
- review status
- related ledger row ids
- notes and open questions

The manifest points to private files; it does not put private file contents in Git.

## Business Profile And Classification Policy

Public examples live in `examples/business-profile.example.json` and `examples/classification-policy.example.json`. Real profiles and policies should live under `private/profile/`.

A business profile should capture:

- tax year and business context;
- accounting method and entity assumptions;
- user-confirmed operating facts;
- recurring source folders;
- professional-review questions;
- user-approved or CPA-approved rules.

A classification policy should capture:

- allowed row categories and Schedule C buckets;
- default statuses;
- default or documented business-use percentages;
- support examples;
- review triggers;
- decision rules for transfers, duplicates, mixed-use items, and missing support.

Agents should read these files before classifying real rows. If a rule is missing, keep the row reviewable instead of inventing final treatment.

## Agent Notes

Public example: `examples/agent-notes.example.md`. Real notes should live under `private/agent-notes/`.

Agent notes should capture:

- documents reviewed;
- rows added or changed;
- classification decisions;
- user-confirmed facts;
- open questions;
- missing support;
- next actions.

These notes help future sessions continue work without committing private data to the public repo.

## Accountant Package Manifest

Public examples live in `examples/accountant-package.example.json`. Real package manifests and generated package files should live under `private/exports/`.

The package manifest should track:

- package year and local folder
- generated ledger backup, CPA CSV, and accountant Markdown status
- source documents that support the package
- open accountant questions
- user/agent checklist items before handoff

## Export Requirements

Accountant exports should include:

- summary calculations
- P&L view
- Schedule C bucket rollup
- review queue
- row-level ledger details
- source/provenance notes where useful

Exports should not include unnecessary personal identifiers.
