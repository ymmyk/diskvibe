---
type: guide
id: product.feature-state
status: active
tags:
  - features
  - status
---

# Feature State

Feature folders are the source of truth for how a feature should work on the main branch. Because specs can change after implementation, each feature needs its own current state and work log.

Prefer the smallest shape that works. See [[thin-feature-path]].

## Feature Folder Contract

**Minimum (thin feature):**

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
```

**Full (create files only when used):**

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
  pocs/
  state.md
  operations.md
  permissions.md
  control-planes/          # only planes this feature uses
  interfaces/
  acceptance.md
  seed-data.md
```

Do not pre-create empty control-plane stubs.

## Status Model

| Field | Values | Meaning |
|---|---|---|
| `spec_state` | `idea`, `draft`, `ready`, `accepted` | How settled the desired behavior is. |
| `implementation_state` | `not-started`, `in-progress`, `implemented`, `dirty`, `blocked` | Whether code matches the current spec. |
| `verification_state` | `unverified`, `automated-pass`, `needs-qa`, `user-qa-pass`, `failed` | Whether the current implementation has proof. |

`dirty` means the feature was previously implemented or partially implemented, but the feature spec changed or evidence failed. A dirty feature needs goal work.

## When To Mark Dirty

Mark a feature `dirty` when:

- State, operation, permission, control plane, interface, or acceptance specs change after implementation.
- Tests fail for behavior that should already work.
- User QA finds a mismatch between product truth and implementation.
- The deployment or seed environment no longer supports testing the feature.

Do not mark a feature dirty for spelling, formatting, or non-behavioral documentation changes.

## Agent Rules

When modifying a feature spec:

1. Update `status.md`.
2. Add an entry to `work-log.md`.
3. If the feature was implemented and the desired behavior changed, set `implementation_state: dirty`.
4. Record the reason and required work.
5. Link any goal or evidence that resolves the dirty state.

When creating POC work:

1. Keep it under `docs/specs/features/{feature-slug}/pocs/`.
2. Add or update the POC index.
3. Add a work-log entry.
4. Promote only the validated learning into specs or implementation.

When completing implementation:

1. Update evidence.
2. Set `implementation_state: implemented` if code matches the current spec.
3. Set `verification_state` based on proof.
4. Add a work-log entry with commands, evidence, and residual gaps.

## Loop Interaction

Goals should scan feature status before choosing work. Features with these states are candidates:

- `implementation_state: not-started`
- `implementation_state: in-progress`
- `implementation_state: dirty`
- `verification_state: failed`
- `verification_state: needs-qa`
