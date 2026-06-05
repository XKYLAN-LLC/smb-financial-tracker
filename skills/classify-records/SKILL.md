---
name: classify-records
description: Use when classifying income, expenses, transfers, deductions, owner movements, or mixed-use rows in the SMB financial tracker.
---

# Classify Records

Classify records conservatively and preserve the reasoning. The goal is a reviewable ledger, not a final tax opinion.

## Read First

- `docs/classification.md`
- `examples/classification-policy.example.json`
- `examples/business-profile.example.json`
- `DATA_MODEL.md`
- `AGENT_GUIDE.md`

For real work, also read private copies when present:

- `private/profile/business-profile.json`
- `private/profile/classification-policy.json`
- `private/agent-notes/session-log.md`

## Rules

- Use the existing category map before inventing a category.
- Keep amounts positive.
- Use row `type` to control how the row affects totals.
- Use `businessPct` from documented support, user-confirmed policy, or professional guidance.
- Use `Needs support` when evidence is missing.
- Use `CPA review` for mixed-use, meals, travel, vehicle, home-office, equipment, education, and tax-treatment judgment.
- Use `Info only` or `Exclude` for transfers, duplicates, owner movements, personal items, and raw support rows.
- Record source ids, row hashes, local path hints, and notes when available.

## Output

After classification, summarize:

- rows classified;
- rows needing support;
- rows needing CPA review;
- excluded or info-only rows;
- assumptions used;
- missing source documents;
- recommended next actions.

Do not claim to replace a CPA, attorney, benefits worker, insurance professional, accountant, or financial advisor.
