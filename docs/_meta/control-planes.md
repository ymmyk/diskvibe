---
type: guide
id: product.control-planes
status: active
tags:
  - control-planes
---

# Control Planes

Control planes are first-class surfaces that invoke, schedule, automate, synchronize, or expose operations.

**Omit unused planes.** Do not create empty stub files.

## Planes

| Plane | Use when |
|---|---|
| **API** | HTTP/RPC for apps and integrations |
| **IPC** | Desktop/native commands (Tauri, Electron, etc.) |
| **MCP** | Agent/tool-facing tools |
| **Webhooks** | Inbound/outbound external events |
| **Async** | Jobs, workers, schedules, long local work |
| **Admin commands** | Repair, support, migration, backfill CLIs |

## Spec Contents (any plane)

- Stable ID and name
- Operation(s) invoked
- Auth / capability requirements
- Inputs, outputs, errors
- Idempotency, retries, cancellation when relevant
- Whether state is mutated

## Bootstrap Hygiene

Scaffold may include example plane files under `docs/specs/bootstrap/control-planes/`. For this product:

1. Keep planes that exist.
2. Delete or rewrite unused examples so they do not look like real contracts.
3. Feature folders create plane files only when the feature uses them.

See also [[thin-feature-path]].
