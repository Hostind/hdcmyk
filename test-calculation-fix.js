// Test script to verify calculation fixes
console.log('Testing calculation fixes...');

// Test 1: Verify ΔE2000 calculation
if (window.colorScience && window.colorScience.calculateDeltaE2000) {
    const lab1 = { l: 50, a: 20, b: -10 };
    const lab2 = { l: 55, a: 25, b: -5 };
    
    const deltaE76 = window.colorScience.calculateDeltaE(lab1, lab2);
    const deltaE2000 = window.colorScience.calculateDeltaE2000(lab1, lab2);
    
    console.log('✅ ΔE Calculations:');
    console.log(`   CIE76: ${deltaE76.toFixed(2)}`);
    console.log(`   CIEDE2000: ${deltaE2000.toFixed(2)}`);
} else {
    console.log('❌ ΔE2000 function not available');
}

// Test 2: Verify performDeltaEAnalysis returns both values
if (window.colorScience && window.colorScience.performDeltaEAnalysis) {
    const analysis = window.colorScience.performDeltaEAnalysis(
        { l: 50, a: 20, b: -10 },
        { l: 55, a: 25, b: -5 }
    );
    
    if (analysis.deltaE && analysis.deltaE2000) {
        console.log('✅ Analysis includes both ΔE values:');
        console.log(`   ΔE76: ${analysis.deltaE.toFixed(2)}`);
        console.log(`   ΔE2000: ${analysis.deltaE2000.toFixed(2)}`);
    } else {
        console.log('❌ Analysis missing ΔE values:', analysis);
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

// Test 4: Test new CMYK to LAB conversion
if (window.colorScience && window.colorScience.cmykToLab) {
    const lab = window.colorScience.cmykToLab(50, 30, 80, 10);
    console.log('✅ CMYK to LAB conversion:');
    console.log(`   C:50 M:30 Y:80 K:10 → L:${lab.l.toFixed(1)} a:${lab.a.toFixed(1)} b:${lab.b.toFixed(1)}`);
} else {
    console.log('❌ CMYK to LAB function not available');
}

// Test 5: Test paper white compensation
if (window.colorScience && window.colorScience.applyPaperWhiteCompensation) {
    const originalLab = { l: 60, a: 20, b: -10 };
    const compensatedLab = window.colorScience.applyPaperWhiteCompensation(originalLab);
    console.log('✅ Paper white compensation:');
    console.log(`   Original: L:${originalLab.l} a:${originalLab.a} b:${originalLab.b}`);
    console.log(`   Compensated: L:${compensatedLab.l.toFixed(1)} a:${compensatedLab.a.toFixed(1)} b:${compensatedLab.b.toFixed(1)}`);
} else {
    console.log('❌ Paper white compensation function not available');
}

console.log('Test completed');