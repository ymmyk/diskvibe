---
type: guide
id: product.thin-feature-path
status: active
tags:
  - features
  - thin-path
---

# Thin Feature Path

Ceremony is optional. Create only the files the work needs. Empty control-plane stubs are a failure mode, not completeness.

## Three Shapes

| Shape | When | What to create |
|---|---|---|
| **Intent-only** | Brainstorm / not building yet | `docs/intent/{slug}.md` only |
| **Thin feature** | Small change, maturity ≤2, single surface | `README.md`, `status.md`, `work-log.md`, plus only needed of `state.md` / `operations.md` / `acceptance.md` |
| **Full feature** | Multi-entity, multi-plane, or maturity ≥3 | Expand as needed; create control-plane files **only when used** |

## Intent-Only

- Keep raw thinking under `docs/intent/`.
- Do not create a feature folder yet.

## Thin Feature

Minimum:

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
```

Add state/ops/permissions/planes/interfaces only as maturity requires. Prefer sections in README until content outgrows one screen.

## Full Feature

Expand when multiple entities, multiple planes, permissions/tenancy, or large contracts need separate files.

## Agent Rules

- Default to the smallest shape that satisfies the maturity gate.
- Never create empty `control-planes/*` stubs "for later."
- Hotfixes and pure refactors: skip new feature folders unless product truth changes.
- Destructive / permission / billing / public-contract work still requires major decision stops.
