---
type: policy
id: product.decision-policy
status: active
tags:
  - decisions
  - policy
---

# Decision Policy

AI agents may make minor decisions to keep work moving, but decisions must be visible and reversible.

## Minor Decisions

A decision is minor when all of these are true:

- It does not materially change product behavior.
- It does not affect permissions, data ownership, billing, public contracts, destructive behavior, compliance, or security posture.
- It is cheap to reverse.
- It is consistent with existing specs or codebase conventions.
- It is logged in `docs/_meta/decision-log.md`.

Examples:

- Naming a non-public helper.
- Choosing table column order.
- Using soft default copy for an empty state.
- Picking a conventional retry interval when the spec already requires retries and the exact value is not product-critical.

## Major Decisions

A decision is major if it affects:

- State model or lifecycle.
- Permissions, roles, tenancy, or data ownership.
- Public API, IPC, webhook, MCP, or integration contracts.
- Billing, subscriptions, payments, or entitlements.
- Destructive actions, retention, auditability, privacy, security, or compliance.
- User-visible workflow semantics.

Major decisions require explicit user approval before implementation.

## Decision Log Entry

```markdown
## YYYY-MM-DD - Short decision title

Type: Minor
Status: Accepted
Context: What was underspecified.
Decision: What the agent chose.
Reason: Why this is reasonable.
Affected specs:
- [[path-or-wikilink]]
Revisit if: What would make this decision invalid.
```
