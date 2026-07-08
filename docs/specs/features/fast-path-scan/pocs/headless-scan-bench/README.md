---
type: poc
id: poc.fast-path-scan.headless-scan-bench
feature_id: feature.fast-path-scan
status: draft
poc_state: proposed
production_status: non-production
tags:
  - poc
  - feature
  - cli
related:
  - "../README.md"
  - "../../README.md"
  - "../../status.md"
  - "../../work-log.md"
---

# POC: Headless scan bench

## Purpose

Run the scan engine over **SSH without a GUI** for timing, parity, and regression work.

## Question being tested

Can we exercise `Scanner` (and later strategy select) with a zero-window binary suitable for CI and remote macOS?

## Scope

In scope:

- `src-tauri/examples/scan_bench.rs` (or equivalent) linking `diskvibe_lib` / scanner module
- CLI: root path + optional `--strategy auto|jwalk|macos-bulk`
- Stdout: wall time, strategy used, files/entries, total size, optional top-N
- Exit non-zero on hard failure
- No Tauri window / no webview

Out of scope:

- Product packaging of a user-facing CLI
- Full JSON tree dump required for v1 of POC (optional nice-to-have)
- Production IPC changes

## How to run (target)

```bash
cd src-tauri
cargo run --example scan_bench -- /path/to/tree
cargo run --example scan_bench -- /path/to/tree --strategy jwalk
cargo run --example scan_bench -- /path/to/tree --strategy macos-bulk
```

SSH: same commands on the Mac host.

## Artifacts

| Path | Notes |
|---|---|
| `src-tauri/examples/scan_bench.rs` | Preferred durable location once written |
| `notes.md` | Optional timing tables / findings |

## Findings

_Not run yet._

## Spec impact

| Spec | Change needed? | Notes |
|---|---:|---|
| Feature README | No (already specifies harness) | — |
| Bootstrap | No | Harness only |
| justfile | Maybe | Optional `just scan-bench path` |

## Promotion decision

Status: not promoted

Promote if:

- Binary runs headless on macOS over SSH
- jwalk baseline numbers reproducible

Discard if:

- Cannot link scanner without pulling full Tauri app runtime (then extract scanner to pure lib path first)
