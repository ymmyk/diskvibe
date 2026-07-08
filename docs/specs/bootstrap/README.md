---
type: bootstrap-spec-index
id: bootstrap.index
status: active
maturity: 4
tags:
  - bootstrap
  - specs
  - diskvibe
---

# Bootstrap Specs

Baseline product contract reconstructed from shipped DiskVibe code (brownfield). Not invented.

Core:

- [[state]]
- [[operations]]
- [[permissions]]
- [[interfaces]]
- [[evidence]]

Control planes in use:

- [[control-planes/ipc]] — Tauri commands (primary)

Removed from this product (do not re-add empty stubs): API, MCP, webhooks, admin commands. Long-running scan work is part of IPC scan operations (parallel jwalk), not a separate job plane.

## Source map

| Spec | Code |
|---|---|
| State | `src-tauri/src/scanner.rs`, `lib.rs` `AppState` |
| Operations / IPC | `src-tauri/src/lib.rs` commands |
| Interfaces | `src/main.js`, `src/index.html`, `src/styles.css` |
| Evidence | `justfile` (`test`, `dev`, `check`, `build`) |
