---
type: poc-index
id: pocs.{{feature-slug}}
feature_id: feature.{{feature-slug}}
status: active
tags:
  - pocs
  - feature
related:
  - "../README.md"
  - "../status.md"
  - "../work-log.md"
---

# POCs: {{Feature Name}}

This folder contains proof-of-concept work used to improve the feature spec.

POCs are non-production by default. They are not completed product behavior unless promoted through a later implementation goal.

## Index

| POC | Status | Purpose | Outcome |
|---|---|---|---|
| TBD | draft | TBD | TBD |

## Rules

- Keep exploratory artifacts under this folder.
- Do not wire POC code into production runtime unless explicitly promoting it.
- Capture what the POC taught in the POC `README.md`.
- Update feature specs when the POC changes desired behavior.
- Append related changes to `../work-log.md`.
