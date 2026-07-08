---
type: intent-note
id: intent.fast-path-scan
status: draft
tags:
  - intent
  - performance
  - scanning
source: user
related:
  - "[[specs/bootstrap/operations]]"
  - "[[specs/bootstrap/state]]"
  - "[[_meta/open-questions]]"
---

# Intent: Fast-path platform scanning

## Brain Dump

Today DiskVibe scans with **jwalk** (parallel `WalkDir` + per-entry metadata). Correct enough, but large trees (home, system volumes, multi-TB disks) feel slow next to tools that cheat the VFS layer:

| Platform | Competitive fast path | Rough idea |
|---|---|---|
| **Windows** | WizTree: read **NTFS MFT** directly | Catalog → tree in seconds; non-NTFS falls back to walk |
| **macOS** | Bulk dir APIs (`getattrlistbulk` / historical `getdirentriesattr`); not true “APFS catalog dump” for third parties | Fewer syscalls: batch readdir+attrs per directory; still a walk, but much cheaper than `stat` per file |
| **Linux** | Research: ext4 inode/dir tables, `fiemap`, `statx` batches, or eBPF — **no WizTree-equivalent public standard** | Likely hybrid: smarter walk first; raw FS reads later if justified |

**Core product bet:** scanning should feel *instant enough* that the treemap is the product, not a loading screen. Platform special cases are acceptable if:

1. Output is still a `FileNode` tree (or compatible) for the existing UI
2. Sizing stays comparable to current Unix **allocated-block** semantics where possible
3. Failure always falls back to current jwalk path (no silent empty tree)

Not about a new UI metaphor — about **scan engine strategy** behind existing ops.

## Why It Matters

- Home / root / large project trees are the default job-to-be-done; pure walk loses mindshare to WizTree-class tools.
- Progress + cancel already exist; users still bounce if wall-clock is “go make coffee.”
- Differentiator for cross-platform: macOS is weak in “WizTree-fast” mindshare; Windows has WizTree; Linux is underserved.

## Rough User Flow

1. User picks folder / volume (same UI as today).
2. App chooses scan strategy: **fast path if eligible**, else jwalk.
3. Progress still polls (`files_scanned`, `total_size`, `current_path`); cancel still works.
4. Same treemap / list / drill-down / rescan / reveal after complete.
5. Optional later: subtle “Scanned via fast path” / strategy indicator for power users — **not required for v1**.

**Rescan item:** same strategy selector as full scan (best available → silent jwalk fallback). See [[#Decisions (locked 2026-07-08)]].

## Decisions (locked 2026-07-08)

| # | Topic | Decision |
|---|---|---|
| 1 | Platform scope | **macOS only now** (`getattrlistbulk` / bulk attrs). Windows MFT + Linux deferred until workstations available for real testing. |
| 2 | Fallback | **Silent jwalk** — no strategy badge / toast required for v1. Never return empty tree because fast path failed. |
| 3 | Size parity | **Prefer exact** match to current Unix sizing (`st_blocks * 512` allocated). Acceptance: fast path vs jwalk parity on fixtures. |
| 4 | Hard links / clones | **Unique physical** — do not double-count the same physical storage via multiple hard-link paths (and prefer clone-aware / unique-extent policy where feasible on APFS). *Note: this changes current jwalk behavior (path-count every link); both strategies should converge on unique-physical once implemented, or document transitional mismatch.* |
| 5 | Rescan | **Default scanner** — same strategy pick as full scan (best eligible path, else jwalk). No jwalk-only rescan exception. |
| 6 | Windows elevation | **Defer** until Windows machine + MFT POC. |

### Headless / SSH testing

**Today:** no CLI. Only Tauri GUI (`just dev`) + `cargo test` in `src-tauri`. Cannot drive a full product scan over SSH without a display.

**For POC / CI / SSH (planned):** add a small **headless scan binary or example** that links the same `Scanner` / strategy code, e.g.:

```bash
# illustrative — not shipped yet
cd src-tauri
cargo run --example scan_bench -- /path/to/tree
# or: cargo test -- --nocapture  with timed parity tests
```

Requirements for that harness:

- No window / no Tauri runtime
- Args: root path, optional `--strategy auto|jwalk|macos-bulk`
- Stdout: wall time, entry count, total size, top-N, optional JSON tree dump
- Exit non-zero on hard failure; report fallback if auto chose jwalk

Also fine for SSH: pure unit/integration tests with temp dirs + hard-link fixtures (parity + unique-physical).

## Success Criteria (intent-level)

- Large local volume / home scan **materially faster** than current jwalk on at least one primary platform (target: order-of-magnitude on cache-warm FS where bulk attrs help; “seconds not minutes” for multi-million-file trees where catalog/MFT exists).
- Tree shape + rollups still valid for UI (`inv.dir-size-rollup`, sort-by-size children).
- Cancel and permission-skip behavior remain safe (no crash, no fatal on single denied entry).
- When fast path unavailable or fails → automatic jwalk; user still gets a result.

## Candidate Actors

| Actor | Role |
|---|---|
| Local user | Starts scan / cancel; consumes same UI |
| Scan engine (Rust) | Strategy select → inventory → `FileNode` build |
| OS / filesystem | Source of truth for names, sizes, structure |
| Elevated / admin context (possible later) | Windows MFT or raw device reads may need privileges — **not assumed for macOS bulk attrs** |

## Candidate State

Still session-scoped; no durable scan DB required for v1.

| Concept | Notes |
|---|---|
| `entity.file-node` | Unchanged contract if possible — `name`, `path`, `size`, `file_count`, `is_directory`, `children` |
| `entity.scan-progress` | Same fields; progress semantics may update in larger steps on bulk/catalog paths |
| Scan strategy (session/ephemeral) | e.g. `jwalk` \| `getattrlistbulk` \| `mft` \| … for diagnostics; optional on progress or evidence |
| Eligibility | FS type, OS, path is local volume?, privileges, feature flags |

**Sizing invariant (current product truth):** Unix files use `st_blocks * 512` (allocated), not logical length — intentional for cloud placeholders. Fast path **must not** silently switch to logical size without a product decision.

## Candidate Operations

Prefer **same domain ops**, new implementation under the hood:

| Op | Fast-path impact |
|---|---|
| `op.scan-directory` | Strategy select → inventory → tree → `cached_tree` |
| `op.cancel-scan` | Cooperative cancel must be honored on all strategies |
| `op.get-scan-progress` | Same IPC shape |
| `op.rescan-item` | Strategy TBD (fast subtree vs always jwalk) |
| *(optional later)* `op.get-scan-capabilities` | Expose which strategies available — not needed for silent auto-select v1 |

No new control plane: still **IPC (Tauri)** only.

## Candidate Interfaces

- **No required UI change for v1** if strategy is automatic.
- Loading / cancel UX unchanged.
- Possible later: strategy badge, “fallback used” toast, settings toggle “prefer accuracy over speed” — out of scope until measured need.

## Platform Strategy (provisional)

### Priority (locked for now)

1. **macOS bulk attrs (`getattrlistbulk`)** — **only active platform work**  
   - No admin rights; improved walk.  
   - Headless bench binary for SSH/CI (see Decisions).
2. **Windows NTFS MFT** — deferred (need Windows box + elevation story later).
3. **Linux** — deferred.
4. **Network / remote volumes** — **out of scope** for fast path; always jwalk.

### Fallback rules (provisional)

```text
if path ineligible OR strategy init fails OR mid-scan unrecoverable error:
  fall back to jwalk (full rescan or seamless handoff — TBD)
never return empty tree because fast path failed
```

## Out of Scope (for now)

- Changing treemap / list / breadcrumb UX
- Network / remote / cloud-mount special inventory (Dropbox/iCloud *placeholders* already partially handled via allocated size)
- Durable scan cache across app restarts
- APFS clone / shared-extent dedup accounting (hard links / clones double-count policy — see open questions)
- Signed driver / kernel extensions
- Making Linux raw inode-table reading a v1 commitment

## Risks

| Risk | Why it hurts | Mitigation direction |
|---|---|---|
| Size mismatch vs jwalk | Users re-scan and numbers jump | Shared size extractor; golden fixtures per platform |
| Hard links / APFS clones | Double-count disk usage | Document policy; optional later unique-inode / clone-aware pass |
| Permissions / FDA (macOS) | Incomplete trees on protected paths | Same skip-continue as today; Full Disk Access is OS-level, not app-specific |
| Windows privilege | MFT needs elevation or special access | Explicit UX later; fallback walk without elevation |
| Cancel correctness | Bulk/catalog loops ignore cancel | Cancel checks between batches / records |
| Strategy complexity | Three half-broken engines | Ship one platform well; keep jwalk as SSOT fallback |

## POC Shape (before full feature)

Suggested under `docs/specs/features/fast-path-scan/pocs/` when promoted:

| POC | Goal | Exit criteria |
|---|---|---|
| `poc.macos-getattrlistbulk` | Inventory via bulk attrs → `FileNode` + headless bench | Faster than jwalk on large local tree; **exact** size parity on fixtures; unique-physical hard links |
| `poc.headless-scan-bench` | CLI/example: path in → timing + totals (+ optional JSON) over SSH | Runnable without GUI/Tauri; CI-friendly |
| `poc.windows-mft` | deferred | — |
| `poc.linux-walk-tune` | deferred | — |

POCs are non-production. A green POC ≠ shipped feature.

## Remaining open questions

| ID | Question | Blocks |
|---|---|---|
| oq.fast-path-progress | Progress: batch jumps OK vs smoothed? | Minor UX |
| oq.fast-path-feature-flag | Compile-time macOS-only vs runtime strategy override (for bench)? | Bench ergonomics — lean runtime override **only in headless/dev** |
| oq.fast-path-unique-physical-impl | Hard links: inode set enough on macOS? APFS clones / cloned extents need extra work beyond inode? | Correct unique-physical on APFS |
| oq.fast-path-jwalk-migration | When unique-physical lands, update baseline jwalk too so strategies match? | Size parity decision implies **yes** — confirm at implement time |

Resolved → [[#Decisions (locked 2026-07-08)]] and decision-log.

## Thin Feature Path (when promoted)

Not started as feature yet. When user prioritizes:

```text
docs/specs/features/fast-path-scan/
  README.md
  status.md
  work-log.md
  pocs/...
  # then operations / state deltas only as needed
  # IPC: likely no new commands if strategy is internal to scan
```

Maturity gates: POC evidence before claiming L2+ for production path; do not swap default scan engine without acceptance fixtures.

## Spec Translation

**Status:** **promoted 2026-07-08** → thin feature (maturity 2).

**Generated specs:**

- [[specs/features/fast-path-scan/README]]
- [[specs/features/fast-path-scan/status]]
- [[specs/features/fast-path-scan/work-log]]
- [[specs/features/fast-path-scan/pocs/README]]
- [[specs/features/fast-path-scan/pocs/headless-scan-bench/README]]
- [[specs/features/fast-path-scan/pocs/macos-getattrlistbulk/README]]

Intent remains historical source; **feature folder is authoritative** for desired behavior going forward.
