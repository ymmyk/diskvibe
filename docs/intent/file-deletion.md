---
type: intent-note
id: intent.file-deletion
status: draft
tags:
  - intent
  - destructive
  - filesystem
---

# Intent: File deletion support

## Raw idea

Allow users to delete files/folders from DiskVibe after identifying large usage (WizTree-like).

## Why

Discovery without cleanup action is half the job for many users.

## Actors

Local user.

## Major decisions required before build

- Trash/recycle vs permanent delete
- Multi-select and bulk delete
- Confirmation UX and undo
- Update tree/cache after delete
- Error handling for locked/permission-denied paths

**This is destructive → stop for user approval (major decision).**

## Spec translation

Not started. Intent-only. Do not implement without explicit approval and maturity ≥3 with permissions + IPC contracts.
