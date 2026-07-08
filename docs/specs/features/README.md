---
type: feature-index
id: features.index
status: active
tags:
  - features
---

# Feature Specs

Prefer the **thin feature path** (`docs/_meta/thin-feature-path.md`).

## Thin (default)

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
  # plus state.md / operations.md / acceptance.md only when needed
```

## Full (when contracts grow)

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
  pocs/                    # only if exploring
  state.md
  operations.md
  permissions.md
  control-planes/          # only planes used
  interfaces/              # only surfaces used
  acceptance.md
  seed-data.md             # only if required
```

Use `docs/_templates/` to create new files. **Do not** pre-create empty control-plane stubs.

## Intent-Only

Brainstorm under `docs/intent/` without a feature folder until build work starts.

## Proofs Of Concept

Use `pocs/` for exploratory work. POCs are non-production by default.

## Feature Work Queue

Goals should scan feature folders for `status.md` files. A feature needs work when:

- `implementation_state: not-started`
- `implementation_state: in-progress`
- `implementation_state: dirty`
- `verification_state: failed`
- `verification_state: needs-qa`
