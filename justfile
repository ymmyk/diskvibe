# DiskVibe - Fast Disk Space Analyzer
# Run `just` to see available commands

# Default recipe - show help
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Run the app in development mode
dev:
    pnpm tauri dev

# Build the app for production
build:
    pnpm tauri build

# Build debug version (faster compilation)
build-debug:
    pnpm tauri build --debug

# Run Rust tests
test:
    cd src-tauri && cargo test

# Check Rust code for errors without building
check:
    cd src-tauri && cargo check

# Format Rust code
fmt:
    cd src-tauri && cargo fmt

# Lint Rust code
lint:
    cd src-tauri && cargo clippy

# Clean build artifacts
clean:
    cd src-tauri && cargo clean
    rm -rf node_modules

# Update dependencies
update:
    pnpm update
    cd src-tauri && cargo update

# Open the project in VS Code
code:
    code .

# Attach to or create a zellij session
attach:
    zellij attach diskvibe --create

# Tag and push a release (usage: just release 0.2.0)
release version:
    @echo "Updating version to {{version}}..."
    sed -i '' 's/"version": "[^"]*"/"version": "{{version}}"/' src-tauri/tauri.conf.json
    git add src-tauri/tauri.conf.json
    git commit -m "Release v{{version}}"
    git tag "v{{version}}"
    git push origin main --tags
    @echo "Release v{{version}} tagged and pushed!"
