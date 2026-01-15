const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

// State
let rootData = null;
let currentNode = null;
let navigationStack = [];
let isScanning = false;
let progressInterval = null;
let currentSort = 'size';
let colorByType = false;
let isDarkMode = false;

// DOM Elements
const selectFolderBtn = document.getElementById('selectFolderBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressFiles = document.getElementById('progressFiles');
const progressSize = document.getElementById('progressSize');
const progressPath = document.getElementById('progressPath');
const fileList = document.getElementById('fileList');
const treemapContainer = document.getElementById('treemapContainer');
const breadcrumb = document.getElementById('breadcrumb');
const sortSelect = document.getElementById('sortSelect');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const totalSizeEl = document.getElementById('totalSize');
const totalFilesEl = document.getElementById('totalFiles');
const totalFoldersEl = document.getElementById('totalFolders');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const colorModeToggle = document.getElementById('colorModeToggle');

// Utility functions
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num) {
  return num.toLocaleString();
}

// Random muted color palette
function getRandomColor() {
  const colors = [
    '#5B8FB9', '#7C93C3', '#9A86A4', '#C47AFF', '#6C9BCF',
    '#E8A87C', '#C38D9E', '#85C88A', '#7EB5A6', '#D4A5A5',
    '#89ABE3', '#AA96DA', '#FCBAD3', '#A8D8EA', '#95E1D3',
    '#F38181', '#FCE38A', '#EAFFD0', '#B5EAEA', '#F9ED69',
    '#6EB5FF', '#FF6F91', '#FF9671', '#FFC75F', '#845EC2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// File type categorization
function getFileTypeCategory(item) {
  if (item.is_directory) return 'folder';

  const ext = item.name.split('.').pop().toLowerCase();

  // Media files
  const mediaExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico',
                     'mp3', 'mp4', 'mov', 'avi', 'mkv', 'wav', 'flac', 'aac',
                     'ogg', 'webm', 'm4a', 'm4v', 'heic', 'heif'];
  if (mediaExts.includes(ext)) return 'media';

  // Application files
  const appExts = ['app', 'exe', 'dmg', 'pkg', 'deb', 'rpm', 'msi', 'appimage'];
  if (appExts.includes(ext)) return 'app';

  // System/config files
  const systemExts = ['sys', 'dll', 'so', 'dylib', 'plist', 'conf', 'cfg', 'ini', 'log'];
  const systemPrefixes = ['.', '_'];
  if (systemExts.includes(ext) || systemPrefixes.some(p => item.name.startsWith(p))) {
    return 'system';
  }

  return 'other';
}

function getFileTypeColor(category) {
  const colors = {
    'folder': '#FF8C00',     // Dark orange for folders
    'media': '#32CD32',      // Lime green for media
    'app': '#9370DB',        // Medium purple for apps
    'system': '#808080',     // Gray for system
    'other': '#4A90D9'       // Muted blue for other files
  };
  return colors[category] || colors.other;
}

function getColorForItem(item) {
  if (colorByType) {
    const category = getFileTypeCategory(item);
    return getFileTypeColor(category);
  }
  return getRandomColor();
}

// Determine if text should be white or black based on background color
function getTextColorForBackground(bgColor) {
  let r, g, b;

  // Parse hex color
  if (bgColor.startsWith('#')) {
    const hex = bgColor.slice(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else {
    // Parse rgb color
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#FFFFFF';
    r = parseInt(match[1]);
    g = parseInt(match[2]);
    b = parseInt(match[3]);
  }

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// File list rendering
function renderFileList(node) {
  if (!node || !node.children) {
    fileList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>Select a folder to analyze disk usage</p>
      </div>
    `;
    return;
  }

  const children = [...node.children];

  // Sort children
  switch (currentSort) {
    case 'size':
      children.sort((a, b) => b.size - a.size);
      break;
    case 'name':
      children.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'files':
      children.sort((a, b) => b.file_count - a.file_count);
      break;
  }

  const maxSize = Math.max(...children.map(c => c.size));

  fileList.innerHTML = children.map((item, index) => {
    const percent = node.size > 0 ? ((item.size / node.size) * 100).toFixed(1) : 0;
    const barWidth = maxSize > 0 ? (item.size / maxSize) * 100 : 0;

    return `
      <div class="file-item" data-path="${item.path}" data-is-dir="${item.is_directory}">
        <div class="file-icon ${item.is_directory ? 'folder' : 'file'}">
          ${item.is_directory
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>'
          }
        </div>
        <div class="file-info">
          <div class="file-name" title="${item.name}">${item.name}</div>
          <div class="file-meta">
            <span class="file-size">${formatSize(item.size)}</span>
            <span class="file-percent">${percent}%</span>
            ${item.is_directory ? `<span>${formatNumber(item.file_count)} files</span>` : ''}
          </div>
        </div>
        <button class="btn-action btn-reload" data-path="${item.path}" title="Reload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
        <button class="btn-action btn-reveal" data-path="${item.path}" title="Reveal in file manager">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
        <div class="size-bar-container">
          <div class="size-bar" style="width: ${barWidth}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Add click handlers for navigation
  fileList.querySelectorAll('.file-item').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't navigate if clicking action buttons
      if (e.target.closest('.btn-action')) return;

      const path = el.dataset.path;
      const isDir = el.dataset.isDir === 'true';

      if (isDir) {
        const childNode = node.children.find(c => c.path === path);
        if (childNode && childNode.children) {
          navigateTo(childNode);
        }
      }
    });
  });

  // Add click handlers for reload buttons
  fileList.querySelectorAll('.btn-reload').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isScanning) return;

      const path = btn.dataset.path;

      // Show progress bar and cancel button
      isScanning = true;
      selectFolderBtn.disabled = true;
      cancelBtn.style.display = 'inline-flex';
      progressContainer.style.display = 'block';
      progressFill.style.width = '0%';
      progressFiles.textContent = 'Refreshing...';
      progressSize.textContent = '';
      progressPath.textContent = path;

      startProgressPolling();

      try {
        const updated = await invoke('rescan_item', { path });
        const index = currentNode.children.findIndex(c => c.path === path);

        if (index !== -1) {
          if (updated) {
            // Update the item in place
            currentNode.children[index] = updated;
            // Recalculate parent size
            currentNode.size = currentNode.children.reduce((sum, c) => sum + c.size, 0);
            currentNode.file_count = currentNode.children.reduce((sum, c) => sum + c.file_count, 0);
          } else {
            // Item no longer exists, remove it
            currentNode.children.splice(index, 1);
            currentNode.size = currentNode.children.reduce((sum, c) => sum + c.size, 0);
            currentNode.file_count = currentNode.children.reduce((sum, c) => sum + c.file_count, 0);
          }
          updateView();
        }
      } catch (err) {
        console.error('Failed to reload item:', err);
      } finally {
        stopProgressPolling();
        progressContainer.style.display = 'none';
        cancelBtn.style.display = 'none';
        selectFolderBtn.disabled = false;
        isScanning = false;
      }
    });
  });

  // Add click handlers for reveal buttons
  fileList.querySelectorAll('.btn-reveal').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const path = btn.dataset.path;
      try {
        await invoke('reveal_in_file_manager', { path });
      } catch (err) {
        console.error('Failed to reveal file:', err);
      }
    });
  });
}

// Treemap rendering
function renderTreemap(node) {
  if (!node || !node.children || node.children.length === 0) {
    treemapContainer.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <p>Treemap will appear here after scanning</p>
      </div>
    `;
    return;
  }

  // Clear container
  treemapContainer.innerHTML = '';

  const width = treemapContainer.clientWidth;
  const height = treemapContainer.clientHeight;

  // Create hierarchy for D3
  const hierarchy = d3.hierarchy(node)
    .sum(d => d.is_directory ? 0 : d.size)
    .sort((a, b) => b.value - a.value);

  // Create treemap layout
  const treemap = d3.treemap()
    .size([width, height])
    .padding(2)
    .round(true);

  treemap(hierarchy);

  // Get leaves (only show immediate children to avoid clutter)
  const leaves = hierarchy.children || [];

  // Create SVG
  const svg = d3.select(treemapContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Create tooltip
  const tooltip = d3.select(treemapContainer)
    .append('div')
    .attr('class', 'treemap-tooltip')
    .style('display', 'none');

  // Add rectangles
  const cells = svg.selectAll('g')
    .data(leaves)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // Pre-compute colors for each cell
  const cellColors = leaves.map(d => getColorForItem(d.data));

  cells.append('rect')
    .attr('class', 'treemap-node')
    .attr('width', d => Math.max(0, d.x1 - d.x0))
    .attr('height', d => Math.max(0, d.y1 - d.y0))
    .attr('fill', (d, i) => cellColors[i])
    .style('cursor', d => d.data.is_directory ? 'pointer' : 'default')
    .on('mouseover', function(event, d) {
      const percent = node.size > 0 ? ((d.data.size / node.size) * 100).toFixed(1) : 0;
      tooltip
        .style('display', 'block')
        .html(`
          <div class="tooltip-name">${d.data.name}</div>
          <div class="tooltip-size">${formatSize(d.data.size)} (${percent}%)</div>
          <div class="tooltip-meta">
            ${d.data.is_directory
              ? `${formatNumber(d.data.file_count)} files`
              : d.data.path}
          </div>
        `);
    })
    .on('mousemove', function(event) {
      const containerRect = treemapContainer.getBoundingClientRect();
      let left = event.clientX - containerRect.left + 10;
      let top = event.clientY - containerRect.top + 10;

      // Keep tooltip within container
      const tooltipRect = tooltip.node().getBoundingClientRect();
      if (left + tooltipRect.width > width) {
        left = event.clientX - containerRect.left - tooltipRect.width - 10;
      }
      if (top + tooltipRect.height > height) {
        top = event.clientY - containerRect.top - tooltipRect.height - 10;
      }

      tooltip
        .style('left', left + 'px')
        .style('top', top + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('display', 'none');
    })
    .on('click', function(event, d) {
      if (d.data.is_directory && d.data.children && d.data.children.length > 0) {
        navigateTo(d.data);
      }
    });

  // Add labels with dynamic text color
  cells.append('text')
    .attr('class', 'treemap-label')
    .attr('x', 4)
    .attr('y', 14)
    .style('fill', (d, i) => getTextColorForBackground(cellColors[i]))
    .text(d => {
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;
      if (width < 40 || height < 20) return '';
      const maxChars = Math.floor(width / 7);
      return d.data.name.length > maxChars
        ? d.data.name.substring(0, maxChars - 2) + '...'
        : d.data.name;
    });

  // Add size labels for larger cells
  cells.append('text')
    .attr('class', 'treemap-label')
    .attr('x', 4)
    .attr('y', 28)
    .style('font-size', '10px')
    .style('opacity', 0.8)
    .style('fill', (d, i) => getTextColorForBackground(cellColors[i]))
    .text(d => {
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;
      if (width < 60 || height < 35) return '';
      return formatSize(d.data.size);
    });
}

// Breadcrumb rendering
function renderBreadcrumb() {
  if (!currentNode) {
    breadcrumb.innerHTML = '';
    return;
  }

  const parts = [];

  // Add root
  if (rootData) {
    parts.push({ name: rootData.name || 'Root', node: rootData });
  }

  // Add navigation stack items
  for (const node of navigationStack) {
    if (node !== rootData) {
      parts.push({ name: node.name, node: node });
    }
  }

  // Add current if not in stack
  if (currentNode !== rootData && !navigationStack.includes(currentNode)) {
    parts.push({ name: currentNode.name, node: currentNode });
  }

  breadcrumb.innerHTML = parts.map((part, index) => {
    const isLast = index === parts.length - 1;
    return `
      <span class="breadcrumb-item" data-index="${index}">${part.name}</span>
      ${!isLast ? '<span class="breadcrumb-separator">/</span>' : ''}
    `;
  }).join('') + `
    <button class="btn-breadcrumb-action" id="breadcrumbRefresh" title="Refresh current folder">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
    </button>
    <button class="btn-breadcrumb-action" id="breadcrumbReveal" title="Open in file manager">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </button>
  `;

  // Add click handlers for breadcrumb items
  breadcrumb.querySelectorAll('.breadcrumb-item').forEach((el, index) => {
    el.addEventListener('click', () => {
      const targetNode = parts[index].node;
      if (targetNode !== currentNode) {
        // Trim navigation stack to this point
        navigationStack = navigationStack.slice(0, index);
        currentNode = targetNode;
        updateView();
      }
    });
  });

  // Refresh current folder
  document.getElementById('breadcrumbRefresh').addEventListener('click', async () => {
    if (!currentNode || isScanning) return;

    // Show progress bar and cancel button
    isScanning = true;
    selectFolderBtn.disabled = true;
    cancelBtn.style.display = 'inline-flex';
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressFiles.textContent = 'Refreshing...';
    progressSize.textContent = '';
    progressPath.textContent = currentNode.path;

    startProgressPolling();

    try {
      const updated = await invoke('rescan_item', { path: currentNode.path });
      if (updated) {
        // Update current node in place
        Object.assign(currentNode, updated);
        updateView();
      } else {
        // Folder was deleted, go back
        if (navigationStack.length > 0) {
          zoomOut();
        }
      }
    } catch (err) {
      console.error('Failed to refresh folder:', err);
      if (err !== 'Scan cancelled') {
        // Only log non-cancellation errors
      }
    } finally {
      stopProgressPolling();
      progressContainer.style.display = 'none';
      cancelBtn.style.display = 'none';
      selectFolderBtn.disabled = false;
      isScanning = false;
    }
  });

  // Reveal current folder in file manager
  document.getElementById('breadcrumbReveal').addEventListener('click', async () => {
    if (!currentNode) return;
    try {
      await invoke('reveal_in_file_manager', { path: currentNode.path });
    } catch (err) {
      console.error('Failed to reveal folder:', err);
    }
  });

  // Show/hide zoom out button
  zoomOutBtn.style.display = navigationStack.length > 0 ? 'inline-flex' : 'none';
}

// Navigation
function navigateTo(node) {
  if (currentNode) {
    navigationStack.push(currentNode);
  }
  currentNode = node;
  updateView();
}

function zoomOut() {
  if (navigationStack.length > 0) {
    currentNode = navigationStack.pop();
    updateView();
  }
}

// Update all views
function updateView() {
  renderFileList(currentNode);
  renderTreemap(currentNode);
  renderBreadcrumb();
  updateStats();
}

// Update footer stats
function updateStats() {
  if (!currentNode) {
    totalSizeEl.textContent = 'Total: --';
    totalFilesEl.textContent = 'Files: --';
    totalFoldersEl.textContent = 'Folders: --';
    return;
  }

  totalSizeEl.textContent = `Total: ${formatSize(currentNode.size)}`;
  totalFilesEl.textContent = `Files: ${formatNumber(currentNode.file_count)}`;

  const folderCount = currentNode.children
    ? currentNode.children.filter(c => c.is_directory).length
    : 0;
  totalFoldersEl.textContent = `Folders: ${formatNumber(folderCount)}`;
}

// Progress polling
function startProgressPolling() {
  progressInterval = setInterval(async () => {
    try {
      const progress = await invoke('get_scan_progress');
      progressFiles.textContent = `${formatNumber(progress.files_scanned)} files scanned`;
      progressSize.textContent = formatSize(progress.total_size);
      progressPath.textContent = progress.current_path;

      // Animate progress bar (indeterminate style)
      const currentWidth = parseFloat(progressFill.style.width) || 0;
      progressFill.style.width = ((currentWidth + 5) % 100) + '%';
    } catch (e) {
      console.error('Progress poll error:', e);
    }
  }, 100);
}

function stopProgressPolling() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// Scanning
async function startScan(path) {
  if (isScanning) return;

  isScanning = true;
  selectFolderBtn.disabled = true;
  cancelBtn.style.display = 'inline-flex';
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';

  startProgressPolling();

  try {
    const result = await invoke('scan_directory', { path });

    rootData = result;
    currentNode = result;
    navigationStack = [];

    updateView();
  } catch (e) {
    console.error('Scan error:', e);
    if (e !== 'Scan cancelled') {
      alert('Scan failed: ' + e);
    }
  } finally {
    isScanning = false;
    selectFolderBtn.disabled = false;
    cancelBtn.style.display = 'none';
    progressContainer.style.display = 'none';
    stopProgressPolling();
  }
}

async function cancelScan() {
  try {
    await invoke('cancel_scan');
  } catch (e) {
    console.error('Cancel error:', e);
  }
}

// Folder selection
async function selectFolder() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select a folder to analyze'
    });

    if (selected) {
      startScan(selected);
    }
  } catch (e) {
    console.error('Folder selection error:', e);
  }
}

// Event listeners
selectFolderBtn.addEventListener('click', selectFolder);
cancelBtn.addEventListener('click', cancelScan);
zoomOutBtn.addEventListener('click', zoomOut);

sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderFileList(currentNode);
});

// Theme toggle
themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

  // Update icon
  if (isDarkMode) {
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
    `;
  } else {
    themeIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
  }

  // Re-render treemap to update border colors
  if (currentNode) {
    renderTreemap(currentNode);
  }
});

// Color mode toggle (file type vs random)
colorModeToggle.addEventListener('click', () => {
  colorByType = !colorByType;
  colorModeToggle.classList.toggle('active', colorByType);

  // Re-render treemap with new colors
  if (currentNode) {
    renderTreemap(currentNode);
  }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (currentNode) {
      renderTreemap(currentNode);
    }
  }, 250);
});

// Disable default context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  // Get home directory and show in breadcrumb as hint
  try {
    const homeDir = await invoke('get_home_directory');
    console.log('Home directory:', homeDir);
  } catch (e) {
    console.error('Could not get home directory:', e);
  }
});
