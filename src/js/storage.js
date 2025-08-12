// LAB Color Matching Calculator - Storage Functions
// Following the simple LocalStorage approach from our design spec

// Storage keys as defined in design.md
const STORAGE_KEYS = {
    HISTORY: 'colorHistory',
    SETTINGS: 'appSettings',
    LAST_COLORS: 'lastColors',
    OFFLINE_CALCULATIONS: 'offlineCalculations',
    PWA_SETTINGS: 'pwaSettings'
};

// Maximum number of history entries to maintain
const MAX_HISTORY_ENTRIES = 50;

/**
 * Save a completed calculation to history
 * Requirements: 8.1 - Automatically save recent color comparisons to local storage
 */
function saveToHistory(comparison) {
    try {
        // Get existing history
        const history = loadHistory();
        
        // Create history entry with timestamp
        const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            target: {
                cmyk: { ...comparison.target.cmyk },
                lab: { ...comparison.target.lab }
            },
            sample: {
                cmyk: { ...comparison.sample.cmyk },
                lab: { ...comparison.sample.lab }
            },
            deltaE: comparison.deltaE,
            tolerance: comparison.tolerance,
            componentDeltas: { ...comparison.componentDeltas },
            notes: comparison.notes || ''
        };
        
        // Add to beginning of history array
        history.unshift(historyEntry);
        
        // Limit to maximum entries
        if (history.length > MAX_HISTORY_ENTRIES) {
            history.splice(MAX_HISTORY_ENTRIES);
        }
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        
        console.log('Saved calculation to history:', historyEntry.id);
        return historyEntry;
        
    } catch (error) {
        console.error('Error saving to history:', error);
        return null;
    }
}

/**
 * Load history from localStorage
 * Requirements: 8.2 - Display a history of previous comparisons
 */
function loadHistory() {
    try {
        const historyJson = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (!historyJson) {
            return [];
        }
        
        const history = JSON.parse(historyJson);
        
        // Validate history structure
        if (!Array.isArray(history)) {
            console.warn('Invalid history format, resetting');
            return [];
        }
        
        // Filter out any invalid entries
        const validHistory = history.filter(entry => {
            return entry && 
                   entry.id && 
                   entry.timestamp && 
                   entry.target && 
                   entry.sample && 
                   typeof entry.deltaE === 'number';
        });
        
        console.log(`Loaded ${validHistory.length} history entries`);
        return validHistory;
        
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
}

/**
 * Display history in the UI
 * Requirements: 8.2, 8.3 - Display history with clickable entries to reload previous calculations
 */
function displayHistory() {
    const historyListElement = document.getElementById('history-list');
    if (!historyListElement) {
        console.error('History list element not found');
        return;
    }
    
    const history = loadHistory();
    
    if (history.length === 0) {
        historyListElement.innerHTML = '<div class="no-history">No previous comparisons</div>';
        return;
    }
    
    // Create history items HTML
    const historyHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="history-item" data-history-id="${entry.id}">
                <div class="history-header">
                    <span class="history-date">${formattedDate} ${formattedTime}</span>
                    <span class="history-delta-e ${entry.tolerance.zone}">ΔE: ${entry.deltaE.toFixed(2)}</span>
                </div>
                <div class="history-colors">
                    <div class="history-color-info">
                        <span class="color-label">Target:</span>
                        <span class="cmyk-preview">C:${entry.target.cmyk.c.toFixed(1)} M:${entry.target.cmyk.m.toFixed(1)} Y:${entry.target.cmyk.y.toFixed(1)} K:${entry.target.cmyk.k.toFixed(1)}</span>
                    </div>
                    <div class="history-color-info">
                        <span class="color-label">Sample:</span>
                        <span class="cmyk-preview">C:${entry.sample.cmyk.c.toFixed(1)} M:${entry.sample.cmyk.m.toFixed(1)} Y:${entry.sample.cmyk.y.toFixed(1)} K:${entry.sample.cmyk.k.toFixed(1)}</span>
                    </div>
                </div>
                ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
            </div>
        `;
    }).join('');
    
    historyListElement.innerHTML = historyHTML;
    
    // Add click event listeners to history items
    setupHistoryClickHandlers();
    
    console.log(`Displayed ${history.length} history entries`);
}

/**
 * Set up click handlers for history items
 * Requirements: 8.3 - Clickable entries to reload previous calculations
 */
function setupHistoryClickHandlers() {
    const historyItems = document.querySelectorAll('.history-item');
    
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            const historyId = this.getAttribute('data-history-id');
            loadHistoryEntry(historyId);
        });
        
        // Add visual feedback for clickable items
        item.style.cursor = 'pointer';
        item.setAttribute('title', 'Click to load this comparison');
    });
}

/**
 * Load a specific history entry and populate the form
 * Requirements: 8.3 - Populate all input fields with saved values
 */
function loadHistoryEntry(historyId) {
    try {
        const history = loadHistory();
        const entry = history.find(item => item.id === historyId);
        
        if (!entry) {
            console.error('History entry not found:', historyId);
            return;
        }
        
        // Populate target color inputs
        populateColorInputs('target', entry.target);
        
        // Populate sample color inputs
        populateColorInputs('sample', entry.sample);
        
        // Trigger input events to update validation and swatches
        triggerInputUpdates();
        
        // Scroll to top for better user experience
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('Loaded history entry:', historyId);
        
        // Show visual feedback
        showHistoryLoadedMessage(entry);
        
    } catch (error) {
        console.error('Error loading history entry:', error);
    }
}

/**
 * Populate color inputs with values from history entry
 */
function populateColorInputs(colorType, colorData) {
    // CMYK inputs
    const cInput = document.getElementById(`${colorType}-c`);
    const mInput = document.getElementById(`${colorType}-m`);
    const yInput = document.getElementById(`${colorType}-y`);
    const kInput = document.getElementById(`${colorType}-k`);
    
    // LAB inputs
    const lInput = document.getElementById(`${colorType}-l`);
    const aInput = document.getElementById(`${colorType}-a`);
    const bInput = document.getElementById(`${colorType}-b`);
    
    // Set CMYK values
    if (cInput) cInput.value = colorData.cmyk.c.toFixed(1);
    if (mInput) mInput.value = colorData.cmyk.m.toFixed(1);
    if (yInput) yInput.value = colorData.cmyk.y.toFixed(1);
    if (kInput) kInput.value = colorData.cmyk.k.toFixed(1);
    
    // Set LAB values
    if (lInput) lInput.value = colorData.lab.l.toFixed(2);
    if (aInput) aInput.value = colorData.lab.a.toFixed(2);
    if (bInput) bInput.value = colorData.lab.b.toFixed(2);
}

/**
 * Trigger input events to update validation and color swatches
 */
function triggerInputUpdates() {
    const allInputs = [
        'target-c', 'target-m', 'target-y', 'target-k',
        'target-l', 'target-a', 'target-b',
        'sample-c', 'sample-m', 'sample-y', 'sample-k',
        'sample-l', 'sample-a', 'sample-b'
    ];
    
    allInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

/**
 * Show message when history entry is loaded
 */
function showHistoryLoadedMessage(entry) {
    // Create temporary message element
    const message = document.createElement('div');
    message.className = 'history-loaded-message';
    message.innerHTML = `
        <span class="message-icon">↻</span>
        <span class="message-text">Loaded comparison from ${new Date(entry.timestamp).toLocaleDateString()}</span>
    `;
    
    // Insert at top of page
    const container = document.querySelector('.calculator-container');
    if (container) {
        container.insertBefore(message, container.firstChild);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

/**
 * Clear all history entries
 * Requirements: 8.4 - Allow users to clear history and manage stored comparisons
 */
function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        console.log('History cleared');
        
        // Refresh the history display
        displayHistory();
        
        // Show confirmation message
        showHistoryClearedMessage();
        
        return true;
        
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
}

/**
 * Show confirmation message when history is cleared
 */
function showHistoryClearedMessage() {
    const message = document.createElement('div');
    message.className = 'history-cleared-message';
    message.innerHTML = `
        <span class="message-icon">✓</span>
        <span class="message-text">History cleared successfully</span>
    `;
    
    const container = document.querySelector('.calculator-container');
    if (container) {
        container.insertBefore(message, container.firstChild);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }
}

/**
 * Get history statistics
 * Requirements: 8.4 - History management functionality
 */
function getHistoryStats() {
    const history = loadHistory();
    
    return {
        totalEntries: history.length,
        maxEntries: MAX_HISTORY_ENTRIES,
        oldestEntry: history.length > 0 ? history[history.length - 1].timestamp : null,
        newestEntry: history.length > 0 ? history[0].timestamp : null,
        storageUsed: JSON.stringify(history).length
    };
}

/**
 * Export history to JSON format
 * Utility function for advanced users
 */
function exportHistory() {
    try {
        const history = loadHistory();
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            entries: history
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `color-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('History exported successfully');
        return true;
        
    } catch (error) {
        console.error('Error exporting history:', error);
        return false;
    }
}

/**
 * Initialize storage module
 * Set up event listeners and load initial history
 */
function initializeStorage() {
    console.log('Initializing storage module...');
    
    // Set up clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                clearHistory();
            }
        });
    }
    
    // Load and display initial history
    displayHistory();
    
    // Initialize PWA storage features
    initializePWAStorage();
    
    // Log storage statistics
    const stats = getHistoryStats();
    console.log('Storage initialized:', stats);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other modules are loaded
    setTimeout(initializeStorage, 100);
});

/**
 * PWA Offline Storage Functions
 * Requirements: 10.3 - Implement offline storage for core calculation functions
 */

/**
 * Save calculation data for offline use
 * Stores essential calculation functions and data when offline
 */
function saveOfflineCalculation(calculationData) {
    try {
        if (!navigator.onLine) {
            console.log('Saving calculation for offline sync...');
            
            const offlineData = loadOfflineCalculations();
            const offlineEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                data: calculationData,
                synced: false
            };
            
            offlineData.push(offlineEntry);
            localStorage.setItem(STORAGE_KEYS.OFFLINE_CALCULATIONS, JSON.stringify(offlineData));
            
            console.log('Offline calculation saved:', offlineEntry.id);
            return offlineEntry;
        }
        
        return null;
    } catch (error) {
        console.error('Error saving offline calculation:', error);
        return null;
    }
}

/**
 * Load offline calculations
 */
function loadOfflineCalculations() {
    try {
        const offlineJson = localStorage.getItem(STORAGE_KEYS.OFFLINE_CALCULATIONS);
        return offlineJson ? JSON.parse(offlineJson) : [];
    } catch (error) {
        console.error('Error loading offline calculations:', error);
        return [];
    }
}

/**
 * Clear synced offline calculations
 */
function clearSyncedOfflineCalculations() {
    try {
        const offlineData = loadOfflineCalculations();
        const unsyncedData = offlineData.filter(item => !item.synced);
        localStorage.setItem(STORAGE_KEYS.OFFLINE_CALCULATIONS, JSON.stringify(unsyncedData));
        
        console.log('Cleared synced offline calculations');
        return true;
    } catch (error) {
        console.error('Error clearing synced offline calculations:', error);
        return false;
    }
}

/**
 * Cache core calculation functions for offline use
 * Requirements: 10.3 - Offline storage for core calculation functions
 */
function cacheCalculationFunctions() {
    try {
        // Cache essential color science functions as strings for offline use
        const coreFunctions = {
            cmykToRgb: window.colorScience?.cmykToRgb?.toString(),
            labToRgb: window.colorScience?.labToRgb?.toString(),
            calculateDeltaE: window.colorScience?.calculateDeltaE?.toString(),
            calculateComponentDeltas: window.colorScience?.calculateComponentDeltas?.toString(),
            getToleranceZone: window.colorScience?.getToleranceZone?.toString(),
            generateCMYKSuggestions: window.colorScience?.generateCMYKSuggestions?.toString()
        };
        
        // Only cache if functions are available
        const validFunctions = Object.keys(coreFunctions).filter(key => coreFunctions[key]);
        
        if (validFunctions.length > 0) {
            localStorage.setItem('cachedCalculationFunctions', JSON.stringify(coreFunctions));
            console.log('Cached calculation functions for offline use:', validFunctions);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error caching calculation functions:', error);
        return false;
    }
}

/**
 * Load cached calculation functions for offline use
 */
function loadCachedCalculationFunctions() {
    try {
        const cachedFunctions = localStorage.getItem('cachedCalculationFunctions');
        if (cachedFunctions) {
            const functions = JSON.parse(cachedFunctions);
            console.log('Loaded cached calculation functions for offline use');
            return functions;
        }
        return null;
    } catch (error) {
        console.error('Error loading cached calculation functions:', error);
        return null;
    }
}

/**
 * PWA Settings Management
 * Requirements: 10.4 - Maintain consistent results across different devices
 */
function savePWASettings(settings) {
    try {
        const currentSettings = loadPWASettings();
        const updatedSettings = { ...currentSettings, ...settings };
        
        localStorage.setItem(STORAGE_KEYS.PWA_SETTINGS, JSON.stringify(updatedSettings));
        console.log('PWA settings saved:', Object.keys(settings));
        return true;
    } catch (error) {
        console.error('Error saving PWA settings:', error);
        return false;
    }
}

/**
 * Load PWA settings
 */
function loadPWASettings() {
    try {
        const settingsJson = localStorage.getItem(STORAGE_KEYS.PWA_SETTINGS);
        const defaultSettings = {
            offlineMode: true,
            autoSync: true,
            cacheCalculations: true,
            notificationsEnabled: false,
            theme: 'auto',
            lastSyncTime: null
        };
        
        if (settingsJson) {
            return { ...defaultSettings, ...JSON.parse(settingsJson) };
        }
        
        return defaultSettings;
    } catch (error) {
        console.error('Error loading PWA settings:', error);
        return {
            offlineMode: true,
            autoSync: true,
            cacheCalculations: true,
            notificationsEnabled: false,
            theme: 'auto',
            lastSyncTime: null
        };
    }
}

/**
 * Check storage quota and manage space
 * Requirements: 10.3 - Efficient offline storage management
 */
function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        return navigator.storage.estimate().then(estimate => {
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
            
            console.log(`Storage usage: ${(usage / 1024 / 1024).toFixed(2)} MB of ${(quota / 1024 / 1024).toFixed(2)} MB (${percentUsed.toFixed(1)}%)`);
            
            // Warn if storage is getting full
            if (percentUsed > 80) {
                console.warn('Storage quota is getting full, consider clearing old data');
                return { usage, quota, percentUsed, warning: true };
            }
            
            return { usage, quota, percentUsed, warning: false };
        });
    } else {
        // Fallback for browsers without storage API
        return Promise.resolve({ 
            usage: 0, 
            quota: 0, 
            percentUsed: 0, 
            warning: false,
            unsupported: true 
        });
    }
}

/**
 * Clean up old offline data to free space
 */
function cleanupOfflineData() {
    try {
        const history = loadHistory();
        const offlineCalculations = loadOfflineCalculations();
        
        // Remove history entries older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentHistory = history.filter(entry => {
            return new Date(entry.timestamp) > thirtyDaysAgo;
        });
        
        // Remove synced offline calculations older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentOfflineCalculations = offlineCalculations.filter(entry => {
            return !entry.synced || new Date(entry.timestamp) > sevenDaysAgo;
        });
        
        // Save cleaned data
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(recentHistory));
        localStorage.setItem(STORAGE_KEYS.OFFLINE_CALCULATIONS, JSON.stringify(recentOfflineCalculations));
        
        const removedHistory = history.length - recentHistory.length;
        const removedOffline = offlineCalculations.length - recentOfflineCalculations.length;
        
        console.log(`Cleanup complete: Removed ${removedHistory} old history entries and ${removedOffline} old offline calculations`);
        
        return {
            removedHistory,
            removedOffline,
            remainingHistory: recentHistory.length,
            remainingOffline: recentOfflineCalculations.length
        };
        
    } catch (error) {
        console.error('Error during cleanup:', error);
        return null;
    }
}

/**
 * Initialize PWA storage features
 * Requirements: 10.1, 10.2, 10.3 - PWA initialization
 */
function initializePWAStorage() {
    console.log('Initializing PWA storage features...');
    
    // Load PWA settings
    const pwaSettings = loadPWASettings();
    console.log('PWA settings loaded:', pwaSettings);
    
    // Cache calculation functions if enabled
    if (pwaSettings.cacheCalculations) {
        // Wait for color science module to load
        setTimeout(() => {
            cacheCalculationFunctions();
        }, 1000);
    }
    
    // Check storage quota
    checkStorageQuota().then(quota => {
        if (quota.warning) {
            console.warn('Storage quota warning - consider cleanup');
            // Automatically cleanup if very full
            if (quota.percentUsed > 90) {
                cleanupOfflineData();
            }
        }
    });
    
    // Set up periodic cleanup (every 24 hours)
    const lastCleanup = localStorage.getItem('lastCleanupTime');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (!lastCleanup || (now - parseInt(lastCleanup)) > twentyFourHours) {
        cleanupOfflineData();
        localStorage.setItem('lastCleanupTime', now.toString());
    }
    
    console.log('PWA storage initialization complete');
}

// Export functions for use by other modules
window.colorStorage = {
    saveToHistory,
    loadHistory,
    displayHistory,
    loadHistoryEntry,
    clearHistory,
    getHistoryStats,
    exportHistory,
    
    // PWA offline storage functions
    saveOfflineCalculation,
    loadOfflineCalculations,
    clearSyncedOfflineCalculations,
    cacheCalculationFunctions,
    loadCachedCalculationFunctions,
    savePWASettings,
    loadPWASettings,
    checkStorageQuota,
    cleanupOfflineData,
    initializePWAStorage
};

console.log('Storage module loaded successfully');