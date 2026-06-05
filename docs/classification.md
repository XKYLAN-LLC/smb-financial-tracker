# Classification Guide

This guide gives agents a shared category vocabulary. It is not tax advice. When treatment is uncertain, keep the row visible and mark it for review.

## Row Type First

Pick the row type before the category:

| Row type | Use when |
|---|---|
| `Revenue` | Business income, gross receipts, client payments, payment processor receipts. |
| `Expense` | Business expense candidates. `businessPct` controls included amount. |
| `Investment / other income` | Interest, dividends, gains, and non-business income context. |
| `Above-line deduction` | Planning deductions tracked outside Schedule C. |
| `Info only` | Raw support, transfers, duplicates, review notes, and source facts that should not affect totals. |

## Status Defaults

| Status | Use when |
|---|---|
| `Supported` | Evidence and business purpose are present, and treatment is not currently disputed. |
| `Estimate` | Useful forecast, not final support. |
| `Needs support` | Category seems likely, but a receipt, invoice, statement, or business-purpose note is missing. |
| `CPA review` | Treatment, allocation, or current-year limitation needs professional review. |
| `Exclude` | Personal, duplicate, transfer, or otherwise outside current totals. |

## Category Map

Use these categories before inventing new ones.

| Situation | Type | Bucket | Subcategory | Default status |
|---|---|---|---|---|
| Client payments or invoice receipts | `Revenue` | `Gross receipts` | `Client payments` | `Needs support` |
| Software subscriptions | `Expense` | `Office expense` | `Software subscriptions` | `Needs support` |
| Hosting, cloud, domains, DNS | `Expense` | `Other expenses` | `Hosting & infrastructure` | `Needs support` |
| Advertising, campaigns, sponsorships | `Expense` | `Advertising` | `Marketing` | `Needs support` |
| Contractor invoices | `Expense` | `Contract labor` | `Contractors` | `Needs support` |
| Legal, accounting, bookkeeping | `Expense` | `Legal and professional fees` | `Legal/accounting` | `Needs support` |
| Bank fees and payment processor fees | `Expense` | `Commissions and fees` | `Processor fees` | `Needs support` |
| Office supplies | `Expense` | `Supplies` | `Office supplies` | `Needs support` |
| Business insurance | `Expense` | `Insurance (other than health)` | `Business insurance` | `Needs support` |
| Taxes, licenses, permits | `Expense` | `Taxes and licenses` | `Licenses & permits` | `CPA review` |
| Education, courses, certifications | `Expense` | `Other expenses` | `Education & certifications` | `CPA review` |
| Meals | `Expense` | `Meals` | `Business meals` | `CPA review` |
| Travel | `Expense` | `Travel` | `Travel` | `CPA review` |
| Vehicle costs, parking, tolls | `Expense` | `Car and truck expenses` | `Vehicle` | `CPA review` |
| Home-office allocation | `Expense` | `Other expenses` | `Home office allocation` | `CPA review` |
| Hardware and equipment | `Expense` | `Property & equipment tracking` | `Hardware / fixed assets` | `CPA review` |
| Transfers between accounts | `Info only` | `Not Schedule C` | `Transfer` | `Exclude` |
| Owner draw or contribution | `Info only` | `Not Schedule C` | `Owner movement` | `Info only` |
| Personal or unsupported item | `Info only` | `Not Schedule C` | `Personal / exclude` | `Exclude` |

## Business Percentage

The ledger uses `businessPct` as a 0 through 100 percentage.

- Use `100` when the item is clearly business and supported.
- Use `0` for personal, duplicate, transfer, and excluded rows.
- Use a documented allocation for mixed-use expenses.
- If the allocation is not documented, keep the item in `CPA review`.

Store recurring allocation rules in `private/profile/classification-policy.json` or `private/profile/business-profile.json`.

## Evidence Notes

Every material classification should explain:

- why the category was chosen;
- which source document supports it;
- whether a user or CPA approved the treatment;
- what remains unresolved.

Good notes make the accountant package useful. Vague notes make it harder to trust the output.
