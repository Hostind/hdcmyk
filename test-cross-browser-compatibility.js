// Cross-Browser Compatibility Testing for UI Enhancements
// Tests browser-specific features and fallbacks

class CrossBrowserTestSuite {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            warnings: [],
            errors: []
        };
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (userAgent.includes('Chrome') && vendor.includes('Google')) {
            browser = 'Chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Edge')) {
            browser = 'Edge';
            version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
            browser = 'Internet Explorer';
            version = userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'Unknown';
        }

        return {
            browser,
            version,
            userAgent,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
            supportsES6: typeof Symbol !== 'undefined',
            supportsCSS3: this.testCSS3Support(),
            supportsFlexbox: this.testFlexboxSupport(),
            supportsGrid: this.testGridSupport()
        };
    }

    testCSS3Support() {
        const testElement = document.createElement('div');
        const properties = [
            'transform',
            'transition',
            'borderRadius',
            'boxShadow',
            'backgroundClip'
        ];
        
        return properties.every(prop => {
            return testElement.style[prop] !== undefined;
        });
    }

    testFlexboxSupport() {
        const testElement = document.createElement('div');
        testElement.style.display = 'flex';
        return testElement.style.display === 'flex';
    }

    testGridSupport() {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        return testElement.style.display === 'grid';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    updateTestResult(testName, passed, message = '', isWarning = false) {
        this.testResults.total++;
        
        if (passed) {
            this.testResults.passed++;
            this.log(`${testName}: PASSED`, 'success');
        } else {
            if (isWarning) {
                this.testResults.warnings.push(`${testName}: ${message}`);
                this.log(`${testName}: WARNING - ${message}`, 'warning');
            } else {
                this.testResults.failed++;
                this.testResults.errors.push(`${testName}: ${message}`);
                this.log(`${testName}: FAILED - ${message}`, 'error');
            }
        }
    }

    // Test CSS Features Support
    async testCSSFeatures() {
        console.log('\n=== Testing CSS Features Support ===');
        
        try {
            // Test CSS Custom Properties (Variables)
            const supportsCustomProperties = CSS.supports('color', 'var(--test)');
            this.updateTestResult(
                'CSS Custom Properties',
                supportsCustomProperties,
                'CSS variables not supported - gold accent system may not work'
            );

            // Test CSS Grid
            const supportsGrid = CSS.supports('display', 'grid');
            this.updateTestResult(
                'CSS Grid Layout',
                supportsGrid,
                'CSS Grid not supported - layout may fall back to flexbox'
            );

            // Test CSS Flexbox
            const supportsFlexbox = CSS.supports('display', 'flex');
            this.updateTestResult(
                'CSS Flexbox',
                supportsFlexbox,
                'Flexbox not supported - layout issues may occur'
            );

            // Test CSS Transforms
            const supportsTransforms = CSS.supports('transform', 'translateY(-100%)');
            this.updateTestResult(
                'CSS Transforms',
                supportsTransforms,
                'CSS transforms not supported - animations may not work'
            );

            // Test CSS Transitions
            const supportsTransitions = CSS.supports('transition', 'all 0.3s ease');
            this.updateTestResult(
                'CSS Transitions',
                supportsTransitions,
                'CSS transitions not supported - animations will be instant'
            );

            // Test CSS Backdrop Filter
            const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
            this.updateTestResult(
                'CSS Backdrop Filter',
                supportsBackdropFilter,
                'Backdrop filter not supported - status bar may lack blur effect',
                true // This is a warning, not a failure
            );

            // Test CSS Clip Path
            const supportsClipPath = CSS.supports('clip-path', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)');
            this.updateTestResult(
                'CSS Clip Path',
                supportsClipPath,
                'Clip path not supported - some visual effects may be missing',
                true
            );

        } catch (error) {
            this.updateTestResult('CSS Features Tests', false, error.message);
        }
    }

    // Test JavaScript Features Support
    async testJavaScriptFeatures() {
        console.log('\n=== Testing JavaScript Features Support ===');
        
        try {
            // Test ES6 Features
            const supportsES6 = typeof Symbol !== 'undefined' && 
                               typeof Promise !== 'undefined' &&
                               typeof Map !== 'undefined';
            
            this.updateTestResult(
                'ES6 Features',
                supportsES6,
                'ES6 features not fully supported - some functionality may not work'
            );

            // Test Arrow Functions
            let supportsArrowFunctions = true;
            try {
                eval('(() => {})');
            } catch (e) {
                supportsArrowFunctions = false;
            }
            
            this.updateTestResult(
                'Arrow Functions',
                supportsArrowFunctions,
                'Arrow functions not supported - code may not execute'
            );

            // Test Template Literals
            let supportsTemplateLiterals = true;
            try {
                eval('`template ${literal}`');
            } catch (e) {
                supportsTemplateLiterals = false;
            }
            
            this.updateTestResult(
                'Template Literals',
                supportsTemplateLiterals,
                'Template literals not supported - string formatting may fail'
            );

            // Test Async/Await
            const supportsAsyncAwait = typeof (async () => {}) === 'function';
            this.updateTestResult(
                'Async/Await',
                supportsAsyncAwait,
                'Async/await not supported - some operations may be synchronous',
                true
            );

            // Test Fetch API
            const supportsFetch = typeof fetch !== 'undefined';
            this.updateTestResult(
                'Fetch API',
                supportsFetch,
                'Fetch API not supported - may fall back to XMLHttpRequest',
                true
            );

            // Test IntersectionObserver
            const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';
            this.updateTestResult(
                'IntersectionObserver',
                supportsIntersectionObserver,
                'IntersectionObserver not supported - scroll detection may use fallback',
                true
            );

        } catch (error) {
            this.updateTestResult('JavaScript Features Tests', false, error.message);
        }
    }

    // Test DOM API Support
    async testDOMAPIs() {
        console.log('\n=== Testing DOM API Support ===');
        
        try {
            // Test querySelector/querySelectorAll
            const supportsQuerySelector = typeof document.querySelector !== 'undefined';
            this.updateTestResult(
                'querySelector API',
                supportsQuerySelector,
                'querySelector not supported - DOM manipulation may fail'
            );

            // Test addEventListener
            const supportsAddEventListener = typeof document.addEventListener !== 'undefined';
            this.updateTestResult(
                'addEventListener API',
                supportsAddEventListener,
                'addEventListener not supported - event handling may not work'
            );

            // Test classList
            const testElement = document.createElement('div');
            const supportsClassList = typeof testElement.classList !== 'undefined';
            this.updateTestResult(
                'classList API',
                supportsClassList,
                'classList not supported - class manipulation may use fallbacks'
            );

            // Test dataset
            const supportsDataset = typeof testElement.dataset !== 'undefined';
            this.updateTestResult(
                'dataset API',
                supportsDataset,
                'dataset not supported - data attribute access may use getAttribute',
                true
            );

            // Test requestAnimationFrame
            const supportsRAF = typeof requestAnimationFrame !== 'undefined';
            this.updateTestResult(
                'requestAnimationFrame',
                supportsRAF,
                'requestAnimationFrame not supported - animations may be choppy',
                true
            );

            // Test getComputedStyle
            const supportsGetComputedStyle = typeof window.getComputedStyle !== 'undefined';
            this.updateTestResult(
                'getComputedStyle',
                supportsGetComputedStyle,
                'getComputedStyle not supported - style calculations may fail'
            );

        } catch (error) {
            this.updateTestResult('DOM API Tests', false, error.message);
        }
    }

    // Test Touch and Mobile Support
    async testTouchSupport() {
        console.log('\n=== Testing Touch and Mobile Support ===');
        
        try {
            // Test Touch Events
            const supportsTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            this.updateTestResult(
                'Touch Events',
                supportsTouchEvents || !this.browserInfo.isMobile,
                'Touch events not supported on mobile device',
                this.browserInfo.isMobile
            );

            // Test Pointer Events
            const supportsPointerEvents = 'onpointerdown' in window;
            this.updateTestResult(
                'Pointer Events',
                supportsPointerEvents,
                'Pointer events not supported - may fall back to mouse/touch events',
                true
            );

            // Test Viewport Meta Tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            this.updateTestResult(
                'Viewport Meta Tag',
                viewportMeta !== null,
                'Viewport meta tag missing - mobile layout may not work correctly'
            );

            // Test Device Orientation
            const supportsOrientation = typeof window.orientation !== 'undefined' || 
                                      typeof screen.orientation !== 'undefined';
            this.updateTestResult(
                'Device Orientation',
                supportsOrientation || !this.browserInfo.isMobile,
                'Device orientation not supported',
                true
            );

        } catch (error) {
            this.updateTestResult('Touch Support Tests', false, error.message);
        }
    }

    // Test PWA Support
    async testPWASupport() {
        console.log('\n=== Testing PWA Support ===');
        
        try {
            // Test Service Worker
            const supportsServiceWorker = 'serviceWorker' in navigator;
            this.updateTestResult(
                'Service Worker',
                supportsServiceWorker,
                'Service Worker not supported - PWA features unavailable',
                true
            );

            // Test Web App Manifest
            const manifestLink = document.querySelector('link[rel="manifest"]');
            this.updateTestResult(
                'Web App Manifest',
                manifestLink !== null,
                'Web App Manifest link missing'
            );

            // Test Cache API
            const supportsCacheAPI = 'caches' in window;
            this.updateTestResult(
                'Cache API',
                supportsCacheAPI,
                'Cache API not supported - offline functionality limited',
                true
            );

            // Test Push Notifications
            const supportsPushNotifications = 'Notification' in window && 'PushManager' in window;
            this.updateTestResult(
                'Push Notifications',
                supportsPushNotifications,
                'Push notifications not supported',
                true
            );

        } catch (error) {
            this.updateTestResult('PWA Support Tests', false, error.message);
        }
    }

    // Test Performance APIs
    async testPerformanceAPIs() {
        console.log('\n=== Testing Performance APIs ===');
        
        try {
            // Test Performance API
            const supportsPerformance = typeof performance !== 'undefined' && 
                                      typeof performance.now !== 'undefined';
            this.updateTestResult(
                'Performance API',
                supportsPerformance,
                'Performance API not supported - timing measurements unavailable',
                true
            );

            // Test Performance Observer
            const supportsPerformanceObserver = typeof PerformanceObserver !== 'undefined';
            this.updateTestResult(
                'Performance Observer',
                supportsPerformanceObserver,
                'Performance Observer not supported - advanced performance monitoring unavailable',
                true
            );

            // Test Web Vitals APIs
            const supportsWebVitals = typeof PerformanceObserver !== 'undefined' &&
                                    PerformanceObserver.supportedEntryTypes &&
                                    PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint');
            this.updateTestResult(
                'Web Vitals APIs',
                supportsWebVitals,
                'Web Vitals APIs not supported - performance metrics limited',
                true
            );

        } catch (error) {
            this.updateTestResult('Performance API Tests', false, error.message);
        }
    }

    // Test Accessibility APIs
    async testAccessibilityAPIs() {
        console.log('\n=== Testing Accessibility APIs ===');
        
        try {
            // Test ARIA Support
            const testElement = document.createElement('div');
            testElement.setAttribute('aria-label', 'test');
            const supportsARIA = testElement.getAttribute('aria-label') === 'test';
            this.updateTestResult(
                'ARIA Attributes',
                supportsARIA,
                'ARIA attributes not supported - accessibility features limited'
            );

            // Test Focus Management
            const supportsFocusManagement = typeof testElement.focus !== 'undefined' &&
                                          typeof document.activeElement !== 'undefined';
            this.updateTestResult(
                'Focus Management',
                supportsFocusManagement,
                'Focus management APIs not supported - keyboard navigation may not work'
            );

            // Test Screen Reader Detection (simplified)
            const hasScreenReaderIndicators = document.querySelector('.sr-only') !== null ||
                                            getComputedStyle(document.documentElement).getPropertyValue('--sr-only');
            this.updateTestResult(
                'Screen Reader Support',
                hasScreenReaderIndicators,
                'Screen reader support classes not found',
                true
            );

        } catch (error) {
            this.updateTestResult('Accessibility API Tests', false, error.message);
        }
    }

    // Generate Browser Compatibility Report
    generateCompatibilityReport() {
        const report = {
            browserInfo: this.browserInfo,
            testResults: this.testResults,
            recommendations: [],
            criticalIssues: [],
            warnings: []
        };

        // Analyze results and generate recommendations
        if (this.browserInfo.browser === 'Internet Explorer') {
            report.criticalIssues.push('Internet Explorer is not supported. Please use a modern browser.');
        }

        if (!this.browserInfo.supportsES6) {
            report.criticalIssues.push('ES6 features not supported. JavaScript functionality may be limited.');
        }

        if (!this.browserInfo.supportsCSS3) {
            report.criticalIssues.push('CSS3 features not supported. Visual styling may be degraded.');
        }

        if (this.browserInfo.isMobile && this.testResults.warnings.some(w => w.includes('Touch'))) {
            report.warnings.push('Touch support issues detected on mobile device.');
        }

        // Add recommendations based on browser
        switch (this.browserInfo.browser) {
            case 'Chrome':
                if (parseInt(this.browserInfo.version) < 80) {
                    report.recommendations.push('Update Chrome to version 80+ for best experience.');
                }
                break;
            case 'Firefox':
                if (parseInt(this.browserInfo.version) < 75) {
                    report.recommendations.push('Update Firefox to version 75+ for best experience.');
                }
                break;
            case 'Safari':
                if (parseInt(this.browserInfo.version) < 13) {
                    report.recommendations.push('Update Safari to version 13+ for best experience.');
                }
                report.warnings.push('Some CSS features may require vendor prefixes in Safari.');
                break;
            case 'Edge':
                if (parseInt(this.browserInfo.version) < 80) {
                    report.recommendations.push('Update Edge to version 80+ for best experience.');
                }
                break;
        }

        return report;
    }

    // Main test runner
    async runAllTests() {
        console.log('🌐 Starting Cross-Browser Compatibility Testing');
        console.log('==============================================');
        console.log(`Browser: ${this.browserInfo.browser} ${this.browserInfo.version}`);
        console.log(`Mobile: ${this.browserInfo.isMobile ? 'Yes' : 'No'}`);
        console.log(`User Agent: ${this.browserInfo.userAgent}`);
        console.log('==============================================');

        const startTime = performance.now();

        // Reset test results
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            warnings: [],
            errors: []
        };

        // Run all test suites
        await this.testCSSFeatures();
        await this.testJavaScriptFeatures();
        await this.testDOMAPIs();
        await this.testTouchSupport();
        await this.testPWASupport();
        await this.testPerformanceAPIs();
        await this.testAccessibilityAPIs();

        const testDuration = ((performance.now() - startTime) / 1000).toFixed(2);

        // Generate compatibility report
        const report = this.generateCompatibilityReport();

        // Print results
        console.log('\n==============================================');
        console.log('🏁 CROSS-BROWSER TESTING COMPLETE');
        console.log('==============================================');
        console.log(`⏱️  Test Duration: ${testDuration} seconds`);
        console.log(`📊 Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`⚠️  Warnings: ${this.testResults.warnings.length}`);
        console.log(`📈 Compatibility Score: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        // Print critical issues
        if (report.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES:');
            report.criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }

        // Print warnings
        if (report.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            report.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
        }

        // Print recommendations
        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }

        // Overall assessment
        if (report.criticalIssues.length === 0 && this.testResults.failed === 0) {
            console.log('\n🎉 EXCELLENT! This browser is fully compatible with all UI enhancements.');
        } else if (report.criticalIssues.length === 0 && this.testResults.failed < 3) {
            console.log('\n✅ GOOD! This browser is mostly compatible. Minor issues may affect some features.');
        } else if (report.criticalIssues.length > 0) {
            console.log('\n❌ POOR! This browser has compatibility issues that may prevent proper functionality.');
        }

        return {
            success: report.criticalIssues.length === 0 && this.testResults.failed === 0,
            report,
            duration: testDuration
        };
    }
}

// Global test runner function
function runCrossBrowserTests() {
    const testSuite = new CrossBrowserTestSuite();
    return testSuite.runAllTests();
}

// Browser info function for quick checks
function getBrowserInfo() {
    const testSuite = new CrossBrowserTestSuite();
    return testSuite.browserInfo;
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CrossBrowserTestSuite,
        runCrossBrowserTests,
        getBrowserInfo
    };
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runCrossBrowserTests, 500);
        });
    } else {
        setTimeout(runCrossBrowserTests, 500);
    }
}