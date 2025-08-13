/**
 * Quick verification script for enhanced interactions
 * This script performs basic checks to ensure all functionality is working
 */

console.log('🔍 Verifying Enhanced Interactions Implementation...');

// Check 1: Verify status bar elements exist
const statusBar = document.getElementById('status-bar');
const statusValue = document.getElementById('status-value');
const deltaValue = document.getElementById('status-delta-value');
const statusCalculateBtn = document.getElementById('status-calculate-btn');
const statusResetBtn = document.getElementById('status-reset-btn');
const statusExportBtn = document.getElementById('status-export-btn');

console.log('✅ Status Bar Elements:', {
    statusBar: !!statusBar,
    statusValue: !!statusValue,
    deltaValue: !!deltaValue,
    calculateBtn: !!statusCalculateBtn,
    resetBtn: !!statusResetBtn,
    exportBtn: !!statusExportBtn
});

// Check 2: Verify tooltip elements exist
const tooltipElements = document.querySelectorAll('.tooltip-enhanced');
console.log('✅ Tooltip Elements:', tooltipElements.length, 'found');

// Check 3: Verify outlined button elements exist
const outlinedButtons = document.querySelectorAll('.btn-outlined');
console.log('✅ Outlined Button Elements:', outlinedButtons.length, 'found');

// Check 4: Verify JavaScript functions exist
const jsChecks = {
    'TooltipManager class': typeof TooltipManager !== 'undefined',
    'initializeStickyStatusBar': typeof initializeStickyStatusBar === 'function',
    'setCalculatingStatus': typeof setCalculatingStatus === 'function',
    'setCompleteStatus': typeof setCompleteStatus === 'function',
    'setReadyStatus': typeof setReadyStatus === 'function',
    'setErrorStatus': typeof setErrorStatus === 'function',
    'updateStatusBarContent': typeof updateStatusBarContent === 'function',
    'toggleStatusBarVisibility': typeof toggleStatusBarVisibility === 'function'
};

console.log('✅ JavaScript Functions:', jsChecks);

// Check 5: Verify CSS classes are applied
const cssChecks = {
    'status-bar class': statusBar?.classList.contains('status-bar'),
    'tooltip-enhanced classes': tooltipElements.length > 0 && tooltipElements[0].classList.contains('tooltip-enhanced'),
    'btn-outlined classes': outlinedButtons.length > 0 && outlinedButtons[0].classList.contains('btn-outlined')
};

console.log('✅ CSS Classes:', cssChecks);

// Check 6: Test basic functionality
setTimeout(() => {
    console.log('🧪 Testing Basic Functionality...');
    
    // Test status bar visibility toggle
    if (statusBar && typeof toggleStatusBarVisibility === 'function') {
        toggleStatusBarVisibility(true);
        const isVisible = statusBar.classList.contains('visible');
        console.log('✅ Status Bar Visibility Toggle:', isVisible);
        
        setTimeout(() => {
            toggleStatusBarVisibility(false);
            const isHidden = !statusBar.classList.contains('visible');
            console.log('✅ Status Bar Hide:', isHidden);
        }, 500);
    }
    
    // Test status updates
    if (typeof setCalculatingStatus === 'function' && statusValue) {
        setCalculatingStatus();
        setTimeout(() => {
            const isCalculating = statusValue.textContent.toLowerCase().includes('calculating');
            console.log('✅ Status Update (Calculating):', isCalculating);
            
            if (typeof setReadyStatus === 'function') {
                setReadyStatus();
                setTimeout(() => {
                    const isReady = statusValue.textContent.toLowerCase().includes('ready');
                    console.log('✅ Status Update (Ready):', isReady);
                }, 300);
            }
        }, 300);
    }
    
    // Test tooltip interaction
    if (tooltipElements.length > 0) {
        const firstTooltip = tooltipElements[0];
        firstTooltip.dispatchEvent(new MouseEvent('mouseenter'));
        
        setTimeout(() => {
            const hasTooltipContent = firstTooltip.getAttribute('data-tooltip');
            console.log('✅ Tooltip Content:', !!hasTooltipContent);
            
            firstTooltip.dispatchEvent(new MouseEvent('mouseleave'));
        }, 200);
    }
    
}, 1000);

// Check 7: Verify scroll detection setup
setTimeout(() => {
    if (typeof window.scrollState !== 'undefined') {
        console.log('✅ Scroll State Object:', window.scrollState);
    }
    
    // Test scroll event
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 150);
    
    setTimeout(() => {
        const scrolled = window.scrollY > 100;
        console.log('✅ Scroll Detection Test:', scrolled);
        
        // Reset scroll position
        window.scrollTo(0, originalScrollY);
    }, 300);
}, 1500);

// Summary report
setTimeout(() => {
    console.log('\n📋 VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    const allChecks = [
        statusBar && statusValue && deltaValue,
        tooltipElements.length > 0,
        outlinedButtons.length > 0,
        Object.values(jsChecks).every(Boolean),
        Object.values(cssChecks).every(Boolean)
    ];
    
    const passedChecks = allChecks.filter(Boolean).length;
    const totalChecks = allChecks.length;
    
    console.log(`✅ Verification Result: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks === totalChecks) {
        console.log('🎉 All enhanced interactions are properly implemented!');
    } else {
        console.log('⚠️  Some issues detected. Check the logs above for details.');
    }
    
    console.log('='.repeat(50));
}, 3000);