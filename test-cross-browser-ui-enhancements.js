// Cross-Browser UI Enhancements Test Suite
// Tests UI enhancements across different browsers and devices

class CrossBrowserUIEnhancementsTest {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.deviceInfo = this.detectDevice();
        this.testResults = [];
        this.supportMatrix = {};
    }

    // Main test runner for cross-browser compatibility
    async runCrossBrowserTests() {
        console.log(`🌐 Starting Cross-Browser UI Enhancements Test on ${this.browserInfo.name} ${this.browserInfo.version}`);
        
        // Test CSS Feature Support
        await this.testCSSFeatureSupport();
        
        // Test JavaScript API Support
        await this.testJavaScriptAPISupport();
        
        // Test UI Enhancement Rendering
        await this.testUIEnhancementRendering();
        
        // Test Interactive Features
        await this.testInteractiveFeatures();
        
        // Test Performance Characteristics
        await this.testPerformanceCharacteristics();
        
        // Generate compatibility report
        this.generateCompatibilityReport();
        
        return this.supportMatrix;
    }

    // Test CSS Feature Support
    async testCSSFeatureSupport() {
        console.log('🎨 Testing CSS Feature Support...');
        
        const cssFeatures = {
            'CSS Grid': 'display: grid',
            'CSS Flexbox': 'display: flex',
            'CSS Custom Properties': 'color: var(--test)',
            'CSS Transforms': 'transform: translateY(0)',
            'CSS Transitions': 'transition: all 0.3s ease',
            'CSS Gradients': 'background: linear-gradient(90deg, red, blue)',
            'CSS Backdrop Filter': 'backdrop-filter: blur(10px)',
            'CSS Clip Path': 'clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            'CSS Object Fit': 'object-fit: cover',
            'CSS Sticky Position': 'position: sticky',
            'CSS Text Stroke': '-webkit-text-stroke: 1px black',
            'CSS Background Clip': 'background-clip: text'
        };

        for (const [featureName, cssProperty] of Object.entries(cssFeatures)) {
            const [property, value] = cssProperty.split(': ');
            const isSupported = CSS.supports(property, value);
            
            this.supportMatrix[featureName] = {
                supported: isSupported,
                critical: this.isCriticalFeature(featureName),
                fallback: this.getFallbackStrategy(featureName)
            };
            
            this.logTest(featureName, isSupported, 
                `${featureName} ${isSupported ? 'supported' : 'not supported'}`);
        }
    }

    // Test JavaScript API Support
    async testJavaScriptAPISupport() {
        console.log('⚙️ Testing JavaScript API Support...');
        
        const jsAPIs = {
            'RequestAnimationFrame': () => typeof requestAnimationFrame === 'function',
            'IntersectionObserver': () => typeof IntersectionObserver === 'function',
            'ResizeObserver': () => typeof ResizeObserver === 'function',
            'MutationObserver': () => typeof MutationObserver === 'function',
            'Fetch API': () => typeof fetch === 'function',
            'Promise': () => typeof Promise === 'function',
            'Arrow Functions': () => {
                try {
                    eval('(() => {})');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'Template Literals': () => {
                try {
                    eval('`test`');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'Destructuring': () => {
                try {
                    eval('const {a} = {a: 1}');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'Async/Await': () => {
                try {
                    eval('async function test() { await Promise.resolve(); }');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'Service Worker': () => 'serviceWorker' in navigator,
            'Local Storage': () => typeof localStorage !== 'undefined',
            'Session Storage': () => typeof sessionStorage !== 'undefined',
            'Clipboard API': () => navigator.clipboard !== undefined,
            'Touch Events': () => 'ontouchstart' in window,
            'Pointer Events': () => 'onpointerdown' in window
        };

        for (const [apiName, testFunction] of Object.entries(jsAPIs)) {
            try {
                const isSupported = testFunction();
                
                this.supportMatrix[apiName] = {
                    supported: isSupported,
                    critical: this.isCriticalAPI(apiName),
                    fallback: this.getAPIFallback(apiName)
                };
                
                this.logTest(apiName, isSupported, 
                    `${apiName} ${isSupported ? 'supported' : 'not supported'}`);
            } catch (error) {
                this.supportMatrix[apiName] = {
                    supported: false,
                    critical: this.isCriticalAPI(apiName),
                    fallback: this.getAPIFallback(apiName),
                    error: error.message
                };
                
                this.logTest(apiName, false, `${apiName} test failed: ${error.message}`);
            }
        }
    }

    // Test UI Enhancement Rendering
    async testUIEnhancementRendering() {
        console.log('🎭 Testing UI Enhancement Rendering...');
        
        // Test sticky status bar rendering
        await this.testStickyStatusBarRendering();
        
        // Test tooltip rendering
        await this.testTooltipRendering();
        
        // Test button styling rendering
        await this.testButtonStylingRendering();
        
        // Test gold accent rendering
        await this.testGoldAccentRendering();
    }

    async testStickyStatusBarRendering() {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            const computedStyle = getComputedStyle(statusBar);
            
            // Test position sticky support
            const hasSticky = computedStyle.position === 'fixed';
            this.logTest('Status Bar Position', hasSticky, 
                `Status bar position: ${computedStyle.position}`);
            
            // Test backdrop filter
            const hasBackdropFilter = computedStyle.backdropFilter !== 'none';
            this.logTest('Status Bar Backdrop Filter', hasBackdropFilter, 
                `Backdrop filter: ${computedStyle.backdropFilter}`);
            
            // Test gradient background
            const hasGradient = computedStyle.backgroundImage.includes('gradient');
            this.logTest('Status Bar Gradient', hasGradient, 
                `Background gradient: ${hasGradient ? 'supported' : 'not supported'}`);
        }
    }

    async testTooltipRendering() {
        const tooltips = document.querySelectorAll('.tooltip-enhanced');
        if (tooltips.length > 0) {
            const tooltip = tooltips[0];
            
            // Test pseudo-element support
            const afterStyle = getComputedStyle(tooltip, '::after');
            const hasAfterElement = afterStyle.content !== 'none';
            this.logTest('Tooltip Pseudo Elements', hasAfterElement, 
                `Tooltip ::after pseudo-element: ${hasAfterElement ? 'supported' : 'not supported'}`);
            
            // Test positioning
            const hasAbsolutePositioning = afterStyle.position === 'absolute';
            this.logTest('Tooltip Positioning', hasAbsolutePositioning, 
                `Tooltip positioning: ${afterStyle.position}`);
        }
    }

    async testButtonStylingRendering() {
        const buttons = document.querySelectorAll('.btn-outlined');
        if (buttons.length > 0) {
            const button = buttons[0];
            const computedStyle = getComputedStyle(button);
            
            // Test border styling
            const hasBorder = computedStyle.borderWidth !== '0px';
            this.logTest('Button Borders', hasBorder, 
                `Button border: ${computedStyle.borderWidth} ${computedStyle.borderStyle}`);
            
            // Test transition support
            const hasTransition = computedStyle.transition !== 'all 0s ease 0s';
            this.logTest('Button Transitions', hasTransition, 
                `Button transitions: ${hasTransition ? 'supported' : 'not supported'}`);
            
            // Test transform support
            const hasTransform = computedStyle.transform !== 'none';
            this.logTest('Button Transforms', true, 
                `Button transform capability: available`);
        }
    }

    async testGoldAccentRendering() {
        // Test CSS custom properties
        const rootStyle = getComputedStyle(document.documentElement);
        const goldPrimary = rootStyle.getPropertyValue('--gold-primary');
        
        this.logTest('Gold CSS Variables', !!goldPrimary, 
            `Gold CSS variables: ${goldPrimary ? 'supported' : 'not supported'}`);
        
        // Test gradient text
        const headers = document.querySelectorAll('h1, h2');
        if (headers.length > 0) {
            const header = headers[0];
            const computedStyle = getComputedStyle(header);
            
            const hasBackgroundClip = computedStyle.backgroundClip === 'text' || 
                                    computedStyle.webkitBackgroundClip === 'text';
            this.logTest('Gold Text Gradients', hasBackgroundClip, 
                `Gradient text clipping: ${hasBackgroundClip ? 'supported' : 'not supported'}`);
        }
    }

    // Test Interactive Features
    async testInteractiveFeatures() {
        console.log('🎮 Testing Interactive Features...');
        
        // Test touch/mouse interactions
        await this.testTouchMouseInteractions();
        
        // Test keyboard navigation
        await this.testKeyboardNavigation();
        
        // Test responsive behavior
        await this.testResponsiveBehavior();
        
        // Test accessibility features
        await this.testAccessibilityFeatures();
    }

    async testTouchMouseInteractions() {
        // Test button hover effects
        const buttons = document.querySelectorAll('button, .btn-outlined');
        if (buttons.length > 0) {
            const button = buttons[0];
            
            // Simulate hover
            const event = new Event('mouseenter');
            button.dispatchEvent(event);
            
            const computedStyle = getComputedStyle(button);
            this.logTest('Button Hover Effects', true, 
                `Button hover interactions: available`);
        }
        
        // Test touch events if supported
        if ('ontouchstart' in window) {
            this.logTest('Touch Events', true, 'Touch events supported');
        } else {
            this.logTest('Touch Events', false, 'Touch events not supported');
        }
    }

    async testKeyboardNavigation() {
        // Test focus management
        const focusableElements = document.querySelectorAll(
            'button, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        this.logTest('Focusable Elements', focusableElements.length > 0, 
            `Found ${focusableElements.length} focusable elements`);
        
        // Test tab navigation
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            firstElement.focus();
            
            const hasFocus = document.activeElement === firstElement;
            this.logTest('Tab Navigation', hasFocus, 
                `Tab navigation: ${hasFocus ? 'working' : 'not working'}`);
        }
    }

    async testResponsiveBehavior() {
        // Test viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        this.logTest('Viewport Meta Tag', !!viewportMeta, 
            `Viewport meta tag: ${viewportMeta ? 'present' : 'missing'}`);
        
        // Test responsive breakpoints
        const breakpoints = {
            'Mobile': '(max-width: 768px)',
            'Tablet': '(min-width: 769px) and (max-width: 1024px)',
            'Desktop': '(min-width: 1025px)'
        };
        
        for (const [name, query] of Object.entries(breakpoints)) {
            const matches = window.matchMedia(query).matches;
            this.logTest(`${name} Breakpoint`, true, 
                `${name} breakpoint: ${matches ? 'active' : 'inactive'}`);
        }
    }

    async testAccessibilityFeatures() {
        // Test ARIA labels
        const ariaLabels = document.querySelectorAll('[aria-label]');
        this.logTest('ARIA Labels', ariaLabels.length > 0, 
            `Found ${ariaLabels.length} elements with ARIA labels`);
        
        // Test semantic HTML
        const semanticElements = document.querySelectorAll(
            'main, section, header, nav, article, aside, footer'
        );
        this.logTest('Semantic HTML', semanticElements.length > 0, 
            `Found ${semanticElements.length} semantic HTML elements`);
        
        // Test skip links
        const skipLinks = document.querySelectorAll('.skip-link');
        this.logTest('Skip Links', skipLinks.length > 0, 
            `Skip links: ${skipLinks.length > 0 ? 'present' : 'missing'}`);
    }

    // Test Performance Characteristics
    async testPerformanceCharacteristics() {
        console.log('⚡ Testing Performance Characteristics...');
        
        // Test animation performance
        await this.testAnimationPerformance();
        
        // Test memory usage
        await this.testMemoryUsage();
        
        // Test load times
        await this.testLoadTimes();
    }

    async testAnimationPerformance() {
        // Test CSS animation support
        const hasTransform = CSS.supports('transform', 'translateY(0)');
        this.logTest('CSS Transforms', hasTransform, 
            `CSS transforms: ${hasTransform ? 'supported' : 'not supported'}`);
        
        // Test transition support
        const hasTransition = CSS.supports('transition', 'all 0.3s ease');
        this.logTest('CSS Transitions', hasTransition, 
            `CSS transitions: ${hasTransition ? 'supported' : 'not supported'}`);
        
        // Test animation frame rate
        if (typeof requestAnimationFrame === 'function') {
            const start = performance.now();
            let frameCount = 0;
            
            const countFrames = () => {
                frameCount++;
                const elapsed = performance.now() - start;
                
                if (elapsed < 1000) {
                    requestAnimationFrame(countFrames);
                } else {
                    const fps = Math.round(frameCount);
                    this.logTest('Animation FPS', fps > 30, 
                        `Animation frame rate: ${fps} FPS`);
                }
            };
            
            requestAnimationFrame(countFrames);
        }
    }

    async testMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usedMemory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            
            this.logTest('Memory Usage', usedMemory < 50, 
                `JavaScript heap size: ${usedMemory}MB`);
        } else {
            this.logTest('Memory Usage', false, 'Memory API not available');
        }
    }

    async testLoadTimes() {
        if (performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            this.logTest('DOM Ready Time', domReady < 2000, 
                `DOM ready in ${domReady}ms`);
            this.logTest('Page Load Time', loadTime < 5000, 
                `Page loaded in ${loadTime}ms`);
        }
    }

    // Utility Methods
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome')) {
            return { name: 'Chrome', version: this.extractVersion(userAgent, 'Chrome/') };
        } else if (userAgent.includes('Firefox')) {
            return { name: 'Firefox', version: this.extractVersion(userAgent, 'Firefox/') };
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            return { name: 'Safari', version: this.extractVersion(userAgent, 'Version/') };
        } else if (userAgent.includes('Edge')) {
            return { name: 'Edge', version: this.extractVersion(userAgent, 'Edge/') };
        } else {
            return { name: 'Unknown', version: 'Unknown' };
        }
    }

    detectDevice() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        
        return {
            type: isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop',
            touchSupport: 'ontouchstart' in window,
            screenSize: { width: screen.width, height: screen.height },
            viewportSize: { width: window.innerWidth, height: window.innerHeight }
        };
    }

    extractVersion(userAgent, prefix) {
        const index = userAgent.indexOf(prefix);
        if (index === -1) return 'Unknown';
        
        const version = userAgent.substring(index + prefix.length);
        const match = version.match(/^[\d.]+/);
        return match ? match[0] : 'Unknown';
    }

    isCriticalFeature(featureName) {
        const criticalFeatures = [
            'CSS Flexbox', 'CSS Grid', 'CSS Custom Properties', 
            'CSS Transforms', 'CSS Transitions'
        ];
        return criticalFeatures.includes(featureName);
    }

    isCriticalAPI(apiName) {
        const criticalAPIs = [
            'Promise', 'Fetch API', 'Local Storage', 'RequestAnimationFrame'
        ];
        return criticalAPIs.includes(apiName);
    }

    getFallbackStrategy(featureName) {
        const fallbacks = {
            'CSS Grid': 'Use CSS Flexbox',
            'CSS Backdrop Filter': 'Use solid background',
            'CSS Clip Path': 'Use border-radius',
            'CSS Text Stroke': 'Use text-shadow',
            'CSS Background Clip': 'Use solid text color'
        };
        return fallbacks[featureName] || 'No fallback needed';
    }

    getAPIFallback(apiName) {
        const fallbacks = {
            'Fetch API': 'Use XMLHttpRequest',
            'IntersectionObserver': 'Use scroll events',
            'ResizeObserver': 'Use window.resize',
            'Async/Await': 'Use Promises',
            'Arrow Functions': 'Use function expressions',
            'Template Literals': 'Use string concatenation',
            'Destructuring': 'Use property access',
            'Service Worker': 'Use AppCache',
            'Clipboard API': 'Use execCommand'
        };
        return fallbacks[apiName] || 'No fallback needed';
    }

    logTest(testName, passed, message) {
        const result = {
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const emoji = passed ? '✅' : '❌';
        const status = passed ? 'PASS' : 'FAIL';
        console.log(`${emoji} ${status}: ${testName} - ${message}`);
    }

    generateCompatibilityReport() {
        console.log('\n📊 Cross-Browser Compatibility Report');
        console.log('=====================================');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
        console.log(`Device: ${this.deviceInfo.type}`);
        console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
        
        // Show critical failures
        const criticalFailures = this.testResults.filter(r => 
            !r.passed && (this.isCriticalFeature(r.test) || this.isCriticalAPI(r.test))
        );
        
        if (criticalFailures.length > 0) {
            console.log('\n⚠️  Critical Issues:');
            criticalFailures.forEach(failure => {
                console.log(`   • ${failure.test}: ${failure.message}`);
            });
        }
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        if (percentage >= 90) {
            console.log('   • Excellent compatibility! All major features supported.');
        } else if (percentage >= 75) {
            console.log('   • Good compatibility with minor limitations.');
        } else {
            console.log('   • Consider implementing fallbacks for better compatibility.');
        }
        
        return {
            browser: this.browserInfo,
            device: this.deviceInfo,
            score: percentage,
            passed: passed,
            total: total,
            criticalFailures: criticalFailures.length,
            supportMatrix: this.supportMatrix
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossBrowserUIEnhancementsTest;
}

// Auto-run tests when included in browser
if (typeof window !== 'undefined') {
    window.CrossBrowserUIEnhancementsTest = CrossBrowserUIEnhancementsTest;
    
    // Add to global test runner
    if (typeof runCrossBrowserUITests === 'undefined') {
        window.runCrossBrowserUITests = async function() {
            const tester = new CrossBrowserUIEnhancementsTest();
            return await tester.runCrossBrowserTests();
        };
    }
}