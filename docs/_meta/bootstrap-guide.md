---
type: guide
id: product.bootstrap-guide
status: active
tags:
  - bootstrap
---

# Bootstrap Guide (This Repository)

This vault was installed from the AI Product OS scaffold.

## After Install

### Greenfield

1. Fill `docs/_meta/product-map.md`.
2. Interview using [[interview-flow]].
3. Fill `docs/specs/bootstrap/*` for planes this product actually uses.
4. Prefer [[thin-feature-path]] for early work.
5. Start goals under `docs/loop/`.

### Brownfield

1. Reconstruct current behavior into `docs/specs/bootstrap/*` from code.
2. Log assumptions in [[decision-log]] and gaps in [[open-questions]].
3. Delete or mark N/A unused control-plane stubs.
4. Put future ideas in `docs/intent/` (intent-only).
5. Spec new features only after baseline reconstruct.

## Existing Agent Docs

If `CLAUDE.md` or other agent files predated bootstrap, **merge** Product OS rules into them. Do not discard stack-specific commands.

## Validate

From the SpecOps repo (or a copied script):

```bash
bash /path/to/SpecOps/scripts/validate-ai-product-os.sh .
```

## Scaffold Version

See [[scaffold-version]].
