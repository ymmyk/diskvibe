---
type: permissions-spec
id: perm.bootstrap
status: active
maturity: 4
tags:
  - bootstrap
  - permissions
  - diskvibe
---

# Bootstrap Permissions

DiskVibe is a single-user local desktop app. There is no in-app role, tenant, or auth model.

## Policy summary

| Concern | Policy |
|---|---|
| Identity | OS user running the process |
| Authorization | OS filesystem ACLs; app does not elevate |
| Multi-user | N/A |
| Network auth | N/A |

## Operation matrix

| Operation | Who | Constraints |
|---|---|---|
| `op.scan-directory` | Local user | Can only observe paths the OS allows; unreadable entries skipped |
| `op.cancel-scan` | Local user | Any UI session in this process |
| `op.get-scan-progress` | Local user / UI | Same process |
| `op.get-cached-tree` | Local user / UI | Same process |
| `op.rescan-item` | Local user | Same OS ACL rules as scan |
| `op.reveal-in-file-manager` | Local user | Spawns OS tools; no extra app role |
| `op.get-home-directory` | Local user / UI | OS home resolution |

## Error posture for denied FS access

- Individual walk/metadata failures: **skip entry** (not global forbidden).
- Missing scan root: hard error `"Path does not exist: …"`.
- No distinction between "not found" and "forbidden" at the operation contract level beyond skip vs fail-root.

## Future destructive ops

File deletion (intent only) is a **major decision**: trash vs permanent, confirmations, and permission UX must be approved before implementation.
