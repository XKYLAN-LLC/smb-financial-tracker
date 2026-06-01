# Repository Settings Checklist

Use this checklist when configuring the GitHub repository.

## Visibility

- Repository visibility: public
- Default branch: `main`

## Branch Protection / Ruleset For `main`

Configure GitHub branch protection or a repository ruleset with:

- Require a pull request before merging.
- Require at least 1 approving review.
- Require review from Code Owners after `.github/CODEOWNERS` has a real user or team.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merging.
- Do not allow force pushes.
- Do not allow branch deletions.
- Restrict direct pushes if the project is ready for stricter governance.

## CODEOWNERS

`CODEOWNERS` currently routes repository review to `@kayalopez`.

```text
* @kayalopez
```

If review should move to an organization team later, replace this with a real team slug. Do not leave non-existent teams in `CODEOWNERS`; invalid entries can make review requirements confusing.

## Required Status Checks

The organization ruleset currently expects these check contexts:

- `changed-route-tests`
- `lint`
- `type-check`
- `test`
- `build`
- `browser-smoke`
- `dependency-review`

Keep `.github/workflows/ci.yml` aligned with those names or update the ruleset and this doc together.

## Repository Metadata

Suggested description:

```text
Agent-first local financial tracker for small business owners.
```

Suggested topics:

```text
local-first
financial-tracker
small-business
bookkeeping
csv-import
agent-workflows
ai-assisted
tax-prep
privacy
open-source
```

## Security Settings

Recommended GitHub settings:

- Enable Dependabot alerts.
- Enable Dependabot security updates if dependencies are added.
- Enable secret scanning if available for the organization.
- Keep private raw data out of Git entirely.

## Review Process

All changes should flow through pull requests once branch protection is active. Reviews should check for:

- private-data exposure
- calculation correctness
- provenance preservation
- agent safety
- public documentation quality
