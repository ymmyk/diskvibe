---
type: current-goal
id: loop.current-goal
status: draft
tags:
  - loop
  - goal
---

# Current Goal

Goal: **Fast-path scan — POC implementation** (not started in code yet).

Feature: [[specs/features/fast-path-scan/README]]  
Status: [[specs/features/fast-path-scan/status]]

## Success for this goal (when implemented)

1. `cargo run --example scan_bench -- <path>` works over SSH (no GUI)
2. macOS bulk path measurable vs jwalk
3. Fixture parity + unique-physical path defined in tests
4. Evidence recorded on feature status/work-log

## Last completed (2026-07-08)

- Bootstrapped AI Product OS scaffold (0.2.0)
- Reconstructed `docs/specs/bootstrap/*` from code
- Intent notes; fast-path **promoted** to thin feature maturity 2 + POC stubs
- Environment: `just test` / `just dev`

## Next candidates

See [[backlog]].

## Constraints

- Must respect maturity gates in [[_meta/maturity-model]].
- Prefer thin features; IPC-only control plane.
- Destructive work (delete) requires major decision approval.
