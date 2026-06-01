# Local Financial Tracker - V1 Scope

Purpose: help an individual or small business owner track business income, supportable expenses, tax-related deductions, and income-threshold program risk without paying for a full accounting stack too early.

## Guardrail

This tracker is for accurate reporting and legal tax planning. Use real income, real expenses, and real deductions only. The goal is to know where the business actually stands and make good decisions, not to hide income or manufacture deductions.

## V1 Built Now

File:

- `index.html`

What it does:

- Starts with the current Covered California/Medi-Cal application numbers.
- Calculates estimated MAGI/application income.
- Auto-estimates the deductible half of self-employment tax from projected net Schedule C income.
- Shows the current buffer against the Medi-Cal tracking threshold.
- Shows the estimated result without the traditional IRA deduction.
- Gives a copyable accountant/county summary.
- Shows current, no-IRA, and CPA-review-expenses-excluded scenarios.
- Imports Monarch CSV rows into the ledger for manual review and classification.
- Exports both CPA CSV and accountant Markdown handoff files.
- Saves edited values locally in the browser on this machine.

V1 is still local-first and mostly manual, but it can import a Monarch CSV into reviewable ledger rows. It is enough for weekly/monthly check-ins and avoids building a private app before the data model is clear.

## Current Baseline Inputs

| Input | Amount |
|---|---:|
| Receipts collected so far | $20,609.29 |
| Known remaining monthly income | $1,225.00 |
| Remaining months at known income | 7 |
| Business expenses forecast | $8,084.29 |
| Ordinary dividends | $1,000.00 |
| Taxable interest | $0.00 |
| Capital gains | $4,889.48 |
| Traditional IRA deduction | $7,500.00 |
| Student loan interest | $450.00 |
| Self-employed health insurance | $0.00 |
| Medi-Cal tracking threshold | $22,025.00 |

## Monthly Workflow

1. Export or review Zoho paid receipts.
2. Export or review Monarch business transactions.
3. Pull Stripe fees if Stripe was used.
4. Update actual or forecast business expenses.
5. Update investment income: dividends, taxable interest, realized capital gains/losses.
6. Update traditional IRA contribution progress.
7. Recheck the tracker buffer.
8. If income changes materially, update BenefitsCal/Covered California/county within the required reporting window.

## Data Sources To Integrate Later

| Source | Use |
|---|---|
| Zoho Invoice | Paid revenue, invoice status, client revenue support |
| Stripe | Gross payments, processing fees, payment-link revenue support |
| Monarch | Business expenses, home-office inputs, subscriptions, bank fees |
| Brokerage | Dividends, interest, realized gains/losses, IRA contribution proof |
| Aidvantage | Student loan interest |
| SDG&E / internet / lease | Home-office support |

## V2 Import Targets

Keep V2 simple. Do not build OAuth or live API integration yet unless manual export becomes annoying.

Needed imports:

- Monarch CSV import for expenses by category and month.
- Zoho CSV import for paid receipts.
- Stripe CSV import for fees.
- Manual brokerage input for dividends/gains until year-end 1099s are available.

Outputs:

- Current estimated Schedule C net income.
- Current estimated Medi-Cal MAGI.
- Remaining threshold buffer.
- Accountant questions/flags.
- Exportable year-end support table.

## V3 Private App Idea

Only consider a private GitHub app after V1/V2 prove the workflow:

- Local-first static app or private Next.js app.
- No public deployment until auth/privacy is solved.
- Import-only workflow first; no write-back to financial systems.
- Keep secrets out of the repo.
- Store raw exports in a private local folder or encrypted storage, not Git.

## Reusable Product Direction

This may grow into an agent-first, local-first financial tracker rather than a one-off health-insurance spreadsheet. Future implementation should treat the current Medi-Cal work as one configured threshold program on top of a broader ledger.

Reusable product principles:

- Keep a transparent ledger/database with provenance for every source record, import, user edit, agent edit, and categorization rule.
- Start with CSV import adapters, then add permissioned agent/MCP adapters for approved systems.
- Keep program requirements as pluggable config with citations and effective dates, not loose hard-coded assumptions.
- Expose agent-friendly operations such as list missing docs, classify uncategorized transactions, reconcile invoices/payments, generate accountant export, calculate current P&L, calculate MAGI scenarios, watch eligibility thresholds, and produce a review queue.
- Stay conservative: organize, calculate, cite, and flag for review. Do not present tax, legal, benefits, or insurance determinations as authoritative advice.
- Keep any future public/open-source repo free of personal details, account numbers, application IDs, client records, health-insurance case details, and private financial exports.

## Accountant Review Questions

Ask the accountant to validate:

1. Whether the full traditional IRA amount is deductible.
2. How to handle any Roth IRA contributions already made for 2026.
3. Which expenses should be excluded from Schedule C.
4. Whether education/real-estate-related expenses are deductible or should be flagged.
5. How to track vehicle usage going forward.
6. Whether the home-office inputs and square footage remain valid.
