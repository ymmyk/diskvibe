---
type: operations-spec
id: ops.bootstrap
status: active
maturity: 4
tags:
  - bootstrap
  - operations
  - diskvibe
---

# Bootstrap Operations

Domain verbs reconstructed from Tauri commands and `Scanner`. Transport details: [[control-planes/ipc]].

## `op.scan-directory`

Intent: fully scan a root path into a `FileNode` tree and cache it.

| | |
|---|---|
| Inputs | `path: string` (absolute directory or path that exists) |
| Outputs | `FileNode` root tree |
| Preconditions | Path exists |
| State changes | Resets scanner progress/cancel; builds tree; sets `cached_tree` to result |
| Errors | Path does not exist; `"Scan cancelled"`; `"Failed to build tree"` |
| Invariants | `inv.scan-root-exists`, `inv.no-symlink-follow`, rollup/sort invariants |
| Idempotency | Re-run replaces cache with a new full scan |
| Side notes | Permission errors on individual entries are skipped (`continue`), not fatal |

## `op.cancel-scan`

Intent: request cancellation of an in-flight scan.

| | |
|---|---|
| Inputs | none |
| Outputs | unit |
| Preconditions | none (safe if idle) |
| State changes | Sets scanner cancel flag |
| Errors | none expected |
| Notes | In-flight `scan` / `rescan` returns `"Scan cancelled"` when flag observed |

## `op.get-scan-progress`

Intent: read current scan progress for UI polling.

| | |
|---|---|
| Inputs | none |
| Outputs | `ScanProgress` |
| Preconditions | none |
| State changes | none |
| Errors | none expected |
| Notes | `is_complete` from backend is currently always `false` in `get_progress` |

## `op.get-cached-tree`

Intent: return last fully scanned tree if present.

| | |
|---|---|
| Inputs | none |
| Outputs | `Option<FileNode>` |
| Preconditions | none |
| State changes | none |
| Errors | none expected |
| Notes | Only populated by successful `op.scan-directory`, not by rescan |

## `op.rescan-item`

Intent: rescan a single path (file or directory subtree).

| | |
|---|---|
| Inputs | `path: string` |
| Outputs | `Option<FileNode>` — `None` if path missing or metadata unreadable |
| Preconditions | none required at API; missing path → `None` |
| State changes | Resets progress/cancel at start; does **not** update `cached_tree` |
| Errors | `"Scan cancelled"` |
| Invariants | Same sizing/sort rules as full scan for the returned subtree |

## `op.reveal-in-file-manager`

Intent: show a path in the OS file manager (select/reveal).

| | |
|---|---|
| Inputs | `path: string` |
| Outputs | unit |
| Preconditions | OS-dependent; path should be meaningful to the shell |
| State changes | none (external process) |
| Errors | Spawn failures as string |
| Platform | macOS `open -R`; Windows `explorer /select,`; Linux dbus FileManager1 or `xdg-open` parent |

## `op.get-home-directory`

Intent: resolve the user's home directory for default UI pathing.

| | |
|---|---|
| Inputs | none |
| Outputs | `string` home path |
| Preconditions | OS can resolve home |
| State changes | none |
| Errors | `"Could not determine home directory"` |
