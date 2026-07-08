---
type: poc-index
id: pocs.fast-path-scan
feature_id: feature.fast-path-scan
status: active
tags:
  - pocs
  - feature
related:
  - "../README.md"
  - "../status.md"
  - "../work-log.md"
---

# POCs: Fast-path platform scanning

Non-production. Green POC ≠ shipped product behavior.

## Index

| POC | Status | Purpose | Outcome |
|---|---|---|---|
| [[headless-scan-bench/README]] | proposed | SSH/CI scan harness (no GUI) | — |
| [[macos-getattrlistbulk/README]] | proposed | Bulk attrs → `FileNode`; speed + parity | — |

## Suggested order

1. **headless-scan-bench** — unblock remote work; baseline jwalk numbers
2. **macos-getattrlistbulk** — prove fast path against that harness

## Rules

- Keep exploratory code under POC notes or clearly gated examples; promote into `src-tauri/src/scanner*.rs` only when adopting.
- Prefer `src-tauri/examples/scan_bench.rs` as the durable harness once validated (shared by both POCs).
- Capture findings in each POC README; append [[../work-log]].
- Do not change default production scan engine until acceptance criteria in feature README are met.
