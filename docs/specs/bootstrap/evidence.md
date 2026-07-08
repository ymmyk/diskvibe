---
type: evidence-spec
id: evidence.bootstrap
status: active
maturity: 4
tags:
  - bootstrap
  - evidence
  - diskvibe
---

# Bootstrap Evidence

How to prove baseline DiskVibe behavior for QA and agent goals.

## Environment mapping

| Intent | Command | Notes |
|---|---|---|
| install | `just install` | pnpm install |
| test | `just test` | `cargo test` in `src-tauri` |
| check | `just check` | `cargo check` |
| lint | `just lint` | clippy |
| preview / QA | `just dev` | `pnpm tauri dev` |
| build | `just build` | production package |
| seed | N/A | Optional future: fixture directory under `testdata/` |
| deploy-preview | N/A | Desktop app; use `just dev` or installed build |

## Automated

```bash
just test
just check
```

Record pass/fail in goal evidence. Add tests when changing scanner/ops.

## Manual QA (baseline)

Via `just dev`:

1. Select home or a small fixture folder — scan completes; treemap + list populate.
2. Cancel mid-scan on a large tree — returns to non-scanning UI without hang.
3. Drill down / breadcrumb / zoom out — navigation consistent.
4. Sort by size/name/count — list order changes.
5. Toggle theme and color-by-type — visual only.
6. Rescan a folder — sizes refresh for that subtree.
7. Reveal in file manager — OS shows path.

## Known gaps (evidence honesty)

- Limited automated UI coverage (mostly Rust unit surface).
- `ScanProgress.is_complete` not used as a backend completion signal.
- Unsigned release friction on macOS/Windows (see product open questions).
