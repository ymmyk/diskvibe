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
            get_home_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
