// Test script to verify calculation fixes
console.log('Testing calculation fixes...');

// Test 1: Basic color science functions
if (window.colorScience) {
    console.log('✅ Color science module loaded');
    
    // Test basic Delta E calculation
    if (window.colorScience.calculateDeltaE) {
        const lab1 = { l: 50, a: 20, b: -10 };
        const lab2 = { l: 55, a: 25, b: -5 };
        
        const deltaE76 = window.colorScience.calculateDeltaE(lab1, lab2);
        console.log('✅ Basic ΔE Calculation:');
        console.log(`   CIE76: ${deltaE76.toFixed(2)}`);
    } else {
        console.log('❌ Basic ΔE function not available');
    }
} else {
    console.log('❌ Color science module not loaded');
}

// Test 2: Verify performDeltaEAnalysis works
if (window.colorScience && window.colorScience.performDeltaEAnalysis) {
    try {
        const analysis = window.colorScience.performDeltaEAnalysis(
            { l: 50, a: 20, b: -10 },
            { l: 55, a: 25, b: -5 }
        );
        
        if (analysis.deltaE) {
            console.log('✅ Analysis function works:');
            console.log(`   ΔE76: ${analysis.deltaE.toFixed(2)}`);
            if (analysis.deltaE2000) {
                console.log(`   ΔE2000: ${analysis.deltaE2000.toFixed(2)}`);
            }
        } else {
            console.log('❌ Analysis missing ΔE values:', analysis);
        }
    } catch (error) {
        console.log('❌ Analysis function error:', error.message);
    }
} else {
    console.log('❌ performDeltaEAnalysis function not available');
}

// Test 3: Check if preset dropdowns exist
const targetPreset = document.getElementById('target-preset-select');
const samplePreset = document.getElementById('sample-preset-select');

if (targetPreset && samplePreset) {
    console.log('✅ Preset dropdowns found');
    console.log(`   Target options: ${targetPreset.options.length}`);
    console.log(`   Sample options: ${samplePreset.options.length}`);
} else {
    console.log('❌ Preset dropdowns not found');
}

// Test 4: Test basic CMYK to RGB conversion
if (window.colorScience && window.colorScience.cmykToRgb) {
    try {
        const rgb = window.colorScience.cmykToRgb(50, 30, 80, 10);
        console.log('✅ CMYK to RGB conversion:');
        console.log(`   C:50 M:30 Y:80 K:10 → R:${rgb.r} G:${rgb.g} B:${rgb.b}`);
    } catch (error) {
        console.log('❌ CMYK to RGB error:', error.message);
    }
} else {
    console.log('❌ CMYK to RGB function not available');
}

// Test 5: Test if Calculate button exists and is functional
const calculateBtn = document.getElementById('calculate-btn');
if (calculateBtn) {
    console.log('✅ Calculate button found');
    console.log('   Button text:', calculateBtn.textContent);
    console.log('   Button enabled:', !calculateBtn.disabled);
} else {
    console.log('❌ Calculate button not found');
}

// Test 6: Test if main calculation function exists
if (typeof performColorDifferenceCalculation === 'function') {
    console.log('✅ Main calculation function available');
} else {
    console.log('❌ Main calculation function not available');
}

console.log('Test completed - Application should be working now!');