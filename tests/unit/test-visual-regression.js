// Visual Regression Tests for Color Swatch Accuracy
// Requirements: 6.4, 4.4 - Add visual regression tests for color swatch accuracy

/**
 * Visual Regression Test Suite for Color Swatch Accuracy
 * Tests color rendering accuracy and visual consistency
 */

// Visual test configuration
const VISUAL_TEST_CONFIG = {
    tolerance: {
        rgb: 10,           // RGB tolerance for color matching
        brightness: 15,    // Brightness variation tolerance
        contrast: 0.1      // Contrast ratio tolerance
    },
    sampleSize: 10,        // Number of pixels to sample for color analysis
    verbose: true
};

// Reference colors for visual testing (known good values)
const VISUAL_REFERENCE_COLORS = [
    {
        name: 'Pure Red',
        cmyk: { c: 0, m: 100, y: 100, k: 0 },
        expectedRgb: { r: 255, g: 0, b: 0 },
        lab: { l: 53.24, a: 80.09, b: 67.20 }
    },
    {
        name: 'Pure Green',
        cmyk: { c: 100, m: 0, y: 100, k: 0 },
        expectedRgb: { r: 0, g: 255, b: 0 },
        lab: { l: 87.73, a: -86.18, b: 83.18 }
    },
    {
        name: 'Pure Blue',
        cmyk: { c: 100, m: 100, y: 0, k: 0 },
        expectedRgb: { r: 0, g: 0, b: 255 },
        lab: { l: 32.30, a: 79.19, b: -107.86 }
    },
    {
        name: 'Pure Cyan',
        cmyk: { c: 100, m: 0, y: 0, k: 0 },
        expectedRgb: { r: 0, g: 255, b: 255 },
        lab: { l: 91.11, a: -48.09, b: -14.13 }
    },
    {
        name: 'Pure Magenta',
        cmyk: { c: 0, m: 100, y: 0, k: 0 },
        expectedRgb: { r: 255, g: 0, b: 255 },
        lab: { l: 60.32, a: 98.23, b: -60.82 }
    },
    {
        name: 'Pure Yellow',
        cmyk: { c: 0, m: 0, y: 100, k: 0 },
        expectedRgb: { r: 255, g: 255, b: 0 },
        lab: { l: 97.14, a: -21.55, b: 94.48 }
    },
    {
        name: 'Black',
        cmyk: { c: 0, m: 0, y: 0, k: 100 },
        expectedRgb: { r: 0, g: 0, b: 0 },
        lab: { l: 0, a: 0, b: 0 }
    },
    {
        name: 'White',
        cmyk: { c: 0, m: 0, y: 0, k: 0 },
        expectedRgb: { r: 255, g: 255, b: 255 },
        lab: { l: 100, a: 0, b: 0 }
    },
    {
        name: '50% Gray',
        cmyk: { c: 0, m: 0, y: 0, k: 50 },
        expectedRgb: { r: 128, g: 128, b: 128 },
        lab: { l: 53.59, a: 0, b: 0 }
    },
    {
        name: 'Rich Black',
        cmyk: { c: 30, m: 30, y: 30, k: 100 },
        expectedRgb: { r: 0, g: 0, b: 0 },
        lab: { l: 0, a: 0, b: 0 }
    }
];

// Visual test results tracking
let visualResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    colorTests: [],
    swatchTests: [],
    consistencyTests: []
};

/**
 * Main visual regression test runner
 */
async function runVisualRegressionTests() {
    console.log('🎨 Starting Visual Regression Tests...');
    console.log('='.repeat(50));
    
    // Reset results
    visualResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        colorTests: [],
        swatchTests: [],
        consistencyTests: []
    };
    
    // Check prerequisites
    if (!checkVisualPrerequisites()) {
        console.error('❌ Visual test prerequisites not met');
        return false;
    }
    
    // Run visual tests
    await testColorAccuracy();
    await testSwatchRendering();
    await testColorConsistency();
    await testSwatchUpdates();
    await testBrowserCompatibility();
    
    // Display results
    displayVisualResults();
    
    return visualResults.failed === 0 && visualResults.errors === 0;
}

/**
 * Check visual test prerequisites
 */
function checkVisualPrerequisites() {
    // Check if color science module is available
    if (typeof window.colorScience === 'undefined') {
        console.error('❌ Color science module not available');
        return false;
    }
    
    // Check if DOM elements exist
    const requiredElements = ['target-swatch', 'sample-swatch'];
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            console.error(`❌ Required element not found: ${elementId}`);
            return false;
        }
    }
    
    // Check if Canvas API is available for pixel analysis
    if (!window.HTMLCanvasElement) {
        console.error('❌ Canvas API not available for pixel analysis');
        return false;
    }
    
    console.log('✅ Visual test prerequisites met');
    return true;
}

/**
 * Test color conversion accuracy by comparing rendered colors
 */
async function testColorAccuracy() {
    console.log('\n🎯 Testing Color Conversion Accuracy...');
    
    for (const refColor of VISUAL_REFERENCE_COLORS) {
        visualResults.total++;
        const testResult = {
            name: refColor.name,
            passed: false,
            cmykInput: refColor.cmyk,
            expectedRgb: refColor.expectedRgb,
            actualRgb: null,
            colorDifference: null,
            error: null
        };
        
        try {
            // Convert CMYK to RGB using color science module
            const convertedRgb = window.colorScience.cmykToRgb(
                refColor.cmyk.c,
                refColor.cmyk.m,
                refColor.cmyk.y,
                refColor.cmyk.k
            );
            
            testResult.actualRgb = convertedRgb;
            
            // Calculate color difference
            const colorDiff = calculateColorDifference(refColor.expectedRgb, convertedRgb);
            testResult.colorDifference = colorDiff;
            
            // Check if within tolerance
            if (colorDiff <= VISUAL_TEST_CONFIG.tolerance.rgb) {
                testResult.passed = true;
                visualResults.passed++;
                
                if (VISUAL_TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${refColor.name}: Color difference ${colorDiff.toFixed(2)} (within tolerance)`);
                }
            } else {
                visualResults.failed++;
                console.log(`  ❌ ${refColor.name}: Color difference ${colorDiff.toFixed(2)} exceeds tolerance ${VISUAL_TEST_CONFIG.tolerance.rgb}`);
                console.log(`     Expected: R${refColor.expectedRgb.r} G${refColor.expectedRgb.g} B${refColor.expectedRgb.b}`);
                console.log(`     Got:      R${convertedRgb.r} G${convertedRgb.g} B${convertedRgb.b}`);
            }
            
        } catch (error) {
            visualResults.errors++;
            testResult.error = error.message;
            console.log(`  💥 ${refColor.name}: ERROR - ${error.message}`);
        }
        
        visualResults.colorTests.push(testResult);
    }
}

/**
 * Test color swatch rendering accuracy
 */
async function testSwatchRendering() {
    console.log('\n🖼️  Testing Color Swatch Rendering...');
    
    const targetSwatch = document.getElementById('target-swatch');
    const sampleSwatch = document.getElementById('sample-swatch');
    
    for (const refColor of VISUAL_REFERENCE_COLORS.slice(0, 5)) { // Test first 5 colors
        visualResults.total++;
        const testResult = {
            name: `Swatch: ${refColor.name}`,
            passed: false,
            swatchColor: null,
            expectedColor: refColor.expectedRgb,
            error: null
        };
        
        try {
            // Set swatch color using CMYK input
            await setSwatchColor(targetSwatch, 'cmyk', refColor.cmyk);
            await sleep(200); // Allow rendering
            
            // Extract actual color from swatch
            const actualColor = await extractSwatchColor(targetSwatch);
            testResult.swatchColor = actualColor;
            
            // Compare with expected color
            const colorDiff = calculateColorDifference(refColor.expectedRgb, actualColor);
            
            if (colorDiff <= VISUAL_TEST_CONFIG.tolerance.rgb) {
                testResult.passed = true;
                visualResults.passed++;
                
                if (VISUAL_TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${refColor.name}: Swatch rendering accurate (diff: ${colorDiff.toFixed(2)})`);
                }
            } else {
                visualResults.failed++;
                console.log(`  ❌ ${refColor.name}: Swatch color difference ${colorDiff.toFixed(2)} exceeds tolerance`);
                console.log(`     Expected: R${refColor.expectedRgb.r} G${refColor.expectedRgb.g} B${refColor.expectedRgb.b}`);
                console.log(`     Swatch:   R${actualColor.r} G${actualColor.g} B${actualColor.b}`);
            }
            
        } catch (error) {
            visualResults.errors++;
            testResult.error = error.message;
            console.log(`  💥 ${refColor.name}: ERROR - ${error.message}`);
        }
        
        visualResults.swatchTests.push(testResult);
    }
}

/**
 * Test color consistency between CMYK and LAB inputs
 */
async function testColorConsistency() {
    console.log('\n🔄 Testing Color Consistency (CMYK vs LAB)...');
    
    const targetSwatch = document.getElementById('target-swatch');
    
    for (const refColor of VISUAL_REFERENCE_COLORS.slice(0, 3)) { // Test first 3 colors
        visualResults.total++;
        const testResult = {
            name: `Consistency: ${refColor.name}`,
            passed: false,
            cmykColor: null,
            labColor: null,
            consistency: null,
            error: null
        };
        
        try {
            // Set color using CMYK
            await setSwatchColor(targetSwatch, 'cmyk', refColor.cmyk);
            await sleep(100);
            const cmykRenderedColor = await extractSwatchColor(targetSwatch);
            testResult.cmykColor = cmykRenderedColor;
            
            // Set color using LAB
            await setSwatchColor(targetSwatch, 'lab', refColor.lab);
            await sleep(100);
            const labRenderedColor = await extractSwatchColor(targetSwatch);
            testResult.labColor = labRenderedColor;
            
            // Compare consistency
            const consistency = calculateColorDifference(cmykRenderedColor, labRenderedColor);
            testResult.consistency = consistency;
            
            // Colors should be reasonably consistent (allowing for conversion differences)
            const consistencyTolerance = VISUAL_TEST_CONFIG.tolerance.rgb * 2; // More lenient for consistency
            
            if (consistency <= consistencyTolerance) {
                testResult.passed = true;
                visualResults.passed++;
                
                if (VISUAL_TEST_CONFIG.verbose) {
                    console.log(`  ✅ ${refColor.name}: CMYK/LAB consistency good (diff: ${consistency.toFixed(2)})`);
                }
            } else {
                visualResults.failed++;
                console.log(`  ❌ ${refColor.name}: CMYK/LAB inconsistency ${consistency.toFixed(2)} exceeds tolerance ${consistencyTolerance}`);
                console.log(`     CMYK: R${cmykRenderedColor.r} G${cmykRenderedColor.g} B${cmykRenderedColor.b}`);
                console.log(`     LAB:  R${labRenderedColor.r} G${labRenderedColor.g} B${labRenderedColor.b}`);
            }
            
        } catch (error) {
            visualResults.errors++;
            testResult.error = error.message;
            console.log(`  💥 ${refColor.name}: ERROR - ${error.message}`);
        }
        
        visualResults.consistencyTests.push(testResult);
    }
}

/**
 * Test real-time swatch updates
 */
async function testSwatchUpdates() {
    console.log('\n⚡ Testing Real-time Swatch Updates...');
    
    visualResults.total++;
    
    try {
        const targetSwatch = document.getElementById('target-swatch');
        const initialColor = await extractSwatchColor(targetSwatch);
        
        // Simulate input changes
        const targetCInput = document.getElementById('target-c');
        if (targetCInput) {
            targetCInput.value = '50';
            targetCInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            await sleep(200); // Allow update
            
            const updatedColor = await extractSwatchColor(targetSwatch);
            const colorChange = calculateColorDifference(initialColor, updatedColor);
            
            if (colorChange > 5) { // Should be a noticeable change
                visualResults.passed++;
                console.log(`  ✅ Real-time updates working (color change: ${colorChange.toFixed(2)})`);
            } else {
                visualResults.failed++;
                console.log(`  ❌ Real-time updates not working (minimal color change: ${colorChange.toFixed(2)})`);
            }
        } else {
            throw new Error('Target C input not found');
        }
        
    } catch (error) {
        visualResults.errors++;
        console.log(`  💥 Real-time update test: ERROR - ${error.message}`);
    }
}

/**
 * Test browser compatibility for color rendering
 */
async function testBrowserCompatibility() {
    console.log('\n🌐 Testing Browser Compatibility...');
    
    visualResults.total++;
    
    try {
        // Test CSS color support
        const testElement = document.createElement('div');
        testElement.style.backgroundColor = 'rgb(255, 128, 0)';
        
        if (testElement.style.backgroundColor === '') {
            throw new Error('Browser does not support RGB color values');
        }
        
        // Test computed style access
        document.body.appendChild(testElement);
        const computedStyle = window.getComputedStyle(testElement);
        const bgColor = computedStyle.backgroundColor;
        document.body.removeChild(testElement);
        
        if (!bgColor || bgColor === 'transparent') {
            throw new Error('Cannot read computed background color');
        }
        
        // Test Canvas API for pixel analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas 2D context not available');
        }
        
        visualResults.passed++;
        console.log('  ✅ Browser compatibility checks passed');
        
    } catch (error) {
        visualResults.errors++;
        console.log(`  ❌ Browser compatibility: ${error.message}`);
    }
}

/**
 * Set swatch color using either CMYK or LAB values
 */
async function setSwatchColor(swatchElement, colorSpace, colorValues) {
    if (colorSpace === 'cmyk') {
        const cssColor = window.colorScience.cmykToCssString(
            colorValues.c, colorValues.m, colorValues.y, colorValues.k
        );
        swatchElement.style.backgroundColor = cssColor;
    } else if (colorSpace === 'lab') {
        const cssColor = window.colorScience.labToCssString(
            colorValues.l, colorValues.a, colorValues.b
        );
        swatchElement.style.backgroundColor = cssColor;
    }
}

/**
 * Extract actual RGB color from swatch element
 */
async function extractSwatchColor(swatchElement) {
    const computedStyle = window.getComputedStyle(swatchElement);
    const bgColor = computedStyle.backgroundColor;
    
    // Parse RGB values from CSS color string
    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    
    // Handle rgba format
    const rgbaMatch = bgColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3])
        };
    }
    
    throw new Error(`Cannot parse background color: ${bgColor}`);
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function calculateColorDifference(color1, color2) {
    const deltaR = color1.r - color2.r;
    const deltaG = color1.g - color2.g;
    const deltaB = color1.b - color2.b;
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
}

/**
 * Display visual test results
 */
function displayVisualResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🎨 VISUAL REGRESSION TEST RESULTS');
    console.log('='.repeat(50));
    
    const passRate = visualResults.total > 0 ? 
        (visualResults.passed / visualResults.total * 100).toFixed(1) : 0;
    
    console.log(`Total Tests:    ${visualResults.total}`);
    console.log(`✅ Passed:      ${visualResults.passed}`);
    console.log(`❌ Failed:      ${visualResults.failed}`);
    console.log(`💥 Errors:      ${visualResults.errors}`);
    console.log(`📊 Pass Rate:   ${passRate}%`);
    
    // Detailed results by category
    console.log('\n📋 Test Categories:');
    console.log(`   Color Accuracy:  ${visualResults.colorTests.filter(t => t.passed).length}/${visualResults.colorTests.length}`);
    console.log(`   Swatch Rendering: ${visualResults.swatchTests.filter(t => t.passed).length}/${visualResults.swatchTests.length}`);
    console.log(`   Consistency:     ${visualResults.consistencyTests.filter(t => t.passed).length}/${visualResults.consistencyTests.length}`);
    
    if (visualResults.failed === 0 && visualResults.errors === 0) {
        console.log('\n🎉 ALL VISUAL TESTS PASSED! Color rendering is accurate and consistent.');
    } else {
        console.log('\n⚠️  Some visual tests failed. Please review color rendering implementation.');
        
        // Show worst performing colors
        const failedColorTests = visualResults.colorTests.filter(t => !t.passed && t.colorDifference);
        if (failedColorTests.length > 0) {
            console.log('\nWorst Color Accuracy:');
            failedColorTests
                .sort((a, b) => b.colorDifference - a.colorDifference)
                .slice(0, 3)
                .forEach(test => {
                    console.log(`   ${test.name}: difference ${test.colorDifference.toFixed(2)}`);
                });
        }
    }
    
    console.log('='.repeat(50));
}

/**
 * Utility function for async delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get visual test results
 */
function getVisualResults() {
    return {
        ...visualResults,
        passRate: visualResults.total > 0 ? 
            (visualResults.passed / visualResults.total * 100) : 0,
        success: visualResults.failed === 0 && visualResults.errors === 0
    };
}

/**
 * Generate visual test report with color samples
 */
function generateVisualReport() {
    const report = {
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        results: visualResults,
        colorSamples: visualResults.colorTests.map(test => ({
            name: test.name,
            expected: test.expectedRgb,
            actual: test.actualRgb,
            difference: test.colorDifference,
            passed: test.passed
        }))
    };
    
    return report;
}

// Export functions for use by other modules
window.visualRegressionTests = {
    runVisualRegressionTests,
    getVisualResults,
    generateVisualReport,
    VISUAL_REFERENCE_COLORS,
    VISUAL_TEST_CONFIG
};

console.log('Visual Regression Tests module loaded');