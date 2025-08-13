// Comprehensive Button Functionality Test
// This script tests all outlined button implementations

console.log('🧪 Starting Outlined Button System Tests...');

// Test 1: Check if all button classes exist
function testButtonClassesExist() {
    console.log('\n📋 Test 1: Checking button class existence...');
    
    const buttonClasses = [
        'btn-outlined',
        'status-action-btn',
        'quick-action-btn',
        'calculate-button',
        'reset-button',
        'export-btn',
        'clear-history-btn',
        'retry-button',
        'test-btn'
    ];
    
    let passed = 0;
    let total = buttonClasses.length;
    
    buttonClasses.forEach(className => {
        const elements = document.querySelectorAll(`.${className}`);
        if (elements.length > 0) {
            console.log(`✅ .${className} found (${elements.length} elements)`);
            passed++;
        } else {
            console.log(`❌ .${className} not found`);
        }
    });
    
    console.log(`📊 Button Classes Test: ${passed}/${total} passed`);
    return passed === total;
}

// Test 2: Check hover states
function testHoverStates() {
    console.log('\n🎯 Test 2: Testing hover states...');
    
    const buttons = document.querySelectorAll('button:not(:disabled)');
    let passed = 0;
    
    buttons.forEach((button, index) => {
        // Simulate hover
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        
        const computedStyle = window.getComputedStyle(button);
        const hasTransition = computedStyle.transition.includes('all') || 
                             computedStyle.transition.includes('color') ||
                             computedStyle.transition.includes('transform');
        
        if (hasTransition) {
            passed++;
        }
        
        // Remove hover
        button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    
    console.log(`📊 Hover States Test: ${passed}/${buttons.length} buttons have transitions`);
    return passed > 0;
}

// Test 3: Check focus indicators
function testFocusIndicators() {
    console.log('\n🎯 Test 3: Testing focus indicators...');
    
    const buttons = document.querySelectorAll('button:not(:disabled)');
    let passed = 0;
    
    buttons.forEach((button, index) => {
        button.focus();
        const computedStyle = window.getComputedStyle(button);
        
        // Check if focus styles are applied
        if (computedStyle.outline !== 'none' || 
            computedStyle.boxShadow.includes('rgba') ||
            computedStyle.border.includes('px')) {
            passed++;
        }
        
        button.blur();
    });
    
    console.log(`📊 Focus Indicators Test: ${passed}/${buttons.length} buttons have focus styles`);
    return passed > 0;
}

// Test 4: Check disabled states
function testDisabledStates() {
    console.log('\n🚫 Test 4: Testing disabled states...');
    
    const disabledButtons = document.querySelectorAll('button:disabled');
    let passed = 0;
    
    disabledButtons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        
        // Check if disabled styles are applied
        if (parseFloat(computedStyle.opacity) < 1 || 
            computedStyle.cursor === 'not-allowed') {
            passed++;
        }
    });
    
    console.log(`📊 Disabled States Test: ${passed}/${disabledButtons.length} disabled buttons styled correctly`);
    return disabledButtons.length === 0 || passed === disabledButtons.length;
}

// Test 5: Check button accessibility
function testAccessibility() {
    console.log('\n♿ Test 5: Testing accessibility features...');
    
    const buttons = document.querySelectorAll('button');
    let passed = 0;
    let total = 0;
    
    buttons.forEach(button => {
        total++;
        let buttonPassed = true;
        
        // Check minimum touch target size (48px)
        const rect = button.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
            console.log(`⚠️ Button "${button.textContent.trim()}" may be too small for touch`);
            buttonPassed = false;
        }
        
        // Check if button has accessible text
        const text = button.textContent.trim() || button.getAttribute('aria-label') || button.getAttribute('title');
        if (!text) {
            console.log(`⚠️ Button has no accessible text`);
            buttonPassed = false;
        }
        
        if (buttonPassed) {
            passed++;
        }
    });
    
    console.log(`📊 Accessibility Test: ${passed}/${total} buttons meet accessibility standards`);
    return passed === total;
}

// Test 6: Check responsive behavior
function testResponsiveBehavior() {
    console.log('\n📱 Test 6: Testing responsive behavior...');
    
    const originalWidth = window.innerWidth;
    let passed = 0;
    let total = 3;
    
    // Test mobile breakpoint
    try {
        // Simulate mobile viewport
        const mobileQuery = window.matchMedia('(max-width: 480px)');
        const tabletQuery = window.matchMedia('(max-width: 768px)');
        
        if (mobileQuery.matches) {
            console.log('✅ Mobile breakpoint detected');
            passed++;
        } else {
            console.log('ℹ️ Not in mobile viewport');
        }
        
        if (tabletQuery.matches) {
            console.log('✅ Tablet breakpoint detected');
            passed++;
        } else {
            console.log('ℹ️ Not in tablet viewport');
        }
        
        // Check if buttons maintain minimum sizes
        const buttons = document.querySelectorAll('button');
        let minSizesPassed = true;
        
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.height < 44) {
                minSizesPassed = false;
            }
        });
        
        if (minSizesPassed) {
            console.log('✅ All buttons maintain minimum touch target sizes');
            passed++;
        } else {
            console.log('❌ Some buttons are too small for touch interaction');
        }
        
    } catch (error) {
        console.log('⚠️ Could not test responsive behavior:', error.message);
    }
    
    console.log(`📊 Responsive Test: ${passed}/${total} responsive checks passed`);
    return passed >= 1; // At least one responsive feature should work
}

// Test 7: Check button variants
function testButtonVariants() {
    console.log('\n🎨 Test 7: Testing button variants...');
    
    const variants = [
        'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gold'
    ];
    
    let found = 0;
    
    variants.forEach(variant => {
        const elements = document.querySelectorAll(`.btn-outlined.${variant}, .quick-action-btn.${variant}`);
        if (elements.length > 0) {
            console.log(`✅ ${variant} variant found`);
            found++;
        }
    });
    
    console.log(`📊 Button Variants Test: ${found}/${variants.length} variants available`);
    return found > 0;
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running Outlined Button System Test Suite...\n');
    
    const tests = [
        { name: 'Button Classes Exist', fn: testButtonClassesExist },
        { name: 'Hover States', fn: testHoverStates },
        { name: 'Focus Indicators', fn: testFocusIndicators },
        { name: 'Disabled States', fn: testDisabledStates },
        { name: 'Accessibility', fn: testAccessibility },
        { name: 'Responsive Behavior', fn: testResponsiveBehavior },
        { name: 'Button Variants', fn: testButtonVariants }
    ];
    
    let passedTests = 0;
    const results = [];
    
    for (const test of tests) {
        try {
            const result = test.fn();
            results.push({ name: test.name, passed: result });
            if (result) passedTests++;
        } catch (error) {
            console.error(`❌ Test "${test.name}" failed with error:`, error);
            results.push({ name: test.name, passed: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    results.forEach(result => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 OVERALL RESULT: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 All tests passed! Outlined button system is working correctly.');
    } else if (passedTests >= tests.length * 0.8) {
        console.log('⚠️ Most tests passed. Minor issues may need attention.');
    } else {
        console.log('❌ Several tests failed. Button system needs review.');
    }
    
    console.log('='.repeat(50));
    
    return passedTests / tests.length;
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.testOutlinedButtons = runAllTests;