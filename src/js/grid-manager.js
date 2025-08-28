// Grid Management System
// Requirements: 3.1, 3.2, 3.3 - Grid management system supporting multiple layouts with interactive cells

console.log('Grid Management System loading...');

/**
 * Grid Manager - Handles patch grid creation, data management, and user interactions
 * Requirements: 3.1, 3.2, 3.3 - Create grid management system supporting 4×6, 6×8, and 10×10 layouts
 */
class GridManager {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            defaultLayout: '6x8',
            enableEditing: true,
            enableHeatmap: true,
            tolerance: 2.0,
            autoCalculate: true,
            ...options
        };
        
        // Grid state
        this.gridData = null;
        this.dimensions = { rows: 0, cols: 0 };
        this.selectedCell = null;
        this.editMode = false;
        
        // Components
        this.csvParser = new window.CSVParser();
        this.heatmapRenderer = null;
        
        // Statistics
        this.statistics = {
            totalPatches: 0,
            validPatches: 0,
            passCount: 0,
            failCount: 0,
            averageDeltaE: 0,
            maxDeltaE: 0,
            medianDeltaE: 0,
            percentile95: 0
        };
        
        // Event callbacks
        this.callbacks = {
            onDataChange: null,
            onCellEdit: null,
            onStatisticsUpdate: null
        };
        
        this.initialize();
    }

    /**
     * Initialize grid manager
     */
    initialize() {
        console.log('Initializing Grid Manager...');
        
        // Create UI elements
        this.createUI();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Initialize with default layout
        this.createGrid(6, 8); // Default 6x8 layout
        
        console.log('Grid Manager initialized');
    }

    /**
     * Create UI elements for grid management
     */
    createUI() {
        this.container.innerHTML = `
            <div class="grid-manager">
                <!-- Grid Controls -->
                <div class="grid-controls">
                    <div class="control-section">
                        <h3>Grid Layout</h3>
                        <div class="layout-buttons">
                            <button class="layout-btn" data-layout="4x6">4×6 (24 patches)</button>
                            <button class="layout-btn active" data-layout="6x8">6×8 (48 patches)</button>
                            <button class="layout-btn" data-layout="10x10">10×10 (100 patches)</button>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>Data Import</h3>
                        <div class="import-controls">
                            <input type="file" id="csv-file-input" accept=".csv,.txt" style="display: none;">
                            <button class="import-btn" id="import-csv-btn">
                                📊 Import CSV
                            </button>
                            <button class="import-btn" id="import-paired-btn">
                                📋 Import Paired Data
                            </button>
                            <div class="import-options">
                                <label>
                                    <input type="radio" name="pairing-mode" value="alternating" checked>
                                    Alternating (Target/Press/Target/Press...)
                                </label>
                                <label>
                                    <input type="radio" name="pairing-mode" value="sequential">
                                    Sequential (All targets first, then all press)
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <h3>Settings</h3>
                        <div class="settings-controls">
                            <label>
                                Tolerance (ΔE):
                                <input type="number" id="tolerance-input" value="2.0" min="0.1" max="10" step="0.1">
                            </label>
                            <label>
                                <input type="checkbox" id="show-values-checkbox" checked>
                                Show ΔE values in cells
                            </label>
                            <label>
                                <input type="checkbox" id="auto-calculate-checkbox" checked>
                                Auto-calculate on changes
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Grid Display Area -->
                <div class="grid-display">
                    <div class="grid-header">
                        <h3>Color Patch Grid</h3>
                        <div class="grid-stats" id="grid-statistics">
                            <span class="stat-item">Total: <span id="stat-total">0</span></span>
                            <span class="stat-item">Pass: <span id="stat-pass">0</span></span>
                            <span class="stat-item">Fail: <span id="stat-fail">0</span></span>
                            <span class="stat-item">Avg ΔE: <span id="stat-avg">--</span></span>
                        </div>
                    </div>
                    
                    <!-- Interactive Grid Table -->
                    <div class="grid-table-container">
                        <table class="grid-table" id="grid-table">
                            <!-- Grid cells will be generated here -->
                        </table>
                    </div>
                    
                    <!-- Heatmap Visualization -->
                    <div class="heatmap-container">
                        <h4>Heatmap Visualization</h4>
                        <canvas id="grid-heatmap" class="heatmap-canvas"></canvas>
                        <div class="heatmap-legend">
                            <div class="legend-item">
                                <div class="legend-color" style="background: #10b981;"></div>
                                <span>Excellent (≤0.5)</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color" style="background: #84cc16;"></div>
                                <span>Very Good (≤1.0)</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color" style="background: #f59e0b;"></div>
                                <span>Acceptable (≤2.0)</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color" style="background: #ef4444;"></div>
                                <span>Poor (>2.0)</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cell Edit Modal -->
                <div class="cell-edit-modal" id="cell-edit-modal" style="display: none;">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Edit Patch <span id="edit-patch-id"></span></h3>
                            <button class="modal-close" id="close-edit-modal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="edit-sections">
                                <div class="edit-section">
                                    <h4>Target LAB Values</h4>
                                    <div class="lab-inputs">
                                        <label>L*: <input type="number" id="edit-target-l" step="0.1" min="0" max="100"></label>
                                        <label>a*: <input type="number" id="edit-target-a" step="0.1" min="-128" max="127"></label>
                                        <label>b*: <input type="number" id="edit-target-b" step="0.1" min="-128" max="127"></label>
                                    </div>
                                </div>
                                <div class="edit-section">
                                    <h4>Press LAB Values</h4>
                                    <div class="lab-inputs">
                                        <label>L*: <input type="number" id="edit-press-l" step="0.1" min="0" max="100"></label>
                                        <label>a*: <input type="number" id="edit-press-a" step="0.1" min="-128" max="127"></label>
                                        <label>b*: <input type="number" id="edit-press-b" step="0.1" min="-128" max="127"></label>
                                    </div>
                                </div>
                            </div>
                            <div class="edit-result">
                                <div class="calculated-delta">
                                    ΔE2000: <span id="edit-calculated-delta">--</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancel-edit">Cancel</button>
                            <button class="btn btn-primary" id="save-edit">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize heatmap renderer
        const heatmapCanvas = document.getElementById('grid-heatmap');
        if (heatmapCanvas) {
            this.heatmapRenderer = new window.HeatmapRenderer(heatmapCanvas, {
                showValues: true,
                showTooltips: true
            });
        }
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Layout buttons
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = e.target.dataset.layout;
                this.setLayout(layout);
                
                // Update active button
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // CSV import
        const csvInput = document.getElementById('csv-file-input');
        const importBtn = document.getElementById('import-csv-btn');
        const importPairedBtn = document.getElementById('import-paired-btn');
        
        importBtn.addEventListener('click', () => {
            csvInput.click();
        });
        
        importPairedBtn.addEventListener('click', () => {
            csvInput.setAttribute('data-mode', 'paired');
            csvInput.click();
        });
        
        csvInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const mode = e.target.getAttribute('data-mode') || 'single';
                this.importCSV(e.target.files[0], mode);
                e.target.removeAttribute('data-mode');
            }
        });
        
        // Settings
        const toleranceInput = document.getElementById('tolerance-input');
        toleranceInput.addEventListener('change', (e) => {
            this.setTolerance(parseFloat(e.target.value));
        });
        
        const showValuesCheckbox = document.getElementById('show-values-checkbox');
        showValuesCheckbox.addEventListener('change', (e) => {
            if (this.heatmapRenderer) {
                this.heatmapRenderer.options.showValues = e.target.checked;
                this.heatmapRenderer.render();
            }
        });
        
        const autoCalculateCheckbox = document.getElementById('auto-calculate-checkbox');
        autoCalculateCheckbox.addEventListener('change', (e) => {
            this.options.autoCalculate = e.target.checked;
        });
        
        // Cell edit modal
        this.setupEditModalHandlers();
        
        // Heatmap cell clicks
        if (this.heatmapRenderer) {
            this.heatmapRenderer.canvas.addEventListener('cellClick', (e) => {
                const { row, col, cellData } = e.detail;
                this.editCell(row, col);
            });
        }
    }

    /**
     * Setup edit modal event handlers
     */
    setupEditModalHandlers() {
        const modal = document.getElementById('cell-edit-modal');
        const closeBtn = document.getElementById('close-edit-modal');
        const cancelBtn = document.getElementById('cancel-edit');
        const saveBtn = document.getElementById('save-edit');
        
        closeBtn.addEventListener('click', () => this.closeEditModal());
        cancelBtn.addEventListener('click', () => this.closeEditModal());
        saveBtn.addEventListener('click', () => this.saveEditedCell());
        
        // Close modal on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeEditModal());
        
        // Auto-calculate delta E when values change
        const inputs = ['edit-target-l', 'edit-target-a', 'edit-target-b', 
                       'edit-press-l', 'edit-press-a', 'edit-press-b'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            input.addEventListener('input', () => this.updateEditPreview());
        });
    }

    /**
     * Create grid with specified dimensions
     * Requirements: 3.1 - Supporting 4×6, 6×8, and 10×10 layouts
     */
    createGrid(rows, cols) {
        console.log(`Creating ${rows}×${cols} grid`);
        
        this.dimensions = { rows, cols };
        
        // Initialize grid data structure
        this.gridData = Array(rows).fill(null).map(() => 
            Array(cols).fill(null).map(() => ({
                t: null, // Target LAB
                p: null, // Press LAB
                de00: null // Delta E 2000
            }))
        );
        
        // Create HTML table
        this.createGridTable();
        
        // Update heatmap
        if (this.heatmapRenderer) {
            this.heatmapRenderer.setGridData(this.gridData, this.options.tolerance);
        }
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Create HTML table for grid display
     * Requirements: 3.3 - Add interactive grid with editable cells
     */
    createGridTable() {
        const table = document.getElementById('grid-table');
        table.innerHTML = '';
        
        for (let row = 0; row < this.dimensions.rows; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < this.dimensions.cols; col++) {
                const td = document.createElement('td');
                td.className = 'grid-cell';
                td.dataset.row = row;
                td.dataset.col = col;
                
                // Create cell content
                td.innerHTML = `
                    <div class="cell-content">
                        <div class="cell-id">${row + 1}-${col + 1}</div>
                        <div class="cell-delta">--</div>
                        <div class="cell-status"></div>
                    </div>
                `;
                
                // Add click handler for editing
                td.addEventListener('click', () => this.editCell(row, col));
                
                tr.appendChild(td);
            }
            
            table.appendChild(tr);
        }
    }

    /**
     * Set grid layout
     */
    setLayout(layout) {
        const layouts = {
            '4x6': [4, 6],
            '6x8': [6, 8],
            '10x10': [10, 10]
        };
        
        if (layouts[layout]) {
            const [rows, cols] = layouts[layout];
            this.createGrid(rows, cols);
        }
    }

    /**
     * Import CSV data
     * Requirements: 3.2 - Implement CSV import functionality with robust parsing
     */
    async importCSV(file, mode = 'single') {
        console.log(`Importing CSV file: ${file.name} (mode: ${mode})`);
        
        try {
            // Show loading state
            this.showLoadingState('Parsing CSV file...');
            
            // Parse CSV file
            const result = await this.csvParser.parseFile(file);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log('CSV parsed successfully:', result.stats);
            
            // Process data based on mode
            if (mode === 'paired') {
                this.processPairedData(result.data);
            } else {
                this.processSingleData(result.data);
            }
            
            // Update displays
            this.updateGridDisplay();
            this.updateStatistics();
            
            // Show success message
            this.showSuccessMessage(`Imported ${result.stats.validRows} patches successfully`);
            
        } catch (error) {
            console.error('CSV import error:', error);
            this.showErrorMessage(`Failed to import CSV: ${error.message}`);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Process single CSV data (each row is one measurement)
     */
    processSingleData(data) {
        const pairingMode = document.querySelector('input[name="pairing-mode"]:checked').value;
        
        if (pairingMode === 'alternating') {
            // Alternating: Target, Press, Target, Press...
            for (let i = 0; i < data.length - 1; i += 2) {
                const targetData = data[i];
                const pressData = data[i + 1];
                
                if (targetData && pressData) {
                    const position = this.getNextAvailablePosition();
                    if (position) {
                        this.setCellData(position.row, position.col, {
                            t: [targetData.l, targetData.a, targetData.b],
                            p: [pressData.l, pressData.a, pressData.b]
                        });
                    }
                }
            }
        } else {
            // Sequential: All targets first, then all press
            const midPoint = Math.floor(data.length / 2);
            const targets = data.slice(0, midPoint);
            const press = data.slice(midPoint);
            
            for (let i = 0; i < Math.min(targets.length, press.length); i++) {
                const position = this.getPositionByIndex(i);
                if (position) {
                    this.setCellData(position.row, position.col, {
                        t: [targets[i].l, targets[i].a, targets[i].b],
                        p: [press[i].l, press[i].a, press[i].b]
                    });
                }
            }
        }
    }

    /**
     * Process paired CSV data (target and press in same row)
     */
    processPairedData(data) {
        // Assume data has both target and press columns
        // This would need to be enhanced based on actual CSV format
        for (let i = 0; i < data.length; i++) {
            const position = this.getPositionByIndex(i);
            if (position && data[i]) {
                // For now, treat as single measurement
                // This would be enhanced to handle actual paired data format
                this.setCellData(position.row, position.col, {
                    t: [data[i].l, data[i].a, data[i].b],
                    p: [data[i].l, data[i].a, data[i].b] // Placeholder
                });
            }
        }
    }

    /**
     * Get next available grid position
     */
    getNextAvailablePosition() {
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                const cell = this.gridData[row][col];
                if (!cell.t || !cell.p) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Get grid position by linear index
     */
    getPositionByIndex(index) {
        const totalCells = this.dimensions.rows * this.dimensions.cols;
        if (index >= totalCells) return null;
        
        const row = Math.floor(index / this.dimensions.cols);
        const col = index % this.dimensions.cols;
        
        return { row, col };
    }

    /**
     * Set cell data and calculate Delta E
     * Requirements: 3.5 - Add real-time ΔE calculation
     */
    setCellData(row, col, data) {
        if (row >= this.dimensions.rows || col >= this.dimensions.cols) return;
        
        const cell = this.gridData[row][col];
        
        // Update cell data
        if (data.t) cell.t = data.t;
        if (data.p) cell.p = data.p;
        
        // Calculate Delta E if both target and press are available
        if (cell.t && cell.p && window.dE00) {
            cell.de00 = window.dE00(
                { l: cell.t[0], a: cell.t[1], b: cell.t[2] },
                { l: cell.p[0], a: cell.p[1], b: cell.p[2] }
            );
        }
        
        // Update displays
        this.updateCellDisplay(row, col);
        
        if (this.heatmapRenderer) {
            this.heatmapRenderer.updateCell(row, col, cell);
        }
        
        // Trigger callback
        if (this.callbacks.onDataChange) {
            this.callbacks.onDataChange(row, col, cell);
        }
    }

    /**
     * Update cell display in HTML table
     */
    updateCellDisplay(row, col) {
        const cell = this.gridData[row][col];
        const td = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        
        if (!td) return;
        
        const deltaDiv = td.querySelector('.cell-delta');
        const statusDiv = td.querySelector('.cell-status');
        
        if (cell.de00 !== null) {
            deltaDiv.textContent = cell.de00.toFixed(1);
            
            // Update status based on tolerance
            const pass = cell.de00 <= this.options.tolerance;
            statusDiv.textContent = pass ? 'Pass' : 'Fail';
            statusDiv.className = `cell-status ${pass ? 'pass' : 'fail'}`;
            
            // Update cell color
            td.className = `grid-cell ${pass ? 'pass' : 'fail'}`;
        } else {
            deltaDiv.textContent = '--';
            statusDiv.textContent = '';
            statusDiv.className = 'cell-status';
            td.className = 'grid-cell';
        }
    }

    /**
     * Update all grid displays
     */
    updateGridDisplay() {
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                this.updateCellDisplay(row, col);
            }
        }
        
        if (this.heatmapRenderer) {
            this.heatmapRenderer.setGridData(this.gridData, this.options.tolerance);
        }
    }

    /**
     * Edit cell data
     * Requirements: 3.3 - Interactive grid with editable cells
     */
    editCell(row, col) {
        console.log(`Editing cell ${row}, ${col}`);
        
        this.selectedCell = { row, col };
        const cell = this.gridData[row][col];
        
        // Populate edit modal
        document.getElementById('edit-patch-id').textContent = `${row + 1}-${col + 1}`;
        
        // Target values
        document.getElementById('edit-target-l').value = cell.t ? cell.t[0].toFixed(1) : '';
        document.getElementById('edit-target-a').value = cell.t ? cell.t[1].toFixed(1) : '';
        document.getElementById('edit-target-b').value = cell.t ? cell.t[2].toFixed(1) : '';
        
        // Press values
        document.getElementById('edit-press-l').value = cell.p ? cell.p[0].toFixed(1) : '';
        document.getElementById('edit-press-a').value = cell.p ? cell.p[1].toFixed(1) : '';
        document.getElementById('edit-press-b').value = cell.p ? cell.p[2].toFixed(1) : '';
        
        // Update preview
        this.updateEditPreview();
        
        // Show modal
        document.getElementById('cell-edit-modal').style.display = 'block';
    }

    /**
     * Update edit preview with calculated Delta E
     */
    updateEditPreview() {
        const targetL = parseFloat(document.getElementById('edit-target-l').value);
        const targetA = parseFloat(document.getElementById('edit-target-a').value);
        const targetB = parseFloat(document.getElementById('edit-target-b').value);
        
        const pressL = parseFloat(document.getElementById('edit-press-l').value);
        const pressA = parseFloat(document.getElementById('edit-press-a').value);
        const pressB = parseFloat(document.getElementById('edit-press-b').value);
        
        const deltaSpan = document.getElementById('edit-calculated-delta');
        
        if (!isNaN(targetL) && !isNaN(targetA) && !isNaN(targetB) &&
            !isNaN(pressL) && !isNaN(pressA) && !isNaN(pressB) && window.dE00) {
            
            const deltaE = window.dE00(
                { l: targetL, a: targetA, b: targetB },
                { l: pressL, a: pressA, b: pressB }
            );
            
            deltaSpan.textContent = deltaE.toFixed(2);
            deltaSpan.className = deltaE <= this.options.tolerance ? 'pass' : 'fail';
        } else {
            deltaSpan.textContent = '--';
            deltaSpan.className = '';
        }
    }

    /**
     * Save edited cell data
     */
    saveEditedCell() {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        // Get values from form
        const targetL = parseFloat(document.getElementById('edit-target-l').value);
        const targetA = parseFloat(document.getElementById('edit-target-a').value);
        const targetB = parseFloat(document.getElementById('edit-target-b').value);
        
        const pressL = parseFloat(document.getElementById('edit-press-l').value);
        const pressA = parseFloat(document.getElementById('edit-press-a').value);
        const pressB = parseFloat(document.getElementById('edit-press-b').value);
        
        // Validate values
        const validTarget = !isNaN(targetL) && !isNaN(targetA) && !isNaN(targetB);
        const validPress = !isNaN(pressL) && !isNaN(pressA) && !isNaN(pressB);
        
        if (!validTarget && !validPress) {
            this.showErrorMessage('Please enter valid LAB values');
            return;
        }
        
        // Update cell data
        const updateData = {};
        if (validTarget) {
            updateData.t = [targetL, targetA, targetB];
        }
        if (validPress) {
            updateData.p = [pressL, pressA, pressB];
        }
        
        this.setCellData(row, col, updateData);
        
        // Update statistics
        this.updateStatistics();
        
        // Close modal
        this.closeEditModal();
        
        // Trigger callback
        if (this.callbacks.onCellEdit) {
            this.callbacks.onCellEdit(row, col, this.gridData[row][col]);
        }
    }

    /**
     * Close edit modal
     */
    closeEditModal() {
        document.getElementById('cell-edit-modal').style.display = 'none';
        this.selectedCell = null;
    }

    /**
     * Set tolerance level
     */
    setTolerance(tolerance) {
        this.options.tolerance = tolerance;
        
        // Update heatmap
        if (this.heatmapRenderer) {
            this.heatmapRenderer.setTolerance(tolerance);
        }
        
        // Update grid display
        this.updateGridDisplay();
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Update statistics
     * Requirements: 3.6 - Real-time statistical analysis
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Update UI
        document.getElementById('stat-total').textContent = stats.totalPatches;
        document.getElementById('stat-pass').textContent = stats.passCount;
        document.getElementById('stat-fail').textContent = stats.failCount;
        document.getElementById('stat-avg').textContent = stats.averageDeltaE > 0 ? 
            stats.averageDeltaE.toFixed(2) : '--';
        
        // Store statistics
        this.statistics = stats;
        
        // Trigger callback
        if (this.callbacks.onStatisticsUpdate) {
            this.callbacks.onStatisticsUpdate(stats);
        }
    }

    /**
     * Calculate grid statistics
     */
    calculateStatistics() {
        const deltaEValues = [];
        let totalPatches = 0;
        let validPatches = 0;
        let passCount = 0;
        let failCount = 0;
        
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                totalPatches++;
                const cell = this.gridData[row][col];
                
                if (cell.de00 !== null) {
                    validPatches++;
                    deltaEValues.push(cell.de00);
                    
                    if (cell.de00 <= this.options.tolerance) {
                        passCount++;
                    } else {
                        failCount++;
                    }
                }
            }
        }
        
        // Calculate statistical measures
        let averageDeltaE = 0;
        let maxDeltaE = 0;
        let medianDeltaE = 0;
        let percentile95 = 0;
        
        if (deltaEValues.length > 0) {
            averageDeltaE = deltaEValues.reduce((sum, val) => sum + val, 0) / deltaEValues.length;
            maxDeltaE = Math.max(...deltaEValues);
            
            // Calculate median and 95th percentile
            const sortedValues = [...deltaEValues].sort((a, b) => a - b);
            const medianIndex = Math.floor(sortedValues.length / 2);
            medianDeltaE = sortedValues.length % 2 === 0 ?
                (sortedValues[medianIndex - 1] + sortedValues[medianIndex]) / 2 :
                sortedValues[medianIndex];
            
            const percentile95Index = Math.floor(sortedValues.length * 0.95);
            percentile95 = sortedValues[percentile95Index] || maxDeltaE;
        }
        
        return {
            totalPatches,
            validPatches,
            passCount,
            failCount,
            averageDeltaE,
            maxDeltaE,
            medianDeltaE,
            percentile95
        };
    }

    /**
     * Export grid data to CSV
     */
    exportToCSV() {
        const csvData = [];
        csvData.push(['Row', 'Col', 'Patch_ID', 'Target_L', 'Target_a', 'Target_b', 
                     'Press_L', 'Press_a', 'Press_b', 'Delta_E_2000', 'Status']);
        
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                const cell = this.gridData[row][col];
                const patchId = `${row + 1}-${col + 1}`;
                const status = cell.de00 !== null ? 
                    (cell.de00 <= this.options.tolerance ? 'Pass' : 'Fail') : 'No Data';
                
                csvData.push([
                    row + 1,
                    col + 1,
                    patchId,
                    cell.t ? cell.t[0].toFixed(2) : '',
                    cell.t ? cell.t[1].toFixed(2) : '',
                    cell.t ? cell.t[2].toFixed(2) : '',
                    cell.p ? cell.p[0].toFixed(2) : '',
                    cell.p ? cell.p[1].toFixed(2) : '',
                    cell.p ? cell.p[2].toFixed(2) : '',
                    cell.de00 !== null ? cell.de00.toFixed(2) : '',
                    status
                ]);
            }
        }
        
        // Create and download CSV
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `grid_analysis_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Clear all grid data
     */
    clearGrid() {
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                this.gridData[row][col] = {
                    t: null,
                    p: null,
                    de00: null
                };
            }
        }
        
        this.updateGridDisplay();
        this.updateStatistics();
    }

    /**
     * Utility methods for UI feedback
     */
    showLoadingState(message) {
        // Implementation for loading state
        console.log('Loading:', message);
    }

    hideLoadingState() {
        // Implementation to hide loading state
        console.log('Loading complete');
    }

    showSuccessMessage(message) {
        // Implementation for success message
        console.log('Success:', message);
    }

    showErrorMessage(message) {
        // Implementation for error message
        console.error('Error:', message);
    }

    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Get current grid data
     */
    getGridData() {
        return this.gridData;
    }

    /**
     * Get current statistics
     */
    getStatistics() {
        return this.statistics;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.heatmapRenderer) {
            this.heatmapRenderer.destroy();
        }
    }
}

// Export for use in other modules
window.GridManager = GridManager;

console.log('Grid Management System loaded successfully');