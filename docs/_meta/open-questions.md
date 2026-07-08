---
type: open-questions
id: product.open-questions
status: active
tags:
  - open-questions
---

# Open Questions

## Product

| ID | Question | Blocks | Notes |
|---|---|---|---|
| oq.delete-semantics | Trash vs permanent delete, multi-select, undo? | File deletion feature | Major before implement |
| oq.export-format | CSV / JSON / HTML report? Scope of export? | Export feature | Major before implement |
| oq.fast-path-platforms | Which OS paths first (macOS APFS only vs Linux too)? | Fast-path scan | Major / research |
| oq.signed-releases | Keep unsigned builds or invest in signing/notarization? | Distribution UX | Product/ops |

## Reconstructive / technical

| ID | Question | Blocks | Notes |
|---|---|---|---|
| oq.progress-complete-flag | `get_progress` always sets `is_complete: false`; UI infers completion from scan return. Intentional? | Spec accuracy | Confirm or fix later |
| oq.rescan-cache | `rescan_item` does not update `cached_tree`; only full `scan_directory` does. Intentional? | Spec accuracy | Documented as current |
| oq.symlink-policy | `follow_links(false)` — should broken/link targets ever be shown specially? | Edge UX | Current: no follow |
