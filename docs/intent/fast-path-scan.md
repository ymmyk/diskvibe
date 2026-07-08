---
type: intent-note
id: intent.fast-path-scan
status: draft
tags:
  - intent
  - performance
  - scanning
---

# Intent: Fast-path platform scanning

## Raw idea

Near-instant disk inventory using platform-specific catalogs instead of (or before) full jwalk:

- macOS: `getattrlistbulk()` or APFS catalog (GrandPerspective-style)
- Linux: ext4 inode table direct reading (research)

## Why

Large volumes (home, system disks) are slow with pure walk; competitors feel instant.

## Actors

Local user on macOS and/or Linux (Windows TBD).

## Out of scope (for now)

- Changing UI metaphor
- Network/remote volumes optimization strategy

## Open questions

- Platform priority order?
- Fallback to current jwalk when fast path fails?
- Accuracy vs allocated-block sizing consistency with current Unix behavior?

## Spec translation

Not started. Intent-only. When building: thin feature under `docs/specs/features/fast-path-scan/` after major decisions.
