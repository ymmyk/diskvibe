# DiskVibe

A fast disk space analyzer for Mac and Linux, similar to WizTree/WinDirStat.

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
├── justfile                # Task runner commands
└── package.json
```

## Features

- Parallel directory scanning using jwalk
- Treemap visualization of disk usage
- File/folder list sortable by size, name, or file count
- Drill-down navigation into folders
- Breadcrumb navigation
- Progress indicator during scanning
- Scan cancellation support
- Graceful handling of permission errors

## Preferences

- Use `just` for running tasks (see `justfile` for available commands)
- Use `pnpm` as the package manager
- Use `just attach` to create/attach to a zellij session for the project

## Common Commands

```bash
just install    # Install dependencies
just dev        # Run in development mode
just build      # Build for production
just check      # Check Rust code for errors
just fmt        # Format Rust code
just lint       # Run clippy linter
just clean      # Clean build artifacts
```

## Future Improvements

- Fast-path scanning using macOS `getattrlistbulk()` or APFS catalog for near-instant results (similar to GrandPerspective)
- Linux ext4 inode table direct reading
- File deletion support
- Export reports
