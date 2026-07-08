---
type: control-plane-spec
id: control.ipc.{{slug}}
status: draft
maturity: 0
tags:
  - control-plane
  - ipc
---

# IPC: {{Name}}

IPC / native command surface (Tauri, Electron, or similar).

## Command Index

| Command | Stable ID | Operation | Mutates | Notes |
|---|---|---|---|---|
| TBD | `ipc.example` | `op.example` | no | TBD |

## Command Contract Template

### `ipc.example`

Command name: `example_command`

Operation: `op.example`

Mutates state: no

Inputs:

| Field | Type | Required | Notes |
|---|---|---|---|
| TBD | TBD | yes | TBD |

Outputs:

| Field | Type | Notes |
|---|---|---|
| TBD | TBD | TBD |

Errors:

| Code / message | Meaning |
|---|---|
| TBD | TBD |

Capabilities / permissions: TBD (OS, sandbox, allowlist)

Async / threading: TBD (blocking, background task, progress events)

Idempotency: TBD
