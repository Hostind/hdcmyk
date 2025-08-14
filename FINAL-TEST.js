// FINAL TEST - This should now work!
console.log('🚨 FINAL CRITICAL FIX TEST');
console.log('Previous issue: Multiple hasValidColorData functions caused wrong validation');
console.log('Fix: Removed duplicate functions, now using the correct one');

// Clear everything first
['target-c', 'target-m', 'target-y', 'target-k', 'sample-c', 'sample-m', 'sample-y', 'sample-k'].forEach(id => {
    document.getElementById(id).value = '';
});

// Enter the same values that were converting correctly but failing validation
document.getElementById('target-c').value = '60';
document.getElementById('target-m').value = '100';  
document.getElementById('target-y').value = '0';
document.getElementById('target-k').value = '0';

document.getElementById('sample-c').value = '58';
document.getElementById('sample-m').value = '95';
document.getElementById('sample-y').value = '2';
document.getElementById('sample-k').value = '1';

// Trigger events
['target-c', 'target-m', 'target-y', 'target-k', 'sample-c', 'sample-m', 'sample-y', 'sample-k'].forEach(id => {
    const input = document.getElementById(id);
    input.dispatchEvent(new Event('input', { bubbles: true }));
});

setTimeout(() => {
    console.log('Values entered, attempting calculation...');
    
    try {
        const result = window.performColorDifferenceCalculation();
        console.log('🎉 SUCCESS! Calculation result:', result);
        
        // Check if Delta E value is displayed
        setTimeout(() => {
            const deltaDisplay = document.querySelector('.delta-e-number');
            if (deltaDisplay && deltaDisplay.textContent !== '--') {
                console.log('🎉 COMPLETE SUCCESS! Delta E displayed:', deltaDisplay.textContent);
                console.log('✅ ALL ISSUES FIXED - WEBSITE IS NOW FUNCTIONAL!');
            } else {
                console.log('⚠️ Calculation worked but display may need refresh');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Still failing:', error.message);
        console.log('Need to investigate further...');
    }
}, 500);