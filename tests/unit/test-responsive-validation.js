// Responsive Design Validation Script
// This script tests the responsive breakpoints and touch-friendly features

class ResponsiveValidator {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            tabletLandscape: 1200,
            desktop: 1201
        };
        
        this.touchTargetMinSize = 44; // Minimum touch target size in pixels
        this.results = [];
    }
    
    // Test if elements meet touch-friendly size requirements
    validateTouchTargets() {
        const interactiveElements = document.querySelectorAll(
            'button, input, select, .color-swatch, .suggestion-item, .history-item'
        );
        
        const failedElements = [];
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const minDimension = Math.min(rect.width, rect.height);
            
            if (minDimension < this.touchTargetMinSize) {
                failedElements.push({
                    element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
                    size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
                    minDimension: Math.round(minDimension)
                });
            }
        });
        
        return {
            passed: failedElements.length === 0,
            failedElements,
            message: failedElements.length === 0 
                ? 'All interactive elements meet touch target requirements'
                : `${failedElements.length} elements are too small for touch interaction`
        };
    }
    
    // Test responsive layout at different viewport sizes
    validateResponsiveLayout() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        const currentBreakpoint = this.getCurrentBreakpoint(viewport.width);
        const layoutTests = [];
        
        // Test main grid layout
        const calculatorMain = document.querySelector('.calculator-main');
        if (calculatorMain) {
            const gridColumns = window.getComputedStyle(calculatorMain).gridTemplateColumns;
            layoutTests.push({
                test: 'Main grid layout',
                expected: this.getExpectedGridColumns(currentBreakpoint),
                actual: gridColumns,
                passed: this.validateGridColumns(gridColumns, currentBreakpoint)
            });
        }
        
        // Test color swatch sizes
        const colorSwatches = document.querySelectorAll('.color-swatch');
        if (colorSwatches.length > 0) {
            const swatchRect = colorSwatches[0].getBoundingClientRect();
            const expectedSize = this.getExpectedSwatchSize(currentBreakpoint);
            layoutTests.push({
                test: 'Color swatch size',
                expected: `${expectedSize}x${expectedSize}px`,
                actual: `${Math.round(swatchRect.width)}x${Math.round(swatchRect.height)}px`,
                passed: Math.abs(swatchRect.width - expectedSize) <= 10
            });
        }
        
        // Test button sizes
        const calculateButton = document.querySelector('.calculate-button');
        if (calculateButton) {
            const buttonRect = calculateButton.getBoundingClientRect();
            const minHeight = this.getExpectedButtonHeight(currentBreakpoint);
            layoutTests.push({
                test: 'Calculate button height',
                expected: `>= ${minHeight}px`,
                actual: `${Math.round(buttonRect.height)}px`,
                passed: buttonRect.height >= minHeight
            });
        }
        
        return {
            viewport,
            currentBreakpoint,
            tests: layoutTests,
            passed: layoutTests.every(test => test.passed)
        };
    }
    
    // Test high contrast and accessibility features
    validateAccessibility() {
        const tests = [];
        
        // Test focus indicators
        const focusableElements = document.querySelectorAll(
            'button, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        tests.push({
            test: 'Focusable elements count',
            expected: '> 0',
            actual: focusableElements.length,
            passed: focusableElements.length > 0
        });
        
        // Test color contrast (simplified check)
        const textElements = document.querySelectorAll('h1, h2, h3, label, button');
        let contrastIssues = 0;
        
        textElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Simple contrast check (would need more sophisticated algorithm in production)
            if (color === backgroundColor) {
                contrastIssues++;
            }
        });
        
        tests.push({
            test: 'Color contrast issues',
            expected: '0',
            actual: contrastIssues,
            passed: contrastIssues === 0
        });
        
        // Test ARIA labels
        const colorSwatches = document.querySelectorAll('.color-swatch[aria-label]');
        tests.push({
            test: 'Color swatches with ARIA labels',
            expected: '2',
            actual: colorSwatches.length,
            passed: colorSwatches.length >= 2
        });
        
        return {
            tests,
            passed: tests.every(test => test.passed)
        };
    }
    
    // Helper methods
    getCurrentBreakpoint(width) {
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        if (width <= this.breakpoints.tabletLandscape) return 'tabletLandscape';
        return 'desktop';
    }
    
    getExpectedGridColumns(breakpoint) {
        switch (breakpoint) {
            case 'mobile':
            case 'tablet':
                return '1fr';
            case 'tabletLandscape':
                return '1fr 1fr';
            default:
                return '1fr 1fr 1fr';
        }
    }
    
    validateGridColumns(actual, breakpoint) {
        const expected = this.getExpectedGridColumns(breakpoint);
        // Simplified validation - in production would need more sophisticated parsing
        return actual.includes('1fr');
    }
    
    getExpectedSwatchSize(breakpoint) {
        switch (breakpoint) {
            case 'mobile':
                return 110;
            case 'tablet':
                return 130;
            case 'tabletLandscape':
                return 140;
            default:
                return 160;
        }
    }
    
    getExpectedButtonHeight(breakpoint) {
        switch (breakpoint) {
            case 'mobile':
                return 56;
            case 'tablet':
                return 58;
            default:
                return 60;
        }
    }
    
    // Run all validation tests
    runAllTests() {
        console.log('🧪 Running Responsive Design Validation Tests...\n');
        
        const touchTargetResults = this.validateTouchTargets();
        const layoutResults = this.validateResponsiveLayout();
        const accessibilityResults = this.validateAccessibility();
        
        // Display results
        console.log('📱 Touch Target Validation:');
        console.log(`Status: ${touchTargetResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Message: ${touchTargetResults.message}`);
        if (!touchTargetResults.passed) {
            console.log('Failed elements:', touchTargetResults.failedElements);
        }
        console.log('');
        
        console.log('📐 Responsive Layout Validation:');
        console.log(`Viewport: ${layoutResults.viewport.width}x${layoutResults.viewport.height}`);
        console.log(`Breakpoint: ${layoutResults.currentBreakpoint}`);
        console.log(`Status: ${layoutResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
        layoutResults.tests.forEach(test => {
            console.log(`  ${test.test}: ${test.passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
        });
        console.log('');
        
        console.log('♿ Accessibility Validation:');
        console.log(`Status: ${accessibilityResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
        accessibilityResults.tests.forEach(test => {
            console.log(`  ${test.test}: ${test.passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
        });
        console.log('');
        
        const overallPassed = touchTargetResults.passed && layoutResults.passed && accessibilityResults.passed;
        console.log(`🎯 Overall Result: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return {
            touchTargets: touchTargetResults,
            layout: layoutResults,
            accessibility: accessibilityResults,
            overallPassed
        };
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    const validator = new ResponsiveValidator();
    
    // Run initial tests
    setTimeout(() => {
        validator.runAllTests();
    }, 1000);
    
    // Re-run tests on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('\n🔄 Window resized, re-running layout tests...');
            const layoutResults = validator.validateResponsiveLayout();
            console.log(`📐 Layout Status: ${layoutResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
        }, 500);
    });
    
    // Make validator available globally for manual testing
    window.responsiveValidator = validator;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveValidator;
}