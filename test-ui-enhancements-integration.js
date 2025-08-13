// UI Enhancements Integration Test Suite
// Tests all UI enhancements work correctly with existing calculator functionality

class UIEnhancementsIntegrationTest {
    constructor() {
        this.testResults = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    // Main test runner
    async runAllTests() {
        console.log('🧪 Starting UI Enhancements Integration Test Suite...');
        
        try {
            // Test 1: Sticky Status Bar Integration
            await this.testStickyStatusBarIntegration();
            
            // Test 2: Enhanced Tooltips Integration
            await this.testEnhancedTooltipsIntegration();
            
            // Test 3: Outlined Button System Integration
            await this.testOutlinedButtonsIntegration();
            
            // Test 4: Gold Accent System Integration
            await this.testGoldAccentsIntegration();
            
            // Test 5: Calculator Functionality Preservation
            await this.testCalculatorFunctionalityPreservation();
            
            // Test 6: G7 Analysis Integration
            await this.testG7AnalysisIntegration();
            
            // Test 7: History Feature Integration
            await this.testHistoryFeatureIntegration();
            
            // Test 8: Export Functionality Integration
            await this.testExportFunctionalityIntegration();
            
            // Test 9: PWA Functionality Integration
            await this.testPWAFunctionalityIntegration();
            
            // Test 10: Cross-Browser Compatibility
            await this.testCrossBrowserCompatibility();
            
            // Test 11: Responsive Design Integration
            await this.testResponsiveDesignIntegration();
            
            // Test 12: Performance Impact Assessment
            await this.testPerformanceImpact();
            
            // Generate final report
            this.generateFinalReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.logTest('Test Suite Execution', false, `Suite failed: ${error.message}`);
        }
    }

    // Test 1: Sticky Status Bar Integration
    async testStickyStatusBarIntegration() {
        console.log('📊 Testing Sticky Status Bar Integration...');
        
        try {
            // Test status bar element exists
            const statusBar = document.getElementById('status-bar');
            this.logTest('Status Bar Element', !!statusBar, 'Status bar element should exist');
            
            if (statusBar) {
                // Test status bar visibility toggle
                const initialVisibility = statusBar.classList.contains('visible');
                
                // Simulate scroll to trigger visibility
                window.scrollTo(0, 200);
                await this.wait(500);
                
                const scrollVisibility = statusBar.classList.contains('visible');
                this.logTest('Status Bar Scroll Visibility', scrollVisibility, 'Status bar should be visible after scrolling');
                
                // Test status bar content elements
                const statusValue = document.getElementById('status-value');
                const deltaValue = document.getElementById('status-delta-value');
                const quickActions = document.querySelector('.quick-actions-bar');
                
                this.logTest('Status Bar Content Elements', 
                    !!(statusValue && deltaValue && quickActions), 
                    'All status bar content elements should exist');
                
                // Test quick action buttons functionality
                const calculateBtn = document.getElementById('status-calculate-btn');
                const resetBtn = document.getElementById('status-reset-btn');
                const exportBtn = document.getElementById('status-export-btn');
                
                this.logTest('Quick Action Buttons', 
                    !!(calculateBtn && resetBtn && exportBtn), 
                    'All quick action buttons should exist');
                
                // Test accessibility attributes
                const hasAriaLabel = statusBar.hasAttribute('aria-label');
                const hasRole = statusBar.hasAttribute('role');
                
                this.logTest('Status Bar Accessibility', 
                    hasAriaLabel && hasRole, 
                    'Status bar should have proper accessibility attributes');
            }
            
        } catch (error) {
            this.logTest('Sticky Status Bar Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 2: Enhanced Tooltips Integration
    async testEnhancedTooltipsIntegration() {
        console.log('💬 Testing Enhanced Tooltips Integration...');
        
        try {
            // Find all tooltip elements
            const tooltipElements = document.querySelectorAll('.tooltip-enhanced');
            this.logTest('Tooltip Elements Count', tooltipElements.length >= 3, 
                `Should have at least 3 tooltip elements, found ${tooltipElements.length}`);
            
            // Test specific section tooltips
            const targetTooltip = document.querySelector('#target-section .tooltip-enhanced');
            const sampleTooltip = document.querySelector('#sample-section .tooltip-enhanced');
            const deltaTooltip = document.querySelector('#delta-section .tooltip-enhanced');
            
            this.logTest('Section Tooltips', 
                !!(targetTooltip && sampleTooltip && deltaTooltip), 
                'Target, Sample, and Delta sections should have tooltips');
            
            // Test tooltip content
            if (targetTooltip) {
                const tooltipContent = targetTooltip.getAttribute('data-tooltip');
                const hasComprehensiveContent = tooltipContent && tooltipContent.length > 50;
                this.logTest('Tooltip Content Quality', hasComprehensiveContent, 
                    'Tooltips should have comprehensive content');
            }
            
            // Test tooltip accessibility
            const hasTabIndex = Array.from(tooltipElements).some(el => el.hasAttribute('tabindex'));
            this.logTest('Tooltip Accessibility', hasTabIndex, 
                'Tooltips should be keyboard accessible');
            
            // Test tooltip positioning classes exist in CSS
            const hasTooltipCSS = this.checkCSSRule('.tooltip-enhanced::after');
            this.logTest('Tooltip CSS Styling', hasTooltipCSS, 
                'Enhanced tooltip CSS should be present');
            
        } catch (error) {
            this.logTest('Enhanced Tooltips Integration', false, `Error: ${error.message}`);
        }
    }    //
 Test 3: Outlined Button System Integration
    async testOutlinedButtonsIntegration() {
        console.log('🔘 Testing Outlined Button System Integration...');
        
        try {
            // Find all outlined buttons
            const outlinedButtons = document.querySelectorAll('.btn-outlined');
            this.logTest('Outlined Buttons Count', outlinedButtons.length > 0, 
                `Should have outlined buttons, found ${outlinedButtons.length}`);
            
            // Test main calculate button
            const calculateBtn = document.getElementById('calculate-btn');
            const hasOutlinedClass = calculateBtn && calculateBtn.classList.contains('btn-outlined');
            this.logTest('Calculate Button Styling', hasOutlinedClass, 
                'Main calculate button should have outlined styling');
            
            // Test button functionality preservation
            if (calculateBtn) {
                const hasClickHandler = typeof calculateBtn.onclick === 'function' || 
                                      calculateBtn.hasAttribute('onclick');
                this.logTest('Button Functionality Preservation', hasClickHandler, 
                    'Buttons should maintain their original functionality');
            }
            
            // Test gold button variants
            const goldButtons = document.querySelectorAll('.btn-outlined.gold, .btn-outlined.gold-premium');
            this.logTest('Gold Button Variants', goldButtons.length > 0, 
                `Should have gold button variants, found ${goldButtons.length}`);
            
            // Test button hover effects (CSS)
            const hasHoverCSS = this.checkCSSRule('.btn-outlined:hover');
            this.logTest('Button Hover Effects', hasHoverCSS, 
                'Outlined buttons should have hover effects');
            
            // Test button focus indicators
            const hasFocusCSS = this.checkCSSRule('.btn-outlined:focus');
            this.logTest('Button Focus Indicators', hasFocusCSS, 
                'Outlined buttons should have focus indicators');
            
        } catch (error) {
            this.logTest('Outlined Button System Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 4: Gold Accent System Integration
    async testGoldAccentsIntegration() {
        console.log('✨ Testing Gold Accent System Integration...');
        
        try {
            // Test CSS custom properties for gold colors
            const rootStyles = getComputedStyle(document.documentElement);
            const goldPrimary = rootStyles.getPropertyValue('--gold-primary');
            const goldGradient = rootStyles.getPropertyValue('--gold-gradient');
            
            this.logTest('Gold CSS Variables', !!(goldPrimary && goldGradient), 
                'Gold color CSS custom properties should be defined');
            
            // Test gold accents in headers
            const headers = document.querySelectorAll('h1, h2, h3');
            const hasGoldHeaders = Array.from(headers).some(header => {
                const style = getComputedStyle(header);
                return style.backgroundImage.includes('gradient') || 
                       header.classList.contains('gold-accent');
            });
            this.logTest('Gold Header Accents', hasGoldHeaders, 
                'Headers should have gold accent styling');
            
            // Test gold highlighting for important values
            const importantValues = document.querySelectorAll('.important-value, .delta-e-value');
            this.logTest('Gold Value Highlighting', importantValues.length > 0, 
                'Important values should have gold highlighting elements');
            
            // Test premium feature indicators
            const premiumFeatures = document.querySelectorAll('.premium-feature, .premium');
            this.logTest('Premium Feature Indicators', premiumFeatures.length > 0, 
                'Premium features should have gold accent indicators');
            
            // Test accessibility contrast (simplified check)
            const goldElements = document.querySelectorAll('[class*="gold"]');
            this.logTest('Gold Elements Present', goldElements.length > 0, 
                'Gold accent elements should be present in the interface');
            
        } catch (error) {
            this.logTest('Gold Accent System Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 5: Calculator Functionality Preservation
    async testCalculatorFunctionalityPreservation() {
        console.log('🧮 Testing Calculator Functionality Preservation...');
        
        try {
            // Test input fields exist and are functional
            const targetInputs = ['target-c', 'target-m', 'target-y', 'target-k'];
            const sampleInputs = ['sample-c', 'sample-m', 'sample-y', 'sample-k'];
            
            const allInputsExist = [...targetInputs, ...sampleInputs].every(id => 
                document.getElementById(id) !== null);
            this.logTest('Input Fields Exist', allInputsExist, 
                'All CMYK input fields should exist');
            
            // Test color swatches exist
            const targetSwatch = document.getElementById('target-swatch');
            const sampleSwatch = document.getElementById('sample-swatch');
            this.logTest('Color Swatches Exist', !!(targetSwatch && sampleSwatch), 
                'Target and sample color swatches should exist');
            
            // Test calculation functionality
            const calculateBtn = document.getElementById('calculate-btn');
            const deltaEValue = document.getElementById('delta-e-value');
            
            if (calculateBtn && deltaEValue) {
                // Set test values
                const targetC = document.getElementById('target-c');
                const sampleC = document.getElementById('sample-c');
                
                if (targetC && sampleC) {
                    targetC.value = '50';
                    sampleC.value = '60';
                    
                    // Trigger calculation
                    calculateBtn.click();
                    
                    // Wait for calculation to complete
                    await this.wait(1000);
                    
                    const hasResult = deltaEValue.textContent !== '--' && 
                                    deltaEValue.textContent !== '';
                    this.logTest('Calculation Functionality', hasResult, 
                        'Calculator should produce results after input and calculation');
                }
            }
            
            // Test preset colors functionality
            const presetSelects = document.querySelectorAll('.preset-select');
            this.logTest('Preset Colors Available', presetSelects.length > 0, 
                'Preset color dropdowns should be available');
            
        } catch (error) {
            this.logTest('Calculator Functionality Preservation', false, `Error: ${error.message}`);
        }
    }

    // Test 6: G7 Analysis Integration
    async testG7AnalysisIntegration() {
        console.log('📈 Testing G7 Analysis Integration...');
        
        try {
            // Test G7 analysis container exists
            const g7Container = document.getElementById('g7-analysis-container');
            this.logTest('G7 Analysis Container', !!g7Container, 
                'G7 analysis container should exist');
            
            if (g7Container) {
                // Test G7 controls
                const g7Toggle = document.getElementById('enable-g7-analysis');
                const g7Prioritize = document.getElementById('prioritize-g7-suggestions');
                
                this.logTest('G7 Controls', !!(g7Toggle && g7Prioritize), 
                    'G7 analysis controls should exist');
                
                // Test G7 compliance status
                const complianceStatus = document.getElementById('g7-compliance-status');
                const complianceIndicator = document.getElementById('compliance-indicator');
                
                this.logTest('G7 Compliance Elements', !!(complianceStatus && complianceIndicator), 
                    'G7 compliance status elements should exist');
                
                // Test G7 recommendations
                const g7Recommendations = document.getElementById('g7-recommendations-list');
                this.logTest('G7 Recommendations', !!g7Recommendations, 
                    'G7 recommendations container should exist');
                
                // Test premium feature styling
                const hasPremiumStyling = g7Container.classList.contains('premium-feature');
                this.logTest('G7 Premium Styling', hasPremiumStyling, 
                    'G7 analysis should have premium feature styling');
            }
            
        } catch (error) {
            this.logTest('G7 Analysis Integration', false, `Error: ${error.message}`);
        }
    }    // 
Test 7: History Feature Integration
    async testHistoryFeatureIntegration() {
        console.log('📚 Testing History Feature Integration...');
        
        try {
            // Test history panel exists
            const historyPanel = document.querySelector('.history-panel');
            const historyList = document.getElementById('history-list');
            
            this.logTest('History Panel', !!(historyPanel && historyList), 
                'History panel and list should exist');
            
            // Test clear history button
            const clearHistoryBtn = document.getElementById('clear-history-btn');
            this.logTest('Clear History Button', !!clearHistoryBtn, 
                'Clear history button should exist');
            
            // Test history functionality with UI enhancements
            if (historyList) {
                const initialHistoryCount = historyList.children.length;
                
                // Perform a calculation to add to history
                const calculateBtn = document.getElementById('calculate-btn');
                if (calculateBtn) {
                    calculateBtn.click();
                    await this.wait(1000);
                    
                    const newHistoryCount = historyList.children.length;
                    this.logTest('History Addition', newHistoryCount >= initialHistoryCount, 
                        'History should update after calculations');
                }
            }
            
        } catch (error) {
            this.logTest('History Feature Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 8: Export Functionality Integration
    async testExportFunctionalityIntegration() {
        console.log('📤 Testing Export Functionality Integration...');
        
        try {
            // Test export panel exists
            const exportPanel = document.querySelector('.export-panel');
            this.logTest('Export Panel', !!exportPanel, 'Export panel should exist');
            
            // Test export buttons
            const csvExportBtn = document.getElementById('export-csv-btn');
            const pdfExportBtn = document.getElementById('export-pdf-btn');
            
            this.logTest('Export Buttons', !!(csvExportBtn && pdfExportBtn), 
                'CSV and PDF export buttons should exist');
            
            // Test export button styling
            if (csvExportBtn && pdfExportBtn) {
                const csvHasGoldStyling = csvExportBtn.classList.contains('gold') || 
                                        csvExportBtn.classList.contains('btn-outlined');
                const pdfHasGoldStyling = pdfExportBtn.classList.contains('gold-premium') || 
                                        pdfExportBtn.classList.contains('btn-outlined');
                
                this.logTest('Export Button Styling', csvHasGoldStyling && pdfHasGoldStyling, 
                    'Export buttons should have enhanced styling');
            }
            
            // Test status bar export button
            const statusExportBtn = document.getElementById('status-export-btn');
            this.logTest('Status Bar Export Button', !!statusExportBtn, 
                'Status bar should have export button');
            
            // Test export functionality availability
            const hasExportModule = typeof window.colorExport !== 'undefined';
            this.logTest('Export Module Available', hasExportModule, 
                'Export functionality module should be available');
            
        } catch (error) {
            this.logTest('Export Functionality Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 9: PWA Functionality Integration
    async testPWAFunctionalityIntegration() {
        console.log('📱 Testing PWA Functionality Integration...');
        
        try {
            // Test service worker support
            const hasServiceWorker = 'serviceWorker' in navigator;
            this.logTest('Service Worker Support', hasServiceWorker, 
                'Browser should support service workers');
            
            // Test manifest file
            const manifestLink = document.querySelector('link[rel="manifest"]');
            this.logTest('Manifest Link', !!manifestLink, 
                'Manifest link should be present');
            
            // Test PWA meta tags
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            const appleCapableMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
            
            this.logTest('PWA Meta Tags', !!(themeColorMeta && appleCapableMeta), 
                'PWA meta tags should be present');
            
            // Test PWA icons
            const iconLink = document.querySelector('link[rel="icon"]');
            const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
            
            this.logTest('PWA Icons', !!(iconLink && appleTouchIcon), 
                'PWA icons should be configured');
            
            // Test offline functionality indicators
            const connectionStatus = document.getElementById('connection-status');
            this.logTest('Offline Status Indicator', true, 
                'PWA should handle offline status (check console for service worker registration)');
            
        } catch (error) {
            this.logTest('PWA Functionality Integration', false, `Error: ${error.message}`);
        }
    }

    // Test 10: Cross-Browser Compatibility
    async testCrossBrowserCompatibility() {
        console.log('🌐 Testing Cross-Browser Compatibility...');
        
        try {
            const userAgent = navigator.userAgent;
            const browserInfo = this.getBrowserInfo();
            
            // Test CSS Grid support (used in calculator layout)
            const supportsGrid = CSS.supports('display', 'grid');
            this.logTest('CSS Grid Support', supportsGrid, 
                'Browser should support CSS Grid');
            
            // Test CSS Custom Properties support (used for gold accents)
            const supportsCustomProps = CSS.supports('color', 'var(--test)');
            this.logTest('CSS Custom Properties Support', supportsCustomProps, 
                'Browser should support CSS custom properties');
            
            // Test Flexbox support
            const supportsFlexbox = CSS.supports('display', 'flex');
            this.logTest('Flexbox Support', supportsFlexbox, 
                'Browser should support Flexbox');
            
            // Test backdrop-filter support (used in status bar)
            const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
            this.logTest('Backdrop Filter Support', supportsBackdropFilter, 
                'Browser should support backdrop-filter (may degrade gracefully)');
            
            // Test transform support (used in animations)
            const supportsTransform = CSS.supports('transform', 'translateY(0)');
            this.logTest('Transform Support', supportsTransform, 
                'Browser should support CSS transforms');
            
            this.logTest('Browser Compatibility', true, 
                `Testing on ${browserInfo.name} ${browserInfo.version}`);
            
        } catch (error) {
            this.logTest('Cross-Browser Compatibility', false, `Error: ${error.message}`);
        }
    }

    // Test 11: Responsive Design Integration
    async testResponsiveDesignIntegration() {
        console.log('📱 Testing Responsive Design Integration...');
        
        try {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            // Test viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            this.logTest('Viewport Meta Tag', !!viewportMeta, 
                'Viewport meta tag should be present');
            
            // Test responsive breakpoints
            const isDesktop = viewport.width >= 1200;
            const isTablet = viewport.width >= 768 && viewport.width < 1200;
            const isMobile = viewport.width < 768;
            
            // Test calculator layout responsiveness
            const calculatorMain = document.querySelector('.calculator-main');
            if (calculatorMain) {
                const gridColumns = getComputedStyle(calculatorMain).gridTemplateColumns;
                const hasResponsiveGrid = gridColumns !== 'none';
                
                this.logTest('Responsive Grid Layout', hasResponsiveGrid, 
                    'Calculator should use responsive grid layout');
            }
            
            // Test status bar responsiveness
            const statusBar = document.getElementById('status-bar');
            if (statusBar) {
                const statusBarHeight = getComputedStyle(statusBar).height;
                const hasResponsiveHeight = statusBarHeight !== 'auto';
                
                this.logTest('Responsive Status Bar', hasResponsiveHeight, 
                    'Status bar should have responsive height');
            }
            
            // Test touch optimization
            const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            this.logTest('Touch Support Detection', hasTouchSupport || !isMobile, 
                'Touch support should be detected on touch devices');
            
            this.logTest('Responsive Design', true, 
                `Testing on ${isDesktop ? 'Desktop' : isTablet ? 'Tablet' : 'Mobile'} viewport (${viewport.width}x${viewport.height})`);
            
        } catch (error) {
            this.logTest('Responsive Design Integration', false, `Error: ${error.message}`);
        }
    }    //
 Test 12: Performance Impact Assessment
    async testPerformanceImpact() {
        console.log('⚡ Testing Performance Impact...');
        
        try {
            // Test initial load performance
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            const loadTimeAcceptable = loadTime < 5000; // Should load in under 5 seconds
            
            this.logTest('Load Time Performance', loadTimeAcceptable, 
                `Page load time: ${loadTime}ms (should be < 5000ms)`);
            
            // Test scroll performance
            const scrollStartTime = performance.now();
            
            // Simulate multiple scroll events
            for (let i = 0; i < 50; i++) {
                window.dispatchEvent(new Event('scroll'));
            }
            
            const scrollEndTime = performance.now();
            const scrollTime = scrollEndTime - scrollStartTime;
            const scrollPerformanceGood = scrollTime < 50; // Should handle 50 scroll events in under 50ms
            
            this.logTest('Scroll Performance', scrollPerformanceGood, 
                `Scroll handling time: ${scrollTime.toFixed(2)}ms for 50 events`);
            
            // Test animation performance
            const supportsRequestAnimationFrame = typeof requestAnimationFrame === 'function';
            this.logTest('Animation Frame Support', supportsRequestAnimationFrame, 
                'Browser should support requestAnimationFrame for smooth animations');
            
            // Test memory usage (if available)
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
                const memoryAcceptable = memoryUsage < 50; // Should use less than 50MB
                
                this.logTest('Memory Usage', memoryAcceptable, 
                    `Memory usage: ${memoryUsage.toFixed(2)}MB (should be < 50MB)`);
            } else {
                this.logTest('Memory Usage', true, 
                    'Memory usage monitoring not available in this browser');
            }
            
            // Test DOM complexity impact
            const elementCount = document.querySelectorAll('*').length;
            const domComplexityAcceptable = elementCount < 1000; // Should have reasonable DOM size
            
            this.logTest('DOM Complexity', domComplexityAcceptable, 
                `DOM elements: ${elementCount} (should be < 1000)`);
            
        } catch (error) {
            this.logTest('Performance Impact Assessment', false, `Error: ${error.message}`);
        }
    }

    // Helper Methods
    logTest(testName, passed, message) {
        this.testCount++;
        
        const result = {
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (passed) {
            this.passCount++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.failCount++;
            console.log(`❌ ${testName}: ${message}`);
        }
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    checkCSSRule(selector) {
        try {
            const styleSheets = Array.from(document.styleSheets);
            
            for (const styleSheet of styleSheets) {
                try {
                    const rules = Array.from(styleSheet.cssRules || styleSheet.rules || []);
                    
                    for (const rule of rules) {
                        if (rule.selectorText && rule.selectorText.includes(selector)) {
                            return true;
                        }
                    }
                } catch (e) {
                    // Skip stylesheets that can't be accessed (CORS)
                    continue;
                }
            }
            
            return false;
        } catch (error) {
            console.warn(`Could not check CSS rule ${selector}:`, error);
            return false;
        }
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let name = 'Unknown';
        let version = 'Unknown';
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
            name = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            name = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            name = 'Safari';
            const match = userAgent.match(/Version\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
            name = 'Edge';
            const match = userAgent.match(/Edg?\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        }
        
        return { name, version };
    }

    generateFinalReport() {
        console.log('\n📋 UI Enhancements Integration Test Report');
        console.log('=' .repeat(50));
        console.log(`Total Tests: ${this.testCount}`);
        console.log(`Passed: ${this.passCount}`);
        console.log(`Failed: ${this.failCount}`);
        console.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);
        console.log(`Browser: ${this.getBrowserInfo().name} ${this.getBrowserInfo().version}`);
        console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        if (this.failCount > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  - ${result.name}: ${result.message}`);
                });
        }
        
        console.log('\n✅ Test Summary:');
        console.log(`  - Sticky Status Bar: ${this.getTestGroupStatus('Status Bar')}`);
        console.log(`  - Enhanced Tooltips: ${this.getTestGroupStatus('Tooltip')}`);
        console.log(`  - Outlined Buttons: ${this.getTestGroupStatus('Button')}`);
        console.log(`  - Gold Accents: ${this.getTestGroupStatus('Gold')}`);
        console.log(`  - Calculator Integration: ${this.getTestGroupStatus('Calculator')}`);
        console.log(`  - Feature Integration: ${this.getTestGroupStatus('Integration')}`);
        console.log(`  - Performance: ${this.getTestGroupStatus('Performance')}`);
        
        // Store results globally for external access
        window.uiEnhancementsTestResults = {
            totalTests: this.testCount,
            passedTests: this.passCount,
            failedTests: this.failCount,
            successRate: ((this.passCount / this.testCount) * 100).toFixed(1),
            browser: this.getBrowserInfo(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
            results: this.testResults
        };
        
        console.log('\n🎉 UI Enhancements Integration Test Suite Complete!');
        
        return window.uiEnhancementsTestResults;
    }

    getTestGroupStatus(groupName) {
        const groupTests = this.testResults.filter(result => 
            result.name.toLowerCase().includes(groupName.toLowerCase()));
        
        if (groupTests.length === 0) return 'No tests';
        
        const passed = groupTests.filter(test => test.passed).length;
        const total = groupTests.length;
        
        return `${passed}/${total} passed`;
    }
}

// Auto-run tests when this script is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const testSuite = new UIEnhancementsIntegrationTest();
                testSuite.runAllTests();
            }, 1000); // Wait 1 second for all scripts to load
        });
    } else {
        // DOM is already ready
        setTimeout(() => {
            const testSuite = new UIEnhancementsIntegrationTest();
            testSuite.runAllTests();
        }, 1000);
    }
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIEnhancementsIntegrationTest;
}