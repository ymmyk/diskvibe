use jwalk::WalkDir;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
#[cfg(unix)]
use std::os::unix::fs::MetadataExt;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub file_count: u64,
    pub is_directory: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub files_scanned: u64,
    pub total_size: u64,
    pub current_path: String,
    pub is_complete: bool,
    pub error: Option<String>,
}

pub struct Scanner {
    cancel_flag: Arc<AtomicBool>,
    files_scanned: Arc<AtomicU64>,
    total_size: Arc<AtomicU64>,
    current_path: Arc<RwLock<String>>,
}

impl Scanner {
    pub fn new() -> Self {
        Self {
            cancel_flag: Arc::new(AtomicBool::new(false)),
            files_scanned: Arc::new(AtomicU64::new(0)),
            total_size: Arc::new(AtomicU64::new(0)),
            current_path: Arc::new(RwLock::new(String::new())),
        }
    }

    pub fn cancel(&self) {
        self.cancel_flag.store(true, Ordering::SeqCst);
    }

    pub fn reset(&self) {
        self.cancel_flag.store(false, Ordering::SeqCst);
        self.files_scanned.store(0, Ordering::SeqCst);
        self.total_size.store(0, Ordering::SeqCst);
        *self.current_path.write() = String::new();
    }

    pub fn get_progress(&self) -> ScanProgress {
        ScanProgress {
            files_scanned: self.files_scanned.load(Ordering::SeqCst),
            total_size: self.total_size.load(Ordering::SeqCst),
            current_path: self.current_path.read().clone(),
            is_complete: false,
            error: None,
        }
    }

    pub fn scan(&self, root_path: &str) -> Result<FileNode, String> {
        self.reset();

        let root = PathBuf::from(root_path);
        if !root.exists() {
            return Err(format!("Path does not exist: {}", root_path));
        }

        // Use HashMap to build tree structure
        // Key is parent path, value is list of children
        let entries: Arc<RwLock<HashMap<String, Vec<FileNode>>>> =
            Arc::new(RwLock::new(HashMap::new()));
        let sizes: Arc<RwLock<HashMap<String, u64>>> = Arc::new(RwLock::new(HashMap::new()));
        let file_counts: Arc<RwLock<HashMap<String, u64>>> = Arc::new(RwLock::new(HashMap::new()));

        let cancel_flag = self.cancel_flag.clone();
        let files_scanned = self.files_scanned.clone();
        let total_size = self.total_size.clone();
        let current_path = self.current_path.clone();

        // First pass: collect all entries with their sizes
        let walk = WalkDir::new(&root)
            .skip_hidden(false)
            .follow_links(false) // Don't follow symlinks to avoid cycles and double-counting
            .parallelism(jwalk::Parallelism::RayonNewPool(num_cpus()));

        for entry in walk {
            if cancel_flag.load(Ordering::SeqCst) {
                return Err("Scan cancelled".to_string());
            }

            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue, // Skip permission errors
            };

            let path = entry.path();
            let path_str = path.to_string_lossy().to_string();

            // Update current path for progress
            if files_scanned.load(Ordering::SeqCst) % 100 == 0 {
                *current_path.write() = path_str.clone();
            }

            let metadata = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };

            let size = if metadata.is_file() {
                // Use actual disk usage instead of logical size.
                // This handles cloud files (OneDrive, iCloud) that report full size
                // but aren't actually stored locally.
                // st_blocks is always in 512-byte units per POSIX standard.
                #[cfg(unix)]
                const BLOCK_SIZE: u64 = 512;
                #[cfg(unix)]
                {
                    metadata.blocks() * BLOCK_SIZE
                }
                #[cfg(not(unix))]
                {
                    metadata.len()
                }
            } else {
                0
            };

            let is_dir = metadata.is_dir();
            let name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| path_str.clone());

            files_scanned.fetch_add(1, Ordering::SeqCst);
            if !is_dir {
                total_size.fetch_add(size, Ordering::SeqCst);
            }

            let node = FileNode {
                name,
                path: path_str.clone(),
                size,
                file_count: if is_dir { 0 } else { 1 },
                is_directory: is_dir,
                children: if is_dir { Some(Vec::new()) } else { None },
            };

            // Store node size
            sizes.write().insert(path_str.clone(), size);
            file_counts
                .write()
                .insert(path_str.clone(), if is_dir { 0 } else { 1 });

            // Add to parent's children list
            if let Some(parent) = path.parent() {
                let parent_str = parent.to_string_lossy().to_string();
                entries
                    .write()
                    .entry(parent_str)
                    .or_insert_with(Vec::new)
                    .push(node);
            } else {
                // This is the root
                entries
                    .write()
                    .entry(String::new())
                    .or_insert_with(Vec::new)
                    .push(node);
            }
        }

        if cancel_flag.load(Ordering::SeqCst) {
            return Err("Scan cancelled".to_string());
        }

        // Build the tree structure from collected data
        let root_str = root.to_string_lossy().to_string();
        build_tree(&root_str, &entries, &sizes, &file_counts)
            .ok_or_else(|| "Failed to build tree".to_string())
    }
}

fn build_tree(
    path: &str,
    entries: &Arc<RwLock<HashMap<String, Vec<FileNode>>>>,
    sizes: &Arc<RwLock<HashMap<String, u64>>>,
    file_counts: &Arc<RwLock<HashMap<String, u64>>>,
) -> Option<FileNode> {
    let entries_map = entries.read();
    let children_nodes = entries_map.get(path);

    let path_buf = PathBuf::from(path);
    let name = path_buf
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string());

    let is_directory = path_buf.is_dir();

    if is_directory {
        let mut children: Vec<FileNode> = Vec::new();
        let mut total_size = 0u64;
        let mut total_file_count = 0u64;

        if let Some(child_nodes) = children_nodes {
            for child in child_nodes {
                if child.is_directory {
                    // Recursively build subtree
                    if let Some(subtree) = build_tree(&child.path, entries, sizes, file_counts) {
                        total_size += subtree.size;
                        total_file_count += subtree.file_count;
                        children.push(subtree);
                    }
                } else {
                    total_size += child.size;
                    total_file_count += 1;
                    children.push(child.clone());
                }
            }
        }

        // Sort children by size descending
        children.sort_by(|a, b| b.size.cmp(&a.size));

        Some(FileNode {
            name,
            path: path.to_string(),
            size: total_size,
            file_count: total_file_count,
            is_directory: true,
            children: Some(children),
        })
    } else {
        let size = sizes.read().get(path).copied().unwrap_or(0);
        Some(FileNode {
            name,
            path: path.to_string(),
            size,
            file_count: 1,
            is_directory: false,
            children: None,
        })
    }
}

fn num_cpus() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}

/// Rescan a single path and return updated FileNode, or None if it no longer exists
pub fn rescan_path(path: &str) -> Option<FileNode> {
    let path_buf = PathBuf::from(path);

    if !path_buf.exists() {
        return None;
    }

    let metadata = path_buf.metadata().ok()?;
    let name = path_buf
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string());

    if metadata.is_dir() {
        // Scan the directory
        let mut total_size = 0u64;
        let mut total_file_count = 0u64;
        let mut children: Vec<FileNode> = Vec::new();

        let walk = WalkDir::new(&path_buf)
            .skip_hidden(false)
            .min_depth(1)
            .max_depth(1);

        for entry in walk.into_iter().flatten() {
            let child_path = entry.path();
            let child_path_str = child_path.to_string_lossy().to_string();

            if let Some(child_node) = rescan_path(&child_path_str) {
                total_size += child_node.size;
                total_file_count += child_node.file_count;
                children.push(child_node);
            }
        }

        children.sort_by(|a, b| b.size.cmp(&a.size));

        Some(FileNode {
            name,
            path: path.to_string(),
            size: total_size,
            file_count: total_file_count,
            is_directory: true,
            children: Some(children),
        })
    } else {
        // Use actual disk usage instead of logical size (512-byte blocks per POSIX)
        #[cfg(unix)]
        const BLOCK_SIZE: u64 = 512;
        #[cfg(unix)]
        let size = metadata.blocks() * BLOCK_SIZE;
        #[cfg(not(unix))]
        let size = metadata.len();

        Some(FileNode {
            name,
            path: path.to_string(),
            size,
            file_count: 1,
            is_directory: false,
            children: None,
        })
    }
}
