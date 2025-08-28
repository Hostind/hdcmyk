/**
 * Enhancement Integration
 * Integrates all advanced features and optimizations
 */

class EnhancementIntegrationManager {
    constructor() {
        this.systems = {
            toast: null,
            debounced: null,
            keyboard: null,
            accessibility: null,
            performance: null
        };
        this.initialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        console.log('Initializing enhancement integration...');
        
        // Initialize systems in order
        this.initializeSystems();
        
        // Set up cross-system communication
        this.setupCommunication();
        
        // Set up global event handlers
        this.setupGlobalEventHandlers();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Set up user experience enhancements
        this.setupUXEnhancements();
        
        this.initialized = true;
        console.log('Enhancement integration complete');
        
        // Notify user that advanced features are ready
        this.showWelcomeMessage();
    }

    initializeSystems() {
        // Reference existing global instances
        this.systems.toast = window.toastSystem;
        this.systems.debounced = window.debouncedInputHandler;
        this.systems.keyboard = window.keyboardShortcuts;
        this.systems.accessibility = window.accessibilityManager;
        this.systems.performance = window.performanceManager;
        
        // Verify all systems are available
        const missingSystem = Object.entries(this.systems).find(([name, system]) => !system);
        if (missingSystem) {
            console.warn(`Enhancement system not available: ${missingSystem[0]}`);
        }
    }

    setupCommunication() {
        // Set up toast notifications for various events
        this.setupToastIntegration();
        
        // Set up accessibility announcements
        this.setupAccessibilityIntegration();
        
        // Set up performance optimization triggers
        this.setupPerformanceIntegration();
        
        // Set up keyboard shortcut feedback
        this.setupKeyboardIntegration();
    }

    setupToastIntegration() {
        if (!this.systems.toast) return;

        // File operations
        document.addEventListener('fileLoadStart', (event) => {
            const fileName = event.detail.fileName || 'file';
            this.systems.toast.info('Loading File', `Processing ${fileName}...`, {
                id: 'file-operation',
                duration: 0
            });
        });

        document.addEventListener('fileLoadComplete', (event) => {
            this.systems.toast.hide('file-operation');
            const fileName = event.detail.fileName || 'file';
            const recordCount = event.detail.recordCount || 0;
            this.systems.toast.success('File Loaded', `${fileName} loaded with ${recordCount} records`);
        });

        document.addEventListener('fileLoadError', (event) => {
            this.systems.toast.hide('file-operation');
            const error = event.detail.error || 'Unknown error';
            this.systems.toast.error('File Error', `Failed to load file: ${error}`);
        });

        // Calculation events
        document.addEventListener('calculationStart', () => {
            this.systems.toast.info('Calculating', 'Processing color difference...', {
                id: 'calculation',
                duration: 0
            });
        });

        document.addEventListener('calculationComplete', (event) => {
            this.systems.toast.hide('calculation');
            const result = event.detail;
            if (result && result.deltaE !== undefined) {
                const tolerance = this.getToleranceDescription(result.deltaE);
                this.systems.toast.success('Complete', `ΔE: ${result.deltaE.toFixed(2)} (${tolerance})`);
            }
        });

        document.addEventListener('calculationError', (event) => {
            this.systems.toast.hide('calculation');
            const error = event.detail.message || 'Calculation failed';
            this.systems.toast.error('Error', error);
        });

        // Export events
        document.addEventListener('exportStart', (event) => {
            const format = event.detail.format || 'file';
            this.systems.toast.info('Exporting', `Generating ${format.toUpperCase()} export...`, {
                id: 'export',
                duration: 0
            });
        });

        document.addEventListener('exportComplete', (event) => {
            this.systems.toast.hide('export');
            const format = event.detail.format || 'file';
            this.systems.toast.success('Export Complete', `${format.toUpperCase()} file downloaded`);
        });

        document.addEventListener('exportError', (event) => {
            this.systems.toast.hide('export');
            const error = event.detail.error || 'Export failed';
            this.systems.toast.error('Export Error', error);
        });
    }

    setupAccessibilityIntegration() {
        if (!this.systems.accessibility) return;

        // Announce calculation results
        document.addEventListener('calculationComplete', (event) => {
            const result = event.detail;
            if (result && result.deltaE !== undefined) {
                const tolerance = this.getToleranceDescription(result.deltaE);
                const message = `Calculation complete. Delta E value is ${result.deltaE.toFixed(2)}. Color difference is ${tolerance}.`;
                this.systems.accessibility.announceMessage(message);
            }
        });

        // Announce file operations
        document.addEventListener('fileLoadComplete', (event) => {
            const fileName = event.detail.fileName || 'file';
            const recordCount = event.detail.recordCount || 0;
            const message = `File ${fileName} loaded successfully with ${recordCount} records.`;
            this.systems.accessibility.announceMessage(message);
        });

        // Announce errors
        document.addEventListener('calculationError', (event) => {
            const error = event.detail.message || 'Calculation failed';
            this.systems.accessibility.announceMessage(`Error: ${error}`, 'assertive');
        });

        document.addEventListener('validationError', (event) => {
            const field = event.detail.field || 'input';
            const message = event.detail.message || 'Invalid value';
            this.systems.accessibility.announceMessage(`${field}: ${message}`, 'assertive');
        });
    }

    setupPerformanceIntegration() {
        if (!this.systems.performance) return;

        // Monitor large dataset operations
        document.addEventListener('datasetSizeChange', (event) => {
            const size = event.detail.size || 0;
            if (size > 1000) {
                this.systems.performance.optimizeForLargeDataset(size);
                if (this.systems.toast) {
                    this.systems.toast.info('Performance', 'Large dataset detected. Optimizations enabled.');
                }
            }
        });

        // Monitor real-time operations
        document.addEventListener('realtimeModeEnabled', () => {
            this.systems.performance.optimizeForRealTime();
            if (this.systems.toast) {
                this.systems.toast.info('Performance', 'Real-time mode enabled with optimizations.');
            }
        });

        // Handle performance warnings
        document.addEventListener('performanceWarning', (event) => {
            const warning = event.detail.warning || 'Performance issue detected';
            if (this.systems.toast) {
                this.systems.toast.warning('Performance', warning);
            }
        });
    }

    setupKeyboardIntegration() {
        if (!this.systems.keyboard) return;

        // Listen for keyboard shortcut usage
        document.addEventListener('keyboardShortcutUsed', (event) => {
            const shortcut = event.detail.shortcut;
            console.log(`Keyboard shortcut used: ${shortcut}`);
        });

        // Provide feedback for certain shortcuts
        document.addEventListener('toastAction', (event) => {
            const action = event.detail.action;
            
            switch (action) {
                case 'showShortcuts':
                    this.systems.keyboard.showHelp();
                    break;
                case 'calculate':
                    if (window.performColorDifferenceCalculation) {
                        window.performColorDifferenceCalculation();
                    }
                    break;
                case 'reset':
                    if (window.resetAllInputs) {
                        window.resetAllInputs();
                    }
                    break;
            }
        });
    }

    setupGlobalEventHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (this.systems.toast) {
                this.systems.toast.error('System Error', 'An unexpected error occurred');
            }
        });

        // Handle global errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (this.systems.toast) {
                this.systems.toast.error('Error', 'A system error occurred');
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            if (this.systems.toast) {
                this.systems.toast.success('Connection', 'Back online');
            }
        });

        window.addEventListener('offline', () => {
            if (this.systems.toast) {
                this.systems.toast.warning('Connection', 'Working offline');
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            if (loadTime > 5000) { // 5 seconds
                if (this.systems.toast) {
                    this.systems.toast.warning('Performance', 'Slow page load detected. Consider refreshing.');
                }
            }
        });

        // Monitor memory usage periodically
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
                
                if (usagePercent > 90) {
                    if (this.systems.toast) {
                        this.systems.toast.warning('Memory', 'High memory usage. Consider refreshing the page.');
                    }
                }
            }, 60000); // Check every minute
        }
    }

    setupUXEnhancements() {
        // Auto-save user preferences
        this.setupAutoSave();
        
        // Set up smart defaults
        this.setupSmartDefaults();
        
        // Set up contextual help
        this.setupContextualHelp();
        
        // Set up progressive disclosure
        this.setupProgressiveDisclosure();
    }

    setupAutoSave() {
        // Auto-save input values
        const inputs = document.querySelectorAll('input[type="number"], select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveInputValue(input.id, input.value);
            });
        });

        // Restore saved values on load
        inputs.forEach(input => {
            const savedValue = this.getSavedInputValue(input.id);
            if (savedValue !== null) {
                input.value = savedValue;
            }
        });
    }

    saveInputValue(inputId, value) {
        try {
            localStorage.setItem(`hd-cmyk-input-${inputId}`, value);
        } catch (error) {
            console.warn('Failed to save input value:', error);
        }
    }

    getSavedInputValue(inputId) {
        try {
            return localStorage.getItem(`hd-cmyk-input-${inputId}`);
        } catch (error) {
            console.warn('Failed to get saved input value:', error);
            return null;
        }
    }

    setupSmartDefaults() {
        // Set intelligent default values based on usage patterns
        const usageData = this.getUsageData();
        
        if (usageData.commonSubstrate) {
            const substrateSelect = document.getElementById('substrate-select');
            if (substrateSelect) {
                substrateSelect.value = usageData.commonSubstrate;
            }
        }

        if (usageData.commonTolerance) {
            const toleranceInput = document.getElementById('tolerance-input');
            if (toleranceInput) {
                toleranceInput.value = usageData.commonTolerance;
            }
        }
    }

    getUsageData() {
        try {
            const data = localStorage.getItem('hd-cmyk-usage-data');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            return {};
        }
    }

    setupContextualHelp() {
        // Add contextual help tooltips
        const helpElements = document.querySelectorAll('[data-help]');
        helpElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.showContextualHelp(element);
            });
        });
    }

    showContextualHelp(element) {
        const helpText = element.getAttribute('data-help');
        if (helpText && this.systems.toast) {
            this.systems.toast.info('Help', helpText, { duration: 3000 });
        }
    }

    setupProgressiveDisclosure() {
        // Show advanced features progressively
        const advancedSections = document.querySelectorAll('.advanced-section');
        advancedSections.forEach(section => {
            section.style.display = 'none';
        });

        // Show advanced features after user interaction
        let interactionCount = 0;
        document.addEventListener('click', () => {
            interactionCount++;
            if (interactionCount === 5) { // After 5 interactions
                this.revealAdvancedFeatures();
            }
        });
    }

    revealAdvancedFeatures() {
        const advancedSections = document.querySelectorAll('.advanced-section');
        advancedSections.forEach(section => {
            section.style.display = 'block';
            section.classList.add('revealed');
        });

        if (this.systems.toast) {
            this.systems.toast.info('Features', 'Advanced features are now available!', {
                actions: [
                    { label: 'Show Shortcuts', action: 'showShortcuts' }
                ]
            });
        }
    }

    showWelcomeMessage() {
        if (this.systems.toast) {
            this.systems.toast.success('Welcome', 'HD CMYK Calculator ready with advanced features', {
                duration: 5000,
                actions: [
                    { label: 'Show Shortcuts', action: 'showShortcuts' }
                ]
            });
        }
    }

    getToleranceDescription(deltaE) {
        if (deltaE <= 0.5) return 'excellent match';
        if (deltaE <= 1.0) return 'very good match';
        if (deltaE <= 2.0) return 'good match';
        if (deltaE <= 4.0) return 'acceptable match';
        return 'poor match';
    }

    // Public API methods
    isInitialized() {
        return this.initialized;
    }

    getSystem(name) {
        return this.systems[name];
    }

    showNotification(type, title, message, options = {}) {
        if (this.systems.toast) {
            this.systems.toast[type](title, message, options);
        }
    }

    announceToScreenReader(message, priority = 'polite') {
        if (this.systems.accessibility) {
            this.systems.accessibility.announceMessage(message, priority);
        }
    }

    measurePerformance(name, func) {
        if (this.systems.performance) {
            return this.systems.performance.measurePerformance(name, func);
        }
        return func();
    }

    // Cleanup method
    cleanup() {
        // Clean up event listeners and resources
        Object.values(this.systems).forEach(system => {
            if (system && typeof system.cleanup === 'function') {
                system.cleanup();
            }
        });
    }
}

// Create global instance
window.enhancementIntegration = new EnhancementIntegrationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancementIntegrationManager;
}