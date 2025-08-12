// Integration test for history functionality
// This script tests the complete workflow

console.log('=== History Integration Test ===');

// Test 1: Check if storage module is loaded
function testStorageModule() {
    console.log('\n1. Testing Storage Module...');
    
    if (typeof window.colorStorage === 'undefined') {
        console.error('❌ Storage module not loaded');
        return false;
    }
    
    console.log('✅ Storage module loaded successfully');
    
    // Test individual functions
    const functions = ['saveToHistory', 'loadHistory', 'displayHistory', 'clearHistory', 'getHistoryStats'];
    let allFunctionsExist = true;
    
    functions.forEach(func => {
        if (typeof window.colorStorage[func] === 'function') {
            console.log(`✅ ${func} function exists`);
        } else {
            console.error(`❌ ${func} function missing`);
            allFunctionsExist = false;
        }
    });
    
    return allFunctionsExist;
}

// Test 2: Check if calculator integration is working
function testCalculatorIntegration() {
    console.log('\n2. Testing Calculator Integration...');
    
    if (typeof window.calculatorApp === 'undefined') {
        console.error('❌ Calculator app not loaded');
        return false;
    }
    
    if (typeof window.calculatorApp.saveCalculationToHistory === 'function') {
        console.log('✅ saveCalculationToHistory function exists');
        return true;
    } else {
        console.error('❌ saveCalculationToHistory function missing');
        return false;
    }
}

// Test 3: Test saving and loading history
function testHistoryOperations() {
    console.log('\n3. Testing History Operations...');
    
    try {
        // Create test data
        const testComparison = {
            target: {
                cmyk: { c: 10, m: 20, y: 30, k: 5 },
                lab: { l: 70, a: 10, b: 15 }
            },
            sample: {
                cmyk: { c: 12, m: 22, y: 28, k: 6 },
                lab: { l: 68, a: 12, b: 13 }
            },
            deltaE: 2.5,
            tolerance: { zone: 'acceptable', description: 'Acceptable', range: '2.1-5.0' },
            componentDeltas: { deltaL: -2, deltaA: 2, deltaB: -2, deltaC: 1, deltaH: 0.5 },
            notes: 'Integration test entry'
        };
        
        // Test save
        const savedEntry = window.colorStorage.saveToHistory(testComparison);
        if (savedEntry) {
            console.log('✅ Successfully saved test entry to history');
        } else {
            console.error('❌ Failed to save test entry');
            return false;
        }
        
        // Test load
        const history = window.colorStorage.loadHistory();
        if (history.length > 0) {
            console.log(`✅ Successfully loaded history (${history.length} entries)`);
        } else {
            console.error('❌ Failed to load history or history is empty');
            return false;
        }
        
        // Test stats
        const stats = window.colorStorage.getHistoryStats();
        console.log(`✅ History stats: ${stats.totalEntries} entries, ${stats.storageUsed} bytes`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error during history operations:', error);
        return false;
    }
}

// Test 4: Test DOM integration
function testDOMIntegration() {
    console.log('\n4. Testing DOM Integration...');
    
    const historyList = document.getElementById('history-list');
    const clearButton = document.getElementById('clear-history-btn');
    
    if (!historyList) {
        console.error('❌ History list element not found');
        return false;
    }
    
    if (!clearButton) {
        console.error('❌ Clear history button not found');
        return false;
    }
    
    console.log('✅ DOM elements found');
    
    // Test display function
    try {
        window.colorStorage.displayHistory();
        console.log('✅ Display history function executed successfully');
        return true;
    } catch (error) {
        console.error('❌ Error displaying history:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Starting integration tests...\n');
    
    const results = {
        storageModule: testStorageModule(),
        calculatorIntegration: testCalculatorIntegration(),
        historyOperations: testHistoryOperations(),
        domIntegration: testDOMIntegration()
    };
    
    console.log('\n=== Test Results ===');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n${allPassed ? '🎉' : '❌'} Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return allPassed;
}

// Export for use in browser console
window.historyIntegrationTest = {
    runAllTests,
    testStorageModule,
    testCalculatorIntegration,
    testHistoryOperations,
    testDOMIntegration
};

// Auto-run tests when script loads (with delay to ensure other modules are loaded)
setTimeout(() => {
    runAllTests();
}, 1000);