# DiskVibe

A fast disk space analyzer for Mac, Linux, and Windows, similar to WizTree/WinDirStat.

**Product OS:** Follow `AGENTS.md` and the vault under `docs/`. Specs are the source of truth for product behavior; this file is stack and workflow notes.

## Tech Stack

- **Tauri 2** - Desktop app framework
- **Rust** - Backend for filesystem operations
- **jwalk** - Parallel directory traversal
- **D3.js** - Treemap visualization
- **Vanilla JS/HTML/CSS** - Frontend UI

## Project Structure

```
diskvibe/
├── src/                    # Frontend
│   ├── index.html          # Main UI layout
│   ├── styles.css          # Dark theme styling
│   └── main.js             # App logic, D3 treemap, Tauri IPC
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands (scan, cancel, progress)
│   │   ├── scanner.rs      # Parallel directory scanner
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── docs/                   # AI Product OS vault (specs, loop, intent)
├── AGENTS.md               # Product OS agent protocol
├── justfile                # Task runner commands
└── package.json
```

## Features (shipped)

- Parallel directory scanning using jwalk
- Treemap visualization of disk usage
- File/folder list sortable by size, name, or file count
- Drill-down navigation into folders
- Breadcrumb navigation
- Progress indicator during scanning
- Scan cancellation support
- Graceful handling of permission errors

Shipped product truth: `docs/specs/bootstrap/`. Futures: `docs/intent/`.

## Preferences

- Use `just` for running tasks (see `justfile` for available commands)
- Use `pnpm` as the package manager
- Use `just attach` to create/attach to a zellij session for the project
- Prefer thin features; primary control plane is **IPC** (Tauri commands)
- Environment: test → `just test`; QA → `just dev`; no deploy-preview

## Common Commands

```bash
just install    # Install dependencies
just dev        # Run in development mode
just build      # Build for production
just check      # Check Rust code for errors
just fmt        # Format Rust code
just lint       # Run clippy linter
just clean      # Clean build artifacts
just test       # Run Rust tests
```

## Future Improvements

Captured as intent notes (not specs yet):

- [[docs/intent/fast-path-scan|Fast-path platform scanning]]
- [[docs/intent/file-deletion|File deletion]]
- [[docs/intent/export-reports|Export reports]]
