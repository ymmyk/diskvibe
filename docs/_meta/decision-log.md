---
type: decision-log
id: product.decision-log
status: active
tags:
  - decisions
---

# Decision Log

## 2026-07-08 - Rescan patches session cache

Type: Minor (behavior fix)
Status: Accepted
Context: Tree expand/list reload + `get_cached_tree` restore left `cached_tree` stale after `rescan_item`, so webview restore undid partial rescans.
Decision: `rescan_item` patches the matching node in `cached_tree` (or removes it / clears root cache on `None`) and recomputes ancestor size/file_count. Frontend applies the same mutation to the live JS tree for nested reloads.
Reason: Cache exists for session restore; restore must match post-rescan UI state.
Affected specs:
- [[specs/bootstrap/operations]]
- [[specs/bootstrap/state]]
Revisit if: Cache becomes durable or multi-root.

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

## 2026-07-08 - Fast-path scan intent enriched (not yet a feature)

Type: Minor (documentation / intent)
Status: Accepted
Context: Stub intent for platform fast scanning was too thin to drive POCs or major decisions.
Decision: Expand [[intent/fast-path-scan]] with competitive techniques, provisional platform order (macOS bulk attrs → Windows MFT → Linux research), fallback-to-jwalk requirement, same `FileNode`/IPC surface, sizing parity with allocated-block Unix semantics, and POC shape. No feature folder or code until major decisions approved.
Reason: Intent inbox should be build-ready thinking without pretending to be authoritative specs.
Affected specs:
- [[intent/fast-path-scan]]
- [[intent/README]]
- [[_meta/open-questions]]
Revisit if: User prioritizes feature; then convert via thin feature + POC and resolve major oq.fast-path-*.

## 2026-07-08 - Fast-path scan major decisions locked

Type: Major (product behavior for upcoming feature)
Status: Accepted
Context: User answered open questions for [[intent/fast-path-scan]].
Decision:
1. **macOS only** for current work (`getattrlistbulk`); Windows/Linux later on proper machines.
2. **Silent jwalk fallback** (no required UI indicator).
3. **Exact size parity** preferred vs baseline sizing contract (`st_blocks*512` on Unix).
4. **Unique physical** for hard links / clones (not path double-count). May require updating jwalk baseline to match.
5. **Rescan uses default scanner** (same strategy select + fallback as full scan).
6. **Windows elevation / MFT** deferred.
Also: no headless CLI today; POC must add **SSH-friendly scan bench** (`cargo test` and/or `cargo run --example scan_bench`) so work can proceed without GUI.
Reason: Unblocks thin feature + macOS POC without multi-platform scope creep.
Affected specs:
- [[intent/fast-path-scan]]
- [[_meta/open-questions]]
Revisit if: APFS clone accounting proves too hard for v1; or Windows work starts.

## 2026-07-08 - Fast-path scan promoted to thin feature

Type: Minor (process / spec structure)
Status: Accepted
Context: User requested promote after decisions locked.
Decision: Create thin feature at maturity 2 under `docs/specs/features/fast-path-scan/` (README with state/ops/acceptance, status, work-log) plus POC stubs `headless-scan-bench` and `macos-getattrlistbulk`. No production code in this step. Intent note remains source history; feature folder is authoritative for desired behavior.
Reason: Thin feature path; ready for backend/POC implementation without full ceremony or empty control-plane stubs.
Affected specs:
- [[specs/features/fast-path-scan/README]]
- [[specs/features/fast-path-scan/status]]
- [[intent/fast-path-scan]]
- [[loop/backlog]]
- [[loop/current-goal]]
Revisit if: Scope expands to Windows/Linux or new IPC commands.
