---
type: interface-spec
id: ui.bootstrap
status: active
maturity: 4
tags:
  - bootstrap
  - interfaces
  - diskvibe
---

# Bootstrap Interfaces

Single desktop shell: `src/index.html` + `src/main.js` + `src/styles.css`.

## `ui.main-shell`

### Purpose

Let the local user select a folder, watch scan progress, explore disk usage via treemap and list, drill down, rescan, and reveal in the OS file manager.

### Primary flows

1. **Select folder** — dialog → `op.scan-directory` → render tree
2. **Progress** — poll `op.get-scan-progress` while scanning; cancel → `op.cancel-scan`
3. **Explore** — click treemap/list → drill into directory; breadcrumbs / zoom out
4. **Sort** — list by size, name, or file count
5. **Color modes** — random muted palette vs file-type categories (folder/media/app/system/other)
6. **Theme** — dark/light toggle
7. **Rescan item** — `op.rescan-item` for a path; UI merges result into view
8. **Reveal** — `op.reveal-in-file-manager`
9. **Startup** — `op.get-home-directory`; optionally `op.get-cached-tree`

### States

| State | Behavior |
|---|---|
| Empty / before scan | Prompt to select folder |
| Scanning | Progress bar: files, size, path sample; cancel enabled |
| Ready | Treemap + list + totals + breadcrumbs |
| Cancelled / error | Surface message; prior tree may remain depending on path |
| Permission-denied entries | Invisible holes in tree (skipped in scanner); no per-file ACL UI |

### Acceptance scenarios (shipped behavior)

```gherkin
Scenario: User scans a folder
  Given the app is open
  When the user selects an existing folder
  Then a treemap and file list show usage under that root
  And total size and file counts are displayed

Scenario: User cancels a scan
  Given a scan is in progress
  When the user cancels
  Then scanning stops
  And the UI leaves the scanning state

Scenario: User drills into a directory
  Given a completed scan
  When the user opens a directory in the treemap or list
  Then the view focuses that directory
  And breadcrumbs reflect the path

Scenario: User reveals a path
  Given a selected file or folder
  When the user chooses reveal in file manager
  Then the OS file manager opens to that path (platform-specific)
```

### Non-goals (not in UI today)

- Delete files
- Export reports
- Multi-window multi-root tabs as a product feature (some per-tree UI state exists for navigation)
- Cloud account integration
