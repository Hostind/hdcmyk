// Complete fix verification test - run in browser console
console.log('🔧 COMPLETE FIX VERIFICATION TEST');
console.log('Testing all critical fixes...');

// Test 1: Validation Fix - Enter CMYK values including 0
console.log('\n1️⃣ VALIDATION FIX TEST');
document.getElementById('target-c').value = '50';
document.getElementById('target-m').value = '0';  // Test 0 value detection
document.getElementById('target-y').value = '100';
document.getElementById('target-k').value = '0';  // Test 0 value detection

document.getElementById('sample-c').value = '55';
document.getElementById('sample-m').value = '5';
document.getElementById('sample-y').value = '95';
document.getElementById('sample-k').value = '2';

// Trigger input events
['target-c', 'target-m', 'target-y', 'target-k', 'sample-c', 'sample-m', 'sample-y', 'sample-k'].forEach(id => {
    const input = document.getElementById(id);
    input.dispatchEvent(new Event('input', { bubbles: true }));
});

setTimeout(() => {
    console.log('✅ Input values filled with 0s included');
    
    // Test calculation
    try {
        const result = window.performColorDifferenceCalculation();
        console.log('✅ CALCULATION SUCCESS:', result);
    } catch (error) {
        console.error('❌ CALCULATION STILL FAILING:', error.message);
    }
    
    // Test 2: Color Swatch Display
    console.log('\n2️⃣ COLOR SWATCH TEST');
    const targetSwatch = document.getElementById('target-swatch');
    const sampleSwatch = document.getElementById('sample-swatch');
    
    if (targetSwatch && targetSwatch.style.backgroundColor !== '') {
        console.log('✅ Target swatch updated:', targetSwatch.style.backgroundColor);
    } else {
        console.error('❌ Target swatch not updated');
    }
    
    if (sampleSwatch && sampleSwatch.style.backgroundColor !== '') {
        console.log('✅ Sample swatch updated:', sampleSwatch.style.backgroundColor);
    } else {
        console.error('❌ Sample swatch not updated');
    }
    
    // Test 3: Preset Selection
    console.log('\n3️⃣ PRESET SELECTION TEST');
    const targetSelect = document.getElementById('target-preset-select');
    
    if (targetSelect && targetSelect.options.length > 10) {
        // Find a Pantone color option
        let pantoneOption = null;
        for (let i = 1; i < Math.min(20, targetSelect.options.length); i++) {
            if (targetSelect.options[i].dataset.colorData) {
                pantoneOption = targetSelect.options[i];
                break;
            }
        }
        
        if (pantoneOption) {
            console.log('📝 Testing Pantone preset:', pantoneOption.text);
            
            // Clear current values first
            ['target-c', 'target-m', 'target-y', 'target-k'].forEach(id => {
                document.getElementById(id).value = '';
            });
            
            // Apply preset
            targetSelect.value = pantoneOption.value;
            targetSelect.dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                const newC = document.getElementById('target-c').value;
                const newM = document.getElementById('target-m').value;
                
                if (newC !== '' || newM !== '') {
                    console.log('✅ Pantone preset populated inputs:', {
                        c: newC, m: newM, 
                        y: document.getElementById('target-y').value,
                        k: document.getElementById('target-k').value
                    });
                    
                    // Check if swatch updated
                    setTimeout(() => {
                        const swatchAfterPreset = targetSwatch.style.backgroundColor;
                        if (swatchAfterPreset !== 'rgb(255, 255, 255)' && swatchAfterPreset !== '') {
                            console.log('✅ Pantone preset updated swatch correctly:', swatchAfterPreset);
                        } else {
                            console.error('❌ Pantone preset did not update swatch properly');
                        }
                    }, 300);
                    
                } else {
                    console.error('❌ Pantone preset did not populate inputs');
                }
            }, 300);
        } else {
            console.error('❌ No Pantone options found with color data');
        }
    }
    
    // Final summary
    setTimeout(() => {
        console.log('\n🏁 FINAL VERIFICATION COMPLETE');
        console.log('Check results above for:');
        console.log('1. ✅ Calculation working with 0 values');  
        console.log('2. ✅ Color swatches displaying properly');
        console.log('3. ✅ Pantone presets working correctly');
        console.log('\nIf all items show ✅, the fixes are successful!');
    }, 2000);
    
}, 500);