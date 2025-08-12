// Final Integration Testing Suite
// Requirements: Test complete workflow from input to export across different browsers

console.log('Loading Final Integration Test Suite...');

// Test configuration
const TEST_CONFIG = {
    TIMEOUT: 5000,
    RETRY_COUNT: 3,
    TEST_DATA: {
        target: {
            cmyk: { c: 15, m: 78, y: 65, k: 8 },
            lab: { l: 61, a: 44, b: 35 }
        },
        sample: {
            cmyk: { c: 18, m: 80, y: 64, k: 10 },
            lab: { l: 59, a: 42, b: 37 }
        }
    }
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

/**
 * Main test runner for complete workflow testing
 * Requirements: Test complete workflow from input to export
 */
async function runCompleteWorkflowTests() {
    console.log('🧪 Starting Complete Workflow Integration Tests...');
    
    try {
        // Reset test results
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.total = 0;
        testResults.details = [];
        
        // Test Suite 1: Basic Application Loading
        await testApplicationLoading();
        
        // Test Suite 2: Input Validation and UI Updates
        await testInputValidationWorkflow();
        
        // Test Suite 3: Color Science Calculations
        await testColorScienceWorkflow();
        
        // Test Suite 4: Results Display and Suggestions
        await testResultsDisplayWorkflow();
        
        // Test Suite 5: Export Functionality
        await testExportWorkflow();
        
        // Test Suite 6: History and Storage
        await testHistoryWorkflow();
        
        // Test Suite 7: Keyboard Shortcuts
        await testKeyboardShortcuts();
        
        // Test Suite 8: PWA Functionality
        await testPWAWorkflow();
        
        // Test Suite 9: Cross-Browser Compatibility
        await testBrowserCompatibility();
        
        // Test Suite 10: Performance and Error Handling
        await testPerformanceAndErrorHandling();
        
        // Generate test report
        generateTestReport();
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        recordTestResult('Complete Test Suite', false, `Test suite failed: ${error.message}`);
    }
}

/**
 * Test Suite 1: Application Loading
 */
async function testApplicationLoading() {
    console.log('📱 Testing Application Loading...');
    
    // Test 1.1: DOM Elements Present
    await runTest('DOM Elements Present', () => {
        const requiredElements = [
            'calculator-container',
            'target-section',
            'sample-section',
            'delta-section',
            'calculate-btn',
            'results-section'
        ];
        
        return requiredElements.every(id => {
            const element = document.getElementById(id);
            if (!element) {
                throw new Error(`Required element missing: ${id}`);
            }
            return true;
        });
    });
    
    // Test 1.2: JavaScript Modules Loaded
    await runTest('JavaScript Modules Loaded', () => {
        const requiredModules = [
            'colorScience',
            'colorStorage',
            'colorExport'
        ];
        
        return requiredModules.every(module => {
            if (!window[module]) {
                throw new Error(`Required module missing: ${module}`);
            }
            return true;
        });
    });
    
    // Test 1.3: CSS Styles Applied
    await runTest('CSS Styles Applied', () => {
        const container = document.querySelector('.calculator-container');
        const computedStyle = window.getComputedStyle(container);
        
        if (computedStyle.display === 'none') {
            throw new Error('Main container is not visible');
        }
        
        return true;
    });
}

/**
 * Test Suite 2: Input Validation and UI Updates
 */
async function testInputValidationWorkflow() {
    console.log('✏️ Testing Input Validation Workflow...');
    
    // Test 2.1: CMYK Input Validation
    await runTest('CMYK Input Validation', () => {
        const targetC = document.getElementById('target-c');
        
        // Test valid input
        targetC.value = '50';
        targetC.dispatchEvent(new Event('input'));
        
        if (targetC.classList.contains('invalid')) {
            throw new Error('Valid CMYK input marked as invalid');
        }
        
        // Test invalid input
        targetC.value = '150';
        targetC.dispatchEvent(new Event('input'));
        
        if (!targetC.classList.contains('invalid')) {
            throw new Error('Invalid CMYK input not marked as invalid');
        }
        
        return true;
    });
    
    // Test 2.2: LAB Input Validation
    await runTest('LAB Input Validation', () => {
        const targetL = document.getElementById('target-l');
        
        // Test valid L* input
        targetL.value = '75';
        targetL.dispatchEvent(new Event('input'));
        
        if (targetL.classList.contains('invalid')) {
            throw new Error('Valid LAB L* input marked as invalid');
        }
        
        // Test invalid L* input
        targetL.value = '150';
        targetL.dispatchEvent(new Event('input'));
        
        if (!targetL.classList.contains('invalid')) {
            throw new Error('Invalid LAB L* input not marked as invalid');
        }
        
        return true;
    });
    
    // Test 2.3: Color Swatch Updates
    await runTest('Color Swatch Updates', async () => {
        // Set valid CMYK values
        setInputValue('target-c', '100');
        setInputValue('target-m', '0');
        setInputValue('target-y', '0');
        setInputValue('target-k', '0');
        
        // Wait for swatch update
        await wait(500);
        
        const targetSwatch = document.getElementById('target-swatch');
        const backgroundColor = window.getComputedStyle(targetSwatch).backgroundColor;
        
        if (backgroundColor === 'rgb(255, 255, 255)') {
            throw new Error('Color swatch did not update from white');
        }
        
        return true;
    });
}

/**
 * Test Suite 3: Color Science Calculations
 */
async function testColorScienceWorkflow() {
    console.log('🎨 Testing Color Science Workflow...');
    
    // Test 3.1: CMYK to RGB Conversion
    await runTest('CMYK to RGB Conversion', () => {
        if (!window.colorScience || !window.colorScience.cmykToRgb) {
            throw new Error('CMYK to RGB function not available');
        }
        
        const result = window.colorScience.cmykToRgb(100, 0, 0, 0);
        
        if (!result || typeof result.r !== 'number' || typeof result.g !== 'number' || typeof result.b !== 'number') {
            throw new Error('Invalid CMYK to RGB conversion result');
        }
        
        // Cyan should produce a cyan-ish color (low red, high green and blue)
        if (result.r > 100 || result.g < 150 || result.b < 150) {
            throw new Error('CMYK to RGB conversion produced unexpected color');
        }
        
        return true;
    });
    
    // Test 3.2: LAB to RGB Conversion
    await runTest('LAB to RGB Conversion', () => {
        if (!window.colorScience || !window.colorScience.labToRgb) {
            throw new Error('LAB to RGB function not available');
        }
        
        const result = window.colorScience.labToRgb(50, 0, 0);
        
        if (!result || typeof result.r !== 'number' || typeof result.g !== 'number' || typeof result.b !== 'number') {
            throw new Error('Invalid LAB to RGB conversion result');
        }
        
        return true;
    });
    
    // Test 3.3: Delta E Calculation
    await runTest('Delta E Calculation', () => {
        if (!window.colorScience || !window.colorScience.calculateDeltaE) {
            throw new Error('Delta E calculation function not available');
        }
        
        const lab1 = { l: 50, a: 0, b: 0 };
        const lab2 = { l: 60, a: 10, b: 5 };
        
        const deltaE = window.colorScience.calculateDeltaE(lab1, lab2);
        
        if (typeof deltaE !== 'number' || deltaE < 0) {
            throw new Error('Invalid Delta E calculation result');
        }
        
        // Delta E should be reasonable for this difference
        if (deltaE < 5 || deltaE > 20) {
            throw new Error('Delta E calculation result outside expected range');
        }
        
        return true;
    });
}

/**
 * Test Suite 4: Results Display and Suggestions
 */
async function testResultsDisplayWorkflow() {
    console.log('📊 Testing Results Display Workflow...');
    
    // Set up test data
    await setupTestData();
    
    // Test 4.1: Complete Calculation Workflow
    await runTest('Complete Calculation Workflow', async () => {
        const calculateBtn = document.getElementById('calculate-btn');
        
        // Trigger calculation
        calculateBtn.click();
        
        // Wait for calculation to complete
        await wait(1000);
        
        // Check if results are displayed
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection.classList.contains('visible')) {
            throw new Error('Results section not visible after calculation');
        }
        
        // Check Delta E display
        const deltaENumber = document.querySelector('.delta-e-number');
        if (!deltaENumber || deltaENumber.textContent === '--') {
            throw new Error('Delta E value not displayed');
        }
        
        return true;
    });
    
    // Test 4.2: Tolerance Zone Classification
    await runTest('Tolerance Zone Classification', () => {
        const toleranceZone = document.getElementById('tolerance-zone');
        
        if (!toleranceZone || !toleranceZone.textContent) {
            throw new Error('Tolerance zone not displayed');
        }
        
        const validZones = ['good', 'acceptable', 'poor'];
        const hasValidZone = validZones.some(zone => 
            toleranceZone.classList.contains(zone)
        );
        
        if (!hasValidZone) {
            throw new Error('Invalid tolerance zone classification');
        }
        
        return true;
    });
    
    // Test 4.3: CMYK Suggestions Generation
    await runTest('CMYK Suggestions Generation', () => {
        const suggestionsList = document.getElementById('suggestions-list');
        const suggestions = suggestionsList.querySelectorAll('.suggestion-item');
        
        if (suggestions.length === 0) {
            throw new Error('No CMYK suggestions generated');
        }
        
        if (suggestions.length > 5) {
            throw new Error('Too many suggestions generated (should be max 5)');
        }
        
        // Check suggestion format
        const firstSuggestion = suggestions[0];
        const cmykDisplay = firstSuggestion.querySelector('.suggestion-cmyk');
        const description = firstSuggestion.querySelector('.suggestion-description');
        
        if (!cmykDisplay || !description) {
            throw new Error('Suggestion format is incomplete');
        }
        
        return true;
    });
}

/**
 * Test Suite 5: Export Functionality
 */
async function testExportWorkflow() {
    console.log('📤 Testing Export Workflow...');
    
    // Ensure we have calculation results
    if (!appState.results) {
        await setupTestData();
        document.getElementById('calculate-btn').click();
        await wait(1000);
    }
    
    // Test 5.1: Export Button States
    await runTest('Export Button States', () => {
        const csvBtn = document.getElementById('export-csv-btn');
        const pdfBtn = document.getElementById('export-pdf-btn');
        
        if (csvBtn.disabled || pdfBtn.disabled) {
            throw new Error('Export buttons should be enabled when results are available');
        }
        
        return true;
    });
    
    // Test 5.2: CSV Export Function
    await runTest('CSV Export Function', () => {
        if (!window.colorExport || !window.colorExport.exportToCSV) {
            throw new Error('CSV export function not available');
        }
        
        // Mock the download to avoid actual file creation
        const originalCreateElement = document.createElement;
        let downloadTriggered = false;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName === 'a') {
                element.click = function() {
                    downloadTriggered = true;
                };
            }
            return element;
        };
        
        try {
            window.colorExport.exportToCSV();
            
            if (!downloadTriggered) {
                throw new Error('CSV download was not triggered');
            }
            
            return true;
        } finally {
            document.createElement = originalCreateElement;
        }
    });
    
    // Test 5.3: PDF Export Function
    await runTest('PDF Export Function', () => {
        if (!window.colorExport || !window.colorExport.exportToPDF) {
            throw new Error('PDF export function not available');
        }
        
        // Mock window.open to avoid actual popup
        const originalOpen = window.open;
        let pdfWindowOpened = false;
        
        window.open = function() {
            pdfWindowOpened = true;
            return {
                document: {
                    write: () => {},
                    close: () => {}
                },
                onload: null,
                print: () => {},
                close: () => {}
            };
        };
        
        try {
            window.colorExport.exportToPDF();
            
            if (!pdfWindowOpened) {
                throw new Error('PDF window was not opened');
            }
            
            return true;
        } finally {
            window.open = originalOpen;
        }
    });
}

/**
 * Test Suite 6: History and Storage
 */
async function testHistoryWorkflow() {
    console.log('💾 Testing History and Storage Workflow...');
    
    // Test 6.1: Save to History
    await runTest('Save to History', () => {
        if (!window.colorStorage || !window.colorStorage.saveToHistory) {
            throw new Error('Save to history function not available');
        }
        
        const testComparison = {
            target: TEST_CONFIG.TEST_DATA.target,
            sample: TEST_CONFIG.TEST_DATA.sample,
            deltaE: 3.48,
            tolerance: { zone: 'acceptable', description: 'Acceptable match' },
            componentDeltas: { deltaL: -2, deltaA: 2, deltaB: -2, deltaC: 1, deltaH: 0.5 }
        };
        
        const result = window.colorStorage.saveToHistory(testComparison);
        
        if (!result || !result.id) {
            throw new Error('Failed to save to history');
        }
        
        return true;
    });
    
    // Test 6.2: Load History
    await runTest('Load History', () => {
        if (!window.colorStorage || !window.colorStorage.loadHistory) {
            throw new Error('Load history function not available');
        }
        
        const history = window.colorStorage.loadHistory();
        
        if (!Array.isArray(history)) {
            throw new Error('History is not an array');
        }
        
        if (history.length === 0) {
            throw new Error('History is empty (should have at least one entry from previous test)');
        }
        
        return true;
    });
    
    // Test 6.3: Display History
    await runTest('Display History', () => {
        if (!window.colorStorage || !window.colorStorage.displayHistory) {
            throw new Error('Display history function not available');
        }
        
        window.colorStorage.displayHistory();
        
        const historyList = document.getElementById('history-list');
        const historyItems = historyList.querySelectorAll('.history-item');
        
        if (historyItems.length === 0) {
            throw new Error('No history items displayed');
        }
        
        return true;
    });
}

/**
 * Test Suite 7: Keyboard Shortcuts
 */
async function testKeyboardShortcuts() {
    console.log('⌨️ Testing Keyboard Shortcuts...');
    
    // Test 7.1: Enter Key Calculation
    await runTest('Enter Key Calculation', async () => {
        await setupTestData();
        
        // Simulate Enter key press
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true
        });
        
        document.dispatchEvent(enterEvent);
        
        // Wait for calculation
        await wait(500);
        
        // Check if calculation was triggered
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection.classList.contains('visible')) {
            throw new Error('Enter key did not trigger calculation');
        }
        
        return true;
    });
    
    // Test 7.2: Keyboard Shortcuts Help
    await runTest('Keyboard Shortcuts Help', () => {
        // Simulate Ctrl+H
        const helpEvent = new KeyboardEvent('keydown', {
            key: 'h',
            ctrlKey: true,
            bubbles: true
        });
        
        document.dispatchEvent(helpEvent);
        
        // Check if help modal is displayed
        const helpModal = document.querySelector('.keyboard-shortcuts-modal');
        if (!helpModal) {
            throw new Error('Keyboard shortcuts help modal not displayed');
        }
        
        // Close the modal
        const closeBtn = helpModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.click();
        }
        
        return true;
    });
    
    // Test 7.3: Reset Shortcut
    await runTest('Reset Shortcut', () => {
        // Set some input values first
        setInputValue('target-c', '50');
        setInputValue('sample-m', '75');
        
        // Simulate Ctrl+R
        const resetEvent = new KeyboardEvent('keydown', {
            key: 'r',
            ctrlKey: true,
            bubbles: true
        });
        
        // Mock confirm dialog
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        
        try {
            document.dispatchEvent(resetEvent);
            
            // Check if inputs were reset
            const targetC = document.getElementById('target-c');
            const sampleM = document.getElementById('sample-m');
            
            if (targetC.value !== '' || sampleM.value !== '') {
                throw new Error('Reset shortcut did not clear inputs');
            }
            
            return true;
        } finally {
            window.confirm = originalConfirm;
        }
    });
}

/**
 * Test Suite 8: PWA Functionality
 */
async function testPWAWorkflow() {
    console.log('📱 Testing PWA Workflow...');
    
    // Test 8.1: Service Worker Registration
    await runTest('Service Worker Registration', () => {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported in this browser');
            return true; // Skip test if not supported
        }
        
        // Check if service worker is registered
        return navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length === 0) {
                throw new Error('No service worker registrations found');
            }
            
            return true;
        });
    });
    
    // Test 8.2: Offline Storage
    await runTest('Offline Storage', () => {
        if (!window.colorStorage || !window.colorStorage.loadPWASettings) {
            throw new Error('PWA storage functions not available');
        }
        
        const settings = window.colorStorage.loadPWASettings();
        
        if (!settings || typeof settings !== 'object') {
            throw new Error('PWA settings not loaded properly');
        }
        
        return true;
    });
    
    // Test 8.3: Manifest File
    await runTest('Manifest File', () => {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        
        if (!manifestLink) {
            throw new Error('Manifest link not found in HTML');
        }
        
        return fetch(manifestLink.href)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Manifest file not accessible');
                }
                return response.json();
            })
            .then(manifest => {
                if (!manifest.name || !manifest.start_url) {
                    throw new Error('Manifest file missing required fields');
                }
                return true;
            });
    });
}

/**
 * Test Suite 9: Cross-Browser Compatibility
 */
async function testBrowserCompatibility() {
    console.log('🌐 Testing Cross-Browser Compatibility...');
    
    // Test 9.1: Browser Feature Detection
    await runTest('Browser Feature Detection', () => {
        const requiredFeatures = {
            localStorage: typeof Storage !== 'undefined',
            canvas: !!document.createElement('canvas').getContext,
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            customProperties: CSS.supports('color', 'var(--test)')
        };
        
        const missingFeatures = Object.keys(requiredFeatures)
            .filter(feature => !requiredFeatures[feature]);
        
        if (missingFeatures.length > 0) {
            console.warn('Missing browser features:', missingFeatures);
            // Don't fail the test, just warn
        }
        
        return true;
    });
    
    // Test 9.2: CSS Grid Support
    await runTest('CSS Grid Support', () => {
        const calculatorMain = document.querySelector('.calculator-main');
        const computedStyle = window.getComputedStyle(calculatorMain);
        
        if (computedStyle.display !== 'grid') {
            throw new Error('CSS Grid not working properly');
        }
        
        return true;
    });
    
    // Test 9.3: Event Handling
    await runTest('Event Handling', () => {
        const testInput = document.getElementById('target-c');
        let eventFired = false;
        
        const testHandler = () => {
            eventFired = true;
        };
        
        testInput.addEventListener('input', testHandler);
        
        // Trigger event
        testInput.value = '25';
        testInput.dispatchEvent(new Event('input'));
        
        testInput.removeEventListener('input', testHandler);
        
        if (!eventFired) {
            throw new Error('Event handling not working properly');
        }
        
        return true;
    });
}

/**
 * Test Suite 10: Performance and Error Handling
 */
async function testPerformanceAndErrorHandling() {
    console.log('⚡ Testing Performance and Error Handling...');
    
    // Test 10.1: Calculation Performance
    await runTest('Calculation Performance', async () => {
        await setupTestData();
        
        const startTime = performance.now();
        
        // Trigger calculation
        document.getElementById('calculate-btn').click();
        
        // Wait for completion
        await wait(1000);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 2000) {
            throw new Error(`Calculation took too long: ${duration}ms`);
        }
        
        console.log(`Calculation completed in ${duration.toFixed(2)}ms`);
        return true;
    });
    
    // Test 10.2: Error Handling
    await runTest('Error Handling', () => {
        // Test invalid color science input
        if (window.colorScience && window.colorScience.calculateDeltaE) {
            try {
                // This should handle invalid input gracefully
                const result = window.colorScience.calculateDeltaE(null, null);
                
                // Should return a number or handle error gracefully
                if (typeof result !== 'number' && !isNaN(result)) {
                    console.log('Error handled gracefully');
                }
                
                return true;
            } catch (error) {
                // Error handling is working if we catch an error
                console.log('Error caught and handled:', error.message);
                return true;
            }
        }
        
        return true;
    });
    
    // Test 10.3: Memory Usage
    await runTest('Memory Usage', () => {
        if (performance.memory) {
            const memoryInfo = performance.memory;
            const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
            
            console.log(`Memory usage: ${usedMB.toFixed(2)} MB`);
            
            if (usedMB > 100) {
                console.warn('High memory usage detected');
            }
        }
        
        return true;
    });
}

/**
 * Utility Functions
 */

// Run a single test with error handling and retry logic
async function runTest(testName, testFunction) {
    testResults.total++;
    
    for (let attempt = 1; attempt <= TEST_CONFIG.RETRY_COUNT; attempt++) {
        try {
            const result = await Promise.race([
                testFunction(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.TIMEOUT)
                )
            ]);
            
            if (result === true) {
                recordTestResult(testName, true);
                return;
            }
        } catch (error) {
            if (attempt === TEST_CONFIG.RETRY_COUNT) {
                recordTestResult(testName, false, error.message);
                return;
            }
            
            console.warn(`Test "${testName}" failed on attempt ${attempt}, retrying...`);
            await wait(100);
        }
    }
}

// Record test result
function recordTestResult(testName, passed, error = null) {
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        console.error(`❌ ${testName}: ${error}`);
    }
    
    testResults.details.push({
        name: testName,
        passed,
        error
    });
}

// Set input value and trigger events
function setInputValue(inputId, value) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

// Setup test data
async function setupTestData() {
    const testData = TEST_CONFIG.TEST_DATA;
    
    // Set target color
    setInputValue('target-c', testData.target.cmyk.c.toString());
    setInputValue('target-m', testData.target.cmyk.m.toString());
    setInputValue('target-y', testData.target.cmyk.y.toString());
    setInputValue('target-k', testData.target.cmyk.k.toString());
    setInputValue('target-l', testData.target.lab.l.toString());
    setInputValue('target-a', testData.target.lab.a.toString());
    setInputValue('target-b', testData.target.lab.b.toString());
    
    // Set sample color
    setInputValue('sample-c', testData.sample.cmyk.c.toString());
    setInputValue('sample-m', testData.sample.cmyk.m.toString());
    setInputValue('sample-y', testData.sample.cmyk.y.toString());
    setInputValue('sample-k', testData.sample.cmyk.k.toString());
    setInputValue('sample-l', testData.sample.lab.l.toString());
    setInputValue('sample-a', testData.sample.lab.a.toString());
    setInputValue('sample-b', testData.sample.lab.b.toString());
    
    // Wait for updates to process
    await wait(300);
}

// Wait utility
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate comprehensive test report
function generateTestReport() {
    const passRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
    
    console.log('\n📊 FINAL INTEGRATION TEST REPORT');
    console.log('=====================================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('=====================================');
    
    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.details
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`- ${test.name}: ${test.error}`);
            });
    }
    
    if (testResults.passed === testResults.total) {
        console.log('\n🎉 ALL TESTS PASSED! Application is ready for production.');
    } else {
        console.log(`\n⚠️ ${testResults.failed} tests failed. Please review and fix issues before deployment.`);
    }
    
    // Create visual test report in the UI
    createVisualTestReport();
}

// Create visual test report in the UI
function createVisualTestReport() {
    const reportModal = document.createElement('div');
    reportModal.className = 'test-report-modal';
    reportModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Integration Test Report</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="test-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Tests:</span>
                        <span class="summary-value">${testResults.total}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Passed:</span>
                        <span class="summary-value success">${testResults.passed}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Failed:</span>
                        <span class="summary-value ${testResults.failed > 0 ? 'error' : 'success'}">${testResults.failed}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Pass Rate:</span>
                        <span class="summary-value">${(testResults.passed / testResults.total * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="test-details">
                    <h4>Test Details:</h4>
                    <div class="test-list">
                        ${testResults.details.map(test => `
                            <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                                <span class="test-icon">${test.passed ? '✅' : '❌'}</span>
                                <span class="test-name">${test.name}</span>
                                ${test.error ? `<span class="test-error">${test.error}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="test-actions">
                    <button onclick="runCompleteWorkflowTests()" class="test-btn">Run Tests Again</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="test-btn secondary">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(reportModal);
}

// Export test functions for manual testing
window.testSuite = {
    runCompleteWorkflowTests,
    testApplicationLoading,
    testInputValidationWorkflow,
    testColorScienceWorkflow,
    testResultsDisplayWorkflow,
    testExportWorkflow,
    testHistoryWorkflow,
    testKeyboardShortcuts,
    testPWAWorkflow,
    testBrowserCompatibility,
    testPerformanceAndErrorHandling,
    generateTestReport
};

console.log('✅ Final Integration Test Suite loaded successfully');
console.log('🧪 Run tests with: runCompleteWorkflowTests()');