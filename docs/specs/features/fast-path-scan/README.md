---
type: feature-spec
id: feature.fast-path-scan
status: draft
maturity: 2
owner: product
tags:
  - feature
  - performance
  - scanning
  - macos
source_intent:
  - "[[intent/fast-path-scan]]"
related:
  - "[[status]]"
  - "[[work-log]]"
  - "[[pocs/README]]"
  - "[[specs/bootstrap/state]]"
  - "[[specs/bootstrap/operations]]"
  - "[[specs/bootstrap/control-planes/ipc]]"
---

# Fast-path platform scanning

Status: [[status]] · Work log: [[work-log]] · POCs: [[pocs/README]]

Shape: **thin** (state/ops in this README until they outgrow it)

## Intent

Make large local scans feel fast on **macOS** by using bulk directory attribute APIs (`getattrlistbulk`) instead of per-file `stat` via jwalk, while keeping the same `FileNode` product contract and existing IPC ops.

Silent fallback to jwalk when the fast path is ineligible or fails. Count **unique physical** storage for hard links (and APFS clones where feasible). Exact size parity with the Unix allocated-block contract (`st_blocks * 512`).

Source: [[intent/fast-path-scan]] (decisions locked 2026-07-08).

## Product scope

### In scope (v1 / current work)

- macOS scan strategy via `getattrlistbulk` (or equivalent bulk attrs)
- Strategy selection on `op.scan-directory` and `op.rescan-item` (same default scanner)
- Silent jwalk fallback (no required UI indicator)
- Exact size parity on fixtures; shared size extraction
- Unique-physical hard-link accounting (update jwalk baseline to match)
- Headless `scan_bench` example for SSH/CI (no Tauri/GUI)
- Progress + cancel continue to work

### Out of scope (now)

- Windows MFT / elevation
- Linux special paths
- Network / remote volume fast path
- UI strategy badge / settings toggle
- Durable scan cache
- Kernel extensions / signed drivers
- New IPC commands (unless headless-only diagnostics prove necessary later)

## Locked decisions

| # | Decision |
|---|---|
| 1 | **macOS only** for active work |
| 2 | **Silent jwalk** fallback |
| 3 | **Exact** size parity preferred |
| 4 | **Unique physical** hard links / clones |
| 5 | Rescan uses **same default scanner** as full scan |
| 6 | Windows elevation **deferred** |

## State

Extends [[specs/bootstrap/state]] — no new durable entities.

| Concept | Change |
|---|---|
| `entity.file-node` | Same fields. Directory `size` / `file_count` rollups unchanged. File `size` remains allocated blocks on Unix. |
| `entity.scan-progress` | Same IPC shape. Bulk path may update counters in larger steps. |
| Session strategy (ephemeral) | Which engine ran (`macos-bulk` \| `jwalk`). Not required on UI; useful for bench stdout / tests. |
| Unique-physical set | During a scan, track seen physical keys (inode at minimum; clone/extent TBD — see open questions) so multi-linked files contribute size once. |

### Invariants (feature)

| ID | Rule |
|---|---|
| `inv.fast-path-fallback` | Ineligible or failed fast path → jwalk; never empty tree solely due to fast-path failure |
| `inv.fast-path-size-unix` | File sizes use allocated blocks (`st_blocks * 512`) on Unix — same as bootstrap |
| `inv.unique-physical` | Same physical storage counted once per scan tree for size rollup |
| `inv.strategy-parity` | On fixtures, `macos-bulk` and `jwalk` totals match (exact preferred) after unique-physical lands on both |
| `inv.no-symlink-follow` | Still no symlink follow (bootstrap) |
| `inv.cancel-cooperative` | Cancel checked between batches/dirs on all strategies |

**Bootstrap impact:** unique-physical **changes** current jwalk behavior (today counts every hard-link path). Implementing this feature updates bootstrap scanner semantics; document in bootstrap state when code lands.

## Operations

No new domain verbs for product UI. Implementation detail under existing ops:

### `op.scan-directory` (behavior delta)

| | |
|---|---|
| Inputs / outputs | Unchanged (`path` → `FileNode`) |
| Preconditions | Unchanged (path exists) |
| Algorithm | `select_strategy(path)` → try fast path → on failure/ineligible **restart or complete via jwalk** (silent) → cache tree |
| Errors | Same surface errors as bootstrap; fast-path-only errors must not surface if jwalk succeeds |
| Idempotency | Re-run replaces cache |

### `op.rescan-item` (behavior delta)

| | |
|---|---|
| Inputs / outputs | Unchanged |
| Algorithm | **Same strategy select + fallback** as full scan for that path/subtree |
| Cache | Patches `cached_tree` when path is under the cached root (same as generic rescan) |

### `op.cancel-scan` / `op.get-scan-progress`

Unchanged contracts; must work for bulk strategy.

### Headless bench (non-product control plane)

Not an IPC product surface. Dev/POC only:

```text
cargo run --example scan_bench -- <path> [--strategy auto|jwalk|macos-bulk]
```

Stdout: wall time, strategy used, entry count, total size, optional top-N / JSON.

## Permissions

Same as bootstrap: local OS user only. macOS bulk attrs do **not** require elevation. Full Disk Access remains an OS policy issue (incomplete trees on protected paths) — same as today.

No new permission matrix file (local single-user).

## Control planes

| Plane | Role |
|---|---|
| **IPC (Tauri)** | Existing scan/rescan/progress/cancel only — no new commands for v1 product path |
| **CLI example** | Headless bench for SSH/CI — not a product control plane |

Do not add API/MCP/webhook stubs.

## Interfaces

**No required UI change.** User flow identical to bootstrap main shell.

Optional later (out of scope): strategy indicator, fallback toast.

## Acceptance (draft — maturity 2)

| # | Criterion | How to prove |
|---|---|---|
| A1 | Headless bench runs over SSH without GUI | `cargo run --example scan_bench -- <path>` |
| A2 | macOS bulk faster than jwalk on large local tree (material wall-clock win) | Bench both strategies, same path, report times |
| A3 | Exact size parity on fixtures (incl. hard links → unique physical) | Automated tests: temp tree with multi-linked file |
| A4 | Silent fallback: force-fail or non-mac → jwalk still returns tree | Test / bench |
| A5 | Cancel aborts bulk scan without hang | Test or manual bench |
| A6 | Permission-denied entries skipped, not fatal | Fixture or manual |
| A7 | UI scan still works via existing IPC (after promotion from POC) | `just dev` QA |

## Implementation plan (suggested order)

1. **POC headless-scan-bench** — wire current jwalk scanner to example binary
2. **POC macos-getattrlistbulk** — bulk inventory → `FileNode`; compare to jwalk
3. Unique-physical on both strategies
4. Strategy select + silent fallback in production `Scanner`
5. Evidence + bootstrap state invariant update
6. Mark implemented only after A1–A7

## Proofs of concept

| POC | Purpose |
|---|---|
| [[pocs/headless-scan-bench/README]] | SSH/CI harness |
| [[pocs/macos-getattrlistbulk/README]] | Prove bulk attrs speed + parity |

## Open questions

| ID | Question |
|---|---|
| oq.fast-path-unique-physical-impl | Inode dedupe enough on macOS, or APFS clones need extent-level work? |
| oq.fast-path-jwalk-migration | Confirm update jwalk baseline to unique-physical (intent says yes) |
| oq.fast-path-progress | Batch progress jumps OK? |
| oq.fast-path-feature-flag | Runtime strategy override in headless/dev only? |

## Spec translation links

- Intent: [[intent/fast-path-scan]]
- Bootstrap ops/state: [[specs/bootstrap/operations]], [[specs/bootstrap/state]]
