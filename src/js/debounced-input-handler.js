/**
 * Debounced Input Handler
 * Provides smooth real-time updates with performance optimization
 */

class DebouncedInputHandler {
    constructor() {
        this.debounceTimers = new Map();
        this.inputCallbacks = new Map();
        this.defaultDelay = 300;
        this.fastDelay = 100;
        this.slowDelay = 500;
        this.init();
    }

    init() {
        this.setupInputListeners();
        console.log('Debounced input handler initialized');
    }

    setupInputListeners() {
        // Set up listeners for all color input fields
        this.setupColorInputs();
        
        // Set up listeners for tolerance and other settings
        this.setupSettingsInputs();
        
        // Set up listeners for file inputs
        this.setupFileInputs();
    }

    setupColorInputs() {
        // Target color inputs
        const targetInputs = [
            'target-c', 'target-m', 'target-y', 'target-k',
            'target-o', 'target-g', 'target-v',
            'target-l', 'target-a', 'target-b'
        ];

        // Sample color inputs
        const sampleInputs = [
            'sample-c', 'sample-m', 'sample-y', 'sample-k',
            'sample-o', 'sample-g', 'sample-v',
            'sample-l', 'sample-a', 'sample-b'
        ];

        // Set up target inputs with fast debounce for real-time preview
        targetInputs.forEach(inputId => {
            this.setupInput(inputId, {
                delay: this.fastDelay,
                callback: (value, element) => this.handleColorInputChange(value, element, 'target'),
                validation: (value, element) => this.validateColorInput(value, element),
                realtime: true
            });
        });

        // Set up sample inputs with fast debounce for real-time preview
        sampleInputs.forEach(inputId => {
            this.setupInput(inputId, {
                delay: this.fastDelay,
                callback: (value, element) => this.handleColorInputChange(value, element, 'sample'),
                validation: (value, element) => this.validateColorInput(value, element),
                realtime: true
            });
        });
    }

    setupSettingsInputs() {
        // Tolerance input
        this.setupInput('tolerance-input', {
            delay: this.defaultDelay,
            callback: (value) => this.handleToleranceChange(value),
            validation: (value) => this.validateTolerance(value)
        });

        // Substrate selection
        this.setupInput('substrate-select', {
            delay: this.fastDelay,
            callback: (value) => this.handleSubstrateChange(value),
            validation: () => true // Always valid for select
        });

        // Grid size inputs
        this.setupInput('grid-rows', {
            delay: this.defaultDelay,
            callback: (value) => this.handleGridSizeChange('rows', value),
            validation: (value) => this.validateGridSize(value)
        });

        this.setupInput('grid-cols', {
            delay: this.defaultDelay,
            callback: (value) => this.handleGridSizeChange('cols', value),
            validation: (value) => this.validateGridSize(value)
        });
    }

    setupFileInputs() {
        // CSV file inputs with immediate processing
        this.setupInput('csv-file-input', {
            delay: 0, // Immediate processing for files
            callback: (value, element) => this.handleFileInput(value, element),
            validation: () => true,
            eventType: 'change'
        });

        this.setupInput('icc-profile-input', {
            delay: 0,
            callback: (value, element) => this.handleICCProfileInput(value, element),
            validation: () => true,
            eventType: 'change'
        });
    }

    setupInput(inputId, options = {}) {
        const element = document.getElementById(inputId);
        if (!element) {
            console.warn(`Input element not found: ${inputId}`);
            return;
        }

        const {
            delay = this.defaultDelay,
            callback = () => {},
            validation = () => true,
            realtime = false,
            eventType = 'input'
        } = options;

        // Store callback for this input
        this.inputCallbacks.set(inputId, { callback, validation, realtime });

        // Set up event listener
        element.addEventListener(eventType, (event) => {
            this.handleInput(inputId, event.target.value, event.target, delay);
        });

        // Set up additional events for better UX
        if (eventType === 'input') {
            // Immediate validation on blur
            element.addEventListener('blur', (event) => {
                this.validateAndUpdate(inputId, event.target.value, event.target, true);
            });

            // Clear validation errors on focus
            element.addEventListener('focus', (event) => {
                this.clearValidationError(event.target);
            });

            // Handle paste events
            element.addEventListener('paste', (event) => {
                setTimeout(() => {
                    this.handleInput(inputId, event.target.value, event.target, this.fastDelay);
                }, 10);
            });
        }

        // Set up accessibility attributes
        this.setupInputAccessibility(element, inputId);
    }

    setupInputAccessibility(element, inputId) {
        // Add ARIA attributes for better accessibility
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${inputId}"]`);
            if (label) {
                element.setAttribute('aria-labelledby', label.id || `${inputId}-label`);
                if (!label.id) {
                    label.id = `${inputId}-label`;
                }
            }
        }

        // Add aria-describedby for validation messages
        element.setAttribute('aria-describedby', `${inputId}-validation`);

        // Add input mode for numeric inputs
        if (this.isNumericInput(inputId)) {
            element.setAttribute('inputmode', 'decimal');
        }
    }

    isNumericInput(inputId) {
        return inputId.includes('-c') || inputId.includes('-m') || inputId.includes('-y') || 
               inputId.includes('-k') || inputId.includes('-o') || inputId.includes('-g') || 
               inputId.includes('-v') || inputId.includes('-l') || inputId.includes('-a') || 
               inputId.includes('-b') || inputId.includes('tolerance') || inputId.includes('grid');
    }

    handleInput(inputId, value, element, delay) {
        // Clear existing timer
        if (this.debounceTimers.has(inputId)) {
            clearTimeout(this.debounceTimers.get(inputId));
        }

        // Set up new timer
        const timer = setTimeout(() => {
            this.validateAndUpdate(inputId, value, element, false);
            this.debounceTimers.delete(inputId);
        }, delay);

        this.debounceTimers.set(inputId, timer);

        // For realtime inputs, also trigger immediate visual feedback
        const inputConfig = this.inputCallbacks.get(inputId);
        if (inputConfig && inputConfig.realtime) {
            this.updateVisualFeedback(inputId, value, element);
        }
    }

    validateAndUpdate(inputId, value, element, immediate = false) {
        const inputConfig = this.inputCallbacks.get(inputId);
        if (!inputConfig) return;

        const { callback, validation } = inputConfig;

        // Validate input
        const isValid = validation(value, element);
        
        if (isValid) {
            this.clearValidationError(element);
            
            // Execute callback
            try {
                callback(value, element);
                this.showInputSuccess(element, immediate);
            } catch (error) {
                console.error(`Error in callback for ${inputId}:`, error);
                this.showValidationError(element, 'Processing error occurred');
                
                // Show toast notification for errors
                if (window.toastSystem) {
                    window.toastSystem.error('Input Error', `Failed to process ${inputId}: ${error.message}`);
                }
            }
        } else {
            this.showValidationError(element, this.getValidationMessage(inputId, value));
        }
    }

    updateVisualFeedback(inputId, value, element) {
        // Add visual feedback class for real-time updates
        element.classList.add('updating');
        
        // Remove class after short delay
        setTimeout(() => {
            element.classList.remove('updating');
        }, 200);

        // Update color swatches for color inputs
        if (this.isColorInput(inputId)) {
            this.updateColorSwatch(inputId, value);
        }
    }

    isColorInput(inputId) {
        return inputId.includes('target-') || inputId.includes('sample-');
    }

    updateColorSwatch(inputId, value) {
        // Determine which color section to update
        const colorType = inputId.startsWith('target-') ? 'target' : 'sample';
        
        // Trigger swatch update with debouncing
        if (window.updateColorSwatches) {
            this.debounceSwatchUpdate(colorType);
        }
    }

    debounceSwatchUpdate(colorType) {
        const swatchTimerId = `swatch-${colorType}`;
        
        if (this.debounceTimers.has(swatchTimerId)) {
            clearTimeout(this.debounceTimers.get(swatchTimerId));
        }

        const timer = setTimeout(() => {
            if (window.updateColorSwatches) {
                window.updateColorSwatches();
            }
            this.debounceTimers.delete(swatchTimerId);
        }, 50); // Very fast for smooth visual feedback

        this.debounceTimers.set(swatchTimerId, timer);
    }

    // Input handlers
    handleColorInputChange(value, element, colorType) {
        // Update application state
        if (window.appState) {
            const channel = this.getChannelFromInputId(element.id);
            const colorSpace = this.getColorSpaceFromInputId(element.id);
            
            if (colorSpace && channel) {
                if (!window.appState[colorType][colorSpace]) {
                    window.appState[colorType][colorSpace] = {};
                }
                window.appState[colorType][colorSpace][channel] = parseFloat(value) || 0;
            }
        }

        // Trigger auto-calculation if both target and sample have values
        this.checkAutoCalculation();
    }

    handleToleranceChange(value) {
        if (window.appState) {
            window.appState.tolerance = parseFloat(value) || 1.0;
        }
        
        // Update tolerance display
        this.updateToleranceDisplay(value);
    }

    handleSubstrateChange(value) {
        if (window.appState) {
            window.appState.substrate = value;
        }
        
        // Update substrate-specific settings
        if (window.substrateProfiles && window.substrateProfiles.applyProfile) {
            window.substrateProfiles.applyProfile(value);
        }
    }

    handleGridSizeChange(dimension, value) {
        if (window.gridManager) {
            const currentSize = window.gridManager.getGridSize();
            const newSize = { ...currentSize };
            newSize[dimension] = parseInt(value) || 4;
            window.gridManager.setGridSize(newSize.rows, newSize.cols);
        }
    }

    handleFileInput(value, element) {
        const files = element.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            // Show processing toast
            if (window.toastSystem) {
                window.toastSystem.info('Processing File', `Loading ${file.name}...`, { duration: 0, id: 'file-processing' });
            }
            
            // Process file based on type
            if (file.name.toLowerCase().endsWith('.csv')) {
                this.processCSVFile(file);
            }
        }
    }

    handleICCProfileInput(value, element) {
        const files = element.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            if (window.toastSystem) {
                window.toastSystem.info('Loading ICC Profile', `Processing ${file.name}...`, { duration: 0, id: 'icc-processing' });
            }
            
            if (window.iccProfileManager) {
                window.iccProfileManager.loadProfile(file);
            }
        }
    }

    processCSVFile(file) {
        if (window.csvEnhanced && window.csvEnhanced.parseFile) {
            window.csvEnhanced.parseFile(file)
                .then(data => {
                    if (window.toastSystem) {
                        window.toastSystem.hide('file-processing');
                        window.toastSystem.success('File Loaded', `Successfully imported ${data.length} rows from ${file.name}`);
                    }
                })
                .catch(error => {
                    if (window.toastSystem) {
                        window.toastSystem.hide('file-processing');
                        window.toastSystem.error('File Error', `Failed to process ${file.name}: ${error.message}`);
                    }
                });
        }
    }

    // Validation methods
    validateColorInput(value, element) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;

        const inputId = element.id;
        
        // CMYK and extended gamut validation (0-100%)
        if (inputId.includes('-c') || inputId.includes('-m') || inputId.includes('-y') || 
            inputId.includes('-k') || inputId.includes('-o') || inputId.includes('-g') || inputId.includes('-v')) {
            return numValue >= 0 && numValue <= 100;
        }
        
        // LAB L* validation (0-100)
        if (inputId.includes('-l')) {
            return numValue >= 0 && numValue <= 100;
        }
        
        // LAB a* and b* validation (-128 to 127)
        if (inputId.includes('-a') || inputId.includes('-b')) {
            return numValue >= -128 && numValue <= 127;
        }
        
        return true;
    }

    validateTolerance(value) {
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 && numValue <= 10;
    }

    validateGridSize(value) {
        const numValue = parseInt(value);
        return !isNaN(numValue) && numValue >= 1 && numValue <= 20;
    }

    getValidationMessage(inputId, value) {
        if (inputId.includes('tolerance')) {
            return 'Tolerance must be between 0 and 10';
        }
        
        if (inputId.includes('grid')) {
            return 'Grid size must be between 1 and 20';
        }
        
        if (inputId.includes('-c') || inputId.includes('-m') || inputId.includes('-y') || 
            inputId.includes('-k') || inputId.includes('-o') || inputId.includes('-g') || inputId.includes('-v')) {
            return 'CMYK values must be between 0 and 100';
        }
        
        if (inputId.includes('-l')) {
            return 'L* value must be between 0 and 100';
        }
        
        if (inputId.includes('-a') || inputId.includes('-b')) {
            return 'a* and b* values must be between -128 and 127';
        }
        
        return 'Invalid input value';
    }

    // Visual feedback methods
    showValidationError(element, message) {
        element.classList.add('validation-error');
        element.setAttribute('aria-invalid', 'true');
        
        // Create or update validation message
        const validationId = `${element.id}-validation`;
        let validationElement = document.getElementById(validationId);
        
        if (!validationElement) {
            validationElement = document.createElement('div');
            validationElement.id = validationId;
            validationElement.className = 'validation-message';
            validationElement.setAttribute('role', 'alert');
            element.parentNode.appendChild(validationElement);
        }
        
        validationElement.textContent = message;
        validationElement.classList.add('error');
    }

    clearValidationError(element) {
        element.classList.remove('validation-error');
        element.setAttribute('aria-invalid', 'false');
        
        const validationId = `${element.id}-validation`;
        const validationElement = document.getElementById(validationId);
        
        if (validationElement) {
            validationElement.textContent = '';
            validationElement.classList.remove('error');
        }
    }

    showInputSuccess(element, immediate = false) {
        if (immediate) {
            element.classList.add('validation-success');
            setTimeout(() => {
                element.classList.remove('validation-success');
            }, 1000);
        }
    }

    // Utility methods
    getChannelFromInputId(inputId) {
        const parts = inputId.split('-');
        return parts[parts.length - 1];
    }

    getColorSpaceFromInputId(inputId) {
        if (inputId.includes('-c') || inputId.includes('-m') || inputId.includes('-y') || 
            inputId.includes('-k') || inputId.includes('-o') || inputId.includes('-g') || inputId.includes('-v')) {
            return 'cmyk';
        }
        
        if (inputId.includes('-l') || inputId.includes('-a') || inputId.includes('-b')) {
            return 'lab';
        }
        
        return null;
    }

    checkAutoCalculation() {
        // Check if we have enough data for auto-calculation
        if (!window.appState) return;
        
        const hasTargetData = this.hasValidColorData('target');
        const hasSampleData = this.hasValidColorData('sample');
        
        if (hasTargetData && hasSampleData) {
            // Debounce auto-calculation
            if (this.debounceTimers.has('auto-calc')) {
                clearTimeout(this.debounceTimers.get('auto-calc'));
            }
            
            const timer = setTimeout(() => {
                if (window.performColorDifferenceCalculation) {
                    window.performColorDifferenceCalculation();
                }
                this.debounceTimers.delete('auto-calc');
            }, this.slowDelay);
            
            this.debounceTimers.set('auto-calc', timer);
        }
    }

    hasValidColorData(colorType) {
        if (!window.appState || !window.appState[colorType]) return false;
        
        const lab = window.appState[colorType].lab;
        return lab && typeof lab.l === 'number' && typeof lab.a === 'number' && typeof lab.b === 'number';
    }

    updateToleranceDisplay(value) {
        const displays = document.querySelectorAll('.tolerance-display');
        displays.forEach(display => {
            display.textContent = `±${value}`;
        });
    }

    // Cleanup method
    destroy() {
        // Clear all timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        this.inputCallbacks.clear();
    }
}

// Create global instance
window.debouncedInputHandler = new DebouncedInputHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebouncedInputHandler;
}