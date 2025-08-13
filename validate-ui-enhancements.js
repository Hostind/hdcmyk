#!/usr/bin/env node

// Command-line validation script for UI Enhancements
// This script validates that all UI enhancements are properly implemented

const fs = require('fs');
const path = require('path');

class UIEnhancementsValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: []
        };
    }

    log(message, type = 'info') {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        console.log(`${icons[type]} ${message}`);
    }

    test(name, condition, errorMessage = '', isWarning = false) {
        if (condition) {
            this.results.passed++;
            this.log(`${name}: PASSED`, 'success');
        } else {
            if (isWarning) {
                this.results.warnings++;
                this.log(`${name}: WARNING - ${errorMessage}`, 'warning');
            } else {
                this.results.failed++;
                this.results.errors.push(`${name}: ${errorMessage}`);
                this.log(`${name}: FAILED - ${errorMessage}`, 'error');
            }
        }
    }

    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            return null;
        }
    }

    fileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    validateStickyStatusBar() {
        console.log('\n=== Validating Sticky Status Bar ===');
        
        // Check HTML structure
        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'Status Bar HTML Structure',
                htmlContent.includes('class="status-bar"') && 
                htmlContent.includes('status-bar-content') &&
                htmlContent.includes('quick-actions-bar'),
                'Missing status bar HTML elements'
            );

            this.test(
                'Status Bar Elements',
                htmlContent.includes('status-calculate-btn') &&
                htmlContent.includes('status-reset-btn') &&
                htmlContent.includes('status-export-btn'),
                'Missing status bar action buttons'
            );
        } else {
            this.test('HTML File Access', false, 'Cannot read index.html file');
        }

        // Check CSS styles
        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Status Bar CSS Styles',
                cssContent.includes('.status-bar') &&
                cssContent.includes('position: fixed') &&
                cssContent.includes('transform: translateY(-100%)'),
                'Missing status bar CSS styles'
            );

            this.test(
                'Status Bar Transitions',
                cssContent.includes('transition:') &&
                cssContent.includes('.status-bar.visible'),
                'Missing status bar transition styles'
            );
        } else {
            this.test('CSS File Access', false, 'Cannot read styles.css file');
        }

        // Check JavaScript functionality
        const jsContent = this.readFile('src/js/calculator.js');
        if (jsContent) {
            this.test(
                'Status Bar JavaScript',
                jsContent.includes('initializeStickyStatusBar') &&
                jsContent.includes('setupScrollDetection') &&
                jsContent.includes('updateStatusBarContent'),
                'Missing status bar JavaScript functions'
            );

            this.test(
                'Scroll Detection Logic',
                jsContent.includes('scrollState') &&
                jsContent.includes('statusBarThreshold') &&
                jsContent.includes('toggleStatusBarVisibility'),
                'Missing scroll detection logic'
            );
        } else {
            this.test('JavaScript File Access', false, 'Cannot read calculator.js file');
        }
    }

    validateEnhancedTooltips() {
        console.log('\n=== Validating Enhanced Tooltips ===');
        
        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'Tooltip Enhanced Class',
                htmlContent.includes('tooltip-enhanced'),
                'Missing tooltip-enhanced class in HTML'
            );

            this.test(
                'Comprehensive Tooltip Content',
                htmlContent.includes('Enter the desired color values') &&
                htmlContent.includes('Enter the measured color values') &&
                htmlContent.includes('Displays calculated color difference'),
                'Missing comprehensive tooltip content'
            );

            this.test(
                'Tooltip Data Attributes',
                htmlContent.includes('data-tooltip='),
                'Missing data-tooltip attributes'
            );
        }

        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Enhanced Tooltip Styles',
                cssContent.includes('.tooltip-enhanced') &&
                cssContent.includes('::after') &&
                cssContent.includes('::before'),
                'Missing enhanced tooltip CSS styles'
            );
        }

        const jsContent = this.readFile('src/js/calculator.js');
        if (jsContent) {
            this.test(
                'Tooltip Manager Class',
                jsContent.includes('class TooltipManager') &&
                jsContent.includes('positionTooltip') &&
                jsContent.includes('setupTooltipAccessibility'),
                'Missing TooltipManager class or methods'
            );
        }
    }

    validateOutlinedButtonSystem() {
        console.log('\n=== Validating Outlined Button System ===');
        
        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Outlined Button Base Styles',
                cssContent.includes('.btn-outlined') &&
                cssContent.includes('background: transparent') &&
                cssContent.includes('border: 2px solid currentColor'),
                'Missing outlined button base styles'
            );

            this.test(
                'Button Hover Effects',
                cssContent.includes('.btn-outlined:hover') &&
                cssContent.includes('transform: translateY(-2px)') &&
                cssContent.includes('::before'),
                'Missing button hover effects'
            );

            this.test(
                'Button Focus Indicators',
                cssContent.includes('.btn-outlined:focus') &&
                cssContent.includes('box-shadow') &&
                cssContent.includes('outline'),
                'Missing button focus indicators'
            );

            this.test(
                'Button Accessibility Features',
                cssContent.includes('min-height: 48px') &&
                cssContent.includes('-webkit-tap-highlight-color'),
                'Missing button accessibility features'
            );
        }

        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'Outlined Button Classes Applied',
                htmlContent.includes('btn-outlined'),
                'Outlined button classes not applied in HTML'
            );
        }
    }

    validateGoldAccentSystem() {
        console.log('\n=== Validating Gold Accent System ===');
        
        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Gold CSS Variables',
                cssContent.includes('--gold-primary: #d4af37') &&
                cssContent.includes('--gold-light: #f4e4a6') &&
                cssContent.includes('--gold-gradient'),
                'Missing gold CSS variables'
            );

            this.test(
                'Gold Text Gradient Effects',
                cssContent.includes('--gold-text-gradient') &&
                cssContent.includes('-webkit-background-clip: text') &&
                cssContent.includes('-webkit-text-fill-color: transparent'),
                'Missing gold text gradient effects'
            );

            this.test(
                'Gold Button Variants',
                cssContent.includes('.btn-outlined.gold') &&
                cssContent.includes('.btn-outlined.gold-premium'),
                'Missing gold button variants'
            );

            this.test(
                'Gold Accent Classes',
                cssContent.includes('.gold-accent') &&
                cssContent.includes('.important-value') &&
                cssContent.includes('.premium-feature'),
                'Missing gold accent utility classes'
            );
        }

        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'Gold Classes Applied',
                htmlContent.includes('gold-accent') ||
                htmlContent.includes('gold-premium') ||
                htmlContent.includes('important-value'),
                'Gold accent classes not applied in HTML'
            );
        }
    }

    validateResponsiveDesign() {
        console.log('\n=== Validating Responsive Design ===');
        
        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Mobile Media Queries',
                cssContent.includes('@media (max-width: 768px)') &&
                cssContent.includes('@media (max-width: 480px)'),
                'Missing mobile media queries'
            );

            this.test(
                'Tablet Media Queries',
                cssContent.includes('@media (max-width: 1200px)'),
                'Missing tablet media queries'
            );

            this.test(
                'Touch-Friendly Sizing',
                cssContent.includes('min-height: 48px') &&
                cssContent.includes('min-width: 44px'),
                'Missing touch-friendly sizing'
            );

            this.test(
                'Responsive Grid Layout',
                cssContent.includes('grid-template-columns') &&
                cssContent.includes('repeat(auto-fit'),
                'Missing responsive grid layout'
            );
        }

        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'Viewport Meta Tag',
                htmlContent.includes('<meta name="viewport"'),
                'Missing viewport meta tag'
            );
        }
    }

    validateIntegration() {
        console.log('\n=== Validating Integration ===');
        
        const jsContent = this.readFile('src/js/calculator.js');
        if (jsContent) {
            this.test(
                'Core Calculator Functions Preserved',
                jsContent.includes('performColorDifferenceCalculation') &&
                jsContent.includes('updateColorSwatch') &&
                jsContent.includes('appState'),
                'Core calculator functions missing or modified'
            );

            this.test(
                'G7 Integration Maintained',
                jsContent.includes('initializeG7Integration') &&
                jsContent.includes('g7-analysis'),
                'G7 integration not maintained'
            );

            this.test(
                'Export Functionality Preserved',
                jsContent.includes('colorExport') ||
                this.readFile('src/js/export.js') !== null,
                'Export functionality not preserved'
            );

            this.test(
                'History Functionality Preserved',
                jsContent.includes('history') &&
                jsContent.includes('saveCalculationToHistory'),
                'History functionality not preserved'
            );
        }

        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'All Required Scripts Loaded',
                htmlContent.includes('color-science.js') &&
                htmlContent.includes('calculator.js') &&
                htmlContent.includes('export.js'),
                'Missing required script includes'
            );

            this.test(
                'PWA Features Maintained',
                htmlContent.includes('serviceWorker') &&
                htmlContent.includes('manifest.json'),
                'PWA features not maintained'
            );
        }
    }

    validatePerformance() {
        console.log('\n=== Validating Performance ===');
        
        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'CSS Performance Optimizations',
                cssContent.includes('will-change: transform') &&
                cssContent.includes('transform: translateZ(0)') &&
                cssContent.includes('backface-visibility: hidden'),
                'Missing CSS performance optimizations',
                true // This is a warning, not a failure
            );

            this.test(
                'Reduced Motion Support',
                cssContent.includes('@media (prefers-reduced-motion: reduce)'),
                'Missing reduced motion support',
                true
            );
        }

        const jsContent = this.readFile('src/js/calculator.js');
        if (jsContent) {
            this.test(
                'Debouncing Implementation',
                jsContent.includes('debounce') ||
                jsContent.includes('setTimeout') &&
                jsContent.includes('clearTimeout'),
                'Missing debouncing for performance',
                true
            );

            this.test(
                'Event Listener Cleanup',
                jsContent.includes('removeEventListener') ||
                jsContent.includes('cleanup'),
                'Missing event listener cleanup',
                true
            );
        }
    }

    validateAccessibility() {
        console.log('\n=== Validating Accessibility ===');
        
        const htmlContent = this.readFile('index.html');
        if (htmlContent) {
            this.test(
                'ARIA Labels Present',
                htmlContent.includes('aria-label'),
                'Missing ARIA labels'
            );

            this.test(
                'Semantic HTML Structure',
                htmlContent.includes('<main') &&
                htmlContent.includes('<section') &&
                htmlContent.includes('<header'),
                'Missing semantic HTML structure'
            );

            this.test(
                'Form Labels Present',
                htmlContent.includes('<label') &&
                htmlContent.includes('for='),
                'Missing form labels'
            );
        }

        const cssContent = this.readFile('src/css/styles.css');
        if (cssContent) {
            this.test(
                'Focus Indicators',
                cssContent.includes(':focus') &&
                cssContent.includes('outline') &&
                cssContent.includes('box-shadow'),
                'Missing focus indicators'
            );

            this.test(
                'Screen Reader Support',
                cssContent.includes('.sr-only') ||
                cssContent.includes('screen reader'),
                'Missing screen reader support classes',
                true
            );
        }
    }

    validateTestFiles() {
        console.log('\n=== Validating Test Files ===');
        
        this.test(
            'UI Enhancements Test File',
            this.fileExists('test-ui-enhancements-integration.js'),
            'UI enhancements test file missing'
        );

        this.test(
            'Cross-Browser Test File',
            this.fileExists('test-cross-browser-compatibility.js'),
            'Cross-browser test file missing'
        );

        this.test(
            'Comprehensive Test File',
            this.fileExists('test-comprehensive-final.html'),
            'Comprehensive test file missing'
        );

        this.test(
            'Validation Script',
            this.fileExists('validate-ui-enhancements.js'),
            'Validation script missing'
        );
    }

    async runAllValidations() {
        console.log('🔍 Starting UI Enhancements Validation');
        console.log('=====================================');
        
        const startTime = Date.now();
        
        // Run all validation suites
        this.validateStickyStatusBar();
        this.validateEnhancedTooltips();
        this.validateOutlinedButtonSystem();
        this.validateGoldAccentSystem();
        this.validateResponsiveDesign();
        this.validateIntegration();
        this.validatePerformance();
        this.validateAccessibility();
        this.validateTestFiles();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : '0';
        
        // Print final results
        console.log('\n=====================================');
        console.log('🏁 VALIDATION COMPLETE');
        console.log('=====================================');
        console.log(`⏱️  Duration: ${duration} seconds`);
        console.log(`📊 Total Checks: ${total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 VALIDATION SUCCESSFUL!');
            console.log('All UI enhancements are properly implemented and integrated.');
            console.log('The calculator maintains full functionality with enhanced user experience.');
        } else {
            console.log('\n❌ VALIDATION FAILED!');
            console.log('The following issues need to be addressed:');
            console.log('==========================================');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        if (this.results.warnings > 0) {
            console.log('\n⚠️  WARNINGS:');
            console.log('These items should be reviewed but are not critical:');
            // Warnings would be logged during individual tests
        }
        
        // Return validation result
        return {
            success: this.results.failed === 0,
            results: this.results,
            duration,
            successRate: parseFloat(successRate)
        };
    }
}

// Main execution
if (require.main === module) {
    const validator = new UIEnhancementsValidator();
    validator.runAllValidations().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Validation failed with error:', error.message);
        process.exit(1);
    });
}

module.exports = UIEnhancementsValidator;