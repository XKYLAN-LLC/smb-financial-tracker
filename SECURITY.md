# Security Policy

## Supported Versions

This project is early-stage. Security and privacy reports for the default branch are welcome.

## Reporting A Security Or Privacy Issue

Please open a GitHub issue if the report does not include sensitive information. If the report includes private data, do not paste it publicly. Contact the maintainers through a private channel first.

## Sensitive Data Policy

This repository should never contain real user financial records or private identifiers. Examples must be synthetic.

Do not commit:

- SSNs, tax IDs, account numbers, addresses, phone numbers, or emails
- credentials, tokens, cookies, or secrets
- private PDFs, screenshots, CSV exports, spreadsheets, receipts, statements, or tax returns
- health insurance, benefits, bank, brokerage, tax, or payment-processor application IDs
- private local seed data

## Agent Safety

Agents working with this repo should:

- work read-only until the user approves imports or edits
- avoid browser/account access unless explicitly authorized for that session
- avoid submitting forms, changing account settings, moving money, or exporting sensitive data to public paths
- preserve source provenance
- flag uncertain classifications for human review
