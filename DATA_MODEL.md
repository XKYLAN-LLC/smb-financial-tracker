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

## Export Requirements

Accountant exports should include:

- summary calculations
- P&L view
- Schedule C bucket rollup
- review queue
- row-level ledger details
- source/provenance notes where useful

Exports should not include unnecessary personal identifiers.
