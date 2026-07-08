---
type: guide
id: product.maturity-model
status: active
tags:
  - maturity
---

# Maturity Model

| Level | Name | Meaning |
|---|---|---|
| 0 | Intent captured | The user goal is written down, but product truth is not yet decomposed. |
| 1 | State described | Entities, relationships, lifecycle, and invariants are known enough to discuss. |
| 2 | Operations described | Domain verbs, inputs, outputs, preconditions, state changes, and errors are known. |
| 3 | Permissions and control planes described | Policy and invocation surfaces are specified. |
| 4 | Interfaces and acceptance described | UI/client behavior, Gherkin scenarios, seed data, and done evidence are specified. |
| 5 | Implemented with evidence | Code, tests, deployment, evidence, and QA notes are complete. |

## Build Gates

- Do not implement backend state-changing work before Level 2.
- Do not expose operations through control planes before Level 3.
- Do not implement user-facing interfaces before Level 4.
- Do not mark a goal complete before Level 5.

Gates apply to **content**, not file count. See [[thin-feature-path]].

- L0–2 may be a thin feature (README + status + work-log, plus state/ops as needed).
- L3+ requires permissions and **only used** control planes — not a full SaaS plane set.
- Intent-only notes under `docs/intent/` are L0 and are not feature folders.
