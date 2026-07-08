---
type: decision-log
id: product.decision-log
status: active
tags:
  - decisions
---

# Decision Log

## 2026-07-08 - Brownfield reconstruct from shipped code

Type: Minor (reconstructive documentation)
Status: Accepted
Context: Bootstrapped AI Product OS into existing DiskVibe; need baseline product truth without changing behavior.
Decision: Document current implementation as bootstrap specs at maturity ~4 for shipped surfaces. Primary control plane is IPC only; remove SaaS plane stubs from bootstrap.
Reason: Code is the source for brownfield; empty API/MCP/webhook files would mislead agents.
Affected specs:
- [[specs/bootstrap/README]]
- [[specs/bootstrap/state]]
- [[specs/bootstrap/operations]]
- [[specs/bootstrap/control-planes/ipc]]
Revisit if: Product gains network APIs, multi-user auth, or durable storage.

## 2026-07-08 - Session tree is not durable product state

Type: Minor (reconstructive)
Status: Accepted
Context: `AppState.cached_tree` and in-memory `FileNode` trees exist only while the process runs.
Decision: Spec state as session-scoped; no DB, no on-disk app model for the tree.
Reason: Matches `lib.rs` / `scanner.rs`.
Affected specs:
- [[specs/bootstrap/state]]
Revisit if: Persist scans, favorites, or history across launches.

## 2026-07-08 - Unix size uses allocated blocks, not logical length

Type: Minor (reconstructive)
Status: Accepted
Context: Scanner uses `metadata.blocks() * 512` on Unix for files; non-Unix uses `metadata.len()`.
Decision: Document disk-usage sizing (allocated blocks) as current product behavior for Unix.
Reason: Code comment: cloud placeholders (iCloud/OneDrive) should not report full logical size.
Affected specs:
- [[specs/bootstrap/state]]
- [[specs/bootstrap/operations]]
Revisit if: User-facing toggle for logical vs allocated size is added.

## 2026-07-08 - Futures stay intent-only

Type: Minor
Status: Accepted
Context: CLAUDE.md listed fast-path scan, deletion, export.
Decision: Capture under `docs/intent/` without feature folders until build work starts.
Reason: Thin feature path; avoid empty ceremony.
Affected specs:
- [[intent/README]]
Revisit if: A future is selected for implementation.
