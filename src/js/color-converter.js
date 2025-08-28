// Color Converter Module - Multi-format color conversion utility
// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5 - Pocket color converter and utility features

console.log('Color Converter module loading...');

/**
 * Color Converter Class
 * Provides multi-format color conversion with real-time updates and validation
 */
class ColorConverter {
    constructor() {
        this.isInitialized = false;
        this.conversionCache = new Map();
        this.maxCacheSize = 100;
        this.debounceTimeout = null;
        this.debounceDelay = 150;
        
        // Conversion accuracy tracking
        this.accuracyWarnings = {
            cmykToRgb: 'CMYK to RGB conversion is approximate - actual print results may vary',
            rgbToCmyk: 'RGB to CMYK conversion is approximate - use ICC profiles for accuracy',
            labToRgb: 'LAB to RGB conversion depends on display profile and viewing conditions',
            hexToLab: 'HEX to LAB conversion assumes sRGB color space'
        };
        
        this.init();
    }

    init() {
        console.log('Initializing Color Converter...');
        this.setupEventListeners();
        this.initializeDefaultValues();
        this.setupClipboardIntegration();
        this.isInitialized = true;
        console.log('Color Converter initialized successfully');
    }

    setupEventListeners() {
        // HEX input
        const hexInput = document.getElementById('converter-hex');
        if (hexInput) {
            hexInput.addEventListener('input', (e) => this.handleHexInput(e));
            hexInput.addEventListener('paste', (e) => this.handlePaste(e, 'hex'));
        }

        // RGB inputs
        ['r', 'g', 'b'].forEach(channel => {
            const input = document.getElementById(`converter-rgb-${channel}`);
            if (input) {
                input.addEventListener('input', (e) => this.handleRgbInput(e));
                input.addEventListener('paste', (e) => this.handlePaste(e, 'rgb'));
            }
        });

        // CMYK inputs
        ['c', 'm', 'y', 'k'].forEach(channel => {
            const input = document.getElementById(`converter-cmyk-${channel}`);
            if (input) {
                input.addEventListener('input', (e) => this.handleCmykInput(e));
                input.addEventListener('paste', (e) => this.handlePaste(e, 'cmyk'));
            }
        });

        // LAB inputs
        ['l', 'a', 'b'].forEach(channel => {
            const input = document.getElementById(`converter-lab-${channel}`);
            if (input) {
                input.addEventListener('input', (e) => this.handleLabInput(e));
                input.addEventListener('paste', (e) => this.handlePaste(e, 'lab'));
            }
        });

        // Copy buttons
        document.querySelectorAll('.converter-copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopyClick(e));
        });

        // Clear button
        const clearBtn = document.getElementById('converter-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllInputs());
        }

        // Swap button (for workflow integration)
        const swapBtn = document.getElementById('converter-swap-btn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapWithMainCalculator());
        }
    }

    handleHexInput(event) {
        const value = event.target.value.trim();
        this.debounceConversion(() => {
            if (this.validateHex(value)) {
                const rgb = this.hexToRgb(value);
                if (rgb) {
                    this.updateFromRgb(rgb, 'hex');
                }
            } else {
                this.showValidationError('hex', 'Invalid HEX format. Use #RRGGBB or #RGB');
            }
        });
    }

    handleRgbInput(event) {
        this.debounceConversion(() => {
            const rgb = this.getRgbValues();
            if (this.validateRgb(rgb)) {
                this.updateFromRgb(rgb, 'rgb');
            } else {
                this.showValidationError('rgb', 'RGB values must be 0-255');
            }
        });
    }

    handleCmykInput(event) {
        this.debounceConversion(() => {
            const cmyk = this.getCmykValues();
            if (this.validateCmyk(cmyk)) {
                this.updateFromCmyk(cmyk, 'cmyk');
            } else {
                this.showValidationError('cmyk', 'CMYK values must be 0-100%');
            }
        });
    }

    handleLabInput(event) {
        this.debounceConversion(() => {
            const lab = this.getLabValues();
            if (this.validateLab(lab)) {
                this.updateFromLab(lab, 'lab');
            } else {
                this.showValidationError('lab', 'LAB values: L* (0-100), a*/b* (-128 to 127)');
            }
        });
    }

    debounceConversion(callback) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(callback, this.debounceDelay);
    }

    // Validation methods
    validateHex(hex) {
        if (!hex) return false;
        const cleanHex = hex.replace('#', '');
        return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleanHex);
    }

    validateRgb(rgb) {
        return rgb.r >= 0 && rgb.r <= 255 &&
               rgb.g >= 0 && rgb.g <= 255 &&
               rgb.b >= 0 && rgb.b <= 255;
    }

    validateCmyk(cmyk) {
        return cmyk.c >= 0 && cmyk.c <= 100 &&
               cmyk.m >= 0 && cmyk.m <= 100 &&
               cmyk.y >= 0 && cmyk.y <= 100 &&
               cmyk.k >= 0 && cmyk.k <= 100;
    }

    validateLab(lab) {
        return lab.l >= 0 && lab.l <= 100 &&
               lab.a >= -128 && lab.a <= 127 &&
               lab.b >= -128 && lab.b <= 127;
    }

    // Color space conversion methods
    hexToRgb(hex) {
        const cleanHex = hex.replace('#', '');
        let r, g, b;

        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.substr(0, 2), 16);
            g = parseInt(cleanHex.substr(2, 2), 16);
            b = parseInt(cleanHex.substr(4, 2), 16);
        } else {
            return null;
        }

        return { r, g, b };
    }

    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    rgbToCmyk(r, g, b) {
        // Normalize RGB values to 0-1
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        // Calculate K (black)
        const k = 1 - Math.max(rNorm, gNorm, bNorm);

        // Calculate CMY
        let c, m, y;
        if (k === 1) {
            c = m = y = 0;
        } else {
            c = (1 - rNorm - k) / (1 - k);
            m = (1 - gNorm - k) / (1 - k);
            y = (1 - bNorm - k) / (1 - k);
        }

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    cmykToRgb(c, m, y, k) {
        // Use the optimized function from color-science.js if available
        if (window.cmykToRgb) {
            return window.cmykToRgb(c, m, y, k);
        }

        // Fallback implementation
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

    rgbToLab(r, g, b) {
        // Use the optimized function from color-science.js if available
        if (window.rgbToXyz && window.xyzToLab) {
            const xyz = window.rgbToXyz(r, g, b);
            return window.xyzToLab(xyz.x, xyz.y, xyz.z);
        }

        // Simplified fallback - not as accurate but functional
        // This is a very basic approximation
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        // Simple grayscale conversion for L*
        const lValue = (0.299 * rNorm + 0.587 * gNorm + 0.114 * bNorm) * 100;
        
        // Simplified a* and b* calculations
        const aValue = (rNorm - gNorm) * 128;
        const bValue = (gNorm - bNorm) * 128;

        return {
            l: Math.max(0, Math.min(100, lValue)),
            a: Math.max(-128, Math.min(127, aValue)),
            b: Math.max(-128, Math.min(127, bValue))
        };
    }

    labToRgb(l, a, b) {
        // Use the optimized function from color-science.js if available
        if (window.labToRgb) {
            return window.labToRgb(l, a, b);
        }

        // Simplified fallback
        const lNorm = l / 100;
        const aNorm = a / 128;
        const bNorm = b / 128;

        // Very basic approximation
        const rValue = Math.round((lNorm + aNorm * 0.5) * 255);
        const gValue = Math.round((lNorm - aNorm * 0.5 + bNorm * 0.5) * 255);
        const bValue = Math.round((lNorm - bNorm * 0.5) * 255);

        return {
            r: Math.max(0, Math.min(255, rValue)),
            g: Math.max(0, Math.min(255, gValue)),
            b: Math.max(0, Math.min(255, bValue))
        };
    }

    // Update methods for each color space
    updateFromRgb(rgb, sourceFormat) {
        this.clearValidationErrors();
        
        try {
            // Update HEX
            if (sourceFormat !== 'hex') {
                const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
                this.setInputValue('converter-hex', hex);
            }

            // Update RGB
            if (sourceFormat !== 'rgb') {
                this.setInputValue('converter-rgb-r', rgb.r);
                this.setInputValue('converter-rgb-g', rgb.g);
                this.setInputValue('converter-rgb-b', rgb.b);
            }

            // Update CMYK
            if (sourceFormat !== 'cmyk') {
                const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
                this.setInputValue('converter-cmyk-c', cmyk.c);
                this.setInputValue('converter-cmyk-m', cmyk.m);
                this.setInputValue('converter-cmyk-y', cmyk.y);
                this.setInputValue('converter-cmyk-k', cmyk.k);
                this.showAccuracyWarning('cmyk', this.accuracyWarnings.rgbToCmyk);
            }

            // Update LAB
            if (sourceFormat !== 'lab') {
                const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b);
                this.setInputValue('converter-lab-l', lab.l.toFixed(1));
                this.setInputValue('converter-lab-a', lab.a.toFixed(1));
                this.setInputValue('converter-lab-b', lab.b.toFixed(1));
                if (sourceFormat === 'hex') {
                    this.showAccuracyWarning('lab', this.accuracyWarnings.hexToLab);
                }
            }

            // Update color preview
            this.updateColorPreview(rgb);

        } catch (error) {
            console.error('Error updating from RGB:', error);
            this.showConversionError('Failed to convert RGB values');
        }
    }

    updateFromCmyk(cmyk, sourceFormat) {
        this.clearValidationErrors();
        
        try {
            const rgb = this.cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            
            // Update RGB
            this.setInputValue('converter-rgb-r', rgb.r);
            this.setInputValue('converter-rgb-g', rgb.g);
            this.setInputValue('converter-rgb-b', rgb.b);

            // Update HEX
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            this.setInputValue('converter-hex', hex);

            // Update LAB
            const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b);
            this.setInputValue('converter-lab-l', lab.l.toFixed(1));
            this.setInputValue('converter-lab-a', lab.a.toFixed(1));
            this.setInputValue('converter-lab-b', lab.b.toFixed(1));

            // Update color preview
            this.updateColorPreview(rgb);

            // Show accuracy warning
            this.showAccuracyWarning('rgb', this.accuracyWarnings.cmykToRgb);

        } catch (error) {
            console.error('Error updating from CMYK:', error);
            this.showConversionError('Failed to convert CMYK values');
        }
    }

    updateFromLab(lab, sourceFormat) {
        this.clearValidationErrors();
        
        try {
            const rgb = this.labToRgb(lab.l, lab.a, lab.b);
            
            // Update RGB
            this.setInputValue('converter-rgb-r', rgb.r);
            this.setInputValue('converter-rgb-g', rgb.g);
            this.setInputValue('converter-rgb-b', rgb.b);

            // Update HEX
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            this.setInputValue('converter-hex', hex);

            // Update CMYK
            const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
            this.setInputValue('converter-cmyk-c', cmyk.c);
            this.setInputValue('converter-cmyk-m', cmyk.m);
            this.setInputValue('converter-cmyk-y', cmyk.y);
            this.setInputValue('converter-cmyk-k', cmyk.k);

            // Update color preview
            this.updateColorPreview(rgb);

            // Show accuracy warning
            this.showAccuracyWarning('rgb', this.accuracyWarnings.labToRgb);

        } catch (error) {
            console.error('Error updating from LAB:', error);
            this.showConversionError('Failed to convert LAB values');
        }
    }

    // Utility methods
    getRgbValues() {
        return {
            r: parseInt(document.getElementById('converter-rgb-r')?.value || 0),
            g: parseInt(document.getElementById('converter-rgb-g')?.value || 0),
            b: parseInt(document.getElementById('converter-rgb-b')?.value || 0)
        };
    }

    getCmykValues() {
        return {
            c: parseFloat(document.getElementById('converter-cmyk-c')?.value || 0),
            m: parseFloat(document.getElementById('converter-cmyk-m')?.value || 0),
            y: parseFloat(document.getElementById('converter-cmyk-y')?.value || 0),
            k: parseFloat(document.getElementById('converter-cmyk-k')?.value || 0)
        };
    }

    getLabValues() {
        return {
            l: parseFloat(document.getElementById('converter-lab-l')?.value || 0),
            a: parseFloat(document.getElementById('converter-lab-a')?.value || 0),
            b: parseFloat(document.getElementById('converter-lab-b')?.value || 0)
        };
    }

    setInputValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
            element.classList.remove('error');
        }
    }

    updateColorPreview(rgb) {
        const preview = document.getElementById('converter-color-preview');
        if (preview) {
            const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            preview.style.backgroundColor = color;
            
            // Update accessibility label
            preview.setAttribute('aria-label', `Color preview: RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        }
    }

    // Error handling and validation feedback
    showValidationError(format, message) {
        const errorElement = document.getElementById(`converter-${format}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Add error styling to inputs
        const inputs = document.querySelectorAll(`[id^="converter-${format}"]`);
        inputs.forEach(input => {
            if (input.type !== 'button') {
                input.classList.add('error');
            }
        });
    }

    showAccuracyWarning(format, message) {
        const warningElement = document.getElementById(`converter-${format}-warning`);
        if (warningElement) {
            warningElement.textContent = message;
            warningElement.style.display = 'block';
        }
    }

    showConversionError(message) {
        const errorElement = document.getElementById('converter-general-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearValidationErrors() {
        // Clear all error messages
        document.querySelectorAll('[id$="-error"], [id$="-warning"]').forEach(element => {
            element.style.display = 'none';
        });

        // Remove error styling
        document.querySelectorAll('.converter-input').forEach(input => {
            input.classList.remove('error');
        });
    }

    // Clipboard integration
    setupClipboardIntegration() {
        // Add paste event listeners for common color formats
        document.addEventListener('paste', (e) => {
            if (e.target.closest('.color-converter')) {
                this.handleGlobalPaste(e);
            }
        });
    }

    handlePaste(event, format) {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text').trim();
        
        if (format === 'hex' && this.validateHex(pastedText)) {
            document.getElementById('converter-hex').value = pastedText;
            this.handleHexInput({ target: { value: pastedText } });
        }
    }

    handleGlobalPaste(event) {
        const pastedText = (event.clipboardData || window.clipboardData).getData('text').trim();
        
        // Try to detect color format and auto-populate
        if (this.validateHex(pastedText)) {
            document.getElementById('converter-hex').value = pastedText;
            this.handleHexInput({ target: { value: pastedText } });
        } else if (pastedText.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)) {
            const matches = pastedText.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (matches) {
                document.getElementById('converter-rgb-r').value = matches[1];
                document.getElementById('converter-rgb-g').value = matches[2];
                document.getElementById('converter-rgb-b').value = matches[3];
                this.handleRgbInput();
            }
        }
    }

    handleCopyClick(event) {
        const button = event.target.closest('.converter-copy-btn');
        const format = button.dataset.format;
        
        let textToCopy = '';
        
        switch (format) {
            case 'hex':
                textToCopy = document.getElementById('converter-hex').value;
                break;
            case 'rgb':
                const rgb = this.getRgbValues();
                textToCopy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                break;
            case 'cmyk':
                const cmyk = this.getCmykValues();
                textToCopy = `C:${cmyk.c}% M:${cmyk.m}% Y:${cmyk.y}% K:${cmyk.k}%`;
                break;
            case 'lab':
                const lab = this.getLabValues();
                textToCopy = `L*:${lab.l} a*:${lab.a} b*:${lab.b}`;
                break;
        }

        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showCopyFeedback(button);
            }).catch(() => {
                // Fallback for older browsers
                this.fallbackCopy(textToCopy, button);
            });
        }
    }

    showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
    }

    fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback(button);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        
        document.body.removeChild(textArea);
    }

    // Workflow integration
    swapWithMainCalculator() {
        if (!window.appState) return;

        const rgb = this.getRgbValues();
        const cmyk = this.getCmykValues();
        const lab = this.getLabValues();

        // Update main calculator target values
        if (window.updateTargetFromConverter) {
            window.updateTargetFromConverter({ rgb, cmyk, lab });
        }

        // Show feedback
        this.showSwapFeedback();
    }

    showSwapFeedback() {
        const swapBtn = document.getElementById('converter-swap-btn');
        if (swapBtn) {
            const originalText = swapBtn.textContent;
            swapBtn.textContent = 'Sent to Calculator!';
            swapBtn.classList.add('success');
            
            setTimeout(() => {
                swapBtn.textContent = originalText;
                swapBtn.classList.remove('success');
            }, 2000);
        }
    }

    clearAllInputs() {
        // Clear all input fields
        document.querySelectorAll('.converter-input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        // Clear color preview
        const preview = document.getElementById('converter-color-preview');
        if (preview) {
            preview.style.backgroundColor = '#f3f4f6';
            preview.setAttribute('aria-label', 'Color preview: No color selected');
        }

        // Clear error messages
        this.clearValidationErrors();
    }

    initializeDefaultValues() {
        // Set default color (medium gray) for demonstration
        const defaultRgb = { r: 128, g: 128, b: 128 };
        this.updateFromRgb(defaultRgb, 'init');
    }

    // Public API methods for integration
    setColor(colorData, format) {
        switch (format) {
            case 'hex':
                if (this.validateHex(colorData)) {
                    document.getElementById('converter-hex').value = colorData;
                    this.handleHexInput({ target: { value: colorData } });
                }
                break;
            case 'rgb':
                if (this.validateRgb(colorData)) {
                    this.setInputValue('converter-rgb-r', colorData.r);
                    this.setInputValue('converter-rgb-g', colorData.g);
                    this.setInputValue('converter-rgb-b', colorData.b);
                    this.updateFromRgb(colorData, 'api');
                }
                break;
            case 'cmyk':
                if (this.validateCmyk(colorData)) {
                    this.setInputValue('converter-cmyk-c', colorData.c);
                    this.setInputValue('converter-cmyk-m', colorData.m);
                    this.setInputValue('converter-cmyk-y', colorData.y);
                    this.setInputValue('converter-cmyk-k', colorData.k);
                    this.updateFromCmyk(colorData, 'api');
                }
                break;
            case 'lab':
                if (this.validateLab(colorData)) {
                    this.setInputValue('converter-lab-l', colorData.l);
                    this.setInputValue('converter-lab-a', colorData.a);
                    this.setInputValue('converter-lab-b', colorData.b);
                    this.updateFromLab(colorData, 'api');
                }
                break;
        }
    }

    getCurrentColor(format) {
        switch (format) {
            case 'hex':
                return document.getElementById('converter-hex').value;
            case 'rgb':
                return this.getRgbValues();
            case 'cmyk':
                return this.getCmykValues();
            case 'lab':
                return this.getLabValues();
            default:
                return {
                    hex: document.getElementById('converter-hex').value,
                    rgb: this.getRgbValues(),
                    cmyk: this.getCmykValues(),
                    lab: this.getLabValues()
                };
        }
    }
}

// Initialize color converter when DOM is ready
let colorConverter;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other modules are loaded
    setTimeout(() => {
        if (document.getElementById('converter-hex')) {
            colorConverter = new ColorConverter();
            
            // Make it globally available for integration
            window.colorConverter = colorConverter;
            
            console.log('Color Converter ready for use');
        }
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorConverter;
}