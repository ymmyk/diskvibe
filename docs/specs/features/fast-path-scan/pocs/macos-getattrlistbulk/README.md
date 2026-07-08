---
type: poc
id: poc.fast-path-scan.macos-getattrlistbulk
feature_id: feature.fast-path-scan
status: draft
poc_state: proposed
production_status: non-production
tags:
  - poc
  - feature
  - macos
related:
  - "../README.md"
  - "../headless-scan-bench/README.md"
  - "../../README.md"
  - "../../status.md"
  - "../../work-log.md"
---

# POC: macOS getattrlistbulk

## Purpose

Prove that bulk directory attributes can build a valid `FileNode` tree **faster** than jwalk with **exact size parity** (including unique-physical hard links).

## Question being tested

1. Does `getattrlistbulk` yield a material wall-clock win on large local trees?
2. Can we match jwalk allocated sizes exactly on fixtures?
3. Can unique-physical hard-link accounting work on the bulk path?
4. Does silent fallback remain easy if bulk path fails mid-flight?

## Scope

In scope:

- macOS-only inventory implementation (may live under `src-tauri/src/` behind `#[cfg(target_os = "macos")]` or POC module)
- Map bulk attrs → name, path, is_dir, allocated size
- Tree build + sort children by size (bootstrap rules)
- Compare totals/structure against jwalk via `scan_bench` and/or tests
- Cancel check between directories/batches

Out of scope:

- Windows / Linux
- Shipping as default production strategy (promotion goal)
- UI changes
- Full APFS clone-extent accounting if too heavy — document residual gap

## How to run (target)

```bash
cd src-tauri
# after headless bench exists:
cargo run --example scan_bench -- ~/large-tree --strategy jwalk
cargo run --example scan_bench -- ~/large-tree --strategy macos-bulk
cargo test -p diskvibe -- fast_path
```

## Artifacts

| Path | Notes |
|---|---|
| Scanner / strategy module | Promote candidate |
| Fixture tests (hard links) | Parity + unique-physical |
| Bench timing notes | Record in `notes.md` |

## Findings

_Not run yet._

## Spec impact

| Spec | Change needed? | Notes |
|---|---:|---|
| Feature README | Maybe | Refine unique-physical if APFS needs more than inode |
| Bootstrap state | Yes on promote | `inv.unique-physical`; jwalk behavior change |
| Bootstrap operations | Yes on promote | Strategy select under scan/rescan |

## Promotion decision

Status: not promoted

Promote if:

- Material speedup on representative large local path
- Exact parity on automated fixtures (hard links included)
- Cancel + permission-skip safe
- Fallback path verified

Discard / redesign if:

- No meaningful speedup vs tuned jwalk
- Cannot get size parity without unacceptable complexity
