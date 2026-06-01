# Accountant Package

The accountant package is the end-of-year handoff surface. It should help a user give their accountant one organized package instead of scattered files and notes.

This repo should not store real package contents in Git. It should store the shape and instructions so an AI assistant can assemble a private local package with the user.

## Package Goals

- Summarize income, expenses, deductions, review flags, and planning scenarios.
- List source documents that support the ledger.
- Identify missing documents and questions for the accountant.
- Keep raw source files local and private.
- Make every material number traceable to ledger rows or user-provided context.

## Suggested Local Folder

Use an ignored folder such as:

```text
private/exports/2026-accountant-package/
```

Inside that folder, a user and agent can keep:

- ledger backup JSON;
- accountant Markdown summary;
- CPA CSV export;
- source-document manifest;
- copies of private support documents, if the user wants one local folder;
- review questions and unresolved items.

Do not commit that folder.

## Public Example

Use `examples/accountant-package.example.json` as the public synthetic shape. It intentionally contains no real source documents, account identifiers, or private financial records.

## Agent Responsibilities

Agents should:

- ask the user which documents should be included;
- record source files by safe local filename and source id;
- connect package items to ledger row ids and review flags;
- keep unresolved tax, legal, benefits, or insurance judgments in an open-questions list;
- ask for user confirmation before calling a package complete.

Agents should not:

- invent missing support;
- remove review flags to make the package look cleaner;
- claim that a package is tax-ready without professional review;
- commit source documents, generated package files, or private records.
