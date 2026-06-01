# Examples

The files in this directory are synthetic examples for agents and contributors. They are safe public shapes, not templates for committing real records.

## Files

- `agent-workspace.example.json`: source-document and review-queue manifest for a local AI-assisted workspace.
- `accountant-package.example.json`: package checklist for an accountant handoff.

## How To Use Them

Use these examples to understand the expected shape of local manifests. For real work, create private copies under ignored folders such as `private/exports/` or `private/backups/`.

Agents should preserve source context, keep uncertain items flagged, and avoid moving private source files into public paths.

## Validation

Run:

```bash
python3 scripts/validate-agent-surface.py
```

The validator checks the example shape and scans for obvious private-data patterns.
