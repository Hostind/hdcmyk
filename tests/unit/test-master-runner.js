// Master Test Runner for LAB Color Matching Calculator
// Requirements: 6.4, 4.4 - Comprehensive testing suite coordination

/**
 * Master Test Runner
 * Coordinates and runs all test suites for the LAB Color Matching Calculator
 */

// Master test configuration
const MASTER_TEST_CONFIG = {
    runInSequence: true,        // Run tests sequentially to avoid conflicts
    stopOnFirstFailure: false, // Continue running tests even if one suite fails
    generateReport: true,       // Generate comprehensive test report
    verbose: true,              // Detailed logging
    timeout: 30000             // 30 second timeout for entire test suite
};

// Test suite registry
const TEST_SUITES = [
    {
        name: 'Color Science Unit Tests',
        module: 'colorScienceTests',
        function: 'runColorScienceUnitTests',
        description: 'Tests all color conversion functions for accuracy',
        category: 'unit',
        priority: 1,
        estimatedTime: 2000
    },
    {
        name: 'Integration Workflow Tests',
        module: 'integrationTests',
        function: 'runIntegrationTests',
        description: 'Tests complete calculation workflow from input to results',
        category: 'integration',
        priority: 2,
        estimatedTime: 8000
    },
    {
        name: 'Visual Regression Tests',
        module: 'visualRegressionTests',
        function: 'runVisualRegressionTests',
        description: 'Tests color swatch accuracy and visual consistency',
        category: 'visual',
        priority: 3,
        estimatedTime: 5000
    },
    {
        name: 'Export Functionality Tests',
        module: 'exportFunctionalityTests',
        function: 'runExportFunctionalityTests',
        description: 'Tests CSV and PDF export with various data sets',
        category: 'functional',
        priority: 4,
        estimatedTime: 4000
    }
];

// Master test results
let masterResults = {
    startTime: null,
    endTime: null,
    totalDuration: 0,
    suiteResults: [],
    summary: {
        totalSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        errorTests: 0
    },
    coverage: {
        colorScience: false,
        workflow: false,
        visual: false,
        export: false
    }
};

/**
 * Main test runner function
 * Runs all test suites and generates comprehensive report
 */
async function runAllTests() {
    console.log('🧪 LAB Color Matching Calculator - Comprehensive Test Suite');
    console.log('='.repeat(70));
    console.log('Starting comprehensive testing of all application components...');
    console.log('');
    
    masterResults.startTime = performance.now();
    masterResults.suiteResults = [];
    masterResults.summary = {
        totalSuites: TEST_SUITES.length,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        errorTests: 0
    };
    
    // Check global prerequisites
    if (!checkGlobalPrerequisites()) {
        console.error('❌ Global prerequisites not met. Cannot run tests.');
        return false;
    }
    
    // Run test suites
    if (MASTER_TEST_CONFIG.runInSequence) {
        await runTestSuitesSequentially();
    } else {
        await runTestSuitesParallel();
    }
    
    masterResults.endTime = performance.now();
    masterResults.totalDuration = masterResults.endTime - masterResults.startTime;
    
    // Generate and display comprehensive report
    generateComprehensiveReport();
    
    // Return overall success status
    return masterResults.summary.failedSuites === 0;
}

/**
 * Check global prerequisites for all tests
 */
function checkGlobalPrerequisites() {
    console.log('🔍 Checking global prerequisites...');
    
    const prerequisites = [
        {
            name: 'DOM Ready',
            check: () => document.readyState === 'complete' || document.readyState === 'interactive'
        },
        {
            name: 'Color Science Module',
            check: () => typeof window.colorScience !== 'undefined'
        },
        {
            name: 'Calculator Module',
            check: () => typeof appState !== 'undefined'
        },
        {
            name: 'Storage Module',
            check: () => typeof window.colorStorage !== 'undefined'
        },
        {
            name: 'Export Module',
            check: () => typeof window.colorExport !== 'undefined'
        },
        {
            name: 'Required DOM Elements',
            check: () => {
                const requiredElements = [
                    'target-swatch', 'sample-swatch', 'calculate-btn',
                    'target-c', 'target-m', 'target-y', 'target-k',
                    'sample-c', 'sample-m', 'sample-y', 'sample-k'
                ];
                return requiredElements.every(id => document.getElementById(id));
            }
        }
    ];
    
    let allPassed = true;
    
    for (const prereq of prerequisites) {
        try {
            if (prereq.check()) {
                console.log(`  ✅ ${prereq.name}`);
            } else {
                console.log(`  ❌ ${prereq.name}`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`  💥 ${prereq.name}: ${error.message}`);
            allPassed = false;
        }
    }
    
    if (allPassed) {
        console.log('✅ All global prerequisites met\n');
    } else {
        console.log('❌ Some global prerequisites failed\n');
    }
    
    return allPassed;
}

/**
 * Run test suites sequentially
 */
async function runTestSuitesSequentially() {
    console.log('🔄 Running test suites sequentially...\n');
    
    for (const suite of TEST_SUITES) {
        await runTestSuite(suite);
        
        // Small delay between suites
        await sleep(500);
        
        // Stop on first failure if configured
        if (MASTER_TEST_CONFIG.stopOnFirstFailure && 
            masterResults.suiteResults[masterResults.suiteResults.length - 1]?.failed) {
            console.log('⏹️  Stopping on first failure as configured');
            break;
        }
    }
}

/**
 * Run test suites in parallel (experimental)
 */
async function runTestSuitesParallel() {
    console.log('⚡ Running test suites in parallel...\n');
    
    const suitePromises = TEST_SUITES.map(suite => runTestSuite(suite));
    await Promise.allSettled(suitePromises);
}

/**
 * Run a single test suite
 */
async function runTestSuite(suite) {
    console.log(`🎯 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);
    console.log(`   Estimated time: ${(suite.estimatedTime / 1000).toFixed(1)}s`);
    
    const suiteResult = {
        name: suite.name,
        category: suite.category,
        startTime: performance.now(),
        endTime: null,
        duration: 0,
        passed: false,
        testResults: null,
        error: null
    };
    
    try {
        // Check if test module is available
        if (typeof window[suite.module] === 'undefined') {
            throw new Error(`Test module '${suite.module}' not found`);
        }
        
        if (typeof window[suite.module][suite.function] !== 'function') {
            throw new Error(`Test function '${suite.function}' not found in module '${suite.module}'`);
        }
        
        // Run the test suite with timeout
        const testPromise = window[suite.module][suite.function]();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test suite timeout')), suite.estimatedTime * 2)
        );
        
        const testPassed = await Promise.race([testPromise, timeoutPromise]);
        
        suiteResult.passed = testPassed;
        
        // Get detailed results if available
        const getResultsFunction = `get${suite.module.charAt(0).toUpperCase() + suite.module.slice(1).replace('Tests', '')}Results`;
        if (typeof window[suite.module][getResultsFunction] === 'function') {
            suiteResult.testResults = window[suite.module][getResultsFunction]();
        }
        
        if (testPassed) {
            masterResults.summary.passedSuites++;
            console.log(`   ✅ ${suite.name} completed successfully`);
        } else {
            masterResults.summary.failedSuites++;
            console.log(`   ❌ ${suite.name} failed`);
        }
        
    } catch (error) {
        masterResults.summary.failedSuites++;
        suiteResult.error = error.message;
        console.log(`   💥 ${suite.name} error: ${error.message}`);
    }
    
    suiteResult.endTime = performance.now();
    suiteResult.duration = suiteResult.endTime - suiteResult.startTime;
    
    masterResults.suiteResults.push(suiteResult);
    
    // Update coverage tracking
    updateCoverageTracking(suite.category, suiteResult.passed);
    
    // Update summary statistics
    if (suiteResult.testResults) {
        masterResults.summary.totalTests += suiteResult.testResults.total || 0;
        masterResults.summary.passedTests += suiteResult.testResults.passed || 0;
        masterResults.summary.failedTests += suiteResult.testResults.failed || 0;
        masterResults.summary.errorTests += suiteResult.testResults.errors || 0;
    }
    
    console.log(`   ⏱️  Duration: ${(suiteResult.duration / 1000).toFixed(2)}s\n`);
}

/**
 * Update coverage tracking
 */
function updateCoverageTracking(category, passed) {
    switch (category) {
        case 'unit':
            masterResults.coverage.colorScience = passed;
            break;
        case 'integration':
            masterResults.coverage.workflow = passed;
            break;
        case 'visual':
            masterResults.coverage.visual = passed;
            break;
        case 'functional':
            masterResults.coverage.export = passed;
            break;
    }
}

/**
 * Generate comprehensive test report
 */
function generateComprehensiveReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(70));
    
    // Overall summary
    const overallPassRate = masterResults.summary.totalTests > 0 ? 
        (masterResults.summary.passedTests / masterResults.summary.totalTests * 100).toFixed(1) : 0;
    
    const suitePassRate = masterResults.summary.totalSuites > 0 ? 
        (masterResults.summary.passedSuites / masterResults.summary.totalSuites * 100).toFixed(1) : 0;
    
    console.log(`\n📈 OVERALL SUMMARY`);
    console.log(`Total Duration:     ${(masterResults.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Test Suites:        ${masterResults.summary.passedSuites}/${masterResults.summary.totalSuites} passed (${suitePassRate}%)`);
    console.log(`Individual Tests:   ${masterResults.summary.passedTests}/${masterResults.summary.totalTests} passed (${overallPassRate}%)`);
    console.log(`Failed Tests:       ${masterResults.summary.failedTests}`);
    console.log(`Error Tests:        ${masterResults.summary.errorTests}`);
    
    // Suite-by-suite breakdown
    console.log(`\n📋 SUITE BREAKDOWN`);
    masterResults.suiteResults.forEach(suite => {
        const status = suite.passed ? '✅' : '❌';
        const duration = (suite.duration / 1000).toFixed(2);
        
        console.log(`${status} ${suite.name} (${duration}s)`);
        
        if (suite.testResults) {
            const passRate = suite.testResults.total > 0 ? 
                (suite.testResults.passed / suite.testResults.total * 100).toFixed(1) : 0;
            console.log(`    Tests: ${suite.testResults.passed}/${suite.testResults.total} (${passRate}%)`);
            
            if (suite.testResults.failed > 0) {
                console.log(`    Failed: ${suite.testResults.failed}`);
            }
            if (suite.testResults.errors > 0) {
                console.log(`    Errors: ${suite.testResults.errors}`);
            }
        }
        
        if (suite.error) {
            console.log(`    Error: ${suite.error}`);
        }
    });
    
    // Coverage report
    console.log(`\n🎯 COVERAGE REPORT`);
    const coverageItems = [
        { name: 'Color Science Functions', covered: masterResults.coverage.colorScience },
        { name: 'Workflow Integration', covered: masterResults.coverage.workflow },
        { name: 'Visual Rendering', covered: masterResults.coverage.visual },
        { name: 'Export Functionality', covered: masterResults.coverage.export }
    ];
    
    coverageItems.forEach(item => {
        const status = item.covered ? '✅' : '❌';
        console.log(`${status} ${item.name}`);
    });
    
    const coveragePercentage = (coverageItems.filter(item => item.covered).length / coverageItems.length * 100).toFixed(1);
    console.log(`\nOverall Coverage: ${coveragePercentage}%`);
    
    // Performance analysis
    console.log(`\n⚡ PERFORMANCE ANALYSIS`);
    const sortedSuites = [...masterResults.suiteResults].sort((a, b) => b.duration - a.duration);
    
    console.log('Slowest test suites:');
    sortedSuites.slice(0, 3).forEach((suite, index) => {
        console.log(`  ${index + 1}. ${suite.name}: ${(suite.duration / 1000).toFixed(2)}s`);
    });
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS`);
    
    if (masterResults.summary.failedSuites > 0) {
        console.log('❗ Some test suites failed. Review the implementation of failed components.');
    }
    
    if (masterResults.summary.errorTests > 0) {
        console.log('❗ Some tests encountered errors. Check for missing dependencies or setup issues.');
    }
    
    if (masterResults.totalDuration > 20000) {
        console.log('⚠️  Test suite is taking longer than 20 seconds. Consider optimizing slow tests.');
    }
    
    if (coveragePercentage < 100) {
        console.log('⚠️  Not all components are covered by tests. Consider adding missing test coverage.');
    }
    
    if (overallPassRate < 95) {
        console.log('⚠️  Test pass rate is below 95%. Review and fix failing tests.');
    }
    
    // Final verdict
    console.log(`\n🏆 FINAL VERDICT`);
    if (masterResults.summary.failedSuites === 0 && overallPassRate >= 95) {
        console.log('🎉 EXCELLENT! All test suites passed with high success rate.');
        console.log('   The LAB Color Matching Calculator is ready for production use.');
    } else if (masterResults.summary.failedSuites <= 1 && overallPassRate >= 90) {
        console.log('✅ GOOD! Most tests passed with acceptable success rate.');
        console.log('   Minor issues should be addressed before production deployment.');
    } else {
        console.log('⚠️  NEEDS WORK! Significant test failures detected.');
        console.log('   Major issues must be resolved before production deployment.');
    }
    
    console.log('='.repeat(70));
    
    // Generate test report file if configured
    if (MASTER_TEST_CONFIG.generateReport) {
        generateTestReportFile();
    }
}

/**
 * Generate test report file
 */
function generateTestReportFile() {
    try {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: masterResults.summary,
            coverage: masterResults.coverage,
            suiteResults: masterResults.suiteResults.map(suite => ({
                name: suite.name,
                category: suite.category,
                passed: suite.passed,
                duration: suite.duration,
                testResults: suite.testResults ? {
                    total: suite.testResults.total,
                    passed: suite.testResults.passed,
                    failed: suite.testResults.failed,
                    errors: suite.testResults.errors,
                    passRate: suite.testResults.passRate
                } : null,
                error: suite.error
            })),
            performance: {
                totalDuration: masterResults.totalDuration,
                averageSuiteDuration: masterResults.suiteResults.length > 0 ? 
                    masterResults.suiteResults.reduce((sum, suite) => sum + suite.duration, 0) / masterResults.suiteResults.length : 0
            }
        };
        
        // Store in localStorage for later retrieval
        localStorage.setItem('testReport', JSON.stringify(reportData, null, 2));
        
        console.log('📄 Test report saved to localStorage (key: "testReport")');
        
    } catch (error) {
        console.warn('⚠️  Could not generate test report file:', error.message);
    }
}

/**
 * Run specific test category
 */
async function runTestCategory(category) {
    console.log(`🎯 Running ${category} tests only...`);
    
    const categoryTests = TEST_SUITES.filter(suite => suite.category === category);
    
    if (categoryTests.length === 0) {
        console.log(`❌ No tests found for category: ${category}`);
        return false;
    }
    
    masterResults.startTime = performance.now();
    masterResults.suiteResults = [];
    
    for (const suite of categoryTests) {
        await runTestSuite(suite);
    }
    
    masterResults.endTime = performance.now();
    masterResults.totalDuration = masterResults.endTime - masterResults.startTime;
    
    // Generate simplified report
    console.log(`\n📊 ${category.toUpperCase()} TEST RESULTS`);
    console.log('='.repeat(40));
    
    const passedSuites = masterResults.suiteResults.filter(s => s.passed).length;
    const totalSuites = masterResults.suiteResults.length;
    
    console.log(`Suites: ${passedSuites}/${totalSuites} passed`);
    console.log(`Duration: ${(masterResults.totalDuration / 1000).toFixed(2)}s`);
    
    return passedSuites === totalSuites;
}

/**
 * Utility function for async delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get master test results
 */
function getMasterResults() {
    return masterResults;
}

/**
 * Quick test runner for development
 */
async function runQuickTests() {
    console.log('⚡ Running quick tests (unit tests only)...');
    return await runTestCategory('unit');
}

// Export functions for use by other modules and console
window.testRunner = {
    runAllTests,
    runTestCategory,
    runQuickTests,
    getMasterResults,
    TEST_SUITES,
    MASTER_TEST_CONFIG
};

// Auto-run tests if URL parameter is present
if (window.location.search.includes('autotest=true')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('🚀 Auto-running tests due to URL parameter...');
            runAllTests();
        }, 2000);
    });
}

console.log('Master Test Runner loaded successfully');
console.log('Available commands:');
console.log('  testRunner.runAllTests() - Run all test suites');
console.log('  testRunner.runTestCategory("unit") - Run specific category');
console.log('  testRunner.runQuickTests() - Run quick unit tests only');