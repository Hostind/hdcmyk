// Unit Tests for Color Science Functions
// Requirements: 6.4, 4.4 - Write unit tests for all color conversion functions

/**
 * Comprehensive Unit Test Suite for Color Science Functions
 * Tests all color conversion functions for accuracy and edge cases
 */

// Test configuration and constants
const TEST_CONFIG = {
    tolerance: {
        rgb: 5,        // RGB values can vary by ±5 due to rounding
        lab: 0.1,      // LAB values should be accurate to ±0.1
        deltaE: 0.01   // Delta E should be accurate to ±0.01
    },
    verbose: true
};

// Known test cases with expected results (Bruce Lindbloom reference values)
const COLOR_TEST_CASES = {
    // Basic CMYK to RGB conversions
    cmykToRgb: [
        {
            name: 'Pure Cyan',
            input: { c: 100, m: 0, y: 0, k: 0 },
            expected: { r: 0, g: 255, b: 255 },
            tolerance: 5
        },
        {
            name: 'Pure Magenta',
            input: { c: 0, m: 100, y: 0, k: 0 },
            expected: { r: 255, g: 0, b: 255 },
            tolerance: 5
        },
        {
            name: 'Pure Yellow',
            input: { c: 0, m: 0, y: 100, k: 0 },
            expected: { r: 255, g: 255, b: 0 },
            tolerance: 5
        },
        {
            name: 'Pure Black',
            input: { c: 0, m: 0, y: 0, k: 100 },
            expected: { r: 0, g: 0, b: 0 },
            tolerance: 2
        },
        {
            name: 'Paper White',
            input: { c: 0, m: 0, y: 0, k: 0 },
            expected: { r: 255, g: 255, b: 255 },
            tolerance: 2
        },
        {
            name: 'Rich Black',
            input: { c: 30, m: 30, y: 30, k: 100 },
            expected: { r: 0, g: 0, b: 0 },
            tolerance: 5
        },
        {
            name: 'Mid-tone Gray',
            input: { c: 0, m: 0, y: 0, k: 50 },
            expected: { r: 128, g: 128, b: 128 },
            tolerance: 10
        }
    ],

    // LAB to RGB conversions (CIE standard test cases)
    labToRgb: [
        {
            name: 'Pure White (D65)',
            input: { l: 100, a: 0, b: 0 },
            expected: { r: 255, g: 255, b: 255 },
            tolerance: 5
        },
        {
            name: 'Pure Black',
            input: { l: 0, a: 0, b: 0 },
            expected: { r: 0, g: 0, b: 0 },
            tolerance: 5
        },
        {
            name: 'Mid Gray',
            input: { l: 50, a: 0, b: 0 },
            expected: { r: 119, g: 119, b: 119 },
            tolerance: 10
        },
        {
            name: 'Red Color',
            input: { l: 53.24, a: 80.09, b: 67.20 },
            expected: { r: 255, g: 0, b: 0 },
            tolerance: 15
        },
        {
            name: 'Green Color',
            input: { l: 87.73, a: -86.18, b: 83.18 },
            expected: { r: 0, g: 255, b: 0 },
            tolerance: 15
        },
        {
            name: 'Blue Color',
            input: { l: 32.30, a: 79.19, b: -107.86 },
            expected: { r: 0, g: 0, b: 255 },
            tolerance: 15
        }
    ],

    // Delta E calculation test cases (CIE standard)
    deltaE: [
        {
            name: 'Identical Colors',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 50, a: 0, b: 0 },
            expected: 0.00,
            tolerance: 0.01
        },
        {
            name: 'Small Lightness Difference',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 52, a: 0, b: 0 },
            expected: 2.00,
            tolerance: 0.01
        },
        {
            name: 'Small a* Difference',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 50, a: 3, b: 0 },
            expected: 3.00,
            tolerance: 0.01
        },
        {
            name: 'Small b* Difference',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 50, a: 0, b: 4 },
            expected: 4.00,
            tolerance: 0.01
        },
        {
            name: 'Combined Differences',
            lab1: { l: 50, a: 2.5, b: 0 },
            lab2: { l: 50, a: 0, b: 2.5 },
            expected: 3.54,
            tolerance: 0.05
        },
        {
            name: 'Large Color Difference',
            lab1: { l: 100, a: 0, b: 0 },
            lab2: { l: 0, a: 0, b: 0 },
            expected: 100.00,
            tolerance: 0.01
        }
    ],

    // Edge cases and boundary conditions
    edgeCases: [
        {
            name: 'CMYK Out of Range - High',
            input: { c: 150, m: 200, y: 300, k: 120 },
            function: 'cmykToRgb',
            shouldClamp: true
        },
        {
            name: 'CMYK Out of Range - Negative',
            input: { c: -50, m: -10, y: -25, k: -5 },
            function: 'cmykToRgb',
            shouldClamp: true
        },
        {
            name: 'LAB L* Out of Range - High',
            input: { l: 150, a: 0, b: 0 },
            function: 'labToRgb',
            shouldClamp: true
        },
        {
            name: 'LAB L* Out of Range - Negative',
            input: { l: -50, a: 0, b: 0 },
            function: 'labToRgb',
            shouldClamp: true
        },
        {
            name: 'LAB a*b* Extreme Values',
            input: { l: 50, a: 200, b: -200 },
            function: 'labToRgb',
            shouldClamp: true
        }
    ]
};

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    details: []
};

/**
 * Main test runner function
 * Requirements: 6.4 - Write unit tests for color conversion accuracy
 */
function runColorScienceUnitTests() {
    console.log('🧪 Starting Color Science Unit Tests...');
    console.log('='.repeat(50));
    
    // Reset test results
    testResults = { total: 0, passed: 0, failed: 0, errors: 0, details: [] };
    
    // Check if color science module is available
    if (typeof window.colorScience === 'undefined') {
        console.error('❌ Color Science module not loaded');
        return false;
    }
    
    // Run all test suites
    testCMYKToRGBConversions();
    testLABToRGBConversions();
    testDeltECalculations();
    testComponentDeltas();
    testToleranceZones();
    testEdgeCases();
    testUtilityFunctions();
    
    // Display final results
    displayTestResults();
    
    return testResults.failed === 0 && testResults.errors === 0;
}

/**
 * Test CMYK to RGB conversions
 */
function testCMYKToRGBConversions() {
    console.log('\n📊 Testing CMYK to RGB Conversions...');
    
    COLOR_TEST_CASES.cmykToRgb.forEach(testCase => {
        try {
            testResults.total++;
            
            const result = window.colorScience.cmykToRgb(
                testCase.input.c,
                testCase.input.m,
                testCase.input.y,
                testCase.input.k
            );
            
            const rMatch = Math.abs(result.r - testCase.expected.r) <= testCase.tolerance;
            const gMatch = Math.abs(result.g - testCase.expected.g) <= testCase.tolerance;
            const bMatch = Math.abs(result.b - testCase.expected.b) <= testCase.tolerance;
            
            if (rMatch && gMatch && bMatch) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: PASSED`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: FAILED`);
                console.log(`     Expected: R${testCase.expected.r} G${testCase.expected.g} B${testCase.expected.b}`);
                console.log(`     Got:      R${result.r} G${result.g} B${result.b}`);
                console.log(`     Tolerance: ±${testCase.tolerance}`);
            }
            
            testResults.details.push({
                test: `CMYK->RGB: ${testCase.name}`,
                passed: rMatch && gMatch && bMatch,
                expected: testCase.expected,
                actual: result,
                tolerance: testCase.tolerance
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
            
            testResults.details.push({
                test: `CMYK->RGB: ${testCase.name}`,
                passed: false,
                error: error.message
            });
        }
    });
}

/**
 * Test LAB to RGB conversions
 */
function testLABToRGBConversions() {
    console.log('\n🎨 Testing LAB to RGB Conversions...');
    
    COLOR_TEST_CASES.labToRgb.forEach(testCase => {
        try {
            testResults.total++;
            
            const result = window.colorScience.labToRgb(
                testCase.input.l,
                testCase.input.a,
                testCase.input.b
            );
            
            const rMatch = Math.abs(result.r - testCase.expected.r) <= testCase.tolerance;
            const gMatch = Math.abs(result.g - testCase.expected.g) <= testCase.tolerance;
            const bMatch = Math.abs(result.b - testCase.expected.b) <= testCase.tolerance;
            
            if (rMatch && gMatch && bMatch) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: PASSED`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: FAILED`);
                console.log(`     Expected: R${testCase.expected.r} G${testCase.expected.g} B${testCase.expected.b}`);
                console.log(`     Got:      R${result.r} G${result.g} B${result.b}`);
                console.log(`     Tolerance: ±${testCase.tolerance}`);
            }
            
            testResults.details.push({
                test: `LAB->RGB: ${testCase.name}`,
                passed: rMatch && gMatch && bMatch,
                expected: testCase.expected,
                actual: result,
                tolerance: testCase.tolerance
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
            
            testResults.details.push({
                test: `LAB->RGB: ${testCase.name}`,
                passed: false,
                error: error.message
            });
        }
    });
}

/**
 * Test Delta E calculations
 * Requirements: 4.4 - Verify accuracy against known Delta E test cases
 */
function testDeltECalculations() {
    console.log('\n📏 Testing Delta E Calculations...');
    
    COLOR_TEST_CASES.deltaE.forEach(testCase => {
        try {
            testResults.total++;
            
            const result = window.colorScience.calculateDeltaE(testCase.lab1, testCase.lab2);
            const deltaMatch = Math.abs(result - testCase.expected) <= testCase.tolerance;
            
            if (deltaMatch) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: PASSED (ΔE = ${result.toFixed(2)})`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: FAILED`);
                console.log(`     Expected: ΔE = ${testCase.expected.toFixed(2)}`);
                console.log(`     Got:      ΔE = ${result.toFixed(2)}`);
                console.log(`     Tolerance: ±${testCase.tolerance}`);
            }
            
            testResults.details.push({
                test: `Delta E: ${testCase.name}`,
                passed: deltaMatch,
                expected: testCase.expected,
                actual: result,
                tolerance: testCase.tolerance
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
            
            testResults.details.push({
                test: `Delta E: ${testCase.name}`,
                passed: false,
                error: error.message
            });
        }
    });
}

/**
 * Test component delta calculations
 */
function testComponentDeltas() {
    console.log('\n📐 Testing Component Delta Calculations...');
    
    const componentTests = [
        {
            name: 'Zero Deltas',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 50, a: 0, b: 0 },
            expected: { deltaL: 0, deltaA: 0, deltaB: 0, deltaC: 0, deltaH: 0 }
        },
        {
            name: 'Lightness Only',
            lab1: { l: 60, a: 0, b: 0 },
            lab2: { l: 50, a: 0, b: 0 },
            expected: { deltaL: 10, deltaA: 0, deltaB: 0 }
        },
        {
            name: 'a* Only',
            lab1: { l: 50, a: 10, b: 0 },
            lab2: { l: 50, a: 0, b: 0 },
            expected: { deltaL: 0, deltaA: 10, deltaB: 0 }
        },
        {
            name: 'b* Only',
            lab1: { l: 50, a: 0, b: 15 },
            lab2: { l: 50, a: 0, b: 0 },
            expected: { deltaL: 0, deltaA: 0, deltaB: 15 }
        }
    ];
    
    componentTests.forEach(testCase => {
        try {
            testResults.total++;
            
            const result = window.colorScience.calculateComponentDeltas(testCase.lab1, testCase.lab2);
            
            let allMatch = true;
            const checks = ['deltaL', 'deltaA', 'deltaB'];
            
            checks.forEach(component => {
                if (testCase.expected[component] !== undefined) {
                    const match = Math.abs(result[component] - testCase.expected[component]) <= 0.01;
                    if (!match) allMatch = false;
                }
            });
            
            if (allMatch) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: PASSED`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: FAILED`);
                console.log(`     Expected: ΔL=${testCase.expected.deltaL} Δa=${testCase.expected.deltaA} Δb=${testCase.expected.deltaB}`);
                console.log(`     Got:      ΔL=${result.deltaL} Δa=${result.deltaA} Δb=${result.deltaB}`);
            }
            
            testResults.details.push({
                test: `Component Deltas: ${testCase.name}`,
                passed: allMatch,
                expected: testCase.expected,
                actual: result
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
        }
    });
}

/**
 * Test tolerance zone classifications
 */
function testToleranceZones() {
    console.log('\n🎯 Testing Tolerance Zone Classifications...');
    
    const toleranceTests = [
        { deltaE: 0.5, expected: 'good', name: 'Excellent Match' },
        { deltaE: 2.0, expected: 'good', name: 'Good Boundary' },
        { deltaE: 2.1, expected: 'acceptable', name: 'Acceptable Start' },
        { deltaE: 3.5, expected: 'acceptable', name: 'Acceptable Middle' },
        { deltaE: 5.0, expected: 'acceptable', name: 'Acceptable Boundary' },
        { deltaE: 5.1, expected: 'poor', name: 'Poor Start' },
        { deltaE: 10.0, expected: 'poor', name: 'Poor Match' }
    ];
    
    toleranceTests.forEach(testCase => {
        try {
            testResults.total++;
            
            const result = window.colorScience.getToleranceZone(testCase.deltaE);
            
            if (result === testCase.expected) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name} (ΔE=${testCase.deltaE}): ${result}`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: Expected '${testCase.expected}', got '${result}'`);
            }
            
            testResults.details.push({
                test: `Tolerance Zone: ${testCase.name}`,
                passed: result === testCase.expected,
                expected: testCase.expected,
                actual: result
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
        }
    });
}

/**
 * Test edge cases and error handling
 */
function testEdgeCases() {
    console.log('\n⚠️  Testing Edge Cases...');
    
    COLOR_TEST_CASES.edgeCases.forEach(testCase => {
        try {
            testResults.total++;
            
            let result;
            let passed = false;
            
            if (testCase.function === 'cmykToRgb') {
                result = window.colorScience.cmykToRgb(
                    testCase.input.c,
                    testCase.input.m,
                    testCase.input.y,
                    testCase.input.k
                );
                
                // Check if values are properly clamped
                if (testCase.shouldClamp) {
                    passed = result.r >= 0 && result.r <= 255 &&
                            result.g >= 0 && result.g <= 255 &&
                            result.b >= 0 && result.b <= 255;
                }
            } else if (testCase.function === 'labToRgb') {
                result = window.colorScience.labToRgb(
                    testCase.input.l,
                    testCase.input.a,
                    testCase.input.b
                );
                
                // Check if values are properly clamped
                if (testCase.shouldClamp) {
                    passed = result.r >= 0 && result.r <= 255 &&
                            result.g >= 0 && result.g <= 255 &&
                            result.b >= 0 && result.b <= 255;
                }
            }
            
            if (passed) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: Values properly clamped`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: Values not properly clamped`);
                console.log(`     Result: R${result.r} G${result.g} B${result.b}`);
            }
            
            testResults.details.push({
                test: `Edge Case: ${testCase.name}`,
                passed: passed,
                actual: result
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
        }
    });
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
    console.log('\n🔧 Testing Utility Functions...');
    
    const utilityTests = [
        {
            name: 'RGB Validation - Valid',
            function: 'validateAndClampRgb',
            input: { r: 128, g: 64, b: 192 },
            expected: { r: 128, g: 64, b: 192 }
        },
        {
            name: 'RGB Validation - Clamp High',
            function: 'validateAndClampRgb',
            input: { r: 300, g: 400, b: 500 },
            expected: { r: 255, g: 255, b: 255 }
        },
        {
            name: 'RGB Validation - Clamp Low',
            function: 'validateAndClampRgb',
            input: { r: -50, g: -100, b: -25 },
            expected: { r: 0, g: 0, b: 0 }
        },
        {
            name: 'CSS String - Valid RGB',
            function: 'rgbToCssString',
            input: { r: 255, g: 128, b: 0 },
            expected: 'rgb(255, 128, 0)'
        }
    ];
    
    utilityTests.forEach(testCase => {
        try {
            testResults.total++;
            
            let result;
            let passed = false;
            
            if (testCase.function === 'validateAndClampRgb') {
                result = window.colorScience.validateAndClampRgb(testCase.input);
                passed = result.r === testCase.expected.r &&
                        result.g === testCase.expected.g &&
                        result.b === testCase.expected.b;
            } else if (testCase.function === 'rgbToCssString') {
                result = window.colorScience.rgbToCssString(testCase.input);
                passed = result === testCase.expected;
            }
            
            if (passed) {
                testResults.passed++;
                if (TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${testCase.name}: PASSED`);
                }
            } else {
                testResults.failed++;
                console.log(`  ❌ ${testCase.name}: FAILED`);
                console.log(`     Expected: ${JSON.stringify(testCase.expected)}`);
                console.log(`     Got:      ${JSON.stringify(result)}`);
            }
            
            testResults.details.push({
                test: `Utility: ${testCase.name}`,
                passed: passed,
                expected: testCase.expected,
                actual: result
            });
            
        } catch (error) {
            testResults.total++;
            testResults.errors++;
            console.log(`  💥 ${testCase.name}: ERROR - ${error.message}`);
        }
    });
}

/**
 * Display final test results
 */
function displayTestResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 COLOR SCIENCE UNIT TEST RESULTS');
    console.log('='.repeat(50));
    
    const passRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
    
    console.log(`Total Tests:    ${testResults.total}`);
    console.log(`✅ Passed:      ${testResults.passed}`);
    console.log(`❌ Failed:      ${testResults.failed}`);
    console.log(`💥 Errors:      ${testResults.errors}`);
    console.log(`📊 Pass Rate:   ${passRate}%`);
    
    if (testResults.failed === 0 && testResults.errors === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Color science functions are working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the color science implementation.');
        
        // Show failed tests summary
        const failedTests = testResults.details.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\nFailed Tests Summary:');
            failedTests.forEach(test => {
                console.log(`  - ${test.test}`);
                if (test.error) {
                    console.log(`    Error: ${test.error}`);
                }
            });
        }
    }
    
    console.log('='.repeat(50));
}

/**
 * Export test results for integration with other test suites
 */
function getTestResults() {
    return {
        ...testResults,
        passRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100) : 0,
        success: testResults.failed === 0 && testResults.errors === 0
    };
}

/**
 * Run specific test category
 */
function runSpecificTests(category) {
    console.log(`Running ${category} tests only...`);
    
    testResults = { total: 0, passed: 0, failed: 0, errors: 0, details: [] };
    
    switch (category) {
        case 'cmyk':
            testCMYKToRGBConversions();
            break;
        case 'lab':
            testLABToRGBConversions();
            break;
        case 'deltaE':
            testDeltECalculations();
            break;
        case 'tolerance':
            testToleranceZones();
            break;
        case 'edge':
            testEdgeCases();
            break;
        case 'utility':
            testUtilityFunctions();
            break;
        default:
            console.log('Unknown test category');
            return false;
    }
    
    displayTestResults();
    return testResults.failed === 0 && testResults.errors === 0;
}

// Export functions for use by other modules
window.colorScienceTests = {
    runColorScienceUnitTests,
    runSpecificTests,
    getTestResults,
    TEST_CONFIG,
    COLOR_TEST_CASES
};

console.log('Color Science Unit Tests module loaded');