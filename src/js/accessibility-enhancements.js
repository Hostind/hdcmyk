/**
 * Accessibility Enhancements
 * Provides comprehensive accessibility features including ARIA labels, keyboard navigation, and screen reader support
 */

class AccessibilityEnhancementManager {
    constructor() {
        this.focusTracker = new Map();
        this.announcements = [];
        this.skipLinks = [];
        this.landmarkRegions = [];
        this.init();
    }

    init() {
        this.setupARIALabels();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupLandmarkRegions();
        this.setupColorContrastEnhancements();
        this.setupMotionPreferences();
        console.log('Accessibility enhancements initialized');
    }

    setupARIALabels() {
        console.log('Setting up ARIA labels...');

        // Main application container
        const mainContainer = document.querySelector('.calculator-container');
        if (mainContainer) {
            mainContainer.setAttribute('role', 'main');
            mainContainer.setAttribute('aria-label', 'HD CMYK Color Calculator');
        }

        // Color input sections
        this.setupColorSectionARIA('target', 'Target Color Input Section');
        this.setupColorSectionARIA('sample', 'Sample Color Input Section');

        // Results section
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.setAttribute('role', 'region');
            resultsSection.setAttribute('aria-label', 'Color Difference Calculation Results');
            resultsSection.setAttribute('aria-live', 'polite');
        }

        // Delta E display
        const deltaDisplay = document.querySelector('.delta-e-value');
        if (deltaDisplay) {
            deltaDisplay.setAttribute('role', 'status');
            deltaDisplay.setAttribute('aria-label', 'Delta E color difference value');
        }

        // Color swatches
        this.setupColorSwatchARIA();

        // Input groups
        this.setupInputGroupARIA();

        // Buttons and controls
        this.setupButtonARIA();

        // Status bar
        this.setupStatusBarARIA();

        console.log('ARIA labels setup complete');
    }

    setupColorSectionARIA(colorType, label) {
        const section = document.querySelector(`.${colorType}-section, .color-section:has([id^="${colorType}-"])`);
        if (section) {
            section.setAttribute('role', 'group');
            section.setAttribute('aria-labelledby', `${colorType}-section-heading`);
            
            // Create or update heading
            let heading = section.querySelector('h2, h3');
            if (heading) {
                heading.id = `${colorType}-section-heading`;
            }
        }

        // CMYK inputs
        const cmykChannels = ['c', 'm', 'y', 'k', 'o', 'g', 'v'];
        cmykChannels.forEach(channel => {
            const input = document.getElementById(`${colorType}-${channel}`);
            if (input) {
                input.setAttribute('aria-label', `${colorType} ${channel.toUpperCase()} value`);
                input.setAttribute('aria-describedby', `${colorType}-${channel}-description`);
                input.setAttribute('role', 'spinbutton');
                input.setAttribute('aria-valuemin', '0');
                input.setAttribute('aria-valuemax', '100');
                
                // Add description element if it doesn't exist
                if (!document.getElementById(`${colorType}-${channel}-description`)) {
                    const description = document.createElement('span');
                    description.id = `${colorType}-${channel}-description`;
                    description.className = 'sr-only';
                    description.textContent = `${channel.toUpperCase()} channel value for ${colorType} color, range 0 to 100 percent`;
                    input.parentNode.appendChild(description);
                }
            }
        });

        // LAB inputs
        const labChannels = [
            { channel: 'l', min: 0, max: 100, description: 'Lightness' },
            { channel: 'a', min: -128, max: 127, description: 'Green-Red axis' },
            { channel: 'b', min: -128, max: 127, description: 'Blue-Yellow axis' }
        ];

        labChannels.forEach(({ channel, min, max, description }) => {
            const input = document.getElementById(`${colorType}-${channel}`);
            if (input) {
                input.setAttribute('aria-label', `${colorType} LAB ${description} value`);
                input.setAttribute('aria-describedby', `${colorType}-${channel}-description`);
                input.setAttribute('role', 'spinbutton');
                input.setAttribute('aria-valuemin', min.toString());
                input.setAttribute('aria-valuemax', max.toString());
                
                // Add description element
                if (!document.getElementById(`${colorType}-${channel}-description`)) {
                    const descElement = document.createElement('span');
                    descElement.id = `${colorType}-${channel}-description`;
                    descElement.className = 'sr-only';
                    descElement.textContent = `LAB ${description} value for ${colorType} color, range ${min} to ${max}`;
                    input.parentNode.appendChild(descElement);
                }
            }
        });
    }

    setupColorSwatchARIA() {
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach((swatch, index) => {
            swatch.setAttribute('role', 'img');
            swatch.setAttribute('tabindex', '0');
            
            // Determine which color this swatch represents
            const colorType = swatch.closest('.target-section') ? 'target' : 
                             swatch.closest('.sample-section') ? 'sample' : 'unknown';
            
            swatch.setAttribute('aria-label', `${colorType} color swatch`);
            swatch.setAttribute('aria-describedby', `swatch-${colorType}-description`);
            
            // Add description element
            if (!document.getElementById(`swatch-${colorType}-description`)) {
                const description = document.createElement('span');
                description.id = `swatch-${colorType}-description`;
                description.className = 'sr-only';
                description.textContent = `Visual representation of the ${colorType} color based on current input values`;
                swatch.parentNode.appendChild(description);
            }

            // Add keyboard interaction
            swatch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.announceColorValues(colorType);
                }
            });
        });
    }

    setupInputGroupARIA() {
        const inputGroups = document.querySelectorAll('.input-group');
        inputGroups.forEach((group, index) => {
            group.setAttribute('role', 'group');
            
            const label = group.querySelector('.group-label, label');
            if (label) {
                const labelId = `input-group-${index}-label`;
                label.id = labelId;
                group.setAttribute('aria-labelledby', labelId);
            }
        });
    }

    setupButtonARIA() {
        // Calculate button
        const calculateBtn = document.querySelector('.calculate-button, #calculate-btn');
        if (calculateBtn) {
            calculateBtn.setAttribute('aria-describedby', 'calculate-btn-description');
            
            if (!document.getElementById('calculate-btn-description')) {
                const description = document.createElement('span');
                description.id = 'calculate-btn-description';
                description.className = 'sr-only';
                description.textContent = 'Calculate the color difference between target and sample colors using Delta E formulas';
                calculateBtn.parentNode.appendChild(description);
            }
        }

        // Reset button
        const resetBtn = document.querySelector('#reset-all-btn');
        if (resetBtn) {
            resetBtn.setAttribute('aria-describedby', 'reset-btn-description');
            
            if (!document.getElementById('reset-btn-description')) {
                const description = document.createElement('span');
                description.id = 'reset-btn-description';
                description.className = 'sr-only';
                description.textContent = 'Reset all color input values to their default state';
                resetBtn.parentNode.appendChild(description);
            }
        }

        // Export buttons
        const exportBtns = document.querySelectorAll('.export-btn');
        exportBtns.forEach((btn, index) => {
            const format = btn.textContent.toLowerCase().includes('csv') ? 'CSV' : 
                          btn.textContent.toLowerCase().includes('pdf') ? 'PDF' : 'file';
            btn.setAttribute('aria-label', `Export calculation results to ${format} format`);
        });
    }

    setupStatusBarARIA() {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.setAttribute('role', 'banner');
            statusBar.setAttribute('aria-label', 'Application status and quick actions');
            statusBar.setAttribute('aria-live', 'polite');
        }
    }

    setupKeyboardNavigation() {
        console.log('Setting up keyboard navigation...');

        // Create focus trap for modals
        this.setupModalFocusTraps();

        // Enhance tab navigation
        this.enhanceTabNavigation();

        // Setup roving tabindex for complex components
        this.setupRovingTabindex();

        // Add visual focus indicators
        this.addFocusIndicators();

        console.log('Keyboard navigation setup complete');
    }

    setupModalFocusTraps() {
        const modals = document.querySelectorAll('.modal, .keyboard-shortcuts-modal');
        
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    enhanceTabNavigation() {
        // Add logical tab order
        const inputSections = document.querySelectorAll('.color-section');
        inputSections.forEach((section, index) => {
            const inputs = section.querySelectorAll('input');
            inputs.forEach((input, inputIndex) => {
                input.setAttribute('tabindex', (index * 10 + inputIndex + 1).toString());
            });
        });

        // Add skip to content functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
                const firstInput = document.querySelector('input[tabindex="1"]');
                if (firstInput) {
                    e.preventDefault();
                    firstInput.focus();
                }
            }
        });
    }

    setupRovingTabindex() {
        // Setup for color input groups
        const colorGroups = document.querySelectorAll('.input-row');
        
        colorGroups.forEach(group => {
            const inputs = group.querySelectorAll('input');
            if (inputs.length > 1) {
                this.makeRovingTabindex(inputs);
            }
        });
    }

    makeRovingTabindex(elements) {
        let currentIndex = 0;
        
        // Set initial tabindex
        elements.forEach((element, index) => {
            element.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        elements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                let newIndex = currentIndex;
                
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        newIndex = (currentIndex + 1) % elements.length;
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        newIndex = (currentIndex - 1 + elements.length) % elements.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        newIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        newIndex = elements.length - 1;
                        break;
                }
                
                if (newIndex !== currentIndex) {
                    elements[currentIndex].setAttribute('tabindex', '-1');
                    elements[newIndex].setAttribute('tabindex', '0');
                    elements[newIndex].focus();
                    currentIndex = newIndex;
                }
            });

            element.addEventListener('focus', () => {
                currentIndex = index;
            });
        });
    }

    addFocusIndicators() {
        // Add CSS for enhanced focus indicators
        if (!document.getElementById('accessibility-focus-styles')) {
            const style = document.createElement('style');
            style.id = 'accessibility-focus-styles';
            style.textContent = `
                /* Enhanced focus indicators */
                *:focus {
                    outline: 2px solid var(--accent-primary, #3b82f6);
                    outline-offset: 2px;
                }

                .keyboard-focused {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
                    transition: box-shadow 0.2s ease;
                }

                /* High contrast focus for better visibility */
                @media (prefers-contrast: high) {
                    *:focus {
                        outline: 3px solid #000000;
                        outline-offset: 2px;
                    }
                }

                /* Focus indicators for custom components */
                .color-swatch:focus {
                    outline: 3px solid var(--accent-primary, #3b82f6);
                    outline-offset: 3px;
                }

                .toast:focus {
                    outline: 2px solid var(--accent-primary, #3b82f6);
                    outline-offset: 2px;
                }

                /* Skip link styles */
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    padding: 8px;
                    text-decoration: none;
                    border-radius: 4px;
                    z-index: 10001;
                    transition: top 0.3s ease;
                }

                .skip-link:focus {
                    top: 6px;
                }

                /* Screen reader only content */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupScreenReaderSupport() {
        console.log('Setting up screen reader support...');

        // Create live region for announcements
        this.createLiveRegion();

        // Setup calculation result announcements
        this.setupCalculationAnnouncements();

        // Setup input change announcements
        this.setupInputAnnouncements();

        // Setup error announcements
        this.setupErrorAnnouncements();

        console.log('Screen reader support setup complete');
    }

    createLiveRegion() {
        if (!document.getElementById('sr-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }

        if (!document.getElementById('sr-alert-region')) {
            const alertRegion = document.createElement('div');
            alertRegion.id = 'sr-alert-region';
            alertRegion.className = 'sr-only';
            alertRegion.setAttribute('aria-live', 'assertive');
            alertRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(alertRegion);
        }
    }

    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'sr-alert-region' : 'sr-live-region';
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous message
            region.textContent = '';
            
            // Add new message after a brief delay to ensure it's announced
            setTimeout(() => {
                region.textContent = message;
            }, 100);

            // Clear message after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 3000);
        }

        // Track announcements
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
    }

    setupCalculationAnnouncements() {
        // Listen for calculation completion
        document.addEventListener('calculationComplete', (event) => {
            const result = event.detail;
            if (result && result.deltaE !== undefined) {
                const tolerance = this.getToleranceDescription(result.deltaE);
                const message = `Calculation complete. Delta E value is ${result.deltaE.toFixed(2)}. Color difference is ${tolerance}.`;
                this.announceToScreenReader(message);
            }
        });
    }

    setupInputAnnouncements() {
        // Announce significant input changes
        const colorInputs = document.querySelectorAll('input[id*="target-"], input[id*="sample-"]');
        
        colorInputs.forEach(input => {
            let lastValue = input.value;
            
            input.addEventListener('blur', () => {
                if (input.value !== lastValue) {
                    const colorType = input.id.includes('target') ? 'target' : 'sample';
                    const channel = input.id.split('-').pop().toUpperCase();
                    const message = `${colorType} ${channel} value changed to ${input.value}`;
                    this.announceToScreenReader(message);
                    lastValue = input.value;
                }
            });
        });
    }

    setupErrorAnnouncements() {
        // Listen for validation errors
        document.addEventListener('validationError', (event) => {
            const { field, message } = event.detail;
            this.announceToScreenReader(`Error in ${field}: ${message}`, 'assertive');
        });

        // Listen for calculation errors
        document.addEventListener('calculationError', (event) => {
            const message = event.detail.message || 'Calculation failed';
            this.announceToScreenReader(`Calculation error: ${message}`, 'assertive');
        });
    }

    setupFocusManagement() {
        console.log('Setting up focus management...');

        // Track focus for restoration
        this.setupFocusTracking();

        // Manage focus for dynamic content
        this.setupDynamicFocusManagement();

        // Handle focus for modals and overlays
        this.setupModalFocusManagement();

        console.log('Focus management setup complete');
    }

    setupFocusTracking() {
        document.addEventListener('focusin', (event) => {
            this.focusTracker.set('lastFocused', event.target);
        });
    }

    setupDynamicFocusManagement() {
        // Focus management for results section
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('visible') && target.classList.contains('results-section')) {
                        // Focus the results section when it becomes visible
                        setTimeout(() => {
                            target.focus();
                            this.announceToScreenReader('Calculation results are now available');
                        }, 100);
                    }
                }
            });
        });

        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            observer.observe(resultsSection, { attributes: true });
        }
    }

    setupModalFocusManagement() {
        // Focus management for modals
        document.addEventListener('modalOpen', (event) => {
            const modal = event.detail.modal;
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            
            if (firstFocusable) {
                setTimeout(() => {
                    firstFocusable.focus();
                }, 100);
            }
        });

        document.addEventListener('modalClose', (event) => {
            const lastFocused = this.focusTracker.get('lastFocused');
            if (lastFocused && document.contains(lastFocused)) {
                setTimeout(() => {
                    lastFocused.focus();
                }, 100);
            }
        });
    }

    setupSkipLinks() {
        console.log('Setting up skip links...');

        // Create skip links if they don't exist
        if (!document.querySelector('.skip-link')) {
            const skipLinksContainer = document.createElement('div');
            skipLinksContainer.className = 'skip-links';
            
            const skipLinks = [
                { href: '#main-content', text: 'Skip to main content' },
                { href: '#target-inputs', text: 'Skip to target color inputs' },
                { href: '#sample-inputs', text: 'Skip to sample color inputs' },
                { href: '#results', text: 'Skip to results' },
                { href: '#tools', text: 'Skip to tools' }
            ];

            skipLinks.forEach(link => {
                const skipLink = document.createElement('a');
                skipLink.href = link.href;
                skipLink.className = 'skip-link';
                skipLink.textContent = link.text;
                skipLinksContainer.appendChild(skipLink);
            });

            document.body.insertBefore(skipLinksContainer, document.body.firstChild);
        }

        // Add IDs to target sections if they don't exist
        this.addSkipLinkTargets();

        console.log('Skip links setup complete');
    }

    addSkipLinkTargets() {
        const targets = [
            { selector: '.calculator-container', id: 'main-content' },
            { selector: '.target-section, [class*="target"]', id: 'target-inputs' },
            { selector: '.sample-section, [class*="sample"]', id: 'sample-inputs' },
            { selector: '.results-section', id: 'results' },
            { selector: '.tools-section', id: 'tools' }
        ];

        targets.forEach(({ selector, id }) => {
            const element = document.querySelector(selector);
            if (element && !element.id) {
                element.id = id;
                element.setAttribute('tabindex', '-1'); // Make focusable for skip links
            }
        });
    }

    setupLandmarkRegions() {
        console.log('Setting up landmark regions...');

        // Main navigation
        const nav = document.querySelector('nav, .navigation');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main navigation');
        }

        // Main content area
        const main = document.querySelector('main, .main-content, .calculator-container');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        // Complementary content (sidebars, tools)
        const complementary = document.querySelectorAll('.sidebar, .tools-section, .history-panel');
        complementary.forEach((element, index) => {
            element.setAttribute('role', 'complementary');
            element.setAttribute('aria-label', `Tools and utilities ${index + 1}`);
        });

        // Content info (footer)
        const footer = document.querySelector('footer, .footer');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
        }

        console.log('Landmark regions setup complete');
    }

    setupColorContrastEnhancements() {
        console.log('Setting up color contrast enhancements...');

        // Check for high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Listen for contrast preference changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.matches);
        });

        // Add high contrast styles
        if (!document.getElementById('high-contrast-styles')) {
            const style = document.createElement('style');
            style.id = 'high-contrast-styles';
            style.textContent = `
                @media (prefers-contrast: high) {
                    .high-contrast {
                        --text-primary: #000000;
                        --text-secondary: #000000;
                        --bg: #ffffff;
                        --panel: #ffffff;
                        --border-color: #000000;
                        --accent-primary: #0000ff;
                    }

                    .high-contrast .color-swatch {
                        border: 2px solid #000000;
                    }

                    .high-contrast button {
                        border: 2px solid #000000;
                        background: #ffffff;
                        color: #000000;
                    }

                    .high-contrast button:hover {
                        background: #000000;
                        color: #ffffff;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        console.log('Color contrast enhancements setup complete');
    }

    setupMotionPreferences() {
        console.log('Setting up motion preferences...');

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // Listen for motion preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            document.body.classList.toggle('reduced-motion', e.matches);
        });

        console.log('Motion preferences setup complete');
    }

    // Utility methods
    announceColorValues(colorType) {
        const values = this.getColorValues(colorType);
        const message = `${colorType} color values: ${values}`;
        this.announceToScreenReader(message);
    }

    getColorValues(colorType) {
        const channels = ['c', 'm', 'y', 'k', 'l', 'a', 'b'];
        const values = channels.map(channel => {
            const input = document.getElementById(`${colorType}-${channel}`);
            return input ? `${channel.toUpperCase()}: ${input.value}` : '';
        }).filter(v => v);
        
        return values.join(', ');
    }

    getToleranceDescription(deltaE) {
        if (deltaE <= 0.5) return 'excellent match';
        if (deltaE <= 1.0) return 'very good match';
        if (deltaE <= 2.0) return 'good match';
        if (deltaE <= 4.0) return 'acceptable match';
        return 'poor match';
    }

    // Public methods for external use
    announceMessage(message, priority = 'polite') {
        this.announceToScreenReader(message, priority);
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            return true;
        }
        return false;
    }

    addARIALabel(element, label) {
        if (element) {
            element.setAttribute('aria-label', label);
        }
    }

    addARIADescription(element, description) {
        if (element) {
            const descId = `desc-${Date.now()}`;
            const descElement = document.createElement('span');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;
            
            element.parentNode.appendChild(descElement);
            element.setAttribute('aria-describedby', descId);
        }
    }

    // Method to validate accessibility compliance
    validateAccessibility() {
        const issues = [];

        // Check for missing alt text on images
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            issues.push(`${images.length} images missing alt text`);
        }

        // Check for missing form labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        const unlabeledInputs = Array.from(inputs).filter(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            return !label;
        });
        if (unlabeledInputs.length > 0) {
            issues.push(`${unlabeledInputs.length} inputs missing labels`);
        }

        // Check for missing headings structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            issues.push('No heading structure found');
        }

        return issues;
    }
}

// Create global instance
window.accessibilityManager = new AccessibilityEnhancementManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancementManager;
}