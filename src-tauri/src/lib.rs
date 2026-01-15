mod scanner;

use parking_lot::RwLock;
use scanner::{FileNode, ScanProgress, Scanner};
use std::sync::Arc;
use tauri::State;

struct AppState {
    scanner: Arc<RwLock<Scanner>>,
}

#[tauri::command]
async fn scan_directory(path: String, state: State<'_, AppState>) -> Result<FileNode, String> {
    let scanner = state.scanner.read();
    scanner.scan(&path)
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
    scanner.rescan(&path)
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
        })
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            cancel_scan,
            get_scan_progress,
            get_home_directory,
            rescan_item,
            reveal_in_file_manager
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
