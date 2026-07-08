---
type: product-map
id: product.map
status: active
maturity: 4
tags:
  - product-map
  - diskvibe
---

# Product Map

## Product Intent

DiskVibe is a local desktop app that helps users understand disk usage: pick a folder, scan the filesystem in parallel, visualize size with a treemap and list, drill into directories, rescan subtrees, and reveal paths in the OS file manager.

## Actors

| Actor | Description | Notes |
|---|---|---|
| Local user | Person running the app on their machine | Single-user; OS account identity only |
| OS file manager | External shell for reveal | macOS Finder, Windows Explorer, Linux FM |

## Entities

| Entity | Purpose | Owner | Notes |
|---|---|---|---|
| `entity.file-node` | Tree node for a file or directory | Session | See bootstrap state |
| `entity.scan-progress` | Live scan counters/path | Session | Not durable |
| Session tree cache | Last full scan root tree | Session | `AppState.cached_tree` |

## Operations

| Operation | Purpose | Primary actors | Specs |
|---|---|---|---|
| `op.scan-directory` | Full parallel scan of a root path | Local user | [[specs/bootstrap/operations]]; strategy delta [[specs/features/fast-path-scan/README]] |
| `op.cancel-scan` | Abort in-flight scan | Local user | [[specs/bootstrap/operations]] |
| `op.get-scan-progress` | Poll scan progress | UI | [[specs/bootstrap/operations]] |
| `op.get-cached-tree` | Read last cached full tree | UI | [[specs/bootstrap/operations]] |
| `op.rescan-item` | Rescan one path / subtree | Local user | [[specs/bootstrap/operations]]; same strategy as full scan (fast-path feature) |
| `op.reveal-in-file-manager` | Show path in OS file manager | Local user | [[specs/bootstrap/operations]] |
| `op.get-home-directory` | Default starting home path | UI | [[specs/bootstrap/operations]] |

## Features (in progress / planned)

| Feature | Status | Specs |
|---|---|---|
| Fast-path scan (macOS bulk attrs) | Spec draft, not implemented | [[specs/features/fast-path-scan/README]] |

## Control Planes

| Control plane | Purpose | Specs |
|---|---|---|
| IPC | Tauri commands between UI and Rust | [[specs/bootstrap/control-planes/ipc]] |
| Async | Parallel jwalk scan + UI progress polling | Documented under IPC / operations |

Unused (not part of product): API, MCP, webhooks, admin commands.

## Interfaces

| Interface | Actor | Purpose | Specs |
|---|---|---|---|
| `ui.main-shell` | Local user | Scan, treemap, list, nav, theme | [[specs/bootstrap/interfaces]] |

## Environment Contract

| Intent | Command |
|---|---|
| install | `just install` |
| test | `just test` |
| check | `just check` |
| preview / QA | `just dev` |
| build | `just build` |
| seed | N/A (optional future `testdata/`) |
| deploy-preview | N/A |

## Open Questions

See [[open-questions]].
