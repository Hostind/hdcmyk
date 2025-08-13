// Live debugging script - paste this into browser console on hdcmyk.com
// This will help identify exactly what's broken

console.log('🔍 Starting Live Debug...');

// Test 1: Check if modules are loaded
console.log('📦 Module Status:');
console.log('- window.colorScience:', !!window.colorScience, typeof window.colorScience);
console.log('- window.pantoneColors:', !!window.pantoneColors, typeof window.pantoneColors);
console.log('- performColorDifferenceCalculation:', !!window.performColorDifferenceCalculation, typeof window.performColorDifferenceCalculation);

// Test 2: Check DOM elements
console.log('🏗️ DOM Elements:');
const calcBtn = document.getElementById('calculate-btn');
const targetC = document.getElementById('target-c');
const targetM = document.getElementById('target-m');
const sampleC = document.getElementById('sample-c');
const deltaEValue = document.getElementById('delta-e-value') || document.querySelector('.delta-e-number');

console.log('- Calculate button:', !!calcBtn);
console.log('- Target C input:', !!targetC, targetC?.value);
console.log('- Target M input:', !!targetM, targetM?.value);
console.log('- Sample C input:', !!sampleC, sampleC?.value);
console.log('- Delta E display:', !!deltaEValue, deltaEValue?.textContent);

// Test 3: Check Pantone dropdown
console.log('🎨 Pantone Status:');
const targetSelect = document.getElementById('target-preset-select');
const sampleSelect = document.getElementById('sample-preset-select');
console.log('- Target preset dropdown:', !!targetSelect, targetSelect?.options?.length + ' options');
console.log('- Sample preset dropdown:', !!sampleSelect, sampleSelect?.options?.length + ' options');

if (window.pantoneColors) {
    const allColors = window.pantoneColors.colors?.length || 0;
    console.log('- Total Pantone colors loaded:', allColors);
    
    if (window.pantoneColors.generatePantonePresetOptions) {
        const presetOptions = window.pantoneColors.generatePantonePresetOptions();
        console.log('- Generated preset options:', presetOptions.length);
        console.log('- First few options:', presetOptions.slice(0, 5));
    }
}

// Test 4: Try manual calculation
console.log('🧮 Manual Calculation Test:');
if (window.colorScience && window.colorScience.calculateDeltaE) {
    try {
        const testLab1 = { l: 50, a: 10, b: 20 };
        const testLab2 = { l: 45, a: 15, b: 18 };
        const testDeltaE = window.colorScience.calculateDeltaE(testLab1, testLab2);
        console.log('✅ Manual Delta E calculation works:', testDeltaE);
    } catch (error) {
        console.log('❌ Manual Delta E calculation failed:', error.message);
    }
}

// Test 5: Check what happens when we click calculate
console.log('🖱️ Button Click Test:');
if (calcBtn) {
    console.log('- Button text:', calcBtn.textContent);
    console.log('- Button disabled:', calcBtn.disabled);
    console.log('- Button classes:', calcBtn.className);
    
    // Check for event listeners (won't show the actual listeners, but we can try)
    console.log('- Attempting to trigger click event...');
    
    // Fill some test data first
    if (targetC) targetC.value = '60';
    if (targetM) targetM.value = '100';
    if (document.getElementById('target-y')) document.getElementById('target-y').value = '0';
    if (document.getElementById('target-k')) document.getElementById('target-k').value = '0';
    if (sampleC) sampleC.value = '58';
    if (document.getElementById('sample-m')) document.getElementById('sample-m').value = '95';
    if (document.getElementById('sample-y')) document.getElementById('sample-y').value = '2';
    if (document.getElementById('sample-k')) document.getElementById('sample-k').value = '1';
    
    console.log('- Filled test data, now triggering calculation...');
    
    // Try to trigger the calculation directly
    if (window.performColorDifferenceCalculation) {
        try {
            window.performColorDifferenceCalculation();
            console.log('✅ Direct function call succeeded');
        } catch (error) {
            console.log('❌ Direct function call failed:', error.message);
            console.log('Error details:', error);
        }
    }
    
    // Also try clicking the button
    try {
        calcBtn.click();
        console.log('✅ Button click event triggered');
    } catch (error) {
        console.log('❌ Button click failed:', error.message);
    }
}

// Test 6: Check for JavaScript errors
console.log('🚨 Recent Console Errors:');
// Note: This won't show errors that happened before this script runs

console.log('🔍 Live Debug Complete - Check results above');