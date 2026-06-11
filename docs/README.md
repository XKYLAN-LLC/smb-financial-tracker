# Documentation

Start with the README, then use this index to find the right surface.

## Product And Workflow

- [Core concepts](concepts.md): the framework pieces this repo gives to users and AI agents.
- [AI agent surface](agent-surface.md): how agents use the local workspace safely.
- [Agent workflows](agent-workflows.md): repeatable document-review, classification, reconciliation, and handoff loops.
- [Classification guide](classification.md): shared row types, categories, review statuses, and business-use guidance.
- [Accountant package](accountant-package.md): how to collect exports, support, and open questions for handoff.
- [AI prompts](ai-prompts.md): copyable prompts for using this repo with an assistant.
- [Walkthrough](walkthrough.md): visual walkthrough using synthetic data.
- [Design reference](design-reference.md): visual direction and intentional product differences.
- [Roadmap](roadmap.md): simple V1, V2, and V3 direction.
- [Project status](project-status.md): what is useful now and what is intentionally not built yet.

## Data And Privacy

- [Private data](private-data.md): what must never go into Git and where local files should live.
- [Data model](../DATA_MODEL.md): ledger, source, provenance, program, and export schema notes.
- [Agent guide](../AGENT_GUIDE.md): workflow guide for assisted updates and imports.
- [Examples](../examples/README.md): synthetic manifests for agent workspaces and accountant packages.

## Project Hygiene

- [Repository settings](repository-settings.md): branch rules, status checks, metadata, and security settings.
- [Contributing](../CONTRIBUTING.md): contribution expectations and privacy rules.
- [Support](../SUPPORT.md): where to file public bugs, docs gaps, feature ideas, and privacy concerns.
- [Security](../SECURITY.md): security and sensitive-data reporting policy.
- [Code of conduct](../CODE_OF_CONDUCT.md): community behavior expectations.

## Validation

Run these before publishing public data or agent-surface changes:

```bash
python3 scripts/validate-sample-json.py
python3 scripts/validate-agent-surface.py
python3 scripts/privacy-scan.py
python3 -m py_compile scripts/validate-sample-json.py scripts/validate-agent-surface.py scripts/privacy-scan.py
node --check scripts/capture-screenshots.mjs
node --check scripts/smoke-dashboard-buttons.mjs
node scripts/smoke-dashboard-buttons.mjs
git diff --check
```
