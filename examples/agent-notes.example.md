# Agent Notes Example

This is a synthetic example for a private future-session note. Real notes should live under `private/agent-notes/` and should not be committed.

## Session

- Date: 2026-06-05
- Agent: sample-agent
- Scope: reviewed synthetic May bank export and receipt support
- Private files reviewed: see private source manifest

## User-Confirmed Facts

- The sample software subscription is used only for client work.
- Home-office allocation is not confirmed and should remain in CPA review.
- Vehicle expenses require a mileage log before classification.

## Classification Decisions

| Rule | Decision | Source | Status |
|---|---|---|---|
| Software subscription | Use `Office expense` / `Software subscriptions` when support exists. | User context plus receipt support | Needs support |
| Bank transfer | Keep as `Info only` or `Exclude` unless the user confirms it is revenue or owner contribution. | Bank CSV review | Exclude |
| Business meals | Keep in `CPA review` until business purpose and attendees are documented. | Classification policy | CPA review |

## Open Questions

- Confirm home-office method and supporting documents.
- Confirm whether any deposits are transfers, reimbursements, loans, or owner contributions.
- Attach missing receipts for rows marked `Needs support`.

## Next Agent Instructions

- Read `private/profile/business-profile.json` before changing categories.
- Read `private/profile/classification-policy.json` before assigning business percentages.
- Update the source manifest when reviewing a new document.
- Preserve row-level evidence pointers and do not overwrite unresolved questions.
