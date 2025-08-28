/**
 * HD CMYK State Synchronizer
 * Implements proper state management between all UI components
 * Requirements: Implement proper state management between all UI components
 */

console.log('HD CMYK State Synchronizer loading...');

class StateSynchronizer {
    constructor() {
        this.subscribers = new Map();
        this.stateHistory = [];
        this.maxHistorySize = 50;
        this.syncInProgress = false;
        this.debounceTimers = new Map();
        this.validationRules = new Map();
        
        this.init();
    }

    /**
     * Initialize state synchronizer
     */
    init() {
        console.log('Initializing State Synchronizer...');
        
        // Set up validation rules
        this.setupValidationRules();
        
        // Set up state watchers
        this.setupStateWatchers();
        
        // Set up cross-component synchronization
        this.setupCrossComponentSync();
        
        // Set up state persistence
        this.setupStatePersistence();
        
        console.log('State Synchronizer initialized');
    }

    /**
     * Set up validation rules for different state properties
     */
    setupValidationRules() {
        // LAB value validation
        this.validationRules.set('lab', (value) => {
            if (!value || typeof value !== 'object') return false;
            return value.l >= 0 && value.l <= 100 &&
                   value.a >= -128 && value.a <= 127 &&
                   value.b >= -128 && value.b <= 127;
        });

        // CMYK value validation
        this.validationRules.set('cmyk', (value) => {
            if (!value || typeof value !== 'object') return false;
            return value.c >= 0 && value.c <= 100 &&
                   value.m >= 0 && value.m <= 100 &&
                   value.y >= 0 && value.y <= 100 &&
                   value.k >= 0 && value.k <= 100;
        });

        // CMYKOGV value validation
        this.validationRules.set('cmykogv', (value) => {
            if (!value || typeof value !== 'object') return false;
            const channels = ['c', 'm', 'y', 'k', 'o', 'g', 'v'];
            return channels.every(channel => 
                value[channel] >= 0 && value[channel] <= 100
            );
        });

        // Tolerance validation
        this.validationRules.set('tolerance', (value) => {
            return typeof value === 'number' && value > 0 && value <= 10;
        });

        // Results validation
        this.validationRules.set('results', (value) => {
            if (!value) return true; // null results are valid
            return typeof value.deltaE === 'number' && 
                   value.deltaE >= 0 &&
                   value.target && value.sample;
        });
    }

    /**
     * Set up state watchers for automatic synchronization
     */
    setupStateWatchers() {
        // Watch for changes to global app state
        if (window.appState) {
            this.watchObject(window.appState, 'appState', (path, newValue, oldValue) => {
                this.handleStateChange(path, newValue, oldValue);
            });
        }

        // Set up periodic state validation
        setInterval(() => {
            this.validateGlobalState();
        }, 5000); // Validate every 5 seconds
    }

    /**
     * Watch an object for changes
     */
    watchObject(obj, basePath, callback) {
        if (!obj || typeof obj !== 'object') return;

        // Create proxy to intercept property changes
        const handler = {
            set: (target, property, value) => {
                const oldValue = target[property];
                const path = `${basePath}.${property}`;
                
                // Validate the new value
                if (this.validateValue(path, value)) {
                    target[property] = value;
                    callback(path, value, oldValue);
                    return true;
                } else {
                    console.warn(`Invalid value for ${path}:`, value);
                    return false;
                }
            },
            
            get: (target, property) => {
                const value = target[property];
                
                // If the value is an object, wrap it in a proxy too
                if (value && typeof value === 'object' && !value.__isProxy) {
                    const proxiedValue = new Proxy(value, handler);
                    proxiedValue.__isProxy = true;
                    return proxiedValue;
                }
                
                return value;
            }
        };

        return new Proxy(obj, handler);
    }

    /**
     * Validate a value based on its path
     */
    validateValue(path, value) {
        // Extract validation type from path
        let validationType = null;
        
        if (path.includes('.lab')) validationType = 'lab';
        else if (path.includes('.cmykogv')) validationType = 'cmykogv';
        else if (path.includes('.cmyk')) validationType = 'cmyk';
        else if (path.includes('tolerance')) validationType = 'tolerance';
        else if (path.includes('results')) validationType = 'results';
        
        if (validationType && this.validationRules.has(validationType)) {
            return this.validationRules.get(validationType)(value);
        }
        
        return true; // No validation rule, allow the value
    }

    /**
     * Handle state changes
     */
    handleStateChange(path, newValue, oldValue) {
        if (this.syncInProgress) return;
        
        console.log(`State change: ${path}`, { newValue, oldValue });
        
        // Add to history
        this.addToHistory(path, newValue, oldValue);
        
        // Notify subscribers
        this.notifySubscribers(path, newValue, oldValue);
        
        // Trigger synchronization with debouncing
        this.debouncedSync(path, newValue);
    }

    /**
     * Add state change to history
     */
    addToHistory(path, newValue, oldValue) {
        this.stateHistory.push({
            timestamp: Date.now(),
            path,
            newValue: this.deepClone(newValue),
            oldValue: this.deepClone(oldValue)
        });
        
        // Limit history size
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
    }

    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(path, newValue, oldValue) {
        this.subscribers.forEach((callback, subscriberPath) => {
            if (path.startsWith(subscriberPath) || subscriberPath === '*') {
                try {
                    callback(path, newValue, oldValue);
                } catch (error) {
                    console.error(`Error in state subscriber for ${subscriberPath}:`, error);
                }
            }
        });
    }

    /**
     * Debounced synchronization
     */
    debouncedSync(path, newValue) {
        const timerId = `sync_${path}`;
        
        // Clear existing timer
        if (this.debounceTimers.has(timerId)) {
            clearTimeout(this.debounceTimers.get(timerId));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            this.synchronizeComponents(path, newValue);
            this.debounceTimers.delete(timerId);
        }, 100); // 100ms debounce
        
        this.debounceTimers.set(timerId, timer);
    }

    /**
     * Synchronize components based on state changes
     */
    synchronizeComponents(path, newValue) {
        this.syncInProgress = true;
        
        try {
            // Synchronize color swatches
            if (path.includes('.lab') || path.includes('.cmyk')) {
                this.syncColorSwatches();
            }
            
            // Synchronize calculation results
            if (path.includes('results')) {
                this.syncCalculationResults(newValue);
            }
            
            // Synchronize grid data
            if (path.includes('gridData')) {
                this.syncGridData(newValue);
            }
            
            // Synchronize ICC profile
            if (path.includes('iccProfile')) {
                this.syncIccProfile(newValue);
            }
            
            // Synchronize client profile
            if (path.includes('clientProfile')) {
                this.syncClientProfile(newValue);
            }
            
            // Synchronize tolerance settings
            if (path.includes('tolerance')) {
                this.syncToleranceSettings(newValue);
            }
            
            // Synchronize substrate settings
            if (path.includes('substrate')) {
                this.syncSubstrateSettings(newValue);
            }
            
        } catch (error) {
            console.error('Error during component synchronization:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Synchronize color swatches across components
     */
    syncColorSwatches() {
        // Update main calculator swatches
        if (window.updateColorSwatches) {
            window.updateColorSwatches();
        }
        
        // Update color converter swatches
        if (window.colorConverter && window.colorConverter.updatePreview) {
            window.colorConverter.updatePreview();
        }
        
        // Update grid visualization
        if (window.gridManager && window.gridManager.updateVisualization) {
            window.gridManager.updateVisualization();
        }
        
        // Update library preview swatches
        if (window.colorLibrary && window.colorLibrary.updatePreviews) {
            window.colorLibrary.updatePreviews();
        }
    }

    /**
     * Synchronize calculation results
     */
    syncCalculationResults(results) {
        // Update correction suggestions
        if (window.correctionSuggestionsUI && window.correctionSuggestionsUI.updateSuggestions) {
            window.correctionSuggestionsUI.updateSuggestions(results);
        }
        
        // Update measurement history
        if (window.measurementHistory && window.measurementHistory.addMeasurement && results) {
            window.measurementHistory.addMeasurement(results);
        }
        
        // Update substrate profile corrections
        if (window.substrateProfileSystem && window.substrateProfileSystem.updateCorrections) {
            window.substrateProfileSystem.updateCorrections(results);
        }
        
        // Update status bar
        if (window.updateStatusBarContent) {
            window.updateStatusBarContent();
        }
        
        // Update results display
        this.updateResultsDisplay(results);
    }

    /**
     * Synchronize grid data
     */
    syncGridData(gridData) {
        // Update heatmap visualization
        if (window.heatmapVisualization && window.heatmapVisualization.update && gridData) {
            window.heatmapVisualization.update(gridData);
        }
        
        // Update grid statistics
        if (window.gridManager && window.gridManager.updateStatistics) {
            window.gridManager.updateStatistics();
        }
    }

    /**
     * Synchronize ICC profile
     */
    syncIccProfile(profile) {
        // Update color conversion methods
        if (profile && window.colorScience) {
            // Notify color science module of new profile
            if (window.colorScience.setIccProfile) {
                window.colorScience.setIccProfile(profile);
            }
        }
        
        // Update color swatches with new profile
        this.syncColorSwatches();
        
        // Emit profile change event
        document.dispatchEvent(new CustomEvent('iccProfileChanged', { 
            detail: { profile } 
        }));
    }

    /**
     * Synchronize client profile
     */
    syncClientProfile(profile) {
        // Update tolerance settings from profile
        if (profile && profile.tolerance && window.appState) {
            window.appState.tolerance = profile.tolerance;
        }
        
        // Update substrate preferences
        if (profile && profile.preferredSubstrate && window.appState) {
            window.appState.substrate = profile.preferredSubstrate;
        }
        
        // Update UI elements
        this.updateClientProfileUI(profile);
        
        // Emit profile change event
        document.dispatchEvent(new CustomEvent('clientProfileChanged', { 
            detail: { profile } 
        }));
    }

    /**
     * Synchronize tolerance settings
     */
    syncToleranceSettings(tolerance) {
        // Update tolerance input
        const toleranceInput = document.getElementById('tolerance-input');
        if (toleranceInput && parseFloat(toleranceInput.value) !== tolerance) {
            toleranceInput.value = tolerance.toFixed(1);
        }
        
        // Update tolerance displays
        const toleranceDisplays = document.querySelectorAll('.tolerance-display');
        toleranceDisplays.forEach(display => {
            display.textContent = tolerance.toFixed(1);
        });
        
        // Update result evaluations with new tolerance
        if (window.appState && window.appState.results) {
            this.updateToleranceEvaluation(window.appState.results, tolerance);
        }
    }

    /**
     * Synchronize substrate settings
     */
    syncSubstrateSettings(substrate) {
        // Update substrate selector
        const substrateSelect = document.getElementById('substrate-select');
        if (substrateSelect && substrateSelect.value !== substrate) {
            substrateSelect.value = substrate;
        }
        
        // Update substrate profile system
        if (window.substrateProfileSystem && window.substrateProfileSystem.setActiveProfile) {
            window.substrateProfileSystem.setActiveProfile(substrate);
        }
        
        // Update correction suggestions with new substrate
        if (window.appState && window.appState.results) {
            this.syncCalculationResults(window.appState.results);
        }
    }

    /**
     * Set up cross-component synchronization
     */
    setupCrossComponentSync() {
        // Listen for input changes
        document.addEventListener('input', (event) => {
            if (event.target.matches('[id^="target-"], [id^="sample-"]')) {
                this.handleInputChange(event.target);
            }
        });
        
        // Listen for calculation events
        document.addEventListener('calculationComplete', (event) => {
            if (window.appState) {
                window.appState.results = event.detail;
            }
        });
        
        // Listen for grid updates
        document.addEventListener('gridDataUpdated', (event) => {
            if (window.appState) {
                window.appState.gridData = event.detail;
            }
        });
    }

    /**
     * Handle input changes and update state
     */
    handleInputChange(input) {
        const value = parseFloat(input.value) || 0;
        const [colorType, channel] = input.id.split('-');
        
        if (!window.appState || !window.appState[colorType]) return;
        
        // Determine color space (lab or cmyk)
        const colorSpace = ['l', 'a', 'b'].includes(channel) ? 'lab' : 'cmyk';
        
        // Update state
        if (!window.appState[colorType][colorSpace]) {
            window.appState[colorType][colorSpace] = {};
        }
        
        window.appState[colorType][colorSpace][channel] = value;
        
        // Emit input change event
        document.dispatchEvent(new CustomEvent('colorInputChanged', {
            detail: { colorType, colorSpace, channel, value }
        }));
    }

    /**
     * Set up state persistence
     */
    setupStatePersistence() {
        // Save state periodically
        setInterval(() => {
            this.saveStateToStorage();
        }, 10000); // Save every 10 seconds
        
        // Save state on page unload
        window.addEventListener('beforeunload', () => {
            this.saveStateToStorage();
        });
        
        // Load state on initialization
        this.loadStateFromStorage();
    }

    /**
     * Save state to localStorage
     */
    saveStateToStorage() {
        try {
            if (window.appState) {
                const stateToSave = {
                    target: window.appState.target,
                    sample: window.appState.sample,
                    tolerance: window.appState.tolerance,
                    substrate: window.appState.substrate,
                    timestamp: Date.now()
                };
                
                localStorage.setItem('hdcmyk_app_state', JSON.stringify(stateToSave));
            }
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }
    }

    /**
     * Load state from localStorage
     */
    loadStateFromStorage() {
        try {
            const savedState = localStorage.getItem('hdcmyk_app_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Only load if state is recent (within 24 hours)
                if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
                    if (window.appState) {
                        Object.assign(window.appState, state);
                        console.log('Loaded previous state from localStorage');
                        
                        // Update UI with loaded state
                        this.updateUIFromState();
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
    }

    /**
     * Update UI elements from current state
     */
    updateUIFromState() {
        if (!window.appState) return;
        
        // Update input fields
        const { target, sample, tolerance, substrate } = window.appState;
        
        // Update target inputs
        if (target) {
            this.updateInputsFromColorData('target', target);
        }
        
        // Update sample inputs
        if (sample) {
            this.updateInputsFromColorData('sample', sample);
        }
        
        // Update tolerance
        if (tolerance) {
            const toleranceInput = document.getElementById('tolerance-input');
            if (toleranceInput) {
                toleranceInput.value = tolerance.toFixed(1);
            }
        }
        
        // Update substrate
        if (substrate) {
            const substrateSelect = document.getElementById('substrate-select');
            if (substrateSelect) {
                substrateSelect.value = substrate;
            }
        }
        
        // Update color swatches
        setTimeout(() => {
            this.syncColorSwatches();
        }, 100);
    }

    /**
     * Update input fields from color data
     */
    updateInputsFromColorData(colorType, colorData) {
        // Update LAB inputs
        if (colorData.lab) {
            ['l', 'a', 'b'].forEach(channel => {
                const input = document.getElementById(`${colorType}-${channel}`);
                if (input && colorData.lab[channel] !== undefined) {
                    input.value = colorData.lab[channel].toFixed(1);
                }
            });
        }
        
        // Update CMYK inputs
        if (colorData.cmyk) {
            ['c', 'm', 'y', 'k'].forEach(channel => {
                const input = document.getElementById(`${colorType}-${channel}`);
                if (input && colorData.cmyk[channel] !== undefined) {
                    input.value = colorData.cmyk[channel].toFixed(1);
                }
            });
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        this.subscribers.set(path, callback);
        
        return () => {
            this.subscribers.delete(path);
        };
    }

    /**
     * Validate global state
     */
    validateGlobalState() {
        if (!window.appState) {
            console.warn('Global application state is missing');
            return false;
        }
        
        let isValid = true;
        
        // Validate target and sample data
        ['target', 'sample'].forEach(colorType => {
            if (window.appState[colorType]) {
                if (window.appState[colorType].lab && !this.validationRules.get('lab')(window.appState[colorType].lab)) {
                    console.warn(`Invalid LAB data for ${colorType}`);
                    isValid = false;
                }
                
                if (window.appState[colorType].cmyk && !this.validationRules.get('cmyk')(window.appState[colorType].cmyk)) {
                    console.warn(`Invalid CMYK data for ${colorType}`);
                    isValid = false;
                }
            }
        });
        
        // Validate tolerance
        if (window.appState.tolerance && !this.validationRules.get('tolerance')(window.appState.tolerance)) {
            console.warn('Invalid tolerance value');
            isValid = false;
        }
        
        // Validate results
        if (window.appState.results && !this.validationRules.get('results')(window.appState.results)) {
            console.warn('Invalid results data');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Utility methods
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    updateResultsDisplay(results) {
        if (!results) return;
        
        // Update Delta E display
        const deltaDisplay = document.querySelector('.delta-e-number');
        if (deltaDisplay) {
            deltaDisplay.textContent = results.deltaE.toFixed(2);
        }
        
        // Update tolerance indicator
        const toleranceIndicator = document.querySelector('.tolerance-indicator');
        if (toleranceIndicator) {
            const tolerance = window.appState?.tolerance || 1.0;
            const zone = results.deltaE <= tolerance ? 'excellent' : 
                        results.deltaE <= tolerance * 2 ? 'good' : 
                        results.deltaE <= tolerance * 3 ? 'acceptable' : 'poor';
            
            toleranceIndicator.className = `tolerance-indicator ${zone}`;
            toleranceIndicator.textContent = zone.toUpperCase();
        }
    }

    updateToleranceEvaluation(results, tolerance) {
        if (!results) return;
        
        const zone = results.deltaE <= tolerance ? 'excellent' : 
                    results.deltaE <= tolerance * 2 ? 'good' : 
                    results.deltaE <= tolerance * 3 ? 'acceptable' : 'poor';
        
        // Update tolerance indicators
        const toleranceIndicators = document.querySelectorAll('.tolerance-indicator');
        toleranceIndicators.forEach(indicator => {
            indicator.className = `tolerance-indicator ${zone}`;
            indicator.textContent = zone.toUpperCase();
        });
    }

    updateClientProfileUI(profile) {
        // Update profile name display
        const profileNameDisplays = document.querySelectorAll('.current-profile-name');
        profileNameDisplays.forEach(display => {
            display.textContent = profile ? profile.name : 'Default';
        });
        
        // Update profile-specific settings
        if (profile) {
            // Update SOP checklist if available
            if (window.clientProfiles && window.clientProfiles.updateSOPDisplay) {
                window.clientProfiles.updateSOPDisplay(profile);
            }
        }
    }

    /**
     * Get synchronization statistics
     */
    getStats() {
        return {
            subscribers: this.subscribers.size,
            historySize: this.stateHistory.length,
            activeTimers: this.debounceTimers.size,
            validationRules: this.validationRules.size,
            lastValidation: this.validateGlobalState()
        };
    }
}

// Initialize state synchronizer
const stateSynchronizer = new StateSynchronizer();

// Make it globally available
window.stateSynchronizer = stateSynchronizer;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateSynchronizer;
}

console.log('HD CMYK State Synchronizer loaded');