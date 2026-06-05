# Examples

The files in this directory are synthetic examples for agents and contributors. They are safe public shapes, not templates for committing real records.

## Files

- `agent-workspace.example.json`: source-document and review-queue manifest for a local AI-assisted workspace.
- `accountant-package.example.json`: package checklist for an accountant handoff.
- `business-profile.example.json`: durable business facts, user-approved rules, and open professional-review questions.
- `classification-policy.example.json`: category rules, default review statuses, and business-use guidance for agents.
- `source-document-manifest.example.json`: local source-document index with extracted-fact and review-question shapes.
- `agent-notes.example.md`: future-session note template for private agent handoffs.

## How To Use Them

Use these examples to understand the expected shape of local manifests. For real work, create private copies under ignored folders such as:

- `private/profile/business-profile.json`
- `private/profile/classification-policy.json`
- `private/source-documents/source-document-manifest.json`
- `private/agent-notes/session-log.md`
- `private/exports/`

Agents should preserve source context, keep uncertain items flagged, and avoid moving private source files into public paths.

## Validation

Run:

```bash
python3 scripts/validate-agent-surface.py
```

The validator checks the example shape and scans for obvious private-data patterns.
