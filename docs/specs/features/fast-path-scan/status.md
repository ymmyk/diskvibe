---
type: feature-status
id: status.fast-path-scan
feature_id: feature.fast-path-scan
status: draft
spec_state: draft
implementation_state: not-started
verification_state: unverified
dirty_reason: null
maturity: 2
last_spec_change: 2026-07-08
last_implementation_change: null
last_verified: null
tags:
  - feature-status
  - feature
related:
  - "[[README]]"
  - "[[work-log]]"
  - "[[pocs/README]]"
  - "[[intent/fast-path-scan]]"
---

# Status: Fast-path platform scanning

## Current State

| Field | Value |
|---|---|
| Spec state | `draft` |
| Implementation state | `not-started` |
| Verification state | `unverified` |
| Maturity | `2` (state + ops described; ready for POC / backend) |
| Dirty reason | — |

## Required Work

1. Implement [[pocs/headless-scan-bench/README]] (`scan_bench` example)
2. Implement [[pocs/macos-getattrlistbulk/README]]
3. Unique-physical accounting + jwalk baseline alignment
4. Wire strategy select + silent fallback into production `Scanner`
5. Automated parity/cancel tests; bench evidence
6. Update bootstrap state invariants when unique-physical ships
7. QA via headless + `just dev` (no new UI)

## Current Goal

Promote complete — next: start POC implementation (headless bench first).

## Evidence

| Date | Evidence | Result |
|---|---|---|
| — | — | none yet |

## Open Questions

- See [[README#Open questions]]
- APFS clone/extent unique-physical depth still open

## Gates

- Backend scan engine change: maturity ≥2 ✓ (content)
- No new control-plane exposure required (reuse IPC)
- Do not mark complete before acceptance A1–A7 + evidence
