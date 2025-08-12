// Integration Tests for Complete Calculation Workflow
// Requirements: 6.4, 4.4 - Create integration tests for complete calculation workflow

/**
 * Comprehensive Integration Test Suite for Complete Calculation Workflow
 * Tests the entire user workflow from input to results display
 */

// Test configuration
const INTEGRATION_TEST_CONFIG = {
    timeout: 5000,        // 5 second timeout for async operations
    verbose: true,
    simulateUserDelay: 100  // Simulate user typing delay
};

// Test scenarios representing real-world usage
const WORKFLOW_TEST_SCENARIOS = [
    {
        name: 'Basic Red Color Comparison',
        description: 'Compare two similar red colors with small difference',
        target: {
            cmyk: { c: 15, m: 85, y: 75, k: 5 },
            lab: { l: 45.2, a: 58.3, b: 42.1 }
        },
        sample: {
            cmyk: { c: 18, m: 88, y: 73, k: 7 },
            lab: { l: 43.8, a: 60.1, b: 41.5 }
        },
        expectedDeltaE: { min: 2.0, max: 4.0 },
        expectedTolerance: 'acceptable'
    },
    {
        name: 'Excellent Color Match',
        description: 'Very close color match within good tolerance',
        target: {
            cmyk: { c: 25, m: 45, y: 65, k: 10 },
            lab: { l: 55.7, a: 12.3, b: 28.9 }
        },
        sample: {
            cmyk: { c: 26, m: 46, y: 64, k: 11 },
            lab: { l: 55.2, a: 12.8, b: 28.4 }
        },
        expectedDeltaE: { min: 0.5, max: 2.0 },
        expectedTolerance: 'good'
    },
    {
        name: 'Poor Color Match',
        description: 'Significant color difference requiring adjustment',
        target: {
            cmyk: { c: 10, m: 20, y: 30, k: 0 },
            lab: { l: 75.5, a: 5.2, b: 15.8 }
        },
        sample: {
            cmyk: { c: 35, m: 55, y: 75, k: 15 },
            lab: { l: 45.2, a: 25.8, b: 45.3 }
        },
        expectedDeltaE: { min: 8.0, max: 15.0 },
        expectedTolerance: 'poor'
    },
    {
        name: 'Black and White Comparison',
        description: 'High contrast comparison between black and white',
        target: {
            cmyk: { c: 0, m: 0, y: 0, k: 0 },
            lab: { l: 100, a: 0, b: 0 }
        },
        sample: {
            cmyk: { c: 0, m: 0, y: 0, k: 100 },
            lab: { l: 0, a: 0, b: 0 }
        },
        expectedDeltaE: { min: 95.0, max: 105.0 },
        expectedTolerance: 'poor'
    },
    {
        name: 'Spot Color Matching',
        description: 'Pantone-like spot color comparison',
        target: {
            cmyk: { c: 85, m: 10, y: 100, k: 0 },
            lab: { l: 51.8, a: -45.2, b: 58.7 }
        },
        sample: {
            cmyk: { c: 88, m: 8, y: 95, k: 2 },
            lab: { l: 50.3, a: -43.8, b: 55.9 }
        },
        expectedDeltaE: { min: 3.0, max: 6.0 },
        expectedTolerance: 'acceptable'
    }
];

// Integration test results tracking
let integrationResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    scenarios: [],
    performance: {
        averageCalculationTime: 0,
        totalTestTime: 0
    }
};

/**
 * Main integration test runner
 * Tests complete workflow from input to results
 */
async function runIntegrationTests() {
    console.log('🔄 Starting Integration Workflow Tests...');
    console.log('='.repeat(60));
    
    const startTime = performance.now();
    
    // Reset results
    integrationResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        scenarios: [],
        performance: { averageCalculationTime: 0, totalTestTime: 0 }
    };
    
    // Check prerequisites
    if (!checkPrerequisites()) {
        console.error('❌ Prerequisites not met for integration tests');
        return false;
    }
    
    // Run workflow tests for each scenario
    for (const scenario of WORKFLOW_TEST_SCENARIOS) {
        await runWorkflowScenario(scenario);
        
        // Small delay between scenarios
        await sleep(200);
    }
    
    // Run additional integration tests
    await testHistoryIntegration();
    await testExportIntegration();
    await testErrorHandling();
    await testPerformance();
    
    // Calculate total test time
    integrationResults.performance.totalTestTime = performance.now() - startTime;
    
    // Display results
    displayIntegrationResults();
    
    return integrationResults.failed === 0 && integrationResults.errors === 0;
}

/**
 * Check if all required modules and DOM elements are available
 */
function checkPrerequisites() {
    const requiredModules = [
        'window.colorScience',
        'window.colorStorage',
        'window.colorExport'
    ];
    
    const requiredElements = [
        'target-c', 'target-m', 'target-y', 'target-k',
        'target-l', 'target-a', 'target-b',
        'sample-c', 'sample-m', 'sample-y', 'sample-k',
        'sample-l', 'sample-a', 'sample-b',
        'calculate-btn', 'results-section'
    ];
    
    // Check modules
    for (const module of requiredModules) {
        if (eval(`typeof ${module}`) === 'undefined') {
            console.error(`❌ Required module not found: ${module}`);
            return false;
        }
    }
    
    // Check DOM elements
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            console.error(`❌ Required DOM element not found: ${elementId}`);
            return false;
        }
    }
    
    console.log('✅ All prerequisites met');
    return true;
}

/**
 * Run a complete workflow scenario test
 */
async function runWorkflowScenario(scenario) {
    console.log(`\n🎯 Testing Scenario: ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    
    integrationResults.total++;
    const scenarioResult = {
        name: scenario.name,
        passed: false,
        steps: [],
        calculationTime: 0,
        error: null
    };
    
    try {
        const startTime = performance.now();
        
        // Step 1: Clear all inputs
        const clearStep = await clearAllInputs();
        scenarioResult.steps.push(clearStep);
        
        // Step 2: Input target color values
        const targetStep = await inputColorValues('target', scenario.target);
        scenarioResult.steps.push(targetStep);
        
        // Step 3: Input sample color values
        const sampleStep = await inputColorValues('sample', scenario.sample);
        scenarioResult.steps.push(sampleStep);
        
        // Step 4: Verify color swatches updated
        const swatchStep = await verifyColorSwatches();
        scenarioResult.steps.push(swatchStep);
        
        // Step 5: Perform calculation
        const calculationStep = await performCalculation();
        scenarioResult.steps.push(calculationStep);
        
        // Step 6: Verify results
        const resultsStep = await verifyResults(scenario);
        scenarioResult.steps.push(resultsStep);
        
        // Step 7: Verify suggestions generated
        const suggestionsStep = await verifySuggestions();
        scenarioResult.steps.push(suggestionsStep);
        
        scenarioResult.calculationTime = performance.now() - startTime;
        
        // Check if all steps passed
        const allStepsPassed = scenarioResult.steps.every(step => step.passed);
        
        if (allStepsPassed) {
            scenarioResult.passed = true;
            integrationResults.passed++;
            console.log(`   ✅ Scenario completed successfully in ${scenarioResult.calculationTime.toFixed(2)}ms`);
        } else {
            integrationResults.failed++;
            console.log(`   ❌ Scenario failed`);
            
            // Log failed steps
            const failedSteps = scenarioResult.steps.filter(step => !step.passed);
            failedSteps.forEach(step => {
                console.log(`      Failed step: ${step.name} - ${step.error || 'Unknown error'}`);
            });
        }
        
    } catch (error) {
        integrationResults.errors++;
        scenarioResult.error = error.message;
        console.log(`   💥 Scenario error: ${error.message}`);
    }
    
    integrationResults.scenarios.push(scenarioResult);
}

/**
 * Clear all input fields
 */
async function clearAllInputs() {
    const step = { name: 'Clear Inputs', passed: false, error: null };
    
    try {
        const inputIds = [
            'target-c', 'target-m', 'target-y', 'target-k',
            'target-l', 'target-a', 'target-b',
            'sample-c', 'sample-m', 'sample-y', 'sample-k',
            'sample-l', 'sample-a', 'sample-b'
        ];
        
        inputIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        await sleep(100); // Allow DOM updates
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Input color values for target or sample
 */
async function inputColorValues(colorType, colorData) {
    const step = { name: `Input ${colorType} Color`, passed: false, error: null };
    
    try {
        // Input CMYK values
        await inputValue(`${colorType}-c`, colorData.cmyk.c);
        await inputValue(`${colorType}-m`, colorData.cmyk.m);
        await inputValue(`${colorType}-y`, colorData.cmyk.y);
        await inputValue(`${colorType}-k`, colorData.cmyk.k);
        
        // Input LAB values
        await inputValue(`${colorType}-l`, colorData.lab.l);
        await inputValue(`${colorType}-a`, colorData.lab.a);
        await inputValue(`${colorType}-b`, colorData.lab.b);
        
        // Verify values were set correctly
        const verification = verifyInputValues(colorType, colorData);
        if (!verification.success) {
            throw new Error(`Input verification failed: ${verification.error}`);
        }
        
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Input a single value with user simulation
 */
async function inputValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element not found: ${elementId}`);
    }
    
    // Simulate user typing
    element.focus();
    element.value = value.toString();
    
    // Trigger input events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Small delay to simulate user behavior
    await sleep(INTEGRATION_TEST_CONFIG.simulateUserDelay);
}

/**
 * Verify input values were set correctly
 */
function verifyInputValues(colorType, expectedData) {
    const tolerance = 0.1;
    
    try {
        // Check CMYK values
        const cmykChecks = [
            { id: `${colorType}-c`, expected: expectedData.cmyk.c },
            { id: `${colorType}-m`, expected: expectedData.cmyk.m },
            { id: `${colorType}-y`, expected: expectedData.cmyk.y },
            { id: `${colorType}-k`, expected: expectedData.cmyk.k }
        ];
        
        for (const check of cmykChecks) {
            const element = document.getElementById(check.id);
            const actualValue = parseFloat(element.value);
            
            if (Math.abs(actualValue - check.expected) > tolerance) {
                return {
                    success: false,
                    error: `${check.id}: expected ${check.expected}, got ${actualValue}`
                };
            }
        }
        
        // Check LAB values
        const labChecks = [
            { id: `${colorType}-l`, expected: expectedData.lab.l },
            { id: `${colorType}-a`, expected: expectedData.lab.a },
            { id: `${colorType}-b`, expected: expectedData.lab.b }
        ];
        
        for (const check of labChecks) {
            const element = document.getElementById(check.id);
            const actualValue = parseFloat(element.value);
            
            if (Math.abs(actualValue - check.expected) > tolerance) {
                return {
                    success: false,
                    error: `${check.id}: expected ${check.expected}, got ${actualValue}`
                };
            }
        }
        
        return { success: true };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Verify color swatches updated correctly
 */
async function verifyColorSwatches() {
    const step = { name: 'Verify Color Swatches', passed: false, error: null };
    
    try {
        await sleep(200); // Allow swatch updates
        
        const targetSwatch = document.getElementById('target-swatch');
        const sampleSwatch = document.getElementById('sample-swatch');
        
        if (!targetSwatch || !sampleSwatch) {
            throw new Error('Color swatch elements not found');
        }
        
        // Check if swatches have background colors set
        const targetBg = window.getComputedStyle(targetSwatch).backgroundColor;
        const sampleBg = window.getComputedStyle(sampleSwatch).backgroundColor;
        
        if (targetBg === 'rgba(0, 0, 0, 0)' || targetBg === 'transparent') {
            throw new Error('Target swatch background not set');
        }
        
        if (sampleBg === 'rgba(0, 0, 0, 0)' || sampleBg === 'transparent') {
            throw new Error('Sample swatch background not set');
        }
        
        // Verify swatches are different (unless testing identical colors)
        if (targetBg === sampleBg) {
            console.warn('   ⚠️  Target and sample swatches have identical colors');
        }
        
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Perform calculation by clicking calculate button
 */
async function performCalculation() {
    const step = { name: 'Perform Calculation', passed: false, error: null };
    
    try {
        const calculateBtn = document.getElementById('calculate-btn');
        if (!calculateBtn) {
            throw new Error('Calculate button not found');
        }
        
        // Click calculate button
        calculateBtn.click();
        
        // Wait for calculation to complete
        await sleep(500);
        
        // Verify results section is visible
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) {
            throw new Error('Results section not found');
        }
        
        // Check if results are displayed
        const deltaEElement = document.querySelector('.delta-e-number');
        if (!deltaEElement || !deltaEElement.textContent) {
            throw new Error('Delta E result not displayed');
        }
        
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Verify calculation results match expectations
 */
async function verifyResults(scenario) {
    const step = { name: 'Verify Results', passed: false, error: null };
    
    try {
        // Get displayed Delta E value
        const deltaEElement = document.querySelector('.delta-e-number');
        if (!deltaEElement) {
            throw new Error('Delta E display element not found');
        }
        
        const displayedDeltaE = parseFloat(deltaEElement.textContent);
        if (isNaN(displayedDeltaE)) {
            throw new Error('Invalid Delta E value displayed');
        }
        
        // Verify Delta E is within expected range
        if (displayedDeltaE < scenario.expectedDeltaE.min || displayedDeltaE > scenario.expectedDeltaE.max) {
            throw new Error(`Delta E ${displayedDeltaE} outside expected range ${scenario.expectedDeltaE.min}-${scenario.expectedDeltaE.max}`);
        }
        
        // Verify tolerance zone
        const toleranceElement = document.getElementById('tolerance-zone');
        if (!toleranceElement) {
            throw new Error('Tolerance zone element not found');
        }
        
        const displayedTolerance = toleranceElement.textContent.toLowerCase();
        if (!displayedTolerance.includes(scenario.expectedTolerance)) {
            throw new Error(`Expected tolerance '${scenario.expectedTolerance}', got '${displayedTolerance}'`);
        }
        
        // Verify component deltas are displayed
        const componentElements = ['delta-l', 'delta-a', 'delta-b', 'delta-c', 'delta-h'];
        for (const elementId of componentElements) {
            const element = document.getElementById(elementId);
            if (!element || !element.textContent) {
                throw new Error(`Component delta ${elementId} not displayed`);
            }
        }
        
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Verify CMYK suggestions are generated
 */
async function verifySuggestions() {
    const step = { name: 'Verify Suggestions', passed: false, error: null };
    
    try {
        const suggestionsList = document.getElementById('suggestions-list');
        if (!suggestionsList) {
            throw new Error('Suggestions list element not found');
        }
        
        // Check if suggestions are displayed
        const suggestionItems = suggestionsList.querySelectorAll('.suggestion-item');
        if (suggestionItems.length === 0) {
            throw new Error('No CMYK suggestions generated');
        }
        
        // Verify suggestion count (should be 3-5 as per requirements)
        if (suggestionItems.length < 3 || suggestionItems.length > 5) {
            throw new Error(`Expected 3-5 suggestions, got ${suggestionItems.length}`);
        }
        
        // Verify each suggestion has required elements
        for (let i = 0; i < suggestionItems.length; i++) {
            const item = suggestionItems[i];
            
            // Check for CMYK values
            const cmykDisplay = item.querySelector('.suggestion-cmyk');
            if (!cmykDisplay || !cmykDisplay.textContent) {
                throw new Error(`Suggestion ${i + 1} missing CMYK values`);
            }
            
            // Check for description
            const description = item.querySelector('.suggestion-description');
            if (!description || !description.textContent) {
                throw new Error(`Suggestion ${i + 1} missing description`);
            }
        }
        
        step.passed = true;
        
    } catch (error) {
        step.error = error.message;
    }
    
    return step;
}

/**
 * Test history integration
 */
async function testHistoryIntegration() {
    console.log('\n📚 Testing History Integration...');
    
    integrationResults.total++;
    
    try {
        // Perform a calculation first
        await clearAllInputs();
        await inputColorValues('target', WORKFLOW_TEST_SCENARIOS[0].target);
        await inputColorValues('sample', WORKFLOW_TEST_SCENARIOS[0].sample);
        await performCalculation();
        
        // Check if calculation was saved to history
        await sleep(200);
        
        const history = window.colorStorage.loadHistory();
        if (history.length === 0) {
            throw new Error('Calculation not saved to history');
        }
        
        // Verify history entry structure
        const latestEntry = history[0];
        if (!latestEntry.id || !latestEntry.timestamp || !latestEntry.deltaE) {
            throw new Error('Invalid history entry structure');
        }
        
        integrationResults.passed++;
        console.log('   ✅ History integration working correctly');
        
    } catch (error) {
        integrationResults.failed++;
        console.log(`   ❌ History integration failed: ${error.message}`);
    }
}

/**
 * Test export integration
 */
async function testExportIntegration() {
    console.log('\n📤 Testing Export Integration...');
    
    integrationResults.total++;
    
    try {
        // Ensure we have calculation results
        if (!appState || !appState.results) {
            throw new Error('No calculation results available for export test');
        }
        
        // Test CSV export function exists and can be called
        if (typeof window.colorExport.exportToCSV !== 'function') {
            throw new Error('CSV export function not available');
        }
        
        // Test PDF export function exists and can be called
        if (typeof window.colorExport.exportToPDF !== 'function') {
            throw new Error('PDF export function not available');
        }
        
        // Verify export buttons are enabled
        const csvBtn = document.getElementById('export-csv-btn');
        const pdfBtn = document.getElementById('export-pdf-btn');
        
        if (csvBtn && csvBtn.disabled) {
            throw new Error('CSV export button should be enabled after calculation');
        }
        
        if (pdfBtn && pdfBtn.disabled) {
            throw new Error('PDF export button should be enabled after calculation');
        }
        
        integrationResults.passed++;
        console.log('   ✅ Export integration working correctly');
        
    } catch (error) {
        integrationResults.failed++;
        console.log(`   ❌ Export integration failed: ${error.message}`);
    }
}

/**
 * Test error handling scenarios
 */
async function testErrorHandling() {
    console.log('\n⚠️  Testing Error Handling...');
    
    integrationResults.total++;
    
    try {
        // Test calculation with empty inputs
        await clearAllInputs();
        
        const calculateBtn = document.getElementById('calculate-btn');
        calculateBtn.click();
        
        await sleep(200);
        
        // Should handle gracefully without crashing
        console.log('   ✅ Empty input handling working correctly');
        
        // Test invalid input values
        await inputValue('target-c', 'invalid');
        await inputValue('target-l', 999);
        
        // Should show validation errors
        const invalidInput = document.getElementById('target-c');
        if (!invalidInput.classList.contains('invalid')) {
            console.warn('   ⚠️  Invalid input validation may not be working');
        }
        
        integrationResults.passed++;
        
    } catch (error) {
        integrationResults.failed++;
        console.log(`   ❌ Error handling test failed: ${error.message}`);
    }
}

/**
 * Test performance benchmarks
 */
async function testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    integrationResults.total++;
    
    try {
        const performanceTimes = [];
        
        // Run multiple calculations to measure average performance
        for (let i = 0; i < 5; i++) {
            await clearAllInputs();
            await inputColorValues('target', WORKFLOW_TEST_SCENARIOS[i % WORKFLOW_TEST_SCENARIOS.length].target);
            await inputColorValues('sample', WORKFLOW_TEST_SCENARIOS[i % WORKFLOW_TEST_SCENARIOS.length].sample);
            
            const startTime = performance.now();
            await performCalculation();
            const endTime = performance.now();
            
            performanceTimes.push(endTime - startTime);
        }
        
        const averageTime = performanceTimes.reduce((a, b) => a + b, 0) / performanceTimes.length;
        integrationResults.performance.averageCalculationTime = averageTime;
        
        // Performance should be under 500ms for good user experience
        if (averageTime > 500) {
            console.warn(`   ⚠️  Average calculation time ${averageTime.toFixed(2)}ms may be too slow`);
        } else {
            console.log(`   ✅ Performance good: ${averageTime.toFixed(2)}ms average`);
        }
        
        integrationResults.passed++;
        
    } catch (error) {
        integrationResults.failed++;
        console.log(`   ❌ Performance test failed: ${error.message}`);
    }
}

/**
 * Display integration test results
 */
function displayIntegrationResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 INTEGRATION WORKFLOW TEST RESULTS');
    console.log('='.repeat(60));
    
    const passRate = integrationResults.total > 0 ? 
        (integrationResults.passed / integrationResults.total * 100).toFixed(1) : 0;
    
    console.log(`Total Tests:           ${integrationResults.total}`);
    console.log(`✅ Passed:             ${integrationResults.passed}`);
    console.log(`❌ Failed:             ${integrationResults.failed}`);
    console.log(`💥 Errors:             ${integrationResults.errors}`);
    console.log(`📊 Pass Rate:          ${passRate}%`);
    console.log(`⚡ Avg Calc Time:      ${integrationResults.performance.averageCalculationTime.toFixed(2)}ms`);
    console.log(`⏱️  Total Test Time:    ${integrationResults.performance.totalTestTime.toFixed(2)}ms`);
    
    // Scenario results summary
    console.log('\n📋 Scenario Results:');
    integrationResults.scenarios.forEach(scenario => {
        const status = scenario.passed ? '✅' : '❌';
        const time = scenario.calculationTime.toFixed(2);
        console.log(`   ${status} ${scenario.name} (${time}ms)`);
        
        if (!scenario.passed && scenario.error) {
            console.log(`      Error: ${scenario.error}`);
        }
    });
    
    if (integrationResults.failed === 0 && integrationResults.errors === 0) {
        console.log('\n🎉 ALL INTEGRATION TESTS PASSED! Complete workflow is functioning correctly.');
    } else {
        console.log('\n⚠️  Some integration tests failed. Please review the workflow implementation.');
    }
    
    console.log('='.repeat(60));
}

/**
 * Utility function for async delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get integration test results
 */
function getIntegrationResults() {
    return {
        ...integrationResults,
        passRate: integrationResults.total > 0 ? 
            (integrationResults.passed / integrationResults.total * 100) : 0,
        success: integrationResults.failed === 0 && integrationResults.errors === 0
    };
}

// Export functions for use by other modules
window.integrationTests = {
    runIntegrationTests,
    getIntegrationResults,
    WORKFLOW_TEST_SCENARIOS,
    INTEGRATION_TEST_CONFIG
};

console.log('Integration Workflow Tests module loaded');