/**
 * HD CMYK Backward Compatibility Layer
 * Maintains backward compatibility with current calculation workflows
 * Requirements: Maintain backward compatibility with current calculation workflows
 */

console.log('HD CMYK Backward Compatibility Layer loading...');

class BackwardCompatibilityLayer {
    constructor() {
        this.legacyFunctions = new Map();
        this.legacyState = new Map();
        this.migrationHandlers = new Map();
        this.compatibilityWarnings = [];

        this.init();
    }

    /**
     * Initialize backward compatibility layer
     */
    init() {
        console.log('Initializing Backward Compatibility Layer...');

        // Preserve existing global functions
        this.preserveGlobalFunctions();

        // Set up legacy state management
        this.setupLegacyStateManagement();

        // Set up API compatibility
        this.setupApiCompatibility();

        // Set up migration handlers
        this.setupMigrationHandlers();

        // Set up compatibility monitoring
        this.setupCompatibilityMonitoring();

        console.log('Backward Compatibility Layer initialized');
    }

    /**
     * Preserve existing global functions
     */
    preserveGlobalFunctions() {
        const criticalFunctions = [
            'performColorDifferenceCalculation',
            'updateColorSwatches',
            'resetAllInputs',
            'updateCorrectionSuggestions',
            'copyCurrentCalculationToClipboard',
            'showStatusMessage'
        ];

        criticalFunctions.forEach(funcName => {
            if (window[funcName]) {
                // Store original function
                this.legacyFunctions.set(funcName, window[funcName]);

                // Wrap with compatibility layer
                window[funcName] = this.createCompatibilityWrapper(funcName, window[funcName]);
            } else {
                // Create fallback if function doesn't exist
                this.createFallbackFunction(funcName);
            }
        });

        // Preserve legacy color conversion functions
        this.preserveColorConversionFunctions();

        // Preserve legacy calculation functions
        this.preserveCalculationFunctions();
    }

    /**
     * Create compatibility wrapper for functions
     */
    createCompatibilityWrapper(funcName, originalFunc) {
        return (...args) => {
            try {
                // Log usage for monitoring
                this.logFunctionUsage(funcName, args);

                // Call original function
                const result = originalFunc.apply(this, args);

                // Handle any necessary post-processing
                this.handlePostProcessing(funcName, result, args);

                return result;

            } catch (error) {
                console.error(`Error in legacy function ${funcName}:`, error);

                // Attempt recovery
                const fallbackResult = this.attemptFunctionRecovery(funcName, args, error);

                if (fallbackResult !== null) {
                    return fallbackResult;
                }

                // Re-throw if recovery failed
                throw error;
            }
        };
    }

    /**
     * Create fallback functions for missing legacy functions
     */
    createFallbackFunction(funcName) {
        switch (funcName) {
            case 'performColorDifferenceCalculation':
                window[funcName] = () => {
                    console.warn('Legacy performColorDifferenceCalculation called - using fallback');
                    return this.fallbackCalculation();
                };
                break;

            case 'updateColorSwatches':
                window[funcName] = () => {
                    console.warn('Legacy updateColorSwatches called - using fallback');
                    return this.fallbackSwatchUpdate();
                };
                break;

            case 'resetAllInputs':
                window[funcName] = () => {
                    console.warn('Legacy resetAllInputs called - using fallback');
                    return this.fallbackReset();
                };
                break;

            case 'updateCorrectionSuggestions':
                window[funcName] = () => {
                    console.warn('Legacy updateCorrectionSuggestions called - using fallback');
                    return this.fallbackCorrectionUpdate();
                };
                break;

            case 'copyCurrentCalculationToClipboard':
                window[funcName] = () => {
                    console.warn('Legacy copyCurrentCalculationToClipboard called - using fallback');
                    return this.fallbackClipboardCopy();
                };
                break;

            case 'showStatusMessage':
                window[funcName] = (message, type = 'info', duration = 3000) => {
                    console.warn('Legacy showStatusMessage called - using fallback');
                    return this.fallbackStatusMessage(message, type, duration);
                };
                break;

            default:
                window[funcName] = () => {
                    console.warn(`Legacy function ${funcName} not implemented - no-op fallback`);
                };
        }
    }

    /**
     * Preserve color conversion functions
     */
    preserveColorConversionFunctions() {
        // Ensure color science functions are available globally
        if (window.colorScience) {
            const colorFunctions = [
                'cmykToRgb',
                'labToRgb',
                'rgbToLab',
                'cmykogvToRgb',
                'calculateDeltaE'
            ];

            colorFunctions.forEach(funcName => {
                if (window.colorScience[funcName] && !window[funcName]) {
                    window[funcName] = window.colorScience[funcName].bind(window.colorScience);
                }
            });
        }

        // Create fallbacks for missing color functions
        if (!window.cmykToRgb) {
            window.cmykToRgb = (c, m, y, k) => {
                console.warn('Using fallback CMYK to RGB conversion');
                return this.fallbackCmykToRgb(c, m, y, k);
            };
        }

        if (!window.labToRgb) {
            window.labToRgb = (l, a, b) => {
                console.warn('Using fallback LAB to RGB conversion');
                return this.fallbackLabToRgb(l, a, b);
            };
        }
    }

    /**
     * Preserve calculation functions
     */
    preserveCalculationFunctions() {
        // Ensure Delta E calculation is available
        if (!window.calculateDeltaE && window.colorScience && window.colorScience.calculateDeltaE) {
            window.calculateDeltaE = window.colorScience.calculateDeltaE.bind(window.colorScience);
        }

        // Create fallback Delta E calculation
        if (!window.calculateDeltaE) {
            window.calculateDeltaE = (lab1, lab2, method = 'DE76') => {
                console.warn('Using fallback Delta E calculation');
                return this.fallbackDeltaE(lab1, lab2, method);
            };
        }
    }

    /**
     * Set up legacy state management
     */
    setupLegacyStateManagement() {
        // Ensure global appState exists and maintains legacy structure
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
                lastCalculationTime: 0
            };
        }

        // Preserve legacy state properties
        this.ensureLegacyStateProperties();

        // Set up state migration
        this.setupStateMigration();
    }

    /**
     * Ensure legacy state properties exist
     */
    ensureLegacyStateProperties() {
        const requiredProperties = {
            'target': { cmyk: { c: 0, m: 0, y: 0, k: 0 }, lab: { l: 50, a: 0, b: 0 } },
            'sample': { cmyk: { c: 0, m: 0, y: 0, k: 0 }, lab: { l: 50, a: 0, b: 0 } },
            'results': null,
            'history': [],
            'isCalculating': false,
            'lastCalculationTime': 0
        };

        Object.keys(requiredProperties).forEach(prop => {
            if (!(prop in window.appState)) {
                window.appState[prop] = requiredProperties[prop];
                console.log(`Added missing legacy state property: ${prop}`);
            }
        });
    }

    /**
     * Set up API compatibility
     */
    setupApiCompatibility() {
        // Maintain legacy event names
        this.setupLegacyEvents();

        // Maintain legacy DOM element IDs
        this.setupLegacyDomCompatibility();

        // Maintain legacy CSS classes
        this.setupLegacyCssCompatibility();
    }

    /**
     * Set up legacy event compatibility
     */
    setupLegacyEvents() {
        // Map new events to legacy event names
        const eventMappings = {
            'calculationComplete': 'colorCalculationComplete',
            'calculationStart': 'colorCalculationStart',
            'calculationError': 'colorCalculationError'
        };

        Object.keys(eventMappings).forEach(newEvent => {
            document.addEventListener(newEvent, (event) => {
                // Also dispatch legacy event name
                const legacyEvent = new CustomEvent(eventMappings[newEvent], {
                    detail: event.detail
                });
                document.dispatchEvent(legacyEvent);
            });
        });
    }

    /**
     * Set up legacy DOM compatibility
     */
    setupLegacyDomCompatibility() {
        // Ensure critical DOM elements exist with expected IDs
        const criticalElements = [
            { id: 'calculate-btn', tag: 'button', text: 'Calculate' },
            { id: 'reset-btn', tag: 'button', text: 'Reset' },
            { id: 'results-section', tag: 'div', class: 'results-section' }
        ];

        criticalElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                console.warn(`Creating missing legacy element: ${element.id}`);
                this.createLegacyElement(element);
            }
        });
    }

    /**
     * Create missing legacy DOM elements
     */
    createLegacyElement(elementConfig) {
        const element = document.createElement(elementConfig.tag);
        element.id = elementConfig.id;

        if (elementConfig.text) {
            element.textContent = elementConfig.text;
        }

        if (elementConfig.class) {
            element.className = elementConfig.class;
        }

        // Add to document (hidden by default)
        element.style.display = 'none';
        document.body.appendChild(element);
    }

    /**
     * Set up migration handlers
     */
    setupMigrationHandlers() {
        // Handle migration from old data formats
        this.migrationHandlers.set('colorData', (oldData) => {
            return this.migrateColorData(oldData);
        });

        this.migrationHandlers.set('calculationResults', (oldResults) => {
            return this.migrateCalculationResults(oldResults);
        });

        this.migrationHandlers.set('userPreferences', (oldPrefs) => {
            return this.migrateUserPreferences(oldPrefs);
        });
    }

    /**
     * Set up compatibility monitoring
     */
    setupCompatibilityMonitoring() {
        // Monitor usage of legacy functions
        setInterval(() => {
            this.reportCompatibilityStatus();
        }, 30000); // Report every 30 seconds

        // Monitor for deprecated API usage
        this.setupDeprecationWarnings();
    }

    /**
     * Fallback implementations
     */
    fallbackCalculation() {
        try {
            if (!window.appState) return null;

            const { target, sample } = window.appState;
            if (!target || !sample || !target.lab || !sample.lab) return null;

            // Simple Delta E calculation
            const deltaE = this.fallbackDeltaE(target.lab, sample.lab);

            const results = {
                deltaE,
                target,
                sample,
                timestamp: Date.now(),
                toleranceZone: deltaE <= 1 ? 'excellent' : deltaE <= 3 ? 'good' : 'acceptable'
            };

            window.appState.results = results;

            // Emit completion event
            document.dispatchEvent(new CustomEvent('calculationComplete', { detail: results }));

            return results;

        } catch (error) {
            console.error('Fallback calculation failed:', error);
            return null;
        }
    }

    fallbackSwatchUpdate() {
        try {
            // Update color swatches using basic color conversion
            const targetSwatch = document.querySelector('.target-swatch');
            const sampleSwatch = document.querySelector('.sample-swatch');

            if (targetSwatch && window.appState && window.appState.target) {
                const targetColor = this.getSwatchColor(window.appState.target);
                targetSwatch.style.backgroundColor = targetColor;
            }

            if (sampleSwatch && window.appState && window.appState.sample) {
                const sampleColor = this.getSwatchColor(window.appState.sample);
                sampleSwatch.style.backgroundColor = sampleColor;
            }

        } catch (error) {
            console.error('Fallback swatch update failed:', error);
        }
    }

    fallbackReset() {
        try {
            // Reset all input fields
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                if (input.id.includes('target-') || input.id.includes('sample-')) {
                    if (input.id.includes('-l')) {
                        input.value = '50';
                    } else {
                        input.value = '0';
                    }
                }
            });

            // Reset state
            if (window.appState) {
                window.appState.target = {
                    cmyk: { c: 0, m: 0, y: 0, k: 0 },
                    lab: { l: 50, a: 0, b: 0 }
                };
                window.appState.sample = {
                    cmyk: { c: 0, m: 0, y: 0, k: 0 },
                    lab: { l: 50, a: 0, b: 0 }
                };
                window.appState.results = null;
            }

            // Update swatches
            this.fallbackSwatchUpdate();

        } catch (error) {
            console.error('Fallback reset failed:', error);
        }
    }

    fallbackCorrectionUpdate() {
        // No-op fallback for correction suggestions
        console.log('Correction suggestions update (fallback)');
    }

    fallbackClipboardCopy() {
        try {
            if (!window.appState || !window.appState.results) {
                console.warn('No calculation results to copy');
                return;
            }

            const results = window.appState.results;
            const text = `Delta E: ${results.deltaE.toFixed(2)}`;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                console.log('Copied to clipboard (fallback)');
            } else {
                console.warn('Clipboard API not available');
            }

        } catch (error) {
            console.error('Fallback clipboard copy failed:', error);
        }
    }

    fallbackStatusMessage(message, type, duration) {
        console.log(`Status (${type}): ${message}`);

        // Try to use toast system if available
        if (window.toastSystem) {
            window.toastSystem[type](type.charAt(0).toUpperCase() + type.slice(1), message, { duration });
        }
    }

    fallbackCmykToRgb(c, m, y, k) {
        // Simple CMYK to RGB conversion
        const cNorm = c / 100;
        const mNorm = m / 100;
        const yNorm = y / 100;
        const kNorm = k / 100;

        const r = 255 * (1 - cNorm) * (1 - kNorm);
        const g = 255 * (1 - mNorm) * (1 - kNorm);
        const b = 255 * (1 - yNorm) * (1 - kNorm);

        return {
            r: Math.round(Math.max(0, Math.min(255, r))),
            g: Math.round(Math.max(0, Math.min(255, g))),
            b: Math.round(Math.max(0, Math.min(255, b)))
        };
    }

    fallbackLabToRgb(l, a, b) {
        // Very basic LAB to RGB approximation
        // This is not accurate but provides a visual approximation
        const lightness = l / 100;
        const aComponent = (a + 128) / 255;
        const bComponent = (b + 128) / 255;

        return {
            r: Math.round(255 * lightness * (1 + aComponent * 0.5)),
            g: Math.round(255 * lightness * (1 - aComponent * 0.3)),
            b: Math.round(255 * lightness * (1 - bComponent * 0.5))
        };
    }

    fallbackDeltaE(lab1, lab2, method = 'DE76') {
        // Simple CIE76 Delta E calculation
        const dL = lab1.l - lab2.l;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;

        return Math.sqrt(dL * dL + da * da + db * db);
    }

    /**
     * Utility methods
     */
    getSwatchColor(colorData) {
        if (colorData.cmyk) {
            const rgb = this.fallbackCmykToRgb(colorData.cmyk.c, colorData.cmyk.m, colorData.cmyk.y, colorData.cmyk.k);
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        } else if (colorData.lab) {
            const rgb = this.fallbackLabToRgb(colorData.lab.l, colorData.lab.a, colorData.lab.b);
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        }
        return '#ffffff';
    }

    logFunctionUsage(funcName, args) {
        // Log usage for monitoring (could be sent to analytics)
        console.log(`Legacy function used: ${funcName}`, args.length > 0 ? 'with args' : 'no args');
    }

    handlePostProcessing(funcName, result, args) {
        // Handle any necessary post-processing for legacy functions
        switch (funcName) {
            case 'performColorDifferenceCalculation':
                // Ensure results are properly formatted
                if (result && window.appState) {
                    window.appState.results = result;
                }
                break;
        }
    }

    attemptFunctionRecovery(funcName, args, error) {
        console.warn(`Attempting recovery for ${funcName}:`, error.message);

        // Attempt to use fallback implementations
        switch (funcName) {
            case 'performColorDifferenceCalculation':
                return this.fallbackCalculation();
            case 'updateColorSwatches':
                this.fallbackSwatchUpdate();
                return true;
            case 'resetAllInputs':
                this.fallbackReset();
                return true;
            default:
                return null;
        }
    }

    reportCompatibilityStatus() {
        const status = {
            legacyFunctionsUsed: this.legacyFunctions.size,
            compatibilityWarnings: this.compatibilityWarnings.length,
            migrationHandlers: this.migrationHandlers.size
        };

        console.log('Compatibility status:', status);
    }

    setupDeprecationWarnings() {
        // Set up warnings for deprecated API usage
        const deprecatedAPIs = [
            'window.oldCalculateFunction',
            'window.legacyColorConverter'
        ];

        deprecatedAPIs.forEach(api => {
            if (window[api.split('.')[1]]) {
                console.warn(`Deprecated API detected: ${api}`);
                this.compatibilityWarnings.push(`Deprecated API: ${api}`);
            }
        });
    }

    /**
     * Migration methods
     */
    migrateColorData(oldData) {
        // Migrate old color data format to new format
        if (oldData && typeof oldData === 'object') {
            return {
                cmyk: oldData.cmyk || { c: 0, m: 0, y: 0, k: 0 },
                lab: oldData.lab || { l: 50, a: 0, b: 0 }
            };
        }
        return null;
    }

    migrateCalculationResults(oldResults) {
        // Migrate old results format to new format
        if (oldResults && typeof oldResults === 'object') {
            return {
                deltaE: oldResults.deltaE || 0,
                target: oldResults.target || null,
                sample: oldResults.sample || null,
                timestamp: oldResults.timestamp || Date.now(),
                toleranceZone: oldResults.toleranceZone || 'unknown'
            };
        }
        return null;
    }

    migrateUserPreferences(oldPrefs) {
        // Migrate old preferences format to new format
        return oldPrefs || {};
    }

    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
        return {
            legacyFunctions: Array.from(this.legacyFunctions.keys()),
            warnings: this.compatibilityWarnings,
            migrationHandlers: Array.from(this.migrationHandlers.keys()),
            stateProperties: Object.keys(window.appState || {}),
            timestamp: Date.now()
        };
    }
}

// Initialize backward compatibility layer
const backwardCompatibilityLayer = new BackwardCompatibilityLayer();

// Make it globally available
window.backwardCompatibilityLayer = backwardCompatibilityLayer;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackwardCompatibilityLayer;
}

console.log('HD CMYK Backward Compatibility Layer loaded');