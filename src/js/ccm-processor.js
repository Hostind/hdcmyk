// Color Correction Matrix (CCM) Processor
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5 - CCM computation and application

console.log('CCM Processor loading...');

/**
 * Color Correction Matrix Processor
 * Implements least squares regression for 3×3 matrix computation
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
class CCMProcessor {
    constructor() {
        this.matrix = null;
        this.isValid = false;
        this.statistics = {
            inputPairs: 0,
            averageError: 0,
            maxError: 0,
            rSquared: 0
        };
        
        // UI elements will be cached here
        this.elements = {};
        
        this.initialize();
    }

    /**
     * Initialize CCM processor
     */
    initialize() {
        console.log('Initializing CCM Processor...');
        this.createUI();
        this.setupEventHandlers();
        console.log('CCM Processor initialized');
    }

    /**
     * Create CCM UI elements
     * Requirements: 4.1 - Add dual CSV file inputs for target and press measurements
     */
    createUI() {
        // Find or create CCM container
        let ccmContainer = document.getElementById('ccm-container');
        if (!ccmContainer) {
            ccmContainer = document.createElement('div');
            ccmContainer.id = 'ccm-container';
            ccmContainer.className = 'feature-card ccm-feature';
            
            // Insert after grid system or at end of advanced features
            const advancedFeatures = document.querySelector('.advanced-features');
            if (advancedFeatures) {
                advancedFeatures.appendChild(ccmContainer);
            } else {
                document.querySelector('.container').appendChild(ccmContainer);
            }
        }

        ccmContainer.innerHTML = `
            <div class="ccm-processor">
                <h3>🔧 Color Correction Matrix (CCM)</h3>
                <p class="feature-description">
                    Compute and apply 3×3 correction matrices from paired target/press measurements
                    to systematically correct color drift across multiple patches.
                </p>
                
                <!-- File Input Section -->
                <div class="ccm-input-section">
                    <h4>Data Input</h4>
                    <div class="file-input-grid">
                        <div class="file-input-group">
                            <label for="ccm-target-file">Target Measurements CSV:</label>
                            <div class="file-input-wrapper">
                                <input type="file" id="ccm-target-file" accept=".csv,.txt" style="display: none;">
                                <button class="file-select-btn" id="ccm-target-btn">
                                    📊 Select Target CSV
                                </button>
                                <span class="file-status" id="ccm-target-status">No file selected</span>
                            </div>
                        </div>
                        
                        <div class="file-input-group">
                            <label for="ccm-press-file">Press Measurements CSV:</label>
                            <div class="file-input-wrapper">
                                <input type="file" id="ccm-press-file" accept=".csv,.txt" style="display: none;">
                                <button class="file-select-btn" id="ccm-press-btn">
                                    📊 Select Press CSV
                                </button>
                                <span class="file-status" id="ccm-press-status">No file selected</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ccm-options">
                        <label>
                            <input type="checkbox" id="ccm-use-grid-data" checked>
                            Use current grid data (if available)
                        </label>
                        <label>
                            Minimum patches required:
                            <input type="number" id="ccm-min-patches" value="9" min="3" max="100">
                        </label>
                    </div>
                </div>
                
                <!-- Matrix Computation Section -->
                <div class="ccm-computation-section">
                    <h4>Matrix Computation</h4>
                    <div class="computation-controls">
                        <button class="btn btn-primary" id="ccm-compute-btn" disabled>
                            🧮 Compute CCM
                        </button>
                        <button class="btn btn-secondary" id="ccm-reset-btn">
                            🔄 Reset Matrix
                        </button>
                        <div class="computation-status" id="ccm-computation-status">
                            Ready to compute matrix
                        </div>
                    </div>
                    
                    <!-- Matrix Display -->
                    <div class="matrix-display" id="ccm-matrix-display" style="display: none;">
                        <h5>3×3 Correction Matrix</h5>
                        <div class="matrix-grid">
                            <div class="matrix-row">
                                <span class="matrix-cell" id="m00">1.000</span>
                                <span class="matrix-cell" id="m01">0.000</span>
                                <span class="matrix-cell" id="m02">0.000</span>
                            </div>
                            <div class="matrix-row">
                                <span class="matrix-cell" id="m10">0.000</span>
                                <span class="matrix-cell" id="m11">1.000</span>
                                <span class="matrix-cell" id="m12">0.000</span>
                            </div>
                            <div class="matrix-row">
                                <span class="matrix-cell" id="m20">0.000</span>
                                <span class="matrix-cell" id="m21">0.000</span>
                                <span class="matrix-cell" id="m22">1.000</span>
                            </div>
                        </div>
                        
                        <div class="matrix-stats">
                            <div class="stat-item">
                                <span class="stat-label">Input Pairs:</span>
                                <span class="stat-value" id="ccm-stat-pairs">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Avg Error:</span>
                                <span class="stat-value" id="ccm-stat-error">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">R²:</span>
                                <span class="stat-value" id="ccm-stat-r2">--</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Matrix Application Section -->
                <div class="ccm-application-section">
                    <h4>Matrix Application</h4>
                    <div class="application-controls">
                        <button class="btn btn-primary" id="ccm-apply-btn" disabled>
                            ✨ Apply CCM to Grid
                        </button>
                        <button class="btn btn-primary" id="ccm-auto-balance-btn" disabled>
                            ⚖️ Auto-Balance (CCM + Gray Axis)
                        </button>
                        <div class="application-options">
                            <label>
                                <input type="checkbox" id="ccm-preview-mode" checked>
                                Preview mode (show before/after)
                            </label>
                        </div>
                    </div>
                    
                    <!-- Application Results -->
                    <div class="application-results" id="ccm-application-results" style="display: none;">
                        <h5>Correction Results</h5>
                        <div class="results-summary">
                            <div class="result-item">
                                <span class="result-label">Patches Corrected:</span>
                                <span class="result-value" id="ccm-corrected-count">0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Avg Improvement:</span>
                                <span class="result-value" id="ccm-improvement">--</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Success Rate:</span>
                                <span class="result-value" id="ccm-success-rate">--</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Error Display -->
                <div class="ccm-error-display" id="ccm-error-display" style="display: none;">
                    <div class="error-content">
                        <span class="error-icon">⚠️</span>
                        <span class="error-message" id="ccm-error-message"></span>
                    </div>
                </div>
            </div>
        `;

        // Cache UI elements
        this.cacheElements();
    }

    /**
     * Cache UI elements for performance
     */
    cacheElements() {
        this.elements = {
            targetFile: document.getElementById('ccm-target-file'),
            pressFile: document.getElementById('ccm-press-file'),
            targetBtn: document.getElementById('ccm-target-btn'),
            pressBtn: document.getElementById('ccm-press-btn'),
            targetStatus: document.getElementById('ccm-target-status'),
            pressStatus: document.getElementById('ccm-press-status'),
            useGridData: document.getElementById('ccm-use-grid-data'),
            minPatches: document.getElementById('ccm-min-patches'),
            computeBtn: document.getElementById('ccm-compute-btn'),
            resetBtn: document.getElementById('ccm-reset-btn'),
            computationStatus: document.getElementById('ccm-computation-status'),
            matrixDisplay: document.getElementById('ccm-matrix-display'),
            applyBtn: document.getElementById('ccm-apply-btn'),
            autoBalanceBtn: document.getElementById('ccm-auto-balance-btn'),
            previewMode: document.getElementById('ccm-preview-mode'),
            applicationResults: document.getElementById('ccm-application-results'),
            errorDisplay: document.getElementById('ccm-error-display'),
            errorMessage: document.getElementById('ccm-error-message')
        };
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // File selection buttons
        this.elements.targetBtn.addEventListener('click', () => {
            this.elements.targetFile.click();
        });

        this.elements.pressBtn.addEventListener('click', () => {
            this.elements.pressFile.click();
        });

        // File input handlers
        this.elements.targetFile.addEventListener('change', (e) => {
            this.handleFileSelection(e, 'target');
        });

        this.elements.pressFile.addEventListener('change', (e) => {
            this.handleFileSelection(e, 'press');
        });

        // Grid data checkbox
        this.elements.useGridData.addEventListener('change', () => {
            this.updateComputeButtonState();
        });

        // Computation buttons
        this.elements.computeBtn.addEventListener('click', () => {
            this.computeMatrix();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.resetMatrix();
        });

        // Application buttons
        this.elements.applyBtn.addEventListener('click', () => {
            this.applyMatrix();
        });

        this.elements.autoBalanceBtn.addEventListener('click', () => {
            this.applyAutoBalance();
        });
    }

    /**
     * Handle file selection
     * Requirements: 4.1 - Add dual CSV file inputs for target and press measurements
     */
    async handleFileSelection(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const statusElement = type === 'target' ? this.elements.targetStatus : this.elements.pressStatus;
        
        try {
            statusElement.textContent = 'Loading...';
            statusElement.className = 'file-status loading';

            // Parse CSV file
            const csvParser = new window.CSVParser();
            const result = await csvParser.parseFile(file);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Store parsed data
            if (type === 'target') {
                this.targetData = result.data;
            } else {
                this.pressData = result.data;
            }

            statusElement.textContent = `${file.name} (${result.stats.validRows} measurements)`;
            statusElement.className = 'file-status success';

            this.updateComputeButtonState();

        } catch (error) {
            console.error(`Error loading ${type} file:`, error);
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.className = 'file-status error';
        }
    }

    /**
     * Update compute button state based on available data
     */
    updateComputeButtonState() {
        const hasGridData = this.elements.useGridData.checked && this.hasValidGridData();
        const hasFileData = this.targetData && this.pressData;
        
        const canCompute = hasGridData || hasFileData;
        
        this.elements.computeBtn.disabled = !canCompute;
        
        if (canCompute) {
            this.elements.computationStatus.textContent = 'Ready to compute matrix';
            this.elements.computationStatus.className = 'computation-status ready';
        } else {
            this.elements.computationStatus.textContent = 'Need target and press data to compute matrix';
            this.elements.computationStatus.className = 'computation-status waiting';
        }
    }

    /**
     * Check if valid grid data is available
     */
    hasValidGridData() {
        if (!window.gridManager || !window.gridManager.gridData) return false;
        
        let validPairs = 0;
        const gridData = window.gridManager.gridData;
        
        for (let row = 0; row < gridData.length; row++) {
            for (let col = 0; col < gridData[row].length; col++) {
                const cell = gridData[row][col];
                if (cell.t && cell.p && cell.t.length === 3 && cell.p.length === 3) {
                    validPairs++;
                }
            }
        }
        
        const minPatches = parseInt(this.elements.minPatches.value) || 9;
        return validPairs >= minPatches;
    }

    /**
     * Compute CCM using least squares regression
     * Requirements: 4.2 - Implement least squares regression for 3×3 matrix computation
     */
    async computeMatrix() {
        try {
            this.showComputationProgress('Preparing data...');
            
            // Get input data
            const { targetData, pressData } = await this.prepareInputData();
            
            if (targetData.length < 3) {
                throw new Error('Need at least 3 measurement pairs for matrix computation');
            }

            this.showComputationProgress('Computing matrix...');
            
            // Validate input data
            this.validateInputData(targetData, pressData);
            
            // Compute 3×3 matrix using least squares regression
            const matrix = this.computeLeastSquaresMatrix(targetData, pressData);
            
            // Validate computed matrix
            this.validateMatrix(matrix);
            
            // Calculate statistics
            const stats = this.calculateMatrixStatistics(matrix, targetData, pressData);
            
            // Store results
            this.matrix = matrix;
            this.isValid = true;
            this.statistics = stats;
            
            // Update UI
            this.displayMatrix(matrix);
            this.displayStatistics(stats);
            this.enableApplicationButtons();
            
            this.showComputationSuccess(`Matrix computed successfully from ${targetData.length} pairs`);
            
        } catch (error) {
            console.error('CCM computation error:', error);
            this.showError(`Matrix computation failed: ${error.message}`);
            this.resetMatrix();
        }
    }

    /**
     * Prepare input data from files or grid
     */
    async prepareInputData() {
        let targetData = [];
        let pressData = [];
        
        if (this.elements.useGridData.checked && this.hasValidGridData()) {
            // Use grid data
            const gridData = window.gridManager.gridData;
            
            for (let row = 0; row < gridData.length; row++) {
                for (let col = 0; col < gridData[row].length; col++) {
                    const cell = gridData[row][col];
                    if (cell.t && cell.p && cell.t.length === 3 && cell.p.length === 3) {
                        targetData.push({ l: cell.t[0], a: cell.t[1], b: cell.t[2] });
                        pressData.push({ l: cell.p[0], a: cell.p[1], b: cell.p[2] });
                    }
                }
            }
        } else if (this.targetData && this.pressData) {
            // Use file data
            const minLength = Math.min(this.targetData.length, this.pressData.length);
            targetData = this.targetData.slice(0, minLength);
            pressData = this.pressData.slice(0, minLength);
        } else {
            throw new Error('No valid input data available');
        }
        
        return { targetData, pressData };
    }

    /**
     * Validate input data for matrix computation
     * Requirements: 4.4 - When CCM fails due to insufficient data THEN the system SHALL provide clear error messaging
     */
    validateInputData(targetData, pressData) {
        if (targetData.length !== pressData.length) {
            throw new Error('Target and press data must have the same number of measurements');
        }
        
        if (targetData.length < 3) {
            throw new Error('Need at least 3 measurement pairs for matrix computation');
        }
        
        // Check for valid LAB ranges
        for (let i = 0; i < targetData.length; i++) {
            const target = targetData[i];
            const press = pressData[i];
            
            if (!this.isValidLabValue(target) || !this.isValidLabValue(press)) {
                throw new Error(`Invalid LAB values at measurement ${i + 1}`);
            }
        }
        
        // Check for sufficient color variation
        const variation = this.calculateColorVariation(targetData);
        if (variation < 10) {
            throw new Error('Insufficient color variation in target data for reliable matrix computation');
        }
    }

    /**
     * Check if LAB value is valid
     */
    isValidLabValue(lab) {
        return lab && 
               typeof lab.l === 'number' && lab.l >= 0 && lab.l <= 100 &&
               typeof lab.a === 'number' && lab.a >= -128 && lab.a <= 127 &&
               typeof lab.b === 'number' && lab.b >= -128 && lab.b <= 127;
    }

    /**
     * Calculate color variation in dataset
     */
    calculateColorVariation(data) {
        if (data.length < 2) return 0;
        
        let totalVariation = 0;
        
        for (let i = 0; i < data.length - 1; i++) {
            for (let j = i + 1; j < data.length; j++) {
                const deltaE = this.calculateDeltaE(data[i], data[j]);
                totalVariation += deltaE;
            }
        }
        
        return totalVariation / (data.length * (data.length - 1) / 2);
    }

    /**
     * Calculate Delta E between two LAB values
     */
    calculateDeltaE(lab1, lab2) {
        if (window.dE00) {
            return window.dE00(lab1, lab2);
        } else {
            // Fallback to simple Euclidean distance
            const dl = lab1.l - lab2.l;
            const da = lab1.a - lab2.a;
            const db = lab1.b - lab2.b;
            return Math.sqrt(dl * dl + da * da + db * db);
        }
    }

    /**
     * Compute 3×3 matrix using least squares regression
     * Requirements: 4.2 - Implement least squares regression for 3×3 matrix computation
     */
    computeLeastSquaresMatrix(targetData, pressDa