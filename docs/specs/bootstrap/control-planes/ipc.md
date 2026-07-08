---
type: control-plane-spec
id: control.ipc.bootstrap
status: active
maturity: 4
tags:
  - control-plane
  - ipc
  - bootstrap
  - diskvibe
---

# Bootstrap IPC (Tauri)

Primary control plane: Tauri 2 commands registered in `src-tauri/src/lib.rs`, invoked from `src/main.js` via `window.__TAURI__.core.invoke`.

## Command Index

| Command | Stable ID | Operation | Mutates | Notes |
|---|---|---|---|---|
| `scan_directory` | `ipc.scan-directory` | `op.scan-directory` | yes | Full scan + cache |
| `cancel_scan` | `ipc.cancel-scan` | `op.cancel-scan` | yes | Cancel flag |
| `get_scan_progress` | `ipc.get-scan-progress` | `op.get-scan-progress` | no | UI poll |
| `get_cached_tree` | `ipc.get-cached-tree` | `op.get-cached-tree` | no | Session cache |
| `rescan_item` | `ipc.rescan-item` | `op.rescan-item` | yes* | Subtree; *does not update cache |
| `reveal_in_file_manager` | `ipc.reveal-in-file-manager` | `op.reveal-in-file-manager` | no | OS side effect |
| `get_home_directory` | `ipc.get-home-directory` | `op.get-home-directory` | no | Startup default |

Also used from UI (plugins, not custom commands):

- `tauri_plugin_dialog` — folder picker (`open`)
- `tauri_plugin_opener` — registered; reveal uses custom command

## Contracts

### `ipc.scan-directory`

- Command: `scan_directory`
- Args: `{ path: string }`
- Result: `FileNode` or error string
- Async: yes (Tauri async command; scan is CPU/IO heavy on Rust side)
- Capabilities: filesystem read within OS permissions; Tauri allowlist as configured

### `ipc.cancel-scan`

- Command: `cancel_scan`
- Args: `{}`
- Result: unit

### `ipc.get-scan-progress`

- Command: `get_scan_progress`
- Args: `{}`
- Result: `ScanProgress`

### `ipc.get-cached-tree`

- Command: `get_cached_tree`
- Args: `{}`
- Result: `FileNode | null`

### `ipc.rescan-item`

- Command: `rescan_item`
- Args: `{ path: string }`
- Result: `FileNode | null`

### `ipc.reveal-in-file-manager`

- Command: `reveal_in_file_manager`
- Args: `{ path: string }`
- Result: unit

### `ipc.get-home-directory`

- Command: `get_home_directory`
- Args: `{}`
- Result: `string`

## Async behavior

- Full scan uses jwalk with a Rayon pool sized to CPU count.
- UI polls `get_scan_progress` on an interval while scanning.
- Cancel is cooperative via atomic flag checked in the walk.

## Security / capabilities

- Local process; no remote API.
- App is typically unsigned in distribution notes — OS trust prompts may apply.
- No IPC auth beyond same-app Tauri boundary.
