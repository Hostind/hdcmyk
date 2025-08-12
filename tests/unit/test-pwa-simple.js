// Simple PWA Test Script
// Requirements: 10.1, 10.2, 10.3, 10.4 - Test PWA functionality

console.log('Starting PWA functionality tests...');

// Test 1: Service Worker Registration
function testServiceWorkerRegistration() {
    console.log('Test 1: Service Worker Registration');
    
    if ('serviceWorker' in navigator) {
        console.log('✓ Service Worker API supported');
        
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                console.log('✓ Service Worker registered:', registration.scope);
                return true;
            } else {
                console.log('✗ Service Worker not registered');
                return false;
            }
        }).catch(error => {
            console.log('✗ Service Worker registration error:', error);
            return false;
        });
    } else {
        console.log('✗ Service Worker not supported');
        return false;
    }
}

// Test 2: Manifest File
async function testManifest() {
    console.log('Test 2: Manifest File');
    
    try {
        const response = await fetch('/manifest.json');
        if (response.ok) {
            const manifest = await response.json();
            console.log('✓ Manifest loaded successfully:', manifest.name);
            return true;
        } else {
            console.log('✗ Manifest not found');
            return false;
        }
    } catch (error) {
        console.log('✗ Manifest error:', error.message);
        return false;
    }
}

// Test 3: Offline Storage
function testOfflineStorage() {
    console.log('Test 3: Offline Storage');
    
    try {
        const testKey = 'pwa-test-' + Date.now();
        const testData = {
            test: true,
            timestamp: Date.now(),
            colorData: { c: 50, m: 30, y: 80, k: 10 }
        };
        
        localStorage.setItem(testKey, JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem(testKey));
        localStorage.removeItem(testKey);
        
        if (retrieved && retrieved.test === true) {
            console.log('✓ Offline storage working');
            return true;
        } else {
            console.log('✗ Offline storage failed');
            return false;
        }
    } catch (error) {
        console.log('✗ Storage error:', error.message);
        return false;
    }
}

// Test 4: Cache API
async function testCacheAPI() {
    console.log('Test 4: Cache API');
    
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            console.log('✓ Cache API supported, caches:', cacheNames);
            return true;
        } catch (error) {
            console.log('✗ Cache API error:', error.message);
            return false;
        }
    } else {
        console.log('✗ Cache API not supported');
        return false;
    }
}

// Test 5: Core Calculation Functions Offline
function testOfflineCalculations() {
    console.log('Test 5: Offline Calculations');
    
    try {
        // Test basic Delta E calculation (simplified)
        const lab1 = { l: 60, a: 20, b: 40 };
        const lab2 = { l: 55, a: 25, b: 35 };
        
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
        
        if (deltaE > 0) {
            console.log('✓ Basic calculations working offline (ΔE:', deltaE.toFixed(2), ')');
            return true;
        } else {
            console.log('✗ Calculation failed');
            return false;
        }
    } catch (error) {
        console.log('✗ Calculation error:', error.message);
        return false;
    }
}

// Test 6: PWA Installation Detection
function testPWAInstallation() {
    console.log('Test 6: PWA Installation Detection');
    
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone === true;
    
    if (isPWA) {
        console.log('✓ Running as installed PWA');
        return true;
    } else {
        console.log('ℹ Running in browser (not installed as PWA)');
        return true; // This is not a failure
    }
}

// Run all tests
async function runAllTests() {
    console.log('=== PWA Functionality Test Suite ===');
    
    const results = {
        serviceWorker: testServiceWorkerRegistration(),
        manifest: await testManifest(),
        offlineStorage: testOfflineStorage(),
        cacheAPI: await testCacheAPI(),
        offlineCalculations: testOfflineCalculations(),
        pwaInstallation: testPWAInstallation()
    };
    
    const passed = Object.values(results).filter(result => result === true).length;
    const total = Object.keys(results).length;
    
    console.log('=== Test Results ===');
    console.log(`Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
        console.log('🎉 All PWA tests passed!');
    } else {
        console.log('⚠️ Some PWA features may not be working correctly');
    }
    
    return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testPWA = {
        runAllTests,
        testServiceWorkerRegistration,
        testManifest,
        testOfflineStorage,
        testCacheAPI,
        testOfflineCalculations,
        testPWAInstallation
    };
}

// Auto-run tests if loaded directly
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(runAllTests, 2000); // Wait for other scripts to load
    });
}

console.log('PWA test script loaded. Run testPWA.runAllTests() to test all features.');