---
type: guide
id: product.interview-flow
status: active
tags:
  - interview
---

# Interview Flow

Use this flow when product intent is vague, a spec does not exist, or the user points at raw notes under `docs/intent/`.

When converting an intent note, preserve the original note and create structured specs under `docs/specs/`.

## 1. Intent

- What should the user or system actor be able to accomplish?
- Who needs this?
- What is the smallest useful version?
- What should not be included yet?

## 2. State

- What data must exist before and after the feature runs?
- Which entities are created, updated, deleted, archived, or derived?
- What relationships must exist?
- What must always be true?
- What lifecycle states exist?
- What should be auditable or recoverable?

## 3. Operations

- What domain verbs does the system need?
- What are the inputs, outputs, preconditions, state changes, errors, emitted events, and idempotency rules?
- Which invariants does each operation enforce?

## 4. Permissions

- Who can run each operation?
- Are there ownership, tenant, role, subscription, staff, client, or delegation constraints?
- Should unauthorized callers see `not found`, `forbidden`, or a specific error?

## 5. Control Planes

- Is this operation called directly through an API?
- Should agents or tools invoke it through MCP?
- Does an external system notify us through an inbound webhook?
- Do we notify external systems through outbound webhooks?
- Does anything need to happen later, on a schedule, after retry, or in bulk?
- Are admin commands needed for repair, migration, backfill, support, or operations?

## 6. Interfaces

- Which screens, apps, or clients need this?
- What does success look like?
- What are the empty, loading, error, disabled, and permission-denied states?
- What should the user be able to inspect after the operation?

## 7. Acceptance and Evidence

- What would convince the user this works?
- What seed/demo data should exist?
- What automated tests should pass?
- What preview URL or environment should the user test?
- What screenshots or evidence should be attached?
