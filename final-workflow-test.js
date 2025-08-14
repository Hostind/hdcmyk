// Final comprehensive workflow test - paste this into browser console
// This tests the complete workflow: preset selection → manual input → calculation

console.log('🧪 Starting Final Workflow Test...');

// Test 1: Verify modules are loaded
console.log('📦 1. Module Status:');
const hasColorScience = !!window.colorScience;
const hasPantoneColors = !!window.pantoneColors;
const hasCalculation = !!window.performColorDifferenceCalculation;
console.log('- window.colorScience:', hasColorScience);
console.log('- window.pantoneColors:', hasPantoneColors);
console.log('- performColorDifferenceCalculation:', hasCalculation);

if (!hasColorScience || !hasPantoneColors || !hasCalculation) {
    console.error('❌ Critical modules missing - workflow will fail');
    return;
}

// Test 2: Preset Selection Test
console.log('🎨 2. Testing Preset Selection...');
const targetSelect = document.getElementById('target-preset-select');
const sampleSelect = document.getElementById('sample-preset-select');

if (targetSelect && targetSelect.options.length > 10) {
    console.log('✅ Target preset dropdown has', targetSelect.options.length, 'options');
    
    // Test preset selection (pick a Pantone color)
    let testPresetOption = null;
    for (let i = 1; i < Math.min(10, targetSelect.options.length); i++) {
        if (targetSelect.options[i].dataset.colorData) {
            testPresetOption = targetSelect.options[i];
            break;
        }
    }
    
    if (testPresetOption) {
        console.log('📝 Testing preset:', testPresetOption.text);
        targetSelect.value = testPresetOption.value;
        targetSelect.dispatchEvent(new Event('change'));
        
        // Check if values populated
        setTimeout(() => {
            const targetC = document.getElementById('target-c');
            const targetM = document.getElementById('target-m');
            if (targetC && targetM && (targetC.value !== '' || targetM.value !== '')) {
                console.log('✅ Preset selection populated inputs:', {
                    c: targetC.value,
                    m: targetM.value,
                    y: document.getElementById('target-y')?.value,
                    k: document.getElementById('target-k')?.value
                });
            } else {
                console.error('❌ Preset selection did not populate inputs');
            }
        }, 500);
    }
} else {
    console.error('❌ Target preset dropdown not found or empty');
}

// Test 3: Manual Input Test
console.log('⌨️ 3. Testing Manual Input...');
setTimeout(() => {
    const inputs = {
        sampleC: document.getElementById('sample-c'),
        sampleM: document.getElementById('sample-m'),
        sampleY: document.getElementById('sample-y'),
        sampleK: document.getElementById('sample-k')
    };
    
    // Fill sample values manually
    const testValues = { c: '65', m: '85', y: '5', k: '2' };
    Object.keys(testValues).forEach(key => {
        const input = inputs[`sample${key.toUpperCase()}`];
        if (input) {
            input.value = testValues[key];
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    });
    
    console.log('📝 Filled sample inputs:', testValues);
    
    // Test 4: Calculation Test
    setTimeout(() => {
        console.log('🧮 4. Testing Calculation...');
        
        const calcButton = document.getElementById('calculate-btn');
        if (calcButton) {
            console.log('🖱️ Clicking calculate button...');
            
            // Try direct function call first
            try {
                const result = window.performColorDifferenceCalculation();
                console.log('✅ Direct function call succeeded:', result);
            } catch (error) {
                console.error('❌ Direct function call failed:', error.message);
                console.log('Error details:', error);
            }
            
            // Also try button click
            try {
                calcButton.click();
                console.log('✅ Button click triggered');
            } catch (error) {
                console.error('❌ Button click failed:', error.message);
            }
            
            // Check results after a delay
            setTimeout(() => {
                const deltaEValue = document.getElementById('delta-e-value') || document.querySelector('.delta-e-number');
                if (deltaEValue && deltaEValue.textContent !== '--' && deltaEValue.textContent.trim() !== '') {
                    console.log('✅ CALCULATION SUCCESS! Delta E result:', deltaEValue.textContent);
                    console.log('🎉 WORKFLOW TEST PASSED - All functionality working!');
                } else {
                    console.error('❌ CALCULATION FAILED - No results displayed');
                    
                    // Debug current values
                    const currentValues = window.getCurrentColorValues ? window.getCurrentColorValues() : 'function not found';
                    console.log('Current values:', currentValues);
                    
                    // Check validation
                    if (window.hasValidColorData && currentValues !== 'function not found') {
                        const isValid = window.hasValidColorData(currentValues);
                        console.log('Validation result:', isValid);
                    }
                }
            }, 1000);
            
        } else {
            console.error('❌ Calculate button not found');
        }
    }, 1000);
    
}, 1000);

console.log('⏱️ Test running... Results will appear above in 3-4 seconds');