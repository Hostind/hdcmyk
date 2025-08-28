/**
 * HD CMYK Integration Manager
 * Ensures seamless integration between existing calculator and HD features
 * Requirements: All requirements validation and integration testing
 */

console.log('HD CMYK Integration Manager loading...');

class IntegrationManager {
    constructor() {
        this.systems = new Map();
        this.errorHandlers = new Map();
        this.stateValidators = new Map();
        this.crossBrowserSupport = new Map();
        this.performanceMonitors = new Map();
        this.initialized = false;
        
        // Integration state tracking
        this.integrationState = {
            coreCalculator: false,
            colorScience: false,
            gridManager: false,
            heatmapVisualization: false,
            ccmProcessor: false,
            iccProfileManager: false,
            colorLibrary: false,
            spectrophotometerIntegration: false,
            clientProfiles: false,
            measurementHistory: false,
            colorConverter: false,
            enhancementSystems: false
        };
        
        this.init();
    }

    /**
     * Initialize integration manager
     */
    init() {
        console.log('Initializing HD CMYK Integration Manager...');
        
        try {
            // Set up global error handling
            this.setupGlobalErrorHandling();
            
            // Initialize state management
            this.initializeStateManagement();
            
            // Set up cross-system communication
            this.setupCrossSystemCommunication();
            
            // Initialize performance monitoring
            this.initializePerformanceMonitoring();
            
            // Set up backward compatibility
            this.setupBackwardCompatibility();
            
            // Register system integrations
            this.registerSystemIntegrations();
            
            // Set up graceful degradation
            this.setupGracefulDegradation();
            
            // Initialize cross-browser compatibility
            this.initializeCrossBrowserSupport();
            
            this.initialized = true;
            console.log('HD CMYK Integration Manager initialized successfully');
            
            // Emit integration ready event
            this.emitEvent('integrationReady', { manager: this });
            
        } catch (error) {
            console.error('Failed to initialize Integration Manager:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Set up global error handling for all systems
     */
    setupGlobalErrorHandling() {
        // Global error handler for unhandled errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
            event.preventDefault(); // Prevent console logging
        });

        // Set up system-specific error handlers
        this.setupSystemErrorHandlers();
    }

    /**
     * Set up error handlers for each system
     */
    setupSystemErrorHandlers() {
        const systems = [
            'colorScience',
            'gridManager', 
            'heatmapVisualization',
            'ccmProcessor',
            'iccProfileManager',
            'colorLibrary',
            'spectrophotometerIntegration',
            'clientProfiles',
            'measurementHistory',
            'colorConverter'
        ];

        systems.forEach(systemName => {
            this.errorHandlers.set(systemName, {
                handler: (error, context) => this.handleSystemError(systemName, error, context),
                fallback: () => this.provideFallback(systemName),
                recovery: () => this.attemptRecovery(systemName)
            });
        });
    }

    /**
     * Initialize state management system
     */
    initializeStateManagement() {
        // Ensure global app state exists and is properly structured
        if (!window.appState) {
            window.appState = {
                target: {
                    cmyk: { c: 0, m: 0, y: 0, k: 0 },
                    lab: { l: 50, a: 0, b: 0 }
                },
                sample: {
                    cmyk: { c: 0, m: 0, y: 0, k: 0 },
                    lab: { l: 50, a: 0, b: 0 }
                },
                results: null,
                history: [],
                isCalculating: false,
                lastCalculationTime: 0,
                tolerance: 1.0,
                substrate: 'coated',
                gridData: null,
                iccProfile: null,
                clientProfile: null
            };
        }

        // Set up state validators
        this.setupStateValidators();
        
        // Set up state synchronization
        this.setupStateSynchronization();
    }

    /**
     * Set up state validators for data integrity
     */
    setupStateValidators() {
        this.stateValidators.set('colorValues', (state) => {
            const { target, sample } = state;
            
            // Validate LAB ranges
            const validateLab = (lab) => {
                return lab.l >= 0 && lab.l <= 100 &&
                       lab.a >= -128 && lab.a <= 127 &&
                       lab.b >= -128 && lab.b <= 127;
            };
            
            // Validate CMYK ranges
            const validateCmyk = (cmyk) => {
                return cmyk.c >= 0 && cmyk.c <= 100 &&
                       cmyk.m >= 0 && cmyk.m <= 100 &&
                       cmyk.y >= 0 && cmyk.y <= 100 &&
                       cmyk.k >= 0 && cmyk.k <= 100;
            };
            
            return validateLab(target.lab) && validateLab(sample.lab) &&
                   validateCmyk(target.cmyk) && validateCmyk(sample.cmyk);
        });

        this.stateValidators.set('calculationResults', (results) => {
            if (!results) return true; // null results are valid
            
            return typeof results.deltaE === 'number' &&
                   results.deltaE >= 0 &&
                   results.target && results.sample &&
                   typeof results.timestamp === 'number';
        });
    }

    /**
     * Set up cross-system communication
     */
    setupCrossSystemCommunication() {
        // Create event bus for system communication
        this.eventBus = new EventTarget();
        
        // Set up system integration events
        this.setupIntegrationEvents();
        
        // Set up data flow coordination
        this.setupDataFlowCoordination();
    }

    /**
     * Set up integration events between systems
     */
    setupIntegrationEvents() {
        // Calculator to other systems
        document.addEventListener('calculationStart', (event) => {
            this.broadcastToSystems('calculationStart', event.detail);
        });

        document.addEventListener('calculationComplete', (event) => {
            this.broadcastToSystems('calculationComplete', event.detail);
            this.updateIntegratedSystems(event.detail);
        });

        document.addEventListener('calculationError', (event) => {
            this.broadcastToSystems('calculationError', event.detail);
            this.handleCalculationError(event.detail);
        });

        // Grid system integration
        document.addEventListener('gridDataUpdated', (event) => {
            this.syncGridData(event.detail);
        });

        // ICC profile integration
        document.addEventListener('iccProfileLoaded', (event) => {
            this.syncIccProfile(event.detail);
        });

        // Client profile integration
        document.addEventListener('clientProfileChanged', (event) => {
            this.syncClientProfile(event.detail);
        });
    }

    /**
     * Set up data flow coordination between systems
     */
    setupDataFlowCoordination() {
        // Coordinate color swatch updates
        this.coordinateSwatchUpdates();
        
        // Coordinate calculation triggers
        this.coordinateCalculationTriggers();
        
        // Coordinate export operations
        this.coordinateExportOperations();
    }

    /**
     * Coordinate color swatch updates across systems
     */
    coordinateSwatchUpdates() {
        let swatchUpdateTimeout;
        
        const updateSwatches = () => {
            clearTimeout(swatchUpdateTimeout);
            swatchUpdateTimeout = setTimeout(() => {
                try {
                    // Update main calculator swatches
                    if (window.updateColorSwatches) {
                        window.updateColorSwatches();
                    }
                    
                    // Update grid visualization if available
                    if (window.gridManager && window.gridManager.updateVisualization) {
                        window.gridManager.updateVisualization();
                    }
                    
                    // Update color converter if available
                    if (window.colorConverter && window.colorConverter.updatePreview) {
                        window.colorConverter.updatePreview();
                    }
                    
                } catch (error) {
                    this.handleSystemError('swatchUpdate', error);
                }
            }, 100); // Debounce swatch updates
        };

        // Listen for color input changes
        document.addEventListener('colorInputChanged', updateSwatches);
        document.addEventListener('iccProfileLoaded', updateSwatches);
        document.addEventListener('substrateChanged', updateSwatches);
    }

    /**
     * Coordinate calculation triggers across systems
     */
    coordinateCalculationTriggers() {
        let calculationTimeout;
        
        const triggerCalculation = () => {
            clearTimeout(calculationTimeout);
            calculationTimeout = setTimeout(() => {
                try {
                    if (this.shouldTriggerAutoCalculation()) {
                        if (window.performColorDifferenceCalculation) {
                            window.performColorDifferenceCalculation();
                        }
                    }
                } catch (error) {
                    this.handleSystemError('autoCalculation', error);
                }
            }, 500); // Debounce auto calculations
        };

        // Listen for input changes that should trigger calculations
        document.addEventListener('colorInputChanged', triggerCalculation);
        document.addEventListener('toleranceChanged', triggerCalculation);
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Monitor system performance
        this.performanceMonitors.set('calculation', {
            startTime: null,
            measurements: [],
            threshold: 1000 // 1 second threshold
        });

        this.performanceMonitors.set('rendering', {
            startTime: null,
            measurements: [],
            threshold: 100 // 100ms threshold
        });

        // Set up performance tracking
        this.setupPerformanceTracking();
    }

    /**
     * Set up performance tracking for critical operations
     */
    setupPerformanceTracking() {
        // Track calculation performance
        document.addEventListener('calculationStart', () => {
            this.startPerformanceTracking('calculation');
        });

        document.addEventListener('calculationComplete', () => {
            this.endPerformanceTracking('calculation');
        });

        // Track rendering performance
        const originalUpdateSwatches = window.updateColorSwatches;
        if (originalUpdateSwatches) {
            window.updateColorSwatches = (...args) => {
                this.startPerformanceTracking('rendering');
                const result = originalUpdateSwatches.apply(this, args);
                this.endPerformanceTracking('rendering');
                return result;
            };
        }
    }

    /**
     * Set up backward compatibility with existing calculator
     */
    setupBackwardCompatibility() {
        // Ensure existing functions continue to work
        this.ensureBackwardCompatibility();
        
        // Provide fallbacks for missing features
        this.provideFallbacks();
        
        // Maintain existing API contracts
        this.maintainApiContracts();
    }

    /**
     * Ensure backward compatibility with existing calculator functions
     */
    ensureBackwardCompatibility() {
        // Preserve existing global functions
        const existingFunctions = [
            'performColorDifferenceCalculation',
            'updateColorSwatches',
            'resetAllInputs',
            'updateCorrectionSuggestions'
        ];

        existingFunctions.forEach(funcName => {
            if (window[funcName]) {
                const originalFunc = window[funcName];
                window[funcName] = (...args) => {
                    try {
                        return originalFunc.apply(this, args);
                    } catch (error) {
                        this.handleSystemError('backwardCompatibility', error, { function: funcName });
                        return null;
                    }
                };
            }
        });
    }

    /**
     * Register system integrations
     */
    registerSystemIntegrations() {
        // Register each system as it becomes available
        this.registerSystem('colorScience', () => window.colorScience);
        this.registerSystem('gridManager', () => window.gridManager);
        this.registerSystem('heatmapVisualization', () => window.heatmapVisualization);
        this.registerSystem('ccmProcessor', () => window.ccmProcessor);
        this.registerSystem('iccProfileManager', () => window.iccProfileManager);
        this.registerSystem('colorLibrary', () => window.colorLibrary);
        this.registerSystem('spectrophotometerIntegration', () => window.spectrophotometerIntegration);
        this.registerSystem('clientProfiles', () => window.clientProfiles);
        this.registerSystem('measurementHistory', () => window.measurementHistory);
        this.registerSystem('colorConverter', () => window.colorConverter);
        
        // Check system availability periodically
        this.startSystemAvailabilityCheck();
    }

    /**
     * Register a system and track its availability
     */
    registerSystem(systemName, availabilityCheck) {
        this.systems.set(systemName, {
            name: systemName,
            available: false,
            instance: null,
            check: availabilityCheck,
            lastCheck: 0
        });
    }

    /**
     * Start periodic system availability checking
     */
    startSystemAvailabilityCheck() {
        const checkInterval = setInterval(() => {
            let allSystemsReady = true;
            
            this.systems.forEach((system, name) => {
                const instance = system.check();
                if (instance && !system.available) {
                    system.available = true;
                    system.instance = instance;
                    this.integrationState[name] = true;
                    console.log(`System integrated: ${name}`);
                    this.emitEvent('systemIntegrated', { name, instance });
                } else if (!instance && system.available) {
                    system.available = false;
                    system.instance = null;
                    this.integrationState[name] = false;
                    console.warn(`System disconnected: ${name}`);
                    this.emitEvent('systemDisconnected', { name });
                }
                
                if (!system.available) {
                    allSystemsReady = false;
                }
            });
            
            // Stop checking once all systems are integrated
            if (allSystemsReady && this.systems.size > 0) {
                clearInterval(checkInterval);
                this.emitEvent('allSystemsIntegrated');
                console.log('All HD systems integrated successfully');
            }
        }, 1000); // Check every second
        
        // Stop checking after 30 seconds to prevent infinite checking
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 30000);
    }

    /**
     * Set up graceful degradation for missing features
     */
    setupGracefulDegradation() {
        // Provide fallbacks for advanced features
        this.setupFeatureFallbacks();
        
        // Handle missing dependencies gracefully
        this.setupDependencyFallbacks();
    }

    /**
     * Set up feature fallbacks for graceful degradation
     */
    setupFeatureFallbacks() {
        // Fallback for grid visualization
        if (!window.gridManager) {
            window.gridManager = {
                updateVisualization: () => console.log('Grid visualization not available'),
                getGridSize: () => ({ rows: 4, cols: 6 }),
                setGridSize: () => console.log('Grid size setting not available')
            };
        }

        // Fallback for heatmap visualization
        if (!window.heatmapVisualization) {
            window.heatmapVisualization = {
                render: () => console.log('Heatmap visualization not available'),
                update: () => console.log('Heatmap update not available')
            };
        }

        // Fallback for ICC profile management
        if (!window.iccProfileManager) {
            window.iccProfileManager = {
                loadProfile: () => console.log('ICC profile management not available'),
                isProfileLoaded: () => false
            };
        }
    }

    /**
     * Initialize cross-browser compatibility
     */
    initializeCrossBrowserSupport() {
        // Check browser capabilities
        this.checkBrowserCapabilities();
        
        // Set up polyfills if needed
        this.setupPolyfills();
        
        // Configure browser-specific optimizations
        this.configureBrowserOptimizations();
    }

    /**
     * Check browser capabilities and set up compatibility
     */
    checkBrowserCapabilities() {
        const capabilities = {
            fileSystemAccess: 'showDirectoryPicker' in window,
            webWorkers: typeof Worker !== 'undefined',
            canvas: !!document.createElement('canvas').getContext,
            localStorage: typeof Storage !== 'undefined',
            requestAnimationFrame: typeof requestAnimationFrame !== 'undefined'
        };

        this.crossBrowserSupport.set('capabilities', capabilities);
        
        // Log capability status
        console.log('Browser capabilities:', capabilities);
        
        // Set up fallbacks for missing capabilities
        this.setupCapabilityFallbacks(capabilities);
    }

    /**
     * Set up fallbacks for missing browser capabilities
     */
    setupCapabilityFallbacks(capabilities) {
        // File System Access API fallback
        if (!capabilities.fileSystemAccess) {
            console.log('File System Access API not available, using drag-and-drop fallback');
        }

        // RequestAnimationFrame fallback
        if (!capabilities.requestAnimationFrame) {
            window.requestAnimationFrame = (callback) => setTimeout(callback, 16);
        }

        // Canvas fallback
        if (!capabilities.canvas) {
            console.warn('Canvas not supported, visual features will be limited');
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(error, filename, lineno) {
        console.error('Global error caught:', error, 'at', filename, ':', lineno);
        
        // Attempt to identify which system caused the error
        const systemName = this.identifyErrorSource(error, filename);
        
        if (systemName) {
            this.handleSystemError(systemName, error);
        } else {
            this.handleUnknownError(error);
        }
    }

    /**
     * Handle promise rejections
     */
    handlePromiseRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        // Show user-friendly error message
        if (window.toastSystem) {
            window.toastSystem.error('System Error', 'An unexpected error occurred. Please refresh the page if issues persist.');
        }
    }

    /**
     * Handle system-specific errors
     */
    handleSystemError(systemName, error, context = {}) {
        console.error(`System error in ${systemName}:`, error, context);
        
        // Get error handler for this system
        const errorHandler = this.errorHandlers.get(systemName);
        
        if (errorHandler) {
            try {
                // Attempt recovery
                errorHandler.recovery();
                
                // Provide fallback functionality
                errorHandler.fallback();
                
            } catch (recoveryError) {
                console.error(`Failed to recover from ${systemName} error:`, recoveryError);
            }
        }
        
        // Show user notification
        if (window.toastSystem) {
            window.toastSystem.error('System Error', `${systemName} encountered an error. Functionality may be limited.`);
        }
        
        // Emit error event for other systems to handle
        this.emitEvent('systemError', { systemName, error, context });
    }

    /**
     * Handle critical errors that affect core functionality
     */
    handleCriticalError(error) {
        console.error('Critical error:', error);
        
        // Show critical error message
        if (window.toastSystem) {
            window.toastSystem.error('Critical Error', 'A critical error occurred. Please refresh the page.');
        } else {
            alert('A critical error occurred. Please refresh the page.');
        }
        
        // Emit critical error event
        this.emitEvent('criticalError', { error });
    }

    /**
     * Broadcast events to all integrated systems
     */
    broadcastToSystems(eventType, data) {
        this.systems.forEach((system, name) => {
            if (system.available && system.instance) {
                try {
                    // Check if system has event handler
                    const handlerName = `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;
                    if (typeof system.instance[handlerName] === 'function') {
                        system.instance[handlerName](data);
                    }
                } catch (error) {
                    console.warn(`Failed to broadcast ${eventType} to ${name}:`, error);
                }
            }
        });
    }

    /**
     * Update integrated systems with calculation results
     */
    updateIntegratedSystems(results) {
        try {
            // Update measurement history
            if (window.measurementHistory && window.measurementHistory.addMeasurement) {
                window.measurementHistory.addMeasurement(results);
            }
            
            // Update correction suggestions
            if (window.correctionSuggestionsUI && window.correctionSuggestionsUI.updateSuggestions) {
                window.correctionSuggestionsUI.updateSuggestions(results);
            }
            
            // Update substrate profile system
            if (window.substrateProfileSystem && window.substrateProfileSystem.updateCorrections) {
                window.substrateProfileSystem.updateCorrections(results);
            }
            
            // Update grid statistics if grid is active
            if (window.gridManager && window.gridManager.updateStatistics) {
                window.gridManager.updateStatistics();
            }
            
        } catch (error) {
            this.handleSystemError('systemUpdate', error);
        }
    }

    /**
     * Validate application state
     */
    validateState() {
        if (!window.appState) {
            console.error('Application state not found');
            return false;
        }
        
        let isValid = true;
        
        this.stateValidators.forEach((validator, name) => {
            try {
                if (!validator(window.appState)) {
                    console.error(`State validation failed for: ${name}`);
                    isValid = false;
                }
            } catch (error) {
                console.error(`State validator error for ${name}:`, error);
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        return {
            initialized: this.initialized,
            systems: Object.fromEntries(
                Array.from(this.systems.entries()).map(([name, system]) => [
                    name, 
                    { available: system.available, lastCheck: system.lastCheck }
                ])
            ),
            state: this.integrationState,
            errors: this.getRecentErrors()
        };
    }

    /**
     * Emit custom events
     */
    emitEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
        this.eventBus.dispatchEvent(event);
    }

    /**
     * Performance tracking utilities
     */
    startPerformanceTracking(operation) {
        const monitor = this.performanceMonitors.get(operation);
        if (monitor) {
            monitor.startTime = performance.now();
        }
    }

    endPerformanceTracking(operation) {
        const monitor = this.performanceMonitors.get(operation);
        if (monitor && monitor.startTime) {
            const duration = performance.now() - monitor.startTime;
            monitor.measurements.push(duration);
            
            // Keep only last 100 measurements
            if (monitor.measurements.length > 100) {
                monitor.measurements.shift();
            }
            
            // Warn if operation is slow
            if (duration > monitor.threshold) {
                console.warn(`Slow ${operation} operation: ${duration.toFixed(2)}ms`);
            }
            
            monitor.startTime = null;
        }
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const stats = {};
        
        this.performanceMonitors.forEach((monitor, operation) => {
            if (monitor.measurements.length > 0) {
                const measurements = monitor.measurements;
                const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
                const max = Math.max(...measurements);
                const min = Math.min(...measurements);
                
                stats[operation] = {
                    average: avg.toFixed(2),
                    maximum: max.toFixed(2),
                    minimum: min.toFixed(2),
                    count: measurements.length,
                    threshold: monitor.threshold
                };
            }
        });
        
        return stats;
    }

    /**
     * Utility methods
     */
    shouldTriggerAutoCalculation() {
        return window.appState && 
               window.appState.target && 
               window.appState.sample &&
               this.validateState();
    }

    identifyErrorSource(error, filename) {
        if (!filename) return null;
        
        const systemFiles = {
            'color-science.js': 'colorScience',
            'grid-manager.js': 'gridManager',
            'heatmap-visualization.js': 'heatmapVisualization',
            'ccm-processor.js': 'ccmProcessor',
            'icc-profile-manager.js': 'iccProfileManager',
            'color-library.js': 'colorLibrary',
            'spectrophotometer-integration.js': 'spectrophotometerIntegration',
            'client-profiles.js': 'clientProfiles',
            'measurement-history.js': 'measurementHistory',
            'color-converter.js': 'colorConverter'
        };
        
        for (const [file, system] of Object.entries(systemFiles)) {
            if (filename.includes(file)) {
                return system;
            }
        }
        
        return null;
    }

    getRecentErrors() {
        // Return recent errors (implementation would track errors)
        return [];
    }
}

// Initialize integration manager
const integrationManager = new IntegrationManager();

// Make it globally available
window.integrationManager = integrationManager;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationManager;
}

console.log('HD CMYK Integration Manager loaded');