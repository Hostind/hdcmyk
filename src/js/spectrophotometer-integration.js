// Live Spectrophotometer Integration with Folder Monitoring
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5 - Live spectrophotometer integration with automatic CSV ingestion

console.log('Spectrophotometer Integration module loading...');

/**
 * Spectrophotometer Integration Manager
 * Handles live folder monitoring and automatic CSV file ingestion
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
class SpectrophotometerIntegration {
    constructor(gridManager, options = {}) {
        this.gridManager = gridManager;
        this.options = {
            monitorInterval: 2000, // Check for new files every 2 seconds
            supportedExtensions: ['.csv', '.txt'],
            autoIngest: true,
            showNotifications: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            ...options
        };
        
        // Connection state
        this.isConnected = false;
        this.folderHandle = null;
        this.monitoringInterval = null;
        this.processedFiles = new Set();
        
        // File System Access API support detection
        this.hasFileSystemAccess = 'showDirectoryPicker' in window;
        
        // Event callbacks
        this.callbacks = {
            onConnectionChange: null,
            onFileDetected: null,
            onFileProcessed: null,
            onError: null
        };
        
        // Statistics
        this.stats = {
            filesProcessed: 0,
            lastProcessedTime: null,
            totalDataPoints: 0,
            errors: []
        };
        
        this.initialize();
    }

    /**
     * Initialize spectrophotometer integration
     * Requirements: 7.1 - Add File System Access API support for folder connection
     */
    initialize() {
        console.log('Initializing Spectrophotometer Integration...');
        console.log('File System Access API support:', this.hasFileSystemAccess);
        
        // Create UI components
        this.createUI();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Setup drag-and-drop fallback
        this.setupDragDropFallback();
        
        console.log('Spectrophotometer Integration initialized');
    }
   
 /**
     * Create UI components for spectrophotometer integration
     */
    createUI() {
        // Find or create container for spectrophotometer controls
        let container = document.getElementById('spectrophotometer-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'spectrophotometer-container';
            container.className = 'feature-card';
            
            // Insert after grid manager or at end of advanced features
            const advancedFeatures = document.querySelector('.advanced-features');
            if (advancedFeatures) {
                advancedFeatures.appendChild(container);
            } else {
                document.querySelector('.container').appendChild(container);
            }
        }
        
        container.innerHTML = `
            <div class="spectrophotometer-integration">
                <h3>📡 Live Spectrophotometer Integration</h3>
                <p class="feature-description">
                    Connect to a folder to automatically ingest CSV files from your spectrophotometer
                </p>
                
                <!-- Connection Status -->
                <div class="connection-status">
                    <div class="status-indicator" id="connection-indicator">
                        <div class="status-dot disconnected" id="status-dot"></div>
                        <span class="status-text" id="status-text">Disconnected</span>
                    </div>
                    <div class="connection-info" id="connection-info" style="display: none;">
                        <span class="folder-path" id="folder-path"></span>
                        <span class="file-count" id="file-count">0 files processed</span>
                    </div>
                </div>
                
                <!-- Connection Controls -->
                <div class="connection-controls">
                    ${this.hasFileSystemAccess ? `
                        <button class="btn btn-primary" id="connect-folder-btn">
                            📁 Connect Folder
                        </button>
                        <button class="btn btn-secondary" id="disconnect-folder-btn" style="display: none;">
                            🔌 Disconnect
                        </button>
                    ` : `
                        <div class="fallback-notice">
                            <p>⚠️ Your browser doesn't support automatic folder monitoring.</p>
                            <p>Use drag-and-drop below to import files manually.</p>
                        </div>
                    `}
                    
                    <div class="monitoring-controls" id="monitoring-controls" style="display: none;">
                        <label>
                            <input type="checkbox" id="auto-ingest-checkbox" ${this.options.autoIngest ? 'checked' : ''}>
                            Auto-ingest new files
                        </label>
                        <label>
                            Monitor interval:
                            <select id="monitor-interval-select">
                                <option value="1000">1 second</option>
                                <option value="2000" selected>2 seconds</option>
                                <option value="5000">5 seconds</option>
                                <option value="10000">10 seconds</option>
                            </select>
                        </label>
                    </div>
                </div>
                
                <!-- Drag and Drop Zone -->
                <div class="drag-drop-zone" id="drag-drop-zone">
                    <div class="drop-content">
                        <div class="drop-icon">📊</div>
                        <div class="drop-text">
                            <strong>Drag CSV files here</strong>
                            <span>or click to browse</span>
                        </div>
                        <input type="file" id="manual-file-input" multiple accept=".csv,.txt" style="display: none;">
                    </div>
                </div>
                
                <!-- File Processing Status -->
                <div class="processing-status" id="processing-status" style="display: none;">
                    <div class="processing-header">
                        <h4>Processing Files...</h4>
                        <div class="processing-spinner"></div>
                    </div>
                    <div class="processing-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <span class="progress-text" id="progress-text">0%</span>
                    </div>
                </div>
                
                <!-- Recent Files List -->
                <div class="recent-files" id="recent-files">
                    <h4>Recent Files</h4>
                    <div class="files-list" id="files-list">
                        <div class="no-files">No files processed yet</div>
                    </div>
                </div>
                
                <!-- Statistics -->
                <div class="integration-stats">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-label">Files Processed</div>
                            <div class="stat-value" id="stat-files-processed">0</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Data Points</div>
                            <div class="stat-value" id="stat-data-points">0</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Last Update</div>
                            <div class="stat-value" id="stat-last-update">Never</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Status</div>
                            <div class="stat-value" id="stat-status">Ready</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }   
 /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Connect folder button
        const connectBtn = document.getElementById('connect-folder-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectToFolder());
        }
        
        // Disconnect button
        const disconnectBtn = document.getElementById('disconnect-folder-btn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectFolder());
        }
        
        // Auto-ingest checkbox
        const autoIngestCheckbox = document.getElementById('auto-ingest-checkbox');
        if (autoIngestCheckbox) {
            autoIngestCheckbox.addEventListener('change', (e) => {
                this.options.autoIngest = e.target.checked;
            });
        }
        
        // Monitor interval select
        const intervalSelect = document.getElementById('monitor-interval-select');
        if (intervalSelect) {
            intervalSelect.addEventListener('change', (e) => {
                this.options.monitorInterval = parseInt(e.target.value);
                if (this.isConnected) {
                    this.restartMonitoring();
                }
            });
        }
        
        // Manual file input
        const manualInput = document.getElementById('manual-file-input');
        if (manualInput) {
            manualInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.processManualFiles(Array.from(e.target.files));
                }
            });
        }
    }

    /**
     * Setup drag-and-drop fallback functionality
     * Requirements: 7.4 - Create drag-and-drop fallback for browsers without folder access
     */
    setupDragDropFallback() {
        const dropZone = document.getElementById('drag-drop-zone');
        if (!dropZone) return;
        
        // Click to browse
        dropZone.addEventListener('click', () => {
            document.getElementById('manual-file-input').click();
        });
        
        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                this.options.supportedExtensions.some(ext => 
                    file.name.toLowerCase().endsWith(ext)));
            
            if (files.length > 0) {
                this.processManualFiles(files);
            } else {
                this.showNotification('No supported CSV files found', 'warning');
            }
        });
    }

    /**
     * Connect to folder using File System Access API
     * Requirements: 7.1 - Add File System Access API support for folder connection
     */
    async connectToFolder() {
        if (!this.hasFileSystemAccess) {
            this.showNotification('File System Access API not supported in this browser', 'error');
            return;
        }
        
        try {
            console.log('Requesting folder access...');
            
            // Request folder access
            this.folderHandle = await window.showDirectoryPicker({
                mode: 'read'
            });
            
            console.log('Folder connected:', this.folderHandle.name);
            
            // Update connection state
            this.isConnected = true;
            this.updateConnectionUI();
            
            // Start monitoring
            this.startMonitoring();
            
            // Scan for existing files
            await this.scanExistingFiles();
            
            this.showNotification(`Connected to folder: ${this.folderHandle.name}`, 'success');
            
            // Trigger callback
            if (this.callbacks.onConnectionChange) {
                this.callbacks.onConnectionChange(true, this.folderHandle.name);
            }
            
        } catch (error) {
            console.error('Failed to connect to folder:', error);
            
            if (error.name === 'AbortError') {
                this.showNotification('Folder selection cancelled', 'info');
            } else {
                this.showNotification(`Failed to connect to folder: ${error.message}`, 'error');
            }
        }
    }

    /**
     * Disconnect from folder and stop monitoring
     */
    disconnectFolder() {
        console.log('Disconnecting from folder...');
        
        this.stopMonitoring();
        this.isConnected = false;
        this.folderHandle = null;
        this.processedFiles.clear();
        
        this.updateConnectionUI();
        this.showNotification('Disconnected from folder', 'info');
        
        // Trigger callback
        if (this.callbacks.onConnectionChange) {
            this.callbacks.onConnectionChange(false, null);
        }
    }   
 /**
     * Start monitoring folder for new files
     * Requirements: 7.2 - Implement automatic CSV file detection and ingestion
     */
    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        console.log(`Starting folder monitoring (interval: ${this.options.monitorInterval}ms)`);
        
        this.monitoringInterval = setInterval(() => {
            this.checkForNewFiles();
        }, this.options.monitorInterval);
        
        this.updateStatusIndicator('monitoring');
    }

    /**
     * Stop monitoring folder
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Stopped folder monitoring');
        this.updateStatusIndicator('connected');
    }

    /**
     * Restart monitoring with new interval
     */
    restartMonitoring() {
        if (this.isConnected) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    /**
     * Scan folder for existing files on initial connection
     */
    async scanExistingFiles() {
        if (!this.folderHandle) return;
        
        try {
            console.log('Scanning for existing CSV files...');
            
            const files = [];
            for await (const [name, handle] of this.folderHandle.entries()) {
                if (handle.kind === 'file' && this.isSupportedFile(name)) {
                    files.push({ name, handle });
                }
            }
            
            console.log(`Found ${files.length} existing CSV files`);
            
            if (files.length > 0 && this.options.autoIngest) {
                await this.processFileHandles(files);
            }
            
        } catch (error) {
            console.error('Error scanning existing files:', error);
            this.showNotification('Error scanning existing files', 'error');
        }
    }

    /**
     * Check for new files in monitored folder
     * Requirements: 7.3 - Add file change monitoring with automatic grid updates
     */
    async checkForNewFiles() {
        if (!this.folderHandle || !this.isConnected) return;
        
        try {
            const newFiles = [];
            
            for await (const [name, handle] of this.folderHandle.entries()) {
                if (handle.kind === 'file' && this.isSupportedFile(name)) {
                    const fileKey = `${name}_${handle.lastModified || Date.now()}`;
                    
                    if (!this.processedFiles.has(fileKey)) {
                        newFiles.push({ name, handle, key: fileKey });
                    }
                }
            }
            
            if (newFiles.length > 0) {
                console.log(`Detected ${newFiles.length} new files`);
                
                // Trigger callback
                if (this.callbacks.onFileDetected) {
                    this.callbacks.onFileDetected(newFiles.map(f => f.name));
                }
                
                if (this.options.autoIngest) {
                    await this.processFileHandles(newFiles);
                } else {
                    this.showNotification(`${newFiles.length} new files detected. Enable auto-ingest to process automatically.`, 'info');
                }
            }
            
        } catch (error) {
            console.error('Error checking for new files:', error);
            
            // Handle permission errors
            if (error.name === 'NotAllowedError') {
                this.showNotification('Lost folder access permissions', 'error');
                this.disconnectFolder();
            }
        }
    }

    /**
     * Process file handles from folder monitoring
     */
    async processFileHandles(fileHandles) {
        console.log(`Processing ${fileHandles.length} file handles`);
        
        this.showProcessingStatus(true);
        
        let processed = 0;
        const total = fileHandles.length;
        
        for (const { name, handle, key } of fileHandles) {
            try {
                // Get file from handle
                const file = await handle.getFile();
                
                // Validate file size
                if (file.size > this.options.maxFileSize) {
                    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
                }
                
                // Process file
                await this.processFile(file);
                
                // Mark as processed
                if (key) {
                    this.processedFiles.add(key);
                }
                
                processed++;
                this.updateProcessingProgress(processed, total);
                
            } catch (error) {
                console.error(`Error processing file ${name}:`, error);
                this.stats.errors.push({
                    file: name,
                    error: error.message,
                    timestamp: new Date()
                });
                
                this.showNotification(`Error processing ${name}: ${error.message}`, 'error');
            }
        }
        
        this.showProcessingStatus(false);
        
        if (processed > 0) {
            this.showNotification(`Successfully processed ${processed} files`, 'success');
        }
    }

    /**
     * Process manual files from drag-and-drop or file input
     */
    async processManualFiles(files) {
        console.log(`Processing ${files.length} manual files`);
        
        this.showProcessingStatus(true);
        
        let processed = 0;
        const total = files.length;
        
        for (const file of files) {
            try {
                await this.processFile(file);
                processed++;
                this.updateProcessingProgress(processed, total);
                
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                this.showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
            }
        }
        
        this.showProcessingStatus(false);
        
        if (processed > 0) {
            this.showNotification(`Successfully processed ${processed} files`, 'success');
        }
    } 
   /**
     * Process individual CSV file
     * Requirements: 7.5 - Include connection status indicator and error handling
     */
    async processFile(file) {
        console.log(`Processing file: ${file.name}`);
        
        try {
            // Use existing CSV parser
            const csvParser = new window.CSVParser();
            const result = await csvParser.parseFile(file);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Import data into grid manager
            if (this.gridManager && result.data.length > 0) {
                await this.importDataToGrid(result.data, file.name);
            }
            
            // Update statistics
            this.stats.filesProcessed++;
            this.stats.totalDataPoints += result.data.length;
            this.stats.lastProcessedTime = new Date();
            
            // Add to recent files list
            this.addToRecentFiles(file.name, result.data.length);
            
            // Update UI
            this.updateStatistics();
            
            // Trigger callback
            if (this.callbacks.onFileProcessed) {
                this.callbacks.onFileProcessed(file.name, result.data.length);
            }
            
            console.log(`Successfully processed ${file.name}: ${result.data.length} data points`);
            
        } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
            throw error;
        }
    }

    /**
     * Import parsed data into grid manager
     * Requirements: 7.5 - Automatic grid updates
     */
    async importDataToGrid(data, filename) {
        if (!this.gridManager) {
            throw new Error('Grid manager not available');
        }
        
        console.log(`Importing ${data.length} data points to grid from ${filename}`);
        
        // Determine import strategy based on data size and grid capacity
        const gridCapacity = this.gridManager.dimensions.rows * this.gridManager.dimensions.cols;
        
        if (data.length > gridCapacity) {
            // Need larger grid or selective import
            const newLayout = this.suggestGridLayout(data.length);
            if (newLayout) {
                this.gridManager.setLayout(newLayout);
            }
        }
        
        // Import data using alternating pairing mode (common for spectrophotometer exports)
        let imported = 0;
        
        for (let i = 0; i < data.length - 1; i += 2) {
            const targetData = data[i];
            const pressData = data[i + 1];
            
            if (targetData && pressData) {
                const position = this.gridManager.getNextAvailablePosition();
                if (position) {
                    this.gridManager.setCellData(position.row, position.col, {
                        t: [targetData.l, targetData.a, targetData.b],
                        p: [pressData.l, pressData.a, pressData.b]
                    });
                    imported++;
                } else {
                    break; // Grid is full
                }
            }
        }
        
        console.log(`Imported ${imported} patch pairs to grid`);
        
        // Update grid statistics
        this.gridManager.updateStatistics();
        
        return imported;
    }

    /**
     * Suggest appropriate grid layout based on data size
     */
    suggestGridLayout(dataSize) {
        const pairCount = Math.floor(dataSize / 2);
        
        if (pairCount <= 24) return '4x6';
        if (pairCount <= 48) return '6x8';
        if (pairCount <= 100) return '10x10';
        
        return null; // Data too large for available layouts
    }

    /**
     * Check if file is supported
     */
    isSupportedFile(filename) {
        return this.options.supportedExtensions.some(ext => 
            filename.toLowerCase().endsWith(ext));
    }

    /**
     * Update connection UI state
     */
    updateConnectionUI() {
        const indicator = document.getElementById('connection-indicator');
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const connectionInfo = document.getElementById('connection-info');
        const connectBtn = document.getElementById('connect-folder-btn');
        const disconnectBtn = document.getElementById('disconnect-folder-btn');
        const monitoringControls = document.getElementById('monitoring-controls');
        
        if (this.isConnected) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected';
            connectionInfo.style.display = 'block';
            
            if (this.folderHandle) {
                document.getElementById('folder-path').textContent = this.folderHandle.name;
            }
            
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (monitoringControls) monitoringControls.style.display = 'block';
        } else {
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Disconnected';
            connectionInfo.style.display = 'none';
            
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (monitoringControls) monitoringControls.style.display = 'none';
        }
    }

    /**
     * Update status indicator
     */
    updateStatusIndicator(status) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        switch (status) {
            case 'monitoring':
                statusDot.className = 'status-dot monitoring';
                statusText.textContent = 'Monitoring';
                break;
            case 'connected':
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Connected';
                break;
            case 'processing':
                statusDot.className = 'status-dot processing';
                statusText.textContent = 'Processing';
                break;
            default:
                statusDot.className = 'status-dot disconnected';
                statusText.textContent = 'Disconnected';
        }
    }    /**

     * Show/hide processing status
     */
    showProcessingStatus(show) {
        const processingStatus = document.getElementById('processing-status');
        if (processingStatus) {
            processingStatus.style.display = show ? 'block' : 'none';
        }
        
        if (show) {
            this.updateStatusIndicator('processing');
        } else {
            this.updateStatusIndicator(this.isConnected ? 'monitoring' : 'disconnected');
        }
    }

    /**
     * Update processing progress
     */
    updateProcessingProgress(current, total) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const percentage = Math.round((current / total) * 100);
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}% (${current}/${total})`;
        }
    }

    /**
     * Add file to recent files list
     */
    addToRecentFiles(filename, dataPoints) {
        const filesList = document.getElementById('files-list');
        if (!filesList) return;
        
        // Remove "no files" message
        const noFiles = filesList.querySelector('.no-files');
        if (noFiles) {
            noFiles.remove();
        }
        
        // Create file entry
        const fileEntry = document.createElement('div');
        fileEntry.className = 'file-entry';
        fileEntry.innerHTML = `
            <div class="file-info">
                <div class="file-name">${filename}</div>
                <div class="file-details">${dataPoints} data points • ${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="file-status">✓</div>
        `;
        
        // Add to top of list
        filesList.insertBefore(fileEntry, filesList.firstChild);
        
        // Limit to 10 recent files
        const entries = filesList.querySelectorAll('.file-entry');
        if (entries.length > 10) {
            entries[entries.length - 1].remove();
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        document.getElementById('stat-files-processed').textContent = this.stats.filesProcessed;
        document.getElementById('stat-data-points').textContent = this.stats.totalDataPoints;
        document.getElementById('stat-last-update').textContent = 
            this.stats.lastProcessedTime ? this.stats.lastProcessedTime.toLocaleTimeString() : 'Never';
        document.getElementById('stat-status').textContent = 
            this.isConnected ? 'Monitoring' : 'Ready';
        
        // Update file count in connection info
        const fileCount = document.getElementById('file-count');
        if (fileCount) {
            fileCount.textContent = `${this.stats.filesProcessed} files processed`;
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        if (!this.options.showNotifications) return;
        
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create toast notification
        this.createToast(message, type);
    }

    /**
     * Create toast notification
     */
    createToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Toast icons
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close">×</button>
            </div>
        `;
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        // Add to container
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Set callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Get current statistics
     */
    getStatistics() {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    resetStatistics() {
        this.stats = {
            filesProcessed: 0,
            lastProcessedTime: null,
            totalDataPoints: 0,
            errors: []
        };
        this.updateStatistics();
    }

    /**
     * Export processed files list
     */
    exportProcessedFiles() {
        const data = {
            statistics: this.stats,
            processedFiles: Array.from(this.processedFiles),
            connectionInfo: {
                isConnected: this.isConnected,
                folderName: this.folderHandle ? this.folderHandle.name : null
            },
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `spectrophotometer-log-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.disconnectFolder();
        
        // Remove toast container
        const toastContainer = document.querySelector('.toast-container');
        if (toastContainer) {
            toastContainer.remove();
        }
        
        console.log('Spectrophotometer Integration cleaned up');
    }
}

// Export for use in other modules
window.SpectrophotometerIntegration = SpectrophotometerIntegration;

console.log('Spectrophotometer Integration module loaded successfully');