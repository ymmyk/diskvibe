mod scanner;

use parking_lot::RwLock;
use scanner::{FileNode, ScanProgress, Scanner};
use std::sync::Arc;
use tauri::State;

struct AppState {
    scanner: Arc<RwLock<Scanner>>,
    cached_tree: Arc<RwLock<Option<FileNode>>>,
}

/// Recompute size and file_count from immediate children (recursive aggregates).
fn recompute_from_children(node: &mut FileNode) {
    if let Some(children) = &node.children {
        node.size = children.iter().map(|c| c.size).sum();
        node.file_count = children.iter().map(|c| c.file_count).sum();
    }
}

/// Apply a rescan result into `root`, recomputing ancestor aggregates.
/// Returns true if `path` was found in the tree (or is the root path).
fn apply_rescan_to_tree(root: &mut FileNode, path: &str, updated: &Option<FileNode>) -> bool {
    if root.path == path {
        if let Some(node) = updated {
            *root = node.clone();
        }
        // Caller handles root deletion (clears cache).
        return true;
    }
    replace_descendant(root, path, updated)
}

fn replace_descendant(node: &mut FileNode, path: &str, updated: &Option<FileNode>) -> bool {
    let Some(children) = node.children.as_mut() else {
        return false;
    };

    for i in 0..children.len() {
        if children[i].path == path {
            match updated {
                Some(u) => children[i] = u.clone(),
                None => {
                    children.remove(i);
                }
            }
            recompute_from_children(node);
            return true;
        }
        if replace_descendant(&mut children[i], path, updated) {
            recompute_from_children(node);
            return true;
        }
    }
    false
}

#[tauri::command]
async fn scan_directory(path: String, state: State<'_, AppState>) -> Result<FileNode, String> {
    let scanner = state.scanner.read();
    let result = scanner.scan(&path)?;

    // Cache the result
    *state.cached_tree.write() = Some(result.clone());

    Ok(result)
}

#[tauri::command]
async fn get_cached_tree(state: State<'_, AppState>) -> Result<Option<FileNode>, String> {
    Ok(state.cached_tree.read().clone())
}

#[tauri::command]
async fn cancel_scan(state: State<'_, AppState>) -> Result<(), String> {
    let scanner = state.scanner.read();
    scanner.cancel();
    Ok(())
}

#[tauri::command]
async fn get_scan_progress(state: State<'_, AppState>) -> Result<ScanProgress, String> {
    let scanner = state.scanner.read();
    Ok(scanner.get_progress())
}

#[tauri::command]
async fn get_home_directory() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

#[tauri::command]
async fn rescan_item(path: String, state: State<'_, AppState>) -> Result<Option<FileNode>, String> {
    let scanner = state.scanner.read();
    let result = scanner.rescan(&path)?;

    // Keep session cache in sync so webview restore reflects partial rescans
    {
        let mut cache = state.cached_tree.write();
        if let Some(tree) = cache.as_mut() {
            if tree.path == path {
                match &result {
                    Some(node) => *tree = node.clone(),
                    None => *cache = None,
                }
            } else {
                // No-op if path is not under the cached root (stale / different scan)
                let _ = apply_rescan_to_tree(tree, &path, &result);
            }
        }
    }

    Ok(result)
}

#[tauri::command]
async fn reveal_in_file_manager(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try dbus method first (works on most DEs), fall back to xdg-open
        let dbus_result = std::process::Command::new("dbus-send")
            .args([
                "--session",
                "--dest=org.freedesktop.FileManager1",
                "--type=method_call",
                "/org/freedesktop/FileManager1",
                "org.freedesktop.FileManager1.ShowItems",
                &format!("array:string:file://{}", &path),
                "string:",
            ])
            .spawn();

        if dbus_result.is_err() {
            // Fall back to opening parent directory
            let parent = std::path::Path::new(&path)
                .parent()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or(path);
            std::process::Command::new("xdg-open")
                .arg(&parent)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            scanner: Arc::new(RwLock::new(Scanner::new())),
            cached_tree: Arc::new(RwLock::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            cancel_scan,
            get_scan_progress,
            get_home_directory,
            rescan_item,
            reveal_in_file_manager,
            get_cached_tree
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dir(name: &str, path: &str, children: Vec<FileNode>) -> FileNode {
        let size = children.iter().map(|c| c.size).sum();
        let file_count = children.iter().map(|c| c.file_count).sum();
        FileNode {
            name: name.to_string(),
            path: path.to_string(),
            size,
            file_count,
            is_directory: true,
            children: Some(children),
        }
    }

    fn file(name: &str, path: &str, size: u64) -> FileNode {
        FileNode {
            name: name.to_string(),
            path: path.to_string(),
            size,
            file_count: 1,
            is_directory: false,
            children: None,
        }
    }

    #[test]
    fn apply_rescan_replaces_nested_and_recomputes_ancestors() {
        let mut root = dir(
            "root",
            "/root",
            vec![dir(
                "a",
                "/root/a",
                vec![file("f.txt", "/root/a/f.txt", 100)],
            )],
        );
        assert_eq!(root.size, 100);

        let updated = file("f.txt", "/root/a/f.txt", 250);
        assert!(apply_rescan_to_tree(
            &mut root,
            "/root/a/f.txt",
            &Some(updated)
        ));
        assert_eq!(root.size, 250);
        assert_eq!(root.children.as_ref().unwrap()[0].size, 250);
        assert_eq!(
            root.children.as_ref().unwrap()[0]
                .children
                .as_ref()
                .unwrap()[0]
                .size,
            250
        );
    }

    #[test]
    fn apply_rescan_removes_missing_path() {
        let mut root = dir(
            "root",
            "/root",
            vec![
                file("keep.txt", "/root/keep.txt", 10),
                file("gone.txt", "/root/gone.txt", 20),
            ],
        );
        assert!(apply_rescan_to_tree(&mut root, "/root/gone.txt", &None));
        assert_eq!(root.children.as_ref().unwrap().len(), 1);
        assert_eq!(root.size, 10);
        assert_eq!(root.file_count, 1);
    }

    #[test]
    fn apply_rescan_replaces_root() {
        let mut root = file("old", "/root", 1);
        let updated = dir("root", "/root", vec![file("n.txt", "/root/n.txt", 5)]);
        assert!(apply_rescan_to_tree(&mut root, "/root", &Some(updated)));
        assert_eq!(root.size, 5);
        assert!(root.is_directory);
    }

    #[test]
    fn apply_rescan_unknown_path_is_noop() {
        let mut root = dir("root", "/root", vec![file("a.txt", "/root/a.txt", 3)]);
        let before = root.clone();
        assert!(!apply_rescan_to_tree(
            &mut root,
            "/other/x",
            &Some(file("x", "/other/x", 99))
        ));
        assert_eq!(root.size, before.size);
    }
}
