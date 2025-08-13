// LAB Color Matching Calculator - Main Application Logic
// Following the simple vanilla JS approach from our design spec

// Global application state as specified in design.md
const appState = {
    target: { 
        cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
        lab: { l: 50, a: 0, b: 0 } 
    },
    sample: { 
        cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
        lab: { l: 50, a: 0, b: 0 } 
    },
    results: null,
    history: [],
    isCalculating: false,
    lastCalculationTime: 0
};

// Enhanced UI state for sticky status bar
const uiEnhancementState = {
    statusBar: {
        visible: false,
        content: {
            deltaE: null,
            status: 'ready', // 'ready', 'calculating', 'complete', 'error'
            quickActions: ['reset', 'calculate', 'export']
        }
    }
};

// Scroll state management for sticky status bar
const scrollState = {
    lastScrollY: 0,
    scrollDirection: 'down',
    statusBarThreshold: 100,
    isStatusBarVisible: false
};

// Performance optimization: Debounce configuration
const DEBOUNCE_CONFIG = {
    INPUT_DELAY: 300,        // 300ms delay for input updates
    SWATCH_DELAY: 100,       // 100ms delay for swatch updates (faster for real-time feel)
    CALCULATION_DELAY: 500   // 500ms delay for auto-calculations
};

// Enhanced real-time preview state
const previewState = {
    updateTimeouts: new Map(),
    isUpdating: false,
    lastUpdateTime: 0,
    animationFrameId: null
};

// Performance optimization: Cached calculations
const calculationCache = new Map();
const MAX_CACHE_SIZE = 100;

// Enhanced Tooltip System
class TooltipManager {
    constructor() {
        this.tooltips = [];
        this.activeTooltip = null;
        this.repositionTimeout = null;
        this.init();
    }

    init() {
        console.log('Initializing enhanced tooltip system...');
        
        // Find all tooltip elements
        this.tooltips = document.querySelectorAll('.tooltip-enhanced');
        console.log(`Found ${this.tooltips.length} tooltip elements`);
        
        // Add event listeners for positioning
        this.tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', (e) => this.handleTooltipShow(e));
            tooltip.addEventListener('focus', (e) => this.handleTooltipShow(e));
            tooltip.addEventListener('mouseleave', (e) => this.handleTooltipHide(e));
            tooltip.addEventListener('blur', (e) => this.handleTooltipHide(e));
            
            // Add keyboard support
            tooltip.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.handleTooltipHide(e);
                    tooltip.blur();
                }
            });
        });

        // Handle window resize and scroll for repositioning
        window.addEventListener('resize', () => this.repositionAllTooltips());
        window.addEventListener('scroll', () => this.repositionAllTooltips());
        
        console.log('Enhanced tooltip system initialized');
    }

    setupTooltipAccessibility(tooltip) {
        // Set up ARIA attributes for screen readers
        const tooltipContent = tooltip.getAttribute('data-tooltip');
        const tooltipId = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        tooltip.setAttribute('aria-describedby', tooltipId);
        tooltip.setAttribute('aria-expanded', 'true');
        
        // Create hidden element for screen readers
        if (!tooltip.querySelector('.sr-only-tooltip')) {
            const srElement = document.createElement('span');
            srElement.className = 'sr-only-tooltip sr-only';
            srElement.id = tooltipId;
            srElement.textContent = tooltipContent.replace(/&#10;/g, ' ');
            tooltip.appendChild(srElement);
        }
    }

    handleTooltipShow(event) {
        const tooltip = event.target;
        this.activeTooltip = tooltip;
        
        // Add active class for styling
        tooltip.classList.add('tooltip-active');
        
        // Set up accessibility attributes
        this.setupTooltipAccessibility(tooltip);
        
        // Position tooltip after a small delay to ensure proper rendering
        setTimeout(() => {
            this.positionTooltip(tooltip);
        }, 10);
        
        // Track tooltip interaction for analytics
        this.trackTooltipInteraction(tooltip);
    }

    handleTooltipHide(event) {
        const tooltip = event.target;
        
        // Remove active class
        tooltip.classList.remove('tooltip-active');
        
        // Clean up accessibility attributes
        this.cleanupTooltipAccessibility(tooltip);
        
        // Reset positioning
        this.resetTooltipPosition(tooltip);
        
        if (this.activeTooltip === tooltip) {
            this.activeTooltip = null;
        }
    }

    cleanupTooltipAccessibility(tooltip) {
        // Clean up ARIA attributes
        tooltip.setAttribute('aria-expanded', 'false');
        
        // Remove screen reader element
        const srElement = tooltip.querySelector('.sr-only-tooltip');
        if (srElement) {
            srElement.remove();
        }
        
        // Remove aria-describedby if no other tooltips are active
        if (!this.activeTooltip || this.activeTooltip === tooltip) {
            tooltip.removeAttribute('aria-describedby');
        }
    }

    positionTooltip(tooltip) {
        // Reset any existing positioning classes
        this.resetTooltipPosition(tooltip);

        // Get tooltip and viewport dimensions
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Estimated tooltip dimensions (based on CSS)
        const tooltipWidth = Math.min(320, viewportWidth - 40); // Responsive width
        const tooltipHeight = 150; // Approximate height with padding
        const margin = 20;

        // Check horizontal positioning
        const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        const tooltipRight = tooltipLeft + tooltipWidth;

        if (tooltipLeft < margin) {
            // Too far left, align to left edge
            tooltip.classList.add('tooltip-left');
        } else if (tooltipRight > viewportWidth - margin) {
            // Too far right, align to right edge
            tooltip.classList.add('tooltip-right');
        }

        // Check vertical positioning
        const tooltipTop = rect.top + scrollY - tooltipHeight - 20; // 20px margin
        const tooltipBottom = rect.bottom + scrollY + tooltipHeight + 20;
        
        if (tooltipTop < scrollY + margin) {
            // Not enough space above, show below
            tooltip.classList.add('tooltip-bottom');
        } else if (tooltipBottom > scrollY + viewportHeight - margin) {
            // Not enough space below, show above (default)
            tooltip.classList.add('tooltip-top');
        }

        // For mobile devices, ensure tooltips are properly sized
        if (viewportWidth <= 768) {
            tooltip.classList.add('tooltip-mobile');
            // On mobile, center horizontally and adjust positioning
            tooltip.classList.remove('tooltip-left', 'tooltip-right');
        }

        // Add positioning class for enhanced styling
        tooltip.classList.add('tooltip-positioned');
    }

    resetTooltipPosition(tooltip) {
        tooltip.classList.remove(
            'tooltip-left', 
            'tooltip-right', 
            'tooltip-top', 
            'tooltip-bottom',
            'tooltip-mobile',
            'tooltip-positioned'
        );
    }

    repositionAllTooltips() {
        // Debounce repositioning to avoid excessive calculations
        clearTimeout(this.repositionTimeout);
        this.repositionTimeout = setTimeout(() => {
            if (this.activeTooltip) {
                this.positionTooltip(this.activeTooltip);
            }
        }, 100);
    }

    trackTooltipInteraction(tooltip) {
        // Track which tooltips are being used for analytics
        const tooltipContent = tooltip.getAttribute('data-tooltip');
        if (tooltipContent) {
            console.log('Tooltip interaction:', tooltipContent.substring(0, 50) + '...');
        }
    }

    // Method to update tooltip content dynamically
    updateTooltipContent(element, newContent) {
        if (element && element.classList.contains('tooltip-enhanced')) {
            element.setAttribute('data-tooltip', newContent);
        }
    }

    // Method to temporarily disable tooltips (useful during calculations)
    disableTooltips() {
        this.tooltips.forEach(tooltip => {
            tooltip.classList.add('tooltip-disabled');
        });
    }

    // Method to re-enable tooltips
    enableTooltips() {
        this.tooltips.forEach(tooltip => {
            tooltip.classList.remove('tooltip-disabled');
        });
    }
}

// Initialize tooltip manager
let tooltipManager;

// Error handling: Error state tracking
const errorState = {
    hasErrors: false,
    lastError: null,
    errorCount: 0,
    maxRetries: 3,
    retryDelay: 1000
};

// Performance optimization: Loading states
const loadingState = {
    isCalculating: false,
    isUpdatingSwatches: false,
    isExporting: false,
    operationStartTime: null
};

// Input validation configuration
const VALIDATION_RULES = {
    cmyk: { min: 0, max: 100 },
    lab_l: { min: 0, max: 100 },
    lab_ab: { min: -128, max: 127 }
};

// DOM Elements - Cache for performance
let domElements = {};

// Performance optimization: Debounce timers
let debounceTimers = {
    inputUpdate: null,
    swatchUpdate: null,
    autoCalculation: null
};

// Preset CMYK colors for common printing colors
// Requirements: 8.4 - Preset CMYK colors for common spot colors and brand colors
const PRESET_COLORS = {
    // Process Colors
    'Process Cyan': { c: 100, m: 0, y: 0, k: 0 },
    'Process Magenta': { c: 0, m: 100, y: 0, k: 0 },
    'Process Yellow': { c: 0, m: 0, y: 100, k: 0 },
    'Process Black': { c: 0, m: 0, y: 0, k: 100 },
    
    // Common Spot Colors (Pantone approximations)
    'Pantone Red 032': { c: 0, m: 91, y: 76, k: 0 },
    'Pantone Blue 072': { c: 100, m: 72, y: 0, k: 12 },
    'Pantone Green 354': { c: 91, m: 0, y: 86, k: 0 },
    'Pantone Orange 021': { c: 0, m: 63, y: 95, k: 0 },
    'Pantone Purple 2685': { c: 76, m: 100, y: 0, k: 0 },
    'Pantone Warm Gray 8': { c: 31, m: 39, y: 42, k: 1 },
    
    // Brand Colors (Generic examples)
    'Corporate Blue': { c: 85, m: 50, y: 0, k: 0 },
    'Corporate Red': { c: 15, m: 100, y: 90, k: 10 },
    'Corporate Green': { c: 75, m: 0, y: 100, k: 0 },
    'Corporate Gray': { c: 0, m: 0, y: 0, k: 50 },
    
    // Common Print Colors
    'Rich Black': { c: 30, m: 30, y: 30, k: 100 },
    'Warm Black': { c: 0, m: 25, y: 25, k: 100 },
    'Cool Black': { c: 25, m: 0, y: 0, k: 100 },
    'Paper White': { c: 0, m: 0, y: 0, k: 0 },
    
    // Skin Tones
    'Light Skin': { c: 15, m: 25, y: 35, k: 0 },
    'Medium Skin': { c: 25, m: 40, y: 65, k: 5 },
    'Dark Skin': { c: 45, m: 70, y: 80, k: 25 },
    
    // Common Printing Challenges
    'Difficult Red': { c: 5, m: 95, y: 85, k: 0 },
    'Difficult Blue': { c: 95, m: 85, y: 5, k: 0 },
    'Difficult Green': { c: 85, m: 5, y: 95, k: 0 }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Enhanced Sticky Status Bar Functionality
function initializeStickyStatusBar() {
    console.log('Initializing sticky status bar...');
    
    // Set up accessibility attributes
    setupStatusBarAccessibility();
    
    // Set up scroll detection
    setupScrollDetection();
    
    // Set up status bar event listeners
    setupStatusBarEventListeners();
    
    // Initialize status bar content
    updateStatusBarContent();
    
    console.log('Sticky status bar initialized');
}

// Set up accessibility attributes for status bar
function setupStatusBarAccessibility() {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.setAttribute('role', 'banner');
        statusBar.setAttribute('aria-label', 'Calculator status and quick actions');
        statusBar.setAttribute('aria-live', 'polite');
        statusBar.setAttribute('aria-atomic', 'true');
    }
    
    // Set up ARIA labels for status bar elements
    const statusValue = document.getElementById('status-value');
    if (statusValue) {
        statusValue.setAttribute('aria-label', 'Current calculation status');
        statusValue.setAttribute('role', 'status');
    }
    
    const deltaValue = document.getElementById('status-delta-value');
    if (deltaValue) {
        deltaValue.setAttribute('aria-label', 'Current Delta E color difference value');
        deltaValue.setAttribute('role', 'status');
    }
    
    // Set up ARIA labels for action buttons
    const statusCalculateBtn = document.getElementById('status-calculate-btn');
    if (statusCalculateBtn) {
        statusCalculateBtn.setAttribute('aria-label', 'Calculate color difference between target and sample');
        statusCalculateBtn.setAttribute('role', 'button');
    }
    
    const statusResetBtn = document.getElementById('status-reset-btn');
    if (statusResetBtn) {
        statusResetBtn.setAttribute('aria-label', 'Reset all color inputs and calculations');
        statusResetBtn.setAttribute('role', 'button');
    }
    
    const statusExportBtn = document.getElementById('status-export-btn');
    if (statusExportBtn) {
        statusExportBtn.setAttribute('aria-label', 'Export calculation results to file');
        statusExportBtn.setAttribute('role', 'button');
    }
}

// Set up scroll detection for status bar visibility
function setupScrollDetection() {
    let ticking = false;
    let lastKnownScrollPosition = 0;
    
    function updateScrollState() {
        const currentScrollY = window.scrollY;
        
        // Performance optimization: only update if scroll position changed significantly
        if (Math.abs(currentScrollY - lastKnownScrollPosition) < 5) {
            ticking = false;
            return;
        }
        
        const scrollDirection = currentScrollY > scrollState.lastScrollY ? 'down' : 'up';
        const shouldShowStatusBar = currentScrollY > scrollState.statusBarThreshold;
        
        scrollState.lastScrollY = currentScrollY;
        scrollState.scrollDirection = scrollDirection;
        lastKnownScrollPosition = currentScrollY;
        
        // Update status bar visibility with performance optimization
        if (shouldShowStatusBar !== scrollState.isStatusBarVisible) {
            scrollState.isStatusBarVisible = shouldShowStatusBar;
            // Use requestAnimationFrame for smooth transitions
            requestAnimationFrame(() => {
                toggleStatusBarVisibility(shouldShowStatusBar);
            });
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }
    
    // Add scroll event listener with throttling and passive flag for performance
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    
    // Initial check
    updateScrollState();
}

// Toggle status bar visibility
function toggleStatusBarVisibility(show) {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return;
    
    if (show) {
        statusBar.classList.add('visible');
        uiEnhancementState.statusBar.visible = true;
    } else {
        statusBar.classList.remove('visible');
        uiEnhancementState.statusBar.visible = false;
    }
}

// Set up status bar event listeners
function setupStatusBarEventListeners() {
    // Calculate button in status bar
    const statusCalculateBtn = document.getElementById('status-calculate-btn');
    if (statusCalculateBtn) {
        statusCalculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performColorDifferenceCalculation();
        });
    }
    
    // Reset button in status bar
    const statusResetBtn = document.getElementById('status-reset-btn');
    if (statusResetBtn) {
        statusResetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Reset all inputs to default values?')) {
                resetAllInputs();
            }
        });
    }
    
    // Export button in status bar
    const statusExportBtn = document.getElementById('status-export-btn');
    if (statusExportBtn) {
        statusExportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.colorExport && appState.results) {
                // Show export options
                showExportOptions();
            }
        });
    }
}

// Show export options when status bar export button is clicked
function showExportOptions() {
    const exportModal = document.createElement('div');
    exportModal.className = 'export-options-modal';
    exportModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Export Options</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <button class="export-option-btn" onclick="exportToCSV(); this.closest('.export-options-modal').remove();">
                        <span class="export-icon">📊</span>
                        <span class="export-label">Export to CSV</span>
                        <span class="export-description">Spreadsheet format for data analysis</span>
                    </button>
                    <button class="export-option-btn" onclick="exportToPDF(); this.closest('.export-options-modal').remove();">
                        <span class="export-icon">📄</span>
                        <span class="export-label">Export to PDF</span>
                        <span class="export-description">Professional report format</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(exportModal);
}

// Export functions for status bar
function exportToCSV() {
    if (window.colorExport && appState.results) {
        window.colorExport.exportToCSV();
    }
}

function exportToPDF() {
    if (window.colorExport && appState.results) {
        window.colorExport.exportToPDF();
    }
}

// Update status bar content based on current application state
function updateStatusBarContent() {
    const statusValue = document.getElementById('status-value');
    const deltaValue = document.getElementById('status-delta-value');
    const exportBtn = document.getElementById('status-export-btn');
    
    if (!statusValue || !deltaValue || !exportBtn) return;
    
    // Update status
    const status = uiEnhancementState.statusBar.content.status;
    statusValue.textContent = getStatusDisplayText(status);
    statusValue.className = `status-value ${status}`;
    
    // Update Delta E value
    if (appState.results && appState.results.deltaE !== null) {
        const deltaE = appState.results.deltaE;
        deltaValue.textContent = deltaE.toFixed(2);
        
        // Apply tolerance zone styling
        const toleranceZone = getToleranceZone(deltaE);
        deltaValue.className = `delta-value ${toleranceZone}`;
        
        // Enable export button
        exportBtn.disabled = false;
    } else {
        deltaValue.textContent = '--';
        deltaValue.className = 'delta-value';
        exportBtn.disabled = true;
    }
}

// Get display text for status
function getStatusDisplayText(status) {
    switch (status) {
        case 'ready': return 'Ready';
        case 'calculating': return 'Calculating...';
        case 'complete': return 'Complete';
        case 'error': return 'Error';
        default: return 'Ready';
    }
}

// Get tolerance zone for Delta E value
function getToleranceZone(deltaE) {
    if (deltaE <= 0.5) return 'excellent';  // Gold accent for exceptional results
    if (deltaE <= 1.0) return 'good';
    if (deltaE <= 3.0) return 'acceptable';
    return 'poor';
}

// Update status bar when calculation starts
function setCalculatingStatus() {
    uiEnhancementState.statusBar.content.status = 'calculating';
    updateStatusBarContent();
}

// Update status bar when calculation completes
function setCompleteStatus() {
    uiEnhancementState.statusBar.content.status = 'complete';
    updateStatusBarContent();
}

// Update status bar when calculation errors
function setErrorStatus() {
    uiEnhancementState.statusBar.content.status = 'error';
    updateStatusBarContent();
}

// Update status bar when inputs are reset
function setReadyStatus() {
    uiEnhancementState.statusBar.content.status = 'ready';
    uiEnhancementState.statusBar.content.deltaE = null;
    updateStatusBarContent();
}

// Final Integration and Polish - Keyboard Shortcuts
// Requirements: Add keyboard shortcuts for power users (Enter to calculate, etc.)
document.addEventListener('keydown', function(e) {
    // Prevent shortcuts when user is typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        // Allow Enter key in input fields to trigger calculation
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
            performColorDifferenceCalculation();
            return;
        }
        return;
    }
    
    // Global keyboard shortcuts
    switch (e.key.toLowerCase()) {
        case 'enter':
        case ' ': // Spacebar
            e.preventDefault();
            performColorDifferenceCalculation();
            break;
            
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                resetAllInputs();
            }
            break;
            
        case 'e':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.shiftKey) {
                    // Ctrl+Shift+E for PDF export
                    if (window.colorExport && appState.results) {
                        window.colorExport.exportToPDF();
                    }
                } else {
                    // Ctrl+E for CSV export
                    if (window.colorExport && appState.results) {
                        window.colorExport.exportToCSV();
                    }
                }
            }
            break;
            
        case 'h':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                showKeyboardShortcutsHelp();
            }
            break;
            
        case 'escape':
            e.preventDefault();
            hideKeyboardShortcutsHelp();
            break;
            
        case '1':
            if (e.altKey) {
                e.preventDefault();
                focusColorSection('target');
            }
            break;
            
        case '2':
            if (e.altKey) {
                e.preventDefault();
                focusColorSection('sample');
            }
            break;
            
        case 'c':
            if (e.ctrlKey || e.metaKey) {
                if (e.shiftKey) {
                    e.preventDefault();
                    copyCurrentCalculationToClipboard();
                }
            }
            break;
    }
});

// Focus management for keyboard navigation
function focusColorSection(colorType) {
    const firstInput = document.getElementById(`${colorType}-c`);
    if (firstInput) {
        firstInput.focus();
        firstInput.select();
    }
}

// Copy current calculation to clipboard
function copyCurrentCalculationToClipboard() {
    if (!appState.results) {
        showStatusMessage('No calculation results to copy', 'info');
        return;
    }
    
    const colorValues = getCurrentColorValues();
    const copyText = `LAB Color Analysis:
Target: C${colorValues.target.cmyk.c}% M${colorValues.target.cmyk.m}% Y${colorValues.target.cmyk.y}% K${colorValues.target.cmyk.k}%
Sample: C${colorValues.sample.cmyk.c}% M${colorValues.sample.cmyk.m}% Y${colorValues.sample.cmyk.y}% K${colorValues.sample.cmyk.k}%
ΔE*ab: ${appState.results.deltaE.toFixed(2)} (${appState.results.tolerance.zone})`;
    
    navigator.clipboard.writeText(copyText).then(() => {
        showStatusMessage('Calculation copied to clipboard', 'success');
    }).catch(() => {
        showStatusMessage('Failed to copy to clipboard', 'error');
    });
}

// Show keyboard shortcuts help
function showKeyboardShortcutsHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'keyboard-shortcuts-modal';
    helpModal.innerHTML = `
        <div class="modal-overlay" onclick="hideKeyboardShortcutsHelp()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Keyboard Shortcuts</h3>
                <button class="modal-close" onclick="hideKeyboardShortcutsHelp()">×</button>
            </div>
            <div class="modal-body">
                <div class="shortcut-group">
                    <h4>Calculation</h4>
                    <div class="shortcut-item">
                        <kbd>Enter</kbd> or <kbd>Space</kbd>
                        <span>Calculate color difference</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>R</kbd>
                        <span>Reset all inputs</span>
                    </div>
                </div>
                
                <div class="shortcut-group">
                    <h4>Export</h4>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>E</kbd>
                        <span>Export to CSV</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd>
                        <span>Export to PDF</span>
                    </div>
                </div>
                
                <div class="shortcut-group">
                    <h4>Navigation</h4>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>1</kbd>
                        <span>Focus target color inputs</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>2</kbd>
                        <span>Focus sample color inputs</span>
                    </div>
                </div>
                
                <div class="shortcut-group">
                    <h4>Other</h4>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
                        <span>Copy calculation to clipboard</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>H</kbd>
                        <span>Show this help</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Escape</kbd>
                        <span>Close help or dialogs</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Focus the modal for accessibility
    const modalContent = helpModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.focus();
    }
}

// Hide keyboard shortcuts help
function hideKeyboardShortcutsHelp() {
    const modal = document.querySelector('.keyboard-shortcuts-modal');
    if (modal) {
        modal.remove();
    }
}

function initializeApp() {
    console.log('Initializing LAB Color Matching Calculator...');
    
    // Initialize accessibility features first
    initializeAccessibilityFeatures();
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Initialize enhanced sticky status bar
    initializeStickyStatusBar();
    
    // Set up event listeners for input validation
    setupInputValidation();
    
    // Set up calculate button event listener
    setupCalculateButton();
    
    // Set up keyboard navigation
    setupKeyboardNavigation();
    
    // Initialize default values
    initializeDefaultValues();
    
    // Initialize preset colors and workflow enhancements
    initializePresetColors();
    setupWorkflowEnhancements();
    
    // Wait for color science module to load, then update swatches
    waitForColorScienceAndInitialize();
    
    // Initialize final integration features
    initializeFinalIntegration();
    
    // Initialize G7 integration
    initializeG7Integration();
    
    // Initialize enhanced tooltip system
    tooltipManager = new TooltipManager();
    
    console.log('Application initialized successfully');
}

// Final Integration and Polish - Reset All Functionality
function resetAllInputs() {
    // Reset all CMYK inputs
    const cmykInputs = ['target-c', 'target-m', 'target-y', 'target-k', 'sample-c', 'sample-m', 'sample-y', 'sample-k'];
    cmykInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
            input.classList.remove('valid', 'invalid');
        }
    });
    
    // Reset LAB inputs to defaults
    const labDefaults = {
        'target-l': '50', 'target-a': '0', 'target-b': '0',
        'sample-l': '50', 'sample-a': '0', 'sample-b': '0'
    };
    
    Object.keys(labDefaults).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = labDefaults[inputId];
            input.classList.remove('valid', 'invalid');
        }
    });
    
    // Reset application state
    appState.target = { 
        cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
        lab: { l: 50, a: 0, b: 0 } 
    };
    appState.sample = { 
        cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
        lab: { l: 50, a: 0, b: 0 } 
    };
    appState.results = null;
    
    // Update status bar to ready state
    setReadyStatus();
    
    // Reset color swatches
    initializeColorSwatches();
    
    // Hide results section
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.remove('visible');
        resultsSection.style.display = 'none';
    }
    
    // Reset delta values
    resetDeltaDisplay();
    
    // Clear any validation errors
    clearAllValidationErrors();
    
    // Reset preset selections
    const presetSelects = document.querySelectorAll('.preset-select');
    presetSelects.forEach(select => {
        select.value = '';
    });
    
    // Update export button states
    if (window.colorExport) {
        window.colorExport.updateExportButtonStates();
    }
    
    // Show confirmation message
    showStatusMessage('All inputs reset to defaults', 'success');
    
    console.log('All inputs reset successfully');
}

// Reset delta display values
function resetDeltaDisplay() {
    const deltaElements = ['delta-l', 'delta-a', 'delta-b', 'delta-c', 'delta-h'];
    deltaElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '--';
            element.classList.remove('significant-delta');
        }
    });
}

// Clear all validation errors
function clearAllValidationErrors() {
    const errorElements = document.querySelectorAll('.validation-error');
    errorElements.forEach(error => error.remove());
    
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(input => {
        input.classList.remove('error', 'valid', 'invalid');
    });
}

// Status message system for user feedback
function showStatusMessage(message, type = 'info', duration = 3000) {
    // Remove existing status messages
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new status message
    const statusMessage = document.createElement('div');
    statusMessage.className = `status-message ${type}`;
    statusMessage.innerHTML = `
        <div class="status-content">
            <span class="status-icon">${getStatusIcon(type)}</span>
            <span class="status-text">${message}</span>
            <button class="status-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(statusMessage);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (statusMessage.parentElement) {
            statusMessage.remove();
        }
    }, duration);
    
    // Add entrance animation
    setTimeout(() => {
        statusMessage.classList.add('visible');
    }, 10);
}

// Get appropriate icon for status type
function getStatusIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '⚠';
        case 'warning': return '⚠';
        case 'info': return 'ℹ';
        default: return 'ℹ';
    }
}

// Initialize final integration features
function initializeFinalIntegration() {
    console.log('Initializing final integration features...');
    
    // Set up reset all button
    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Reset all inputs to default values? This will clear your current work.')) {
                resetAllInputs();
            }
        });
        console.log('Reset all button initialized');
    }
    
    // Add keyboard shortcut indicator to buttons
    addKeyboardShortcutIndicators();
    
    // Initialize workflow validation
    initializeWorkflowValidation();
    
    // Add professional finishing touches
    addProfessionalFinishingTouches();
    
    // Initialize cross-browser compatibility checks
    initializeBrowserCompatibility();
    
    console.log('Final integration features initialized');
}

// Add keyboard shortcut indicators to buttons
function addKeyboardShortcutIndicators() {
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.setAttribute('title', calculateBtn.getAttribute('title') + ' (Enter or Space)');
    }
    
    const resetBtn = document.getElementById('reset-all-btn');
    if (resetBtn) {
        resetBtn.setAttribute('title', resetBtn.getAttribute('title') + ' (Ctrl+R)');
    }
    
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
        csvBtn.setAttribute('title', csvBtn.getAttribute('title') + ' (Ctrl+E)');
    }
    
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
        pdfBtn.setAttribute('title', pdfBtn.getAttribute('title') + ' (Ctrl+Shift+E)');
    }
}

// Initialize workflow validation
function initializeWorkflowValidation() {
    // Add workflow progress indicator
    const workflowIndicator = document.createElement('div');
    workflowIndicator.className = 'workflow-indicator';
    workflowIndicator.innerHTML = `
        <div class="workflow-step" data-step="input">
            <span class="step-number">1</span>
            <span class="step-label">Input Colors</span>
        </div>
        <div class="workflow-step" data-step="calculate">
            <span class="step-number">2</span>
            <span class="step-label">Calculate</span>
        </div>
        <div class="workflow-step" data-step="results">
            <span class="step-number">3</span>
            <span class="step-label">Review Results</span>
        </div>
        <div class="workflow-step" data-step="export">
            <span class="step-number">4</span>
            <span class="step-label">Export</span>
        </div>
    `;
    
    const header = document.querySelector('.app-header');
    if (header) {
        header.appendChild(workflowIndicator);
    }
    
    // Update workflow progress
    updateWorkflowProgress();
}

// Update workflow progress indicator
function updateWorkflowProgress() {
    const steps = document.querySelectorAll('.workflow-step');
    if (!steps.length) return;
    
    // Reset all steps
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    // Check current workflow state
    const hasInputs = hasAnyColorInputs();
    const hasResults = appState.results !== null;
    
    if (hasInputs) {
        steps[0].classList.add('completed');
        if (!hasResults) {
            steps[1].classList.add('active');
        }
    } else {
        steps[0].classList.add('active');
    }
    
    if (hasResults) {
        steps[1].classList.add('completed');
        steps[2].classList.add('active');
        steps[3].classList.add('active');
    }
}

// Check if user has entered any color inputs
function hasAnyColorInputs() {
    const inputs = [
        'target-c', 'target-m', 'target-y', 'target-k',
        'target-l', 'target-a', 'target-b',
        'sample-c', 'sample-m', 'sample-y', 'sample-k',
        'sample-l', 'sample-a', 'sample-b'
    ];
    
    return inputs.some(inputId => {
        const input = document.getElementById(inputId);
        return input && input.value && input.value !== '0' && input.value !== '50';
    });
}

// Add professional finishing touches
function addProfessionalFinishingTouches() {
    // Add loading animations
    addLoadingAnimations();
    
    // Add smooth transitions
    addSmoothTransitions();
    
    // Add professional tooltips
    addProfessionalTooltips();
    
    // Add accessibility enhancements
    addAccessibilityEnhancements();
    
    // Add performance monitoring
    addPerformanceMonitoring();
}

// Add loading animations for better UX
function addLoadingAnimations() {
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        const originalText = calculateBtn.textContent;
        
        // Override the existing calculation function to add loading state
        const originalCalculate = window.performColorDifferenceCalculation;
        window.performColorDifferenceCalculation = function() {
            calculateBtn.classList.add('calculating');
            calculateBtn.textContent = 'Calculating...';
            calculateBtn.disabled = true;
            
            // Add small delay for visual feedback
            setTimeout(() => {
                try {
                    originalCalculate();
                } finally {
                    calculateBtn.classList.remove('calculating');
                    calculateBtn.textContent = originalText;
                    calculateBtn.disabled = false;
                    updateWorkflowProgress();
                }
            }, 200);
        };
    }
}

// Add smooth transitions for better visual experience
function addSmoothTransitions() {
    // Add transition classes to key elements
    const transitionElements = [
        '.color-section',
        '.delta-section',
        '.results-section',
        '.input-field input',
        '.color-swatch',
        '.calculate-button',
        '.export-btn'
    ];
    
    transitionElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
        });
    });
}

// Add professional tooltips with detailed information
function addProfessionalTooltips() {
    const tooltips = {
        'target-swatch': 'Target color preview - This shows how your target color will appear',
        'sample-swatch': 'Sample color preview - This shows how your sample color will appear',
        'delta-indicator': 'Delta indicator - Shows the visual difference between colors',
        'calculate-btn': 'Calculate color difference using industry-standard Delta E formula',
        'reset-all-btn': 'Reset all inputs to default values and clear results'
    };
    
    Object.keys(tooltips).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.setAttribute('data-tooltip', tooltips[elementId]);
        }
    });
}

// Add accessibility enhancements
function addAccessibilityEnhancements() {
    // Add ARIA labels and descriptions
    const ariaLabels = {
        'target-section': 'Target color input section',
        'sample-section': 'Sample color input section',
        'delta-section': 'Color difference display section',
        'results-section': 'Calculation results section',
        'calculate-btn': 'Calculate color difference button',
        'reset-all-btn': 'Reset all inputs button'
    };
    
    Object.keys(ariaLabels).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.setAttribute('aria-label', ariaLabels[elementId]);
        }
    });
    
    // Add keyboard navigation hints
    const keyboardHint = document.createElement('div');
    keyboardHint.className = 'keyboard-hint';
    keyboardHint.innerHTML = `
        <span class="hint-text">Press Ctrl+H for keyboard shortcuts</span>
    `;
    
    const container = document.querySelector('.calculator-container');
    if (container) {
        container.appendChild(keyboardHint);
    }
}

// Add performance monitoring
function addPerformanceMonitoring() {
    // Monitor calculation performance
    const originalCalculate = window.performColorDifferenceCalculation;
    if (originalCalculate) {
        window.performColorDifferenceCalculation = function() {
            const startTime = performance.now();
            
            try {
                originalCalculate();
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                console.log(`Calculation completed in ${duration.toFixed(2)}ms`);
                
                // Show performance warning if calculation is slow
                if (duration > 1000) {
                    showStatusMessage('Calculation completed (slower than expected)', 'warning');
                } else if (duration > 500) {
                    showStatusMessage('Calculation completed', 'info', 2000);
                }
                
            } catch (error) {
                console.error('Calculation error:', error);
                showStatusMessage('Calculation failed: ' + error.message, 'error');
            }
        };
    }
}

// Initialize cross-browser compatibility checks
function initializeBrowserCompatibility() {
    console.log('Checking browser compatibility...');
    
    const compatibility = {
        localStorage: typeof Storage !== 'undefined',
        canvas: !!document.createElement('canvas').getContext,
        webWorkers: typeof Worker !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        clipboard: navigator.clipboard && navigator.clipboard.writeText,
        notifications: 'Notification' in window
    };
    
    console.log('Browser compatibility:', compatibility);
    
    // Show warnings for missing features
    const warnings = [];
    if (!compatibility.localStorage) {
        warnings.push('Local storage not supported - history will not be saved');
    }
    if (!compatibility.serviceWorker) {
        warnings.push('Service workers not supported - offline functionality limited');
    }
    if (!compatibility.clipboard) {
        warnings.push('Clipboard API not supported - copy functions may not work');
    }
    
    if (warnings.length > 0) {
        console.warn('Browser compatibility warnings:', warnings);
        showStatusMessage(`Browser limitations detected: ${warnings.length} features may not work fully`, 'warning', 5000);
    } else {
        console.log('Full browser compatibility confirmed');
    }
    
    return compatibility;
}

// Show browser information for debugging and compatibility
function showBrowserInfo() {
    const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        clipboard: navigator.clipboard && navigator.clipboard.writeText,
        webGL: !!document.createElement('canvas').getContext('webgl'),
        webGL2: !!document.createElement('canvas').getContext('webgl2'),
        touchSupport: 'ontouchstart' in window,
        pointerEvents: 'PointerEvent' in window,
        cssGrid: CSS.supports('display', 'grid'),
        cssFlexbox: CSS.supports('display', 'flex'),
        cssCustomProperties: CSS.supports('color', 'var(--test)'),
        es6Modules: 'noModule' in HTMLScriptElement.prototype,
        asyncAwait: (async () => {}).constructor === (async function(){}).constructor,
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined'
    };
    
    const infoModal = document.createElement('div');
    infoModal.className = 'browser-info-modal';
    infoModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Browser Information & Compatibility</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="info-section">
                    <h4>Browser Details</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">User Agent:</span>
                            <span class="info-value">${browserInfo.userAgent}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Platform:</span>
                            <span class="info-value">${browserInfo.platform}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Language:</span>
                            <span class="info-value">${browserInfo.language}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Online Status:</span>
                            <span class="info-value ${browserInfo.onLine ? 'success' : 'error'}">${browserInfo.onLine ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Display Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Screen Resolution:</span>
                            <span class="info-value">${browserInfo.screenResolution}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Viewport Size:</span>
                            <span class="info-value">${browserInfo.viewport}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Color Depth:</span>
                            <span class="info-value">${browserInfo.colorDepth} bits</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pixel Ratio:</span>
                            <span class="info-value">${browserInfo.pixelRatio}x</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Feature Support</h4>
                    <div class="feature-grid">
                        ${Object.entries({
                            'Local Storage': browserInfo.localStorage,
                            'Session Storage': browserInfo.sessionStorage,
                            'IndexedDB': browserInfo.indexedDB,
                            'Web Workers': browserInfo.webWorkers,
                            'Service Worker': browserInfo.serviceWorker,
                            'Notifications': browserInfo.notifications,
                            'Clipboard API': browserInfo.clipboard,
                            'WebGL': browserInfo.webGL,
                            'WebGL 2': browserInfo.webGL2,
                            'Touch Support': browserInfo.touchSupport,
                            'Pointer Events': browserInfo.pointerEvents,
                            'CSS Grid': browserInfo.cssGrid,
                            'CSS Flexbox': browserInfo.cssFlexbox,
                            'CSS Custom Properties': browserInfo.cssCustomProperties,
                            'ES6 Modules': browserInfo.es6Modules,
                            'Async/Await': browserInfo.asyncAwait,
                            'Fetch API': browserInfo.fetch,
                            'Promises': browserInfo.promises
                        }).map(([feature, supported]) => `
                            <div class="feature-item ${supported ? 'supported' : 'not-supported'}">
                                <span class="feature-icon">${supported ? '✅' : '❌'}</span>
                                <span class="feature-name">${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="info-actions">
                    <button onclick="copyBrowserInfo()" class="info-btn">Copy to Clipboard</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="info-btn secondary">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(infoModal);
    
    // Store browser info for copying
    window.currentBrowserInfo = browserInfo;
}

// Copy browser info to clipboard
function copyBrowserInfo() {
    if (!window.currentBrowserInfo) return;
    
    const info = window.currentBrowserInfo;
    const infoText = `LAB Color Calculator - Browser Information
    
Browser Details:
- User Agent: ${info.userAgent}
- Platform: ${info.platform}
- Language: ${info.language}
- Online: ${info.onLine}

Display:
- Screen: ${info.screenResolution}
- Viewport: ${info.viewport}
- Color Depth: ${info.colorDepth} bits
- Pixel Ratio: ${info.pixelRatio}x

Feature Support:
- Local Storage: ${info.localStorage}
- Service Worker: ${info.serviceWorker}
- WebGL: ${info.webGL}
- CSS Grid: ${info.cssGrid}
- Touch Support: ${info.touchSupport}
- Clipboard API: ${info.clipboard}

Generated: ${new Date().toISOString()}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(infoText).then(() => {
            showStatusMessage('Browser information copied to clipboard', 'success');
        }).catch(() => {
            showStatusMessage('Failed to copy to clipboard', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = infoText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showStatusMessage('Browser information copied to clipboard', 'success');
        } catch (err) {
            showStatusMessage('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textArea);
    }
}

function cacheDOMElements() {
    // Target color inputs
    domElements.targetC = document.getElementById('target-c');
    domElements.targetM = document.getElementById('target-m');
    domElements.targetY = document.getElementById('target-y');
    domElements.targetK = document.getElementById('target-k');
    domElements.targetL = document.getElementById('target-l');
    domElements.targetA = document.getElementById('target-a');
    domElements.targetB = document.getElementById('target-b');
    
    // Sample color inputs
    domElements.sampleC = document.getElementById('sample-c');
    domElements.sampleM = document.getElementById('sample-m');
    domElements.sampleY = document.getElementById('sample-y');
    domElements.sampleK = document.getElementById('sample-k');
    domElements.sampleL = document.getElementById('sample-l');
    domElements.sampleA = document.getElementById('sample-a');
    domElements.sampleB = document.getElementById('sample-b');
    
    // Color swatches
    domElements.targetSwatch = document.getElementById('target-swatch');
    domElements.sampleSwatch = document.getElementById('sample-swatch');
    
    // Calculate button
    domElements.calculateBtn = document.getElementById('calculate-btn');
    
    // Preset and workflow elements
    domElements.targetPresetSelect = document.getElementById('target-preset-select');
    domElements.samplePresetSelect = document.getElementById('sample-preset-select');
    domElements.targetClearBtn = document.getElementById('target-clear-btn');
    domElements.sampleClearBtn = document.getElementById('sample-clear-btn');
    domElements.targetCopyBtn = document.getElementById('target-copy-btn');
    domElements.sampleCopyBtn = document.getElementById('sample-copy-btn');
    domElements.resetAllBtn = document.getElementById('reset-all-btn');
    
    // Results elements
    domElements.deltaEValue = document.getElementById('delta-e-value');
    domElements.deltaENumber = document.querySelector('.delta-e-number');
    domElements.toleranceZone = document.getElementById('tolerance-zone');
    domElements.suggestionsList = document.getElementById('suggestions-list');
    domElements.resultsSection = document.getElementById('results-section');
    
    // Component delta elements
    domElements.deltaL = document.getElementById('delta-l');
    domElements.deltaA = document.getElementById('delta-a');
    domElements.deltaB = document.getElementById('delta-b');
    domElements.deltaC = document.getElementById('delta-c');
    domElements.deltaH = document.getElementById('delta-h');
    
    console.log('DOM elements cached successfully');
}

function setupInputValidation() {
    // Target CMYK inputs
    setupCMYKValidation('target', 'c', domElements.targetC);
    setupCMYKValidation('target', 'm', domElements.targetM);
    setupCMYKValidation('target', 'y', domElements.targetY);
    setupCMYKValidation('target', 'k', domElements.targetK);
    
    // Target LAB inputs
    setupLABValidation('target', 'l', domElements.targetL);
    setupLABValidation('target', 'a', domElements.targetA);
    setupLABValidation('target', 'b', domElements.targetB);
    
    // Sample CMYK inputs
    setupCMYKValidation('sample', 'c', domElements.sampleC);
    setupCMYKValidation('sample', 'm', domElements.sampleM);
    setupCMYKValidation('sample', 'y', domElements.sampleY);
    setupCMYKValidation('sample', 'k', domElements.sampleK);
    
    // Sample LAB inputs
    setupLABValidation('sample', 'l', domElements.sampleL);
    setupLABValidation('sample', 'a', domElements.sampleA);
    setupLABValidation('sample', 'b', domElements.sampleB);
    
    console.log('Input validation event listeners set up');
}

/**
 * Set up calculate button event listener
 * Requirements: 4.5, 7.4 - Main calculate button functionality
 */
function setupCalculateButton() {
    console.log('Setting up calculate button...');
    
    // Try direct DOM query as backup
    const calculateBtn = document.getElementById('calculate-btn');
    console.log('Calculate button found:', !!calculateBtn);
    
    if (!calculateBtn) {
        console.error('Calculate button not found in DOM');
        return;
    }
    
    // Store reference
    domElements.calculateBtn = calculateBtn;
    
    // Simple, direct event listener
    calculateBtn.addEventListener('click', function(e) {
        console.log('Calculate button clicked!');
        e.preventDefault();
        
        // Direct call to main calculation function
        performColorDifferenceCalculation();
    });
    
    // Also allow Enter key to trigger calculation when focused on inputs
    const allInputs = [
        domElements.targetC, domElements.targetM, domElements.targetY, domElements.targetK,
        domElements.targetL, domElements.targetA, domElements.targetB,
        domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK,
        domElements.sampleL, domElements.sampleA, domElements.sampleB
    ];
    
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performColorDifferenceCalculation();
                }
            });
        }
    });
    
    console.log('Calculate button event listeners set up');
}

function setupCMYKValidation(colorType, component, inputElement) {
    if (!inputElement) {
        console.error(`Input element not found for ${colorType}-${component}`);
        return;
    }
    
    // Real-time validation on input with debouncing
    inputElement.addEventListener('input', function(e) {
        try {
            const value = parseFloat(e.target.value);
            const isValid = validateCMYKValue(value);
            
            // Update color swatch in real-time
            const colorType = inputElement.id.includes('target') ? 'target' : 'sample';
            updateColorSwatch(colorType);
            
            // Immediate visual feedback (no debounce for validation state)
            updateInputValidationState(inputElement, isValid);
            
            // Show/clear error messages immediately
            if (!isValid && e.target.value !== '') {
                showValidationError(inputElement, `${component.toUpperCase()}% must be between 0-100`);
            } else {
                clearValidationError(inputElement);
            }
            
            // Debounced state update and swatch rendering
            debouncedInputUpdate(colorType, component, value, isValid, e.target.value);
            
        } catch (error) {
            console.error(`Error in CMYK validation for ${colorType}-${component}:`, error);
            handleValidationError(inputElement, error);
        }
    });
    
    // Validation on blur (when user leaves the field)
    inputElement.addEventListener('blur', function(e) {
        try {
            const value = parseFloat(e.target.value);
            
            // Auto-correct out-of-range values
            if (!isNaN(value)) {
                const correctedValue = Math.max(0, Math.min(100, value));
                if (correctedValue !== value) {
                    e.target.value = correctedValue.toFixed(1);
                    appState[colorType].cmyk[component] = correctedValue;
                    updateInputValidationState(inputElement, true);
                    debouncedSwatchUpdate(colorType); // Use debounced update
                    console.log(`Auto-corrected ${colorType} ${component.toUpperCase()} to ${correctedValue}%`);
                }
            }
        } catch (error) {
            console.error(`Error in CMYK blur validation for ${colorType}-${component}:`, error);
            handleValidationError(inputElement, error);
        }
    });
}

function setupLABValidation(colorType, component, inputElement) {
    if (!inputElement) {
        console.error(`Input element not found for ${colorType}-${component}`);
        return;
    }
    
    // Determine validation rules based on component
    const rules = component === 'l' ? VALIDATION_RULES.lab_l : VALIDATION_RULES.lab_ab;
    
    // Real-time validation on input with debouncing
    inputElement.addEventListener('input', function(e) {
        try {
            const value = parseFloat(e.target.value);
            const isValid = validateLABValue(value, component);
            
            // Update color swatch in real-time
            const colorType = inputElement.id.includes('target') ? 'target' : 'sample';
            updateColorSwatch(colorType);
            
            // Immediate visual feedback (no debounce for validation state)
            updateInputValidationState(inputElement, isValid);
            
            // Show/clear error messages immediately
            if (!isValid && e.target.value !== '') {
                const rangeText = component === 'l' ? '0-100' : '-128 to +127';
                showValidationError(inputElement, `${component.toUpperCase()}* must be between ${rangeText}`);
            } else {
                clearValidationError(inputElement);
            }
            
            // Debounced state update and swatch rendering
            debouncedInputUpdate(colorType, component, value, isValid, e.target.value, 'lab');
            
        } catch (error) {
            console.error(`Error in LAB validation for ${colorType}-${component}:`, error);
            handleValidationError(inputElement, error);
        }
    });
    
    // Validation on blur (when user leaves the field)
    inputElement.addEventListener('blur', function(e) {
        try {
            const value = parseFloat(e.target.value);
            
            // Auto-correct out-of-range values
            if (!isNaN(value)) {
                const correctedValue = Math.max(rules.min, Math.min(rules.max, value));
                if (correctedValue !== value) {
                    e.target.value = correctedValue.toFixed(2);
                    appState[colorType].lab[component] = correctedValue;
                    updateInputValidationState(inputElement, true);
                    debouncedSwatchUpdate(colorType); // Use debounced update
                    console.log(`Auto-corrected ${colorType} ${component.toUpperCase()}* to ${correctedValue}`);
                }
            }
        } catch (error) {
            console.error(`Error in LAB blur validation for ${colorType}-${component}:`, error);
            handleValidationError(inputElement, error);
        }
    });
}

function validateCMYKValue(value) {
    // Requirements 1.3: CMYK values must be numeric and within 0-100% range
    if (isNaN(value)) return false;
    return value >= VALIDATION_RULES.cmyk.min && value <= VALIDATION_RULES.cmyk.max;
}

function validateLABValue(value, component) {
    // Requirements 2.3: LAB values must be within specified ranges
    if (isNaN(value)) return false;
    
    if (component === 'l') {
        return value >= VALIDATION_RULES.lab_l.min && value <= VALIDATION_RULES.lab_l.max;
    } else {
        return value >= VALIDATION_RULES.lab_ab.min && value <= VALIDATION_RULES.lab_ab.max;
    }
}

function updateInputValidationState(inputElement, isValid) {
    // Requirements 1.4, 2.4: Visual feedback for valid/invalid inputs
    inputElement.classList.remove('valid', 'invalid');
    
    if (inputElement.value === '') {
        // Empty input - neutral state
        return;
    }
    
    if (isValid) {
        inputElement.classList.add('valid');
    } else {
        inputElement.classList.add('invalid');
    }
}

function showValidationError(inputElement, message) {
    // Remove existing error message
    clearValidationError(inputElement);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    errorElement.setAttribute('data-error-for', inputElement.id);
    
    // Insert error message after the input field
    inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
}

function clearValidationError(inputElement) {
    // Find and remove existing error message
    const existingError = inputElement.parentNode.querySelector(`[data-error-for="${inputElement.id}"]`);
    if (existingError) {
        existingError.remove();
    }
}

function initializeDefaultValues() {
    // Set default values as specified in the HTML placeholders
    domElements.targetL.value = '50';
    domElements.sampleL.value = '50';
    
    // Update application state with defaults
    appState.target.lab.l = 50;
    appState.sample.lab.l = 50;
    
    // Initialize color swatches with default colors
    initializeColorSwatches();
    
    console.log('Default values initialized');
}

/**
 * Initialize color swatches with default white color
 * Requirements: 3.1, 3.2 - Display color swatches with minimum 150px size
 */
function initializeColorSwatches() {
    // Set initial white color for both swatches
    if (domElements.targetSwatch) {
        domElements.targetSwatch.style.backgroundColor = 'rgb(255, 255, 255)';
        domElements.targetSwatch.setAttribute('title', 'Target Color: White (Default)');
    }
    
    if (domElements.sampleSwatch) {
        domElements.sampleSwatch.style.backgroundColor = 'rgb(255, 255, 255)';
        domElements.sampleSwatch.setAttribute('title', 'Sample Color: White (Default)');
    }
    
    console.log('Color swatches initialized');
}

/**
 * Update color swatch based on current input values
 * Requirements: 1.5, 2.5, 3.1, 3.2, 3.4 - Real-time color swatch updates
 */
function updateColorSwatch(colorType, immediate = false) {
    // Cancel previous update for this color type
    const timeoutKey = `${colorType}-swatch`;
    if (previewState.updateTimeouts.has(timeoutKey)) {
        clearTimeout(previewState.updateTimeouts.get(timeoutKey));
    }
    
    const performUpdate = () => {
        // Check if color science module is available
        if (typeof window.colorScience === 'undefined') {
            console.warn('Color science module not loaded yet');
            return;
        }
        
        const swatchElement = colorType === 'target' ? domElements.targetSwatch : domElements.sampleSwatch;
        if (!swatchElement) {
            console.error(`Swatch element not found for ${colorType}`);
            return;
        }
        
        try {
            // Add loading state for visual feedback
            swatchElement.classList.add('loading');
            previewState.isUpdating = true;
            
            // Use requestAnimationFrame for smooth updates
            if (previewState.animationFrameId) {
                cancelAnimationFrame(previewState.animationFrameId);
            }
            
            previewState.animationFrameId = requestAnimationFrame(() => {
                try {
                    // Get current color values from inputs
                    const currentValues = getCurrentColorValues();
                    const colorData = currentValues[colorType];
                    
                    // Determine which color space has more complete data
                    const cmykComplete = hasCompleteColorData(colorData.cmyk, 'cmyk');
                    const labComplete = hasCompleteColorData(colorData.lab, 'lab');
                    
                    let cssColor;
                    let colorInfo;
                    
                    if (cmykComplete && labComplete) {
                        // Both complete - prioritize LAB for accuracy
                        cssColor = window.colorScience.labToCssString(colorData.lab.l, colorData.lab.a, colorData.lab.b);
                        colorInfo = `LAB(${colorData.lab.l.toFixed(1)}, ${colorData.lab.a.toFixed(1)}, ${colorData.lab.b.toFixed(1)})`;
                    } else if (labComplete) {
                        // LAB data available
                        cssColor = window.colorScience.labToCssString(colorData.lab.l, colorData.lab.a, colorData.lab.b);
                        colorInfo = `LAB(${colorData.lab.l.toFixed(1)}, ${colorData.lab.a.toFixed(1)}, ${colorData.lab.b.toFixed(1)})`;
                    } else if (cmykComplete) {
                        // CMYK data available
                        cssColor = window.colorScience.cmykToCssString(colorData.cmyk.c, colorData.cmyk.m, colorData.cmyk.y, colorData.cmyk.k);
                        colorInfo = `CMYK(${colorData.cmyk.c.toFixed(1)}, ${colorData.cmyk.m.toFixed(1)}, ${colorData.cmyk.y.toFixed(1)}, ${colorData.cmyk.k.toFixed(1)})`;
        } else {
            // Default to white if no complete data
            cssColor = 'rgb(255, 255, 255)';
            colorInfo = 'White (Default)';
                    }
                    
                    // Update swatch background color with smooth transition
                    swatchElement.style.backgroundColor = cssColor;
                    
                    // Update tooltip with color information
                    const capitalizedType = colorType.charAt(0).toUpperCase() + colorType.slice(1);
                    swatchElement.setAttribute('title', `${capitalizedType} Color: ${colorInfo}`);
                    
                    // Remove loading state and add update animation
                    swatchElement.classList.remove('loading');
                    swatchElement.classList.add('color-updated');
                    
                    setTimeout(() => {
                        swatchElement.classList.remove('color-updated');
                    }, 500);
                    
                    previewState.lastUpdateTime = performance.now();
                    console.log(`Enhanced ${colorType} swatch update: ${colorInfo}`);
                    
                    // Trigger G7 analysis for sample color changes
                    if (colorType === 'sample' && typeof updateG7Analysis === 'function') {
                        updateG7Analysis();
                    }
                    
                } catch (error) {
                    console.error(`Error updating ${colorType} swatch:`, error);
                    // Fallback to white on error
                    swatchElement.style.backgroundColor = 'rgb(255, 255, 255)';
                    swatchElement.setAttribute('title', `${colorType} Color: Error - Using White`);
                    swatchElement.classList.remove('loading');
                } finally {
                    previewState.isUpdating = false;
                }
            });
            
        } catch (error) {
            console.error(`Error in swatch update process:`, error);
            previewState.isUpdating = false;
            swatchElement.classList.remove('loading');
        }
    };
    
    if (immediate) {
        performUpdate();
    } else {
        // Debounce the update for better performance
        const timeout = setTimeout(performUpdate, DEBOUNCE_CONFIG.SWATCH_DELAY);
        previewState.updateTimeouts.set(timeoutKey, timeout);
    }
}

/**
 * Check if color data is complete enough for conversion
 */
function hasCompleteColorData(colorData, colorSpace) {
    if (colorSpace === 'cmyk') {
        // CMYK is complete if any component has a non-zero value
        return colorData.c > 0 || colorData.m > 0 || colorData.y > 0 || colorData.k > 0;
    } else if (colorSpace === 'lab') {
        // LAB is complete if L* is not default (50) or a*/b* have values
        return colorData.l !== 50 || colorData.a !== 0 || colorData.b !== 0;
    }
    return false;
}

/**
 * Update both color swatches
 * Requirements: 3.2 - Real-time updates for both target and sample
 */
function updateAllColorSwatches() {
    updateColorSwatch('target');
    updateColorSwatch('sample');
}

/**
 * Force update all swatches (useful for initialization and testing)
 */
function forceUpdateSwatches() {
    console.log('Force updating all color swatches...');
    updateAllColorSwatches();
}

/**
 * Wait for color science module to load and initialize swatches
 * Requirements: 3.4 - Clear visual distinction and proper initialization
 */
function waitForColorScienceAndInitialize() {
    const checkColorScience = () => {
        if (typeof window.colorScience !== 'undefined') {
            console.log('Color science module detected, initializing swatches...');
            // Update swatches with any existing data
            updateAllColorSwatches();
        } else {
            // Check again in 100ms
            setTimeout(checkColorScience, 100);
        }
    };
    
    // Start checking
    checkColorScience();
}

// Utility function to check if all inputs are valid
function areAllInputsValid() {
    const allInputs = [
        domElements.targetC, domElements.targetM, domElements.targetY, domElements.targetK,
        domElements.targetL, domElements.targetA, domElements.targetB,
        domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK,
        domElements.sampleL, domElements.sampleA, domElements.sampleB
    ];
    
    return allInputs.every(input => {
        if (!input.value) return true; // Empty inputs are considered valid (will use defaults)
        return !input.classList.contains('invalid');
    });
}

// Function to get current color values from inputs (for use by other modules)
function getCurrentColorValues() {
    const colorValues = {
        target: {
            cmyk: {
                c: parseFloat(domElements.targetC.value) || 0,
                m: parseFloat(domElements.targetM.value) || 0,
                y: parseFloat(domElements.targetY.value) || 0,
                k: parseFloat(domElements.targetK.value) || 0
            },
            lab: {
                l: parseFloat(domElements.targetL.value) || 50,
                a: parseFloat(domElements.targetA.value) || 0,
                b: parseFloat(domElements.targetB.value) || 0
            }
        },
        sample: {
            cmyk: {
                c: parseFloat(domElements.sampleC.value) || 0,
                m: parseFloat(domElements.sampleM.value) || 0,
                y: parseFloat(domElements.sampleY.value) || 0,
                k: parseFloat(domElements.sampleK.value) || 0
            },
            lab: {
                l: parseFloat(domElements.sampleL.value) || 50,
                a: parseFloat(domElements.sampleA.value) || 0,
                b: parseFloat(domElements.sampleB.value) || 0
            }
        }
    };

    // Convert CMYK to LAB if LAB values are at defaults but CMYK has data
    ['target', 'sample'].forEach(colorType => {
        const color = colorValues[colorType];
        const hasCMYK = color.cmyk.c > 0 || color.cmyk.m > 0 || color.cmyk.y > 0 || color.cmyk.k > 0;
        const hasDefaultLAB = color.lab.l === 50 && color.lab.a === 0 && color.lab.b === 0;
        
        if (hasCMYK && hasDefaultLAB && window.colorScience) {
            try {
                // Convert CMYK to RGB first, then RGB to LAB
                const rgb = window.colorScience.cmykToRgb(color.cmyk.c, color.cmyk.m, color.cmyk.y, color.cmyk.k);
                const xyz = window.colorScience.rgbToXyz(rgb.r, rgb.g, rgb.b);
                const lab = window.colorScience.xyzToLab(xyz.x, xyz.y, xyz.z);
                
                color.lab.l = Math.round(lab.l * 100) / 100;
                color.lab.a = Math.round(lab.a * 100) / 100;
                color.lab.b = Math.round(lab.b * 100) / 100;
                
                console.log(`Converted ${colorType} CMYK(${color.cmyk.c},${color.cmyk.m},${color.cmyk.y},${color.cmyk.k}) to LAB(${color.lab.l},${color.lab.a},${color.lab.b})`);
            } catch (error) {
                console.warn(`Failed to convert ${colorType} CMYK to LAB:`, error);
            }
        }
    });

    return colorValues;
}

/**
 * Performance Optimization: Debounced Input Updates
 * Requirements: Implement debounced input updates to prevent excessive calculations
 */
function debouncedInputUpdate(colorType, component, value, isValid, rawValue, colorSpace = 'cmyk') {
    // Clear existing timer
    if (debounceTimers.inputUpdate) {
        clearTimeout(debounceTimers.inputUpdate);
    }
    
    // Set new timer
    debounceTimers.inputUpdate = setTimeout(() => {
        try {
            if (isValid && !isNaN(value)) {
                // Update application state
                appState[colorType][colorSpace][component] = value;
                
                // Update swatch with debouncing
                debouncedSwatchUpdate(colorType);
                
                // Clear any previous errors for this input
                errorState.hasErrors = false;
                
            } else if (rawValue === '') {
                // Handle empty input - set to default
                const defaultValue = getDefaultValue(component, colorSpace);
                appState[colorType][colorSpace][component] = defaultValue;
                debouncedSwatchUpdate(colorType);
            }
        } catch (error) {
            console.error(`Error in debounced input update:`, error);
            handleInputUpdateError(error, colorType, component);
        }
    }, DEBOUNCE_CONFIG.INPUT_DELAY);
}

/**
 * Performance Optimization: Debounced Swatch Updates
 * Requirements: Optimize color conversion functions for real-time performance
 */
function debouncedSwatchUpdate(colorType) {
    // Clear existing timer
    if (debounceTimers.swatchUpdate) {
        clearTimeout(debounceTimers.swatchUpdate);
    }
    
    // Set new timer
    debounceTimers.swatchUpdate = setTimeout(() => {
        try {
            // Check if we're already updating to prevent race conditions
            if (loadingState.isUpdatingSwatches) {
                return;
            }
            
            loadingState.isUpdatingSwatches = true;
            updateColorSwatch(colorType);
            
        } catch (error) {
            console.error(`Error in debounced swatch update:`, error);
            handleSwatchUpdateError(error, colorType);
        } finally {
            loadingState.isUpdatingSwatches = false;
        }
    }, DEBOUNCE_CONFIG.SWATCH_DELAY);
}

/**
 * Get default value for a color component
 */
function getDefaultValue(component, colorSpace) {
    if (colorSpace === 'cmyk') {
        return 0; // All CMYK components default to 0
    } else if (colorSpace === 'lab') {
        return component === 'l' ? 50 : 0; // L* defaults to 50, a* and b* to 0
    }
    return 0;
}

/**
 * Error Handling: Handle validation errors
 * Requirements: Add comprehensive error handling for invalid inputs
 */
function handleValidationError(inputElement, error) {
    errorState.hasErrors = true;
    errorState.lastError = error;
    errorState.errorCount++;
    
    // Show user-friendly error message
    showValidationError(inputElement, 'Invalid input - please check your value');
    
    // Log detailed error for debugging
    console.error('Validation error:', error);
    
    // Add error styling to input
    inputElement.classList.add('error');
    
    // Remove error styling after a delay
    setTimeout(() => {
        inputElement.classList.remove('error');
    }, 3000);
}

/**
 * Error Handling: Handle input update errors
 */
function handleInputUpdateError(error, colorType, component) {
    errorState.hasErrors = true;
    errorState.lastError = error;
    errorState.errorCount++;
    
    console.error(`Input update error for ${colorType}-${component}:`, error);
    
    // Show user notification
    showErrorNotification(`Error updating ${colorType} ${component}: ${error.message}`);
}

/**
 * Error Handling: Handle swatch update errors
 */
function handleSwatchUpdateError(error, colorType) {
    errorState.hasErrors = true;
    errorState.lastError = error;
    errorState.errorCount++;
    
    console.error(`Swatch update error for ${colorType}:`, error);
    
    // Fallback to white color on error
    const swatchElement = colorType === 'target' ? domElements.targetSwatch : domElements.sampleSwatch;
    if (swatchElement) {
        swatchElement.style.backgroundColor = 'rgb(255, 255, 255)';
        swatchElement.setAttribute('title', `${colorType} Color: Error - Using White`);
    }
    
    // Show user notification
    showErrorNotification(`Error displaying ${colorType} color. Using white as fallback.`);
}

/**
 * Show error notification to user
 * Requirements: Add loading states and user feedback for longer operations
 */
function showErrorNotification(message, duration = 5000) {
    // Remove existing error notifications
    const existingNotifications = document.querySelectorAll('.error-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-message">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Show loading state for operations
 * Requirements: Add loading states and user feedback for longer operations
 */
function showLoadingState(operation, element = null) {
    loadingState.operationStartTime = Date.now();
    
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
        
        // Store original text
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent;
        }
        
        // Show loading text
        element.textContent = `${operation}...`;
    }
    
    // Show global loading indicator if operation takes too long
    setTimeout(() => {
        if (loadingState.operationStartTime && 
            Date.now() - loadingState.operationStartTime > 1000) {
            showGlobalLoadingIndicator(operation);
        }
    }, 1000);
}

/**
 * Hide loading state
 */
function hideLoadingState(element = null) {
    loadingState.operationStartTime = null;
    
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
        
        // Restore original text
        if (element.dataset.originalText) {
            element.textContent = element.dataset.originalText;
        }
    }
    
    // Hide global loading indicator
    hideGlobalLoadingIndicator();
}

/**
 * Show global loading indicator
 */
function showGlobalLoadingIndicator(operation) {
    // Remove existing indicator
    hideGlobalLoadingIndicator();
    
    const indicator = document.createElement('div');
    indicator.id = 'global-loading-indicator';
    indicator.className = 'global-loading-indicator';
    indicator.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <span class="loading-text">${operation}...</span>
        </div>
    `;
    
    document.body.appendChild(indicator);
}

/**
 * Hide global loading indicator
 */
function hideGlobalLoadingIndicator() {
    const indicator = document.getElementById('global-loading-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Debug function to test validation (can be removed in production)
function testValidation() {
    console.log('Testing validation system...');
    
    // Test CMYK validation
    console.log('CMYK 50:', validateCMYKValue(50)); // Should be true
    console.log('CMYK 150:', validateCMYKValue(150)); // Should be false
    console.log('CMYK -10:', validateCMYKValue(-10)); // Should be false
    
    // Test LAB validation
    console.log('LAB L* 50:', validateLABValue(50, 'l')); // Should be true
    console.log('LAB L* 150:', validateLABValue(150, 'l')); // Should be false
    console.log('LAB a* 50:', validateLABValue(50, 'a')); // Should be true
    console.log('LAB a* 150:', validateLABValue(150, 'a')); // Should be false
    
    console.log('Validation tests completed');
}

// Function to populate test data for development
function loadTestData() {
    // Target color: Rich red
    domElements.targetC.value = '15.2';
    domElements.targetM.value = '78.4';
    domElements.targetY.value = '65.1';
    domElements.targetK.value = '8.3';
    domElements.targetL.value = '60.87';
    domElements.targetA.value = '44.36';
    domElements.targetB.value = '35.27';
    
    // Sample color: Slightly different red
    domElements.sampleC.value = '17.8';
    domElements.sampleM.value = '80.1';
    domElements.sampleY.value = '63.5';
    domElements.sampleK.value = '10.2';
    domElements.sampleL.value = '58.72';
    domElements.sampleA.value = '42.18';
    domElements.sampleB.value = '36.93';
    
    // Trigger validation for all fields
    const allInputs = [
        domElements.targetC, domElements.targetM, domElements.targetY, domElements.targetK,
        domElements.targetL, domElements.targetA, domElements.targetB,
        domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK,
        domElements.sampleL, domElements.sampleA, domElements.sampleB
    ];
    
    allInputs.forEach(input => {
        input.dispatchEvent(new Event('input'));
    });
    
    // Force update color swatches with test data
    setTimeout(() => {
        updateAllColorSwatches();
    }, 100);
    
    console.log('Test data loaded and validated');
}

/**
 * Main Color Difference Calculation Workflow
 * Requirements: 4.5 - Display total color difference prominently
 * Requirements: 7.4 - Complete 90% of comparisons with minimal clicks
 * Enhanced with performance optimization and error handling
 */
function performColorDifferenceCalculation() {
    console.log('=== STARTING COLOR DIFFERENCE CALCULATION ===');
    
    // Prevent multiple simultaneous calculations
    if (loadingState.isCalculating) {
        console.log('Calculation already in progress, ignoring request');
        return;
    }
    
    // Basic checks
    if (!window.colorScience) {
        console.error('Color science module not loaded!');
        alert('Color science module not loaded. Please refresh the page.');
        return;
    }
    
    loadingState.isCalculating = true;
    const startTime = Date.now();
    
    // Update status bar to calculating state
    setCalculatingStatus();
    
    try {
        // Show loading state
        showLoadingState('Calculating', domElements.calculateBtn);
        
        // Check if color science module is available with retry logic
        if (typeof window.colorScience === 'undefined') {
            return retryOperation(() => {
                if (typeof window.colorScience === 'undefined') {
                    throw new Error('Color science module not loaded');
                }
                return performCalculationCore();
            }, 'Color science module not loaded. Retrying...');
        }
        
        // Perform core calculation
        return performCalculationCore();
        
    } catch (error) {
        console.error('Error during color difference calculation:', error);
        setErrorStatus();
        handleCalculationError(error);
    } finally {
        loadingState.isCalculating = false;
        hideLoadingState(domElements.calculateBtn);
        
        // Log performance metrics
        const duration = Date.now() - startTime;
        console.log(`Calculation completed in ${duration}ms`);
        
        // Warn if calculation took too long
        if (duration > 2000) {
            console.warn(`Slow calculation detected: ${duration}ms`);
        }
    }
}

/**
 * Core calculation logic separated for retry functionality
 */
function performCalculationCore() {
    // Reset and show workflow if enabled
    if (calculationWorkflow.isVisible) {
        calculationWorkflow.reset();
    }
    
    // Step 1: Validate inputs
    if (calculationWorkflow.isVisible) {
        calculationWorkflow.updateStep('validate', 'processing', 'Checking input values...');
    }
    
    if (!areAllInputsValid()) {
        if (calculationWorkflow.isVisible) {
            calculationWorkflow.updateStep('validate', 'error', 'Invalid input values detected');
        }
        throw new Error('Invalid input values detected');
    }
    
    // Get current color values from inputs
    const colorValues = getCurrentColorValues();
    
    // Validate that we have sufficient data for calculation
    if (!hasValidColorData(colorValues)) {
        if (calculationWorkflow.isVisible) {
            calculationWorkflow.updateStep('validate', 'error', 'Insufficient color data');
        }
        throw new Error('Insufficient color data for calculation');
    }
    
    if (calculationWorkflow.isVisible) {
        calculationWorkflow.updateStep('validate', 'completed', 'Input validation passed');
    }
    
    // Check calculation cache first for performance
    const cacheKey = generateCalculationCacheKey(colorValues);
    if (calculationCache.has(cacheKey)) {
        console.log('Using cached calculation result');
        const cachedResult = calculationCache.get(cacheKey);
        displayCalculationResults(cachedResult);
        return;
    }
    
    // Step 2: Convert Target CMYK to LAB
    if (calculationWorkflow.isVisible) {
        calculationWorkflow.updateStep('convert-target', 'processing', 
            `Target: C${colorValues.target.cmyk.c}% M${colorValues.target.cmyk.m}% Y${colorValues.target.cmyk.y}% K${colorValues.target.cmyk.k}%`);
        
        setTimeout(() => {
            calculationWorkflow.updateStep('convert-target', 'completed', 
                `LAB: L*${colorValues.target.lab.l.toFixed(1)} a*${colorValues.target.lab.a.toFixed(1)} b*${colorValues.target.lab.b.toFixed(1)}`);
        }, 300);
    }
    
    // Step 3: Convert Sample CMYK to LAB
    if (calculationWorkflow.isVisible) {
        setTimeout(() => {
            calculationWorkflow.updateStep('convert-sample', 'processing', 
                `Sample: C${colorValues.sample.cmyk.c}% M${colorValues.sample.cmyk.m}% Y${colorValues.sample.cmyk.y}% K${colorValues.sample.cmyk.k}%`);
            
            setTimeout(() => {
                calculationWorkflow.updateStep('convert-sample', 'completed', 
                    `LAB: L*${colorValues.sample.lab.l.toFixed(1)} a*${colorValues.sample.lab.a.toFixed(1)} b*${colorValues.sample.lab.b.toFixed(1)}`);
            }, 300);
        }, 600);
    }
    
    // Step 4: Calculate component deltas
    if (calculationWorkflow.isVisible) {
        setTimeout(() => {
            calculationWorkflow.updateStep('calculate-deltas', 'processing', 'Computing ΔL*, Δa*, Δb* values...');
        }, 1200);
    }
    
    // Step 5: Calculate Delta E
    if (calculationWorkflow.isVisible) {
        setTimeout(() => {
            calculationWorkflow.updateStep('calculate-deltae', 'processing', 'Computing CIE76 Delta E...');
        }, 1500);
    }
    
    // Perform Delta E analysis using color science module
    const analysisPromise = new Promise((resolve) => {
        setTimeout(() => {
            const analysis = window.colorScience.performDeltaEAnalysis(
                colorValues.target.lab,
                colorValues.sample.lab
            );
            resolve(analysis);
        }, calculationWorkflow.isVisible ? 1800 : 0);
    });
    
    analysisPromise.then(analysis => {
        if (analysis.error) {
            if (calculationWorkflow.isVisible) {
                calculationWorkflow.updateStep('calculate-deltae', 'error', `Error: ${analysis.error}`);
            }
            throw new Error(`Calculation error: ${analysis.error}`);
        }
        
        // Complete calculation steps
        if (calculationWorkflow.isVisible) {
            calculationWorkflow.updateStep('calculate-deltas', 'completed', 
                `ΔL*=${analysis.componentDeltas?.deltaL?.toFixed(2)} Δa*=${analysis.componentDeltas?.deltaA?.toFixed(2)} Δb*=${analysis.componentDeltas?.deltaB?.toFixed(2)}`);
            calculationWorkflow.updateStep('calculate-deltae', 'completed', 
                `ΔE = ${analysis.deltaE?.toFixed(2)}`);
            
            // Step 6: Analyze tolerance
            calculationWorkflow.updateStep('analyze-tolerance', 'processing', 'Evaluating industry tolerance...');
            setTimeout(() => {
                calculationWorkflow.updateStep('analyze-tolerance', 'completed', 
                    `Zone: ${analysis.tolerance?.description}`);
                
                // Step 7: Generate report
                calculationWorkflow.updateStep('generate-results', 'processing', 'Generating professional report...');
                setTimeout(() => {
                    calculationWorkflow.updateStep('generate-results', 'completed', 
                        'Report ready for printing professionals');
                }, 300);
            }, 300);
        }
        
        // Cache the result for future use
        cacheCalculationResult(cacheKey, analysis);
        
        // Update application state with results
        appState.results = analysis;
        
        // Update status bar to complete state
        setCompleteStatus();
        
        // Display results
        displayCalculationResults(analysis);
        
        // Update export button states
        if (typeof window.colorExport !== 'undefined' && window.colorExport.updateExportButtonStates) {
            window.colorExport.updateExportButtonStates();
        }
    
    // Save calculation to history
    saveCalculationToHistory(colorValues, analysis);
    
    // Save for offline sync if offline
    if (typeof window.colorStorage !== 'undefined' && window.colorStorage.saveOfflineCalculation) {
        window.colorStorage.saveOfflineCalculation({
            colorValues,
            analysis,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log('Color difference calculation completed successfully');
    console.log('Delta E:', analysis.deltaE);
    console.log('Tolerance Zone:', analysis.tolerance.zone);
    }).catch(error => {
        console.error('Promise chain error:', error);
        handleCalculationError(error);
    });
}

/**
 * Performance Optimization: Calculation caching
 */
function generateCalculationCacheKey(colorValues) {
    const target = colorValues.target.lab;
    const sample = colorValues.sample.lab;
    return `${target.l.toFixed(2)}-${target.a.toFixed(2)}-${target.b.toFixed(2)}_${sample.l.toFixed(2)}-${sample.a.toFixed(2)}-${sample.b.toFixed(2)}`;
}

function cacheCalculationResult(key, result) {
    // Manage cache size
    if (calculationCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry (first key)
        const firstKey = calculationCache.keys().next().value;
        calculationCache.delete(firstKey);
    }
    
    calculationCache.set(key, result);
    console.log(`Cached calculation result. Cache size: ${calculationCache.size}`);
}

/**
 * Retry operation with exponential backoff
 * Requirements: Add comprehensive error handling for calculation failures
 */
function retryOperation(operation, message, retryCount = 0) {
    return new Promise((resolve, reject) => {
        try {
            const result = operation();
            resolve(result);
        } catch (error) {
            if (retryCount < errorState.maxRetries) {
                console.log(`${message} Retry ${retryCount + 1}/${errorState.maxRetries}`);
                
                // Show retry notification
                showErrorNotification(`${message} Retry ${retryCount + 1}/${errorState.maxRetries}`, 2000);
                
                // Exponential backoff
                const delay = errorState.retryDelay * Math.pow(2, retryCount);
                
                setTimeout(() => {
                    retryOperation(operation, message, retryCount + 1)
                        .then(resolve)
                        .catch(reject);
                }, delay);
            } else {
                reject(error);
            }
        }
    });
}

/**
 * Enhanced error handling for calculations
 * Requirements: Add comprehensive error handling for calculation failures
 */
function handleCalculationError(error) {
    errorState.hasErrors = true;
    errorState.lastError = error;
    errorState.errorCount++;
    
    let userMessage = 'Calculation failed. ';
    
    // Provide specific error messages based on error type
    if (error.message.includes('Color science module not loaded')) {
        userMessage += 'Please refresh the page and try again.';
    } else if (error.message.includes('Invalid input values')) {
        userMessage += 'Please check your input values and correct any errors.';
    } else if (error.message.includes('Insufficient color data')) {
        userMessage += 'Please enter color values for both target and sample colors.';
    } else {
        userMessage += 'An unexpected error occurred. Please try again.';
    }
    
    // Show user-friendly error message
    showErrorNotification(userMessage, 8000);
    
    // Log detailed error for debugging
    console.error('Detailed calculation error:', {
        message: error.message,
        stack: error.stack,
        errorCount: errorState.errorCount,
        timestamp: new Date().toISOString()
    });
    
    // Reset calculation state
    resetCalculationState();
}

/**
 * Reset calculation state after error
 */
function resetCalculationState() {
    loadingState.isCalculating = false;
    appState.results = null;
    
    // Clear any loading indicators
    hideLoadingState(domElements.calculateBtn);
    hideGlobalLoadingIndicator();
}

/**
 * Enhanced input validation with better error reporting
 * Requirements: Add comprehensive error handling for invalid inputs
 */
function areAllInputsValid() {
    const allInputs = [
        domElements.targetC, domElements.targetM, domElements.targetY, domElements.targetK,
        domElements.targetL, domElements.targetA, domElements.targetB,
        domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK,
        domElements.sampleL, domElements.sampleA, domElements.sampleB
    ];
    
    let invalidInputs = [];
    
    const isValid = allInputs.every(input => {
        if (!input) return true; // Skip missing elements
        
        if (input.value && input.classList.contains('invalid')) {
            invalidInputs.push(input.id);
            return false;
        }
        return true;
    });
    
    if (!isValid) {
        console.warn('Invalid inputs detected:', invalidInputs);
        
        // Focus on first invalid input
        const firstInvalidInput = document.getElementById(invalidInputs[0]);
        if (firstInvalidInput) {
            firstInvalidInput.focus();
        }
    }
    
    return isValid;
}

/**
 * Enhanced color data validation
 */
function hasValidColorData(colorValues) {
    try {
        // Check if we have at least some color data for both target and sample
        const targetHasData = hasAnyColorData(colorValues.target);
        const sampleHasData = hasAnyColorData(colorValues.sample);
        
        if (!targetHasData) {
            throw new Error('No target color data provided');
        }
        
        if (!sampleHasData) {
            throw new Error('No sample color data provided');
        }
        
        return true;
        
    } catch (error) {
        console.error('Color data validation error:', error);
        return false;
    }
}

/**
 * Check if color object has any meaningful data
 */
function hasAnyColorData(colorData) {
    // Check CMYK data
    const hasCMYK = colorData.cmyk.c > 0 || colorData.cmyk.m > 0 || 
                   colorData.cmyk.y > 0 || colorData.cmyk.k > 0;
    
    // Check LAB data (L* different from default 50, or a*/b* non-zero)
    const hasLAB = colorData.lab.l !== 50 || colorData.lab.a !== 0 || colorData.lab.b !== 0;
    
    console.log('Color data validation:', {
        cmyk: colorData.cmyk,
        lab: colorData.lab,
        hasCMYK,
        hasLAB,
        result: hasCMYK || hasLAB
    });
    
    return hasCMYK || hasLAB;
}

/**
 * Display calculation results in the results section
 * Requirements: 4.2 - Display component deltas
 * Requirements: 4.3 - Color-coded tolerance zone indicators
 * Requirements: 4.5 - Display total color difference prominently
 */
function displayCalculationResults(analysis) {
    // Display main Delta E value prominently
    displayDeltaEValue(analysis.deltaE, analysis.tolerance);
    
    // Display component deltas
    displayComponentDeltas(analysis.componentDeltas);
    
    // Display tolerance zone indicator
    displayToleranceZone(analysis.tolerance);
    
    // Generate and display CMYK adjustment suggestions
    displayCMYKSuggestions(analysis);
    
    // Show results section
    showResultsSection();
    
    // Scroll to results for better user experience
    scrollToResults();
}

/**
 * Display the main Delta E value prominently
 * Requirements: 4.5 - Display total color difference prominently as ΔE*ab value
 */
function displayDeltaEValue(deltaE, tolerance) {
    if (!domElements.deltaENumber) {
        console.error('Delta E number element not found');
        return;
    }
    
    // Update the main Delta E display
    domElements.deltaENumber.textContent = deltaE.toFixed(2);
    
    // Add tolerance zone class for color coding
    domElements.deltaEValue.className = `delta-e-value ${tolerance.zone}`;
    
    // Update tooltip with detailed information
    domElements.deltaEValue.setAttribute('title', 
        `Delta E: ${deltaE.toFixed(2)} - ${tolerance.description} (${tolerance.range})`
    );
    
    console.log(`Displayed Delta E value: ${deltaE.toFixed(2)}`);
}

/**
 * Display component deltas in the delta section
 * Requirements: 4.2 - Display component deltas: ΔL*, Δa*, Δb*, ΔC*, Δh
 */
function displayComponentDeltas(componentDeltas) {
    const deltaElements = [
        { element: domElements.deltaL, value: componentDeltas.deltaL, label: 'ΔL*' },
        { element: domElements.deltaA, value: componentDeltas.deltaA, label: 'Δa*' },
        { element: domElements.deltaB, value: componentDeltas.deltaB, label: 'Δb*' },
        { element: domElements.deltaC, value: componentDeltas.deltaC, label: 'ΔC*' },
        { element: domElements.deltaH, value: componentDeltas.deltaH, label: 'Δh' }
    ];
    
    deltaElements.forEach(({ element, value, label }) => {
        if (element) {
            element.textContent = value.toFixed(2);
            element.setAttribute('title', `${label}: ${value.toFixed(2)}`);
            
            // Add visual indicator for significant differences
            element.className = Math.abs(value) > 2 ? 'significant-delta' : '';
        } else {
            console.warn(`Delta element not found for ${label}`);
        }
    });
    
    console.log('Component deltas displayed');
}

/**
 * Display tolerance zone indicator with color coding and gold accents
 * Requirements: 4.3 - Color-coded tolerance zones
 * Requirements: 4.1, 4.2, 4.3 - Gold accents for premium results
 */
function displayToleranceZone(tolerance) {
    if (!domElements.toleranceZone) {
        console.error('Tolerance zone element not found');
        return;
    }
    
    // Add gold accent classes for excellent results
    const goldClass = tolerance.zone === 'excellent' ? 'gold-accent' : '';
    const premiumClass = tolerance.zone === 'excellent' ? 'premium-feature' : '';
    
    // Create tolerance zone content with gold accents for excellent results
    const toleranceHTML = `
        <div class="tolerance-indicator ${tolerance.zone} ${goldClass}">
            <span class="tolerance-label">${tolerance.description}</span>
            <span class="tolerance-range">${tolerance.range}</span>
            ${tolerance.zone === 'excellent' ? '<span class="premium-badge">Excellent</span>' : ''}
        </div>
        <div class="tolerance-message">${tolerance.message}</div>
    `;
    
    domElements.toleranceZone.innerHTML = toleranceHTML;
    domElements.toleranceZone.className = `tolerance-zone ${tolerance.zone} ${premiumClass}`;
    
    // Apply gold accents to the delta E value container for excellent results
    if (tolerance.zone === 'excellent' && domElements.deltaEValue) {
        domElements.deltaEValue.classList.add('excellent', 'gold-glow');
    } else if (domElements.deltaEValue) {
        domElements.deltaEValue.classList.remove('excellent', 'gold-glow');
    }
    
    console.log(`Tolerance zone displayed: ${tolerance.zone} with gold accents: ${tolerance.zone === 'excellent'}`);
}

/**
 * Display CMYK adjustment suggestions
 * Requirements: 5.1 - Generate 3-5 alternative CMYK combinations to get closer to target
 * Requirements: 5.2 - Order options by likelihood of success (smallest adjustments first)
 * Requirements: 5.3 - Show complete CMYK values for each option
 */
function displayCMYKSuggestions(analysis) {
    if (!domElements.suggestionsList) {
        console.error('Suggestions list element not found');
        return;
    }
    
    try {
        // Get current color values to generate suggestions
        const colorValues = getCurrentColorValues();
        
        // Generate CMYK suggestions using the color science engine
        const suggestions = window.colorScience.generateCMYKSuggestions(
            analysis.target,
            colorValues.sample.cmyk,
            analysis.sample
        );
        
        if (suggestions.length === 0) {
            displayNoSuggestionsMessage();
            return;
        }
        
        // Create suggestions HTML
        const suggestionsHTML = suggestions.map((suggestion, index) => {
            const cmyk = suggestion.cmyk;
            const adjustmentMagnitude = calculateTotalAdjustment(cmyk, colorValues.sample.cmyk);
            
            return `
                <div class="suggestion-item" data-suggestion-index="${index}">
                    <div class="suggestion-header">
                        <span class="suggestion-number">${index + 1}</span>
                        <span class="suggestion-description">${suggestion.description}</span>
                        <span class="adjustment-magnitude">±${adjustmentMagnitude.toFixed(1)}%</span>
                    </div>
                    <div class="suggestion-cmyk">
                        <div class="cmyk-values">
                            <span class="cmyk-component">
                                <label>C:</label>
                                <span class="cmyk-value">${cmyk.c.toFixed(1)}%</span>
                            </span>
                            <span class="cmyk-component">
                                <label>M:</label>
                                <span class="cmyk-value">${cmyk.m.toFixed(1)}%</span>
                            </span>
                            <span class="cmyk-component">
                                <label>Y:</label>
                                <span class="cmyk-value">${cmyk.y.toFixed(1)}%</span>
                            </span>
                            <span class="cmyk-component">
                                <label>K:</label>
                                <span class="cmyk-value">${cmyk.k.toFixed(1)}%</span>
                            </span>
                        </div>
                        <div class="suggestion-actions">
                            <button class="apply-suggestion-btn" onclick="applySuggestion(${index})">
                                Apply
                            </button>
                            <button class="copy-suggestion-btn" onclick="copySuggestionToClipboard(${index})">
                                Copy
                            </button>
                        </div>
                    </div>
                    <div class="suggestion-preview">
                        <div class="suggestion-swatch" style="background-color: ${window.colorScience.cmykToCssString(cmyk.c, cmyk.m, cmyk.y, cmyk.k)}"></div>
                        <span class="suggestion-type">${suggestion.adjustmentType}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update suggestions list
        domElements.suggestionsList.innerHTML = suggestionsHTML;
        
        // Store suggestions for later use (apply/copy functions)
        window.currentSuggestions = suggestions;
        
        console.log(`Displayed ${suggestions.length} CMYK suggestions`);
        
    } catch (error) {
        console.error('Error displaying CMYK suggestions:', error);
        displaySuggestionsError(error.message);
    }
}

/**
 * Display message when no suggestions can be generated
 */
function displayNoSuggestionsMessage() {
    domElements.suggestionsList.innerHTML = `
        <div class="no-suggestions">
            <p>No adjustment suggestions available.</p>
            <p>The current color difference may be too small to require adjustments, or the colors are already well-matched.</p>
        </div>
    `;
}

/**
 * Display error message for suggestion generation
 */
function displaySuggestionsError(errorMessage) {
    domElements.suggestionsList.innerHTML = `
        <div class="suggestions-error">
            <p>Unable to generate suggestions: ${errorMessage}</p>
            <p>Please check your input values and try again.</p>
        </div>
    `;
}

// Step-by-step calculation workflow for professional printing users
class CalculationWorkflow {
    constructor() {
        this.steps = [
            { id: 'validate', name: 'Validate Inputs', status: 'pending' },
            { id: 'convert-target', name: 'Convert Target CMYK→LAB', status: 'pending' },
            { id: 'convert-sample', name: 'Convert Sample CMYK→LAB', status: 'pending' },
            { id: 'calculate-deltas', name: 'Calculate Component Deltas', status: 'pending' },
            { id: 'calculate-deltae', name: 'Calculate Total ΔE', status: 'pending' },
            { id: 'analyze-tolerance', name: 'Analyze Tolerance Zone', status: 'pending' },
            { id: 'generate-results', name: 'Generate Professional Report', status: 'pending' }
        ];
        this.currentStep = 0;
        this.isVisible = false;
    }

    showWorkflow() {
        this.isVisible = true;
        this.renderWorkflow();
    }

    hideWorkflow() {
        this.isVisible = false;
        const container = document.getElementById('calculation-workflow');
        if (container) container.style.display = 'none';
    }

    updateStep(stepId, status, details = null) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.status = status;
            step.details = details;
            this.renderWorkflow();
        }
    }

    renderWorkflow() {
        if (!this.isVisible) return;
        
        let container = document.getElementById('calculation-workflow');
        if (!container) {
            container = document.createElement('div');
            container.id = 'calculation-workflow';
            container.className = 'workflow-container';
            
            const calculatorMain = document.querySelector('.calculator-main');
            if (calculatorMain) {
                calculatorMain.parentNode.insertBefore(container, calculatorMain.nextSibling);
            }
        }
        
        container.style.display = 'block';
        container.innerHTML = `
            <div class="workflow-header">
                <h3>Calculation Process</h3>
                <button class="workflow-close" onclick="calculationWorkflow.hideWorkflow()">×</button>
            </div>
            <div class="workflow-steps">
                ${this.steps.map((step, index) => `
                    <div class="workflow-step ${step.status}" data-step="${step.id}">
                        <div class="step-indicator">
                            <span class="step-number">${index + 1}</span>
                            ${step.status === 'completed' ? '<span class="step-checkmark">✓</span>' : ''}
                            ${step.status === 'processing' ? '<span class="step-spinner">⟳</span>' : ''}
                        </div>
                        <div class="step-content">
                            <div class="step-name">${step.name}</div>
                            ${step.details ? `<div class="step-details">${step.details}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    reset() {
        this.steps.forEach(step => {
            step.status = 'pending';
            step.details = null;
        });
        this.currentStep = 0;
        if (this.isVisible) this.renderWorkflow();
    }
}

// Global workflow instance
const calculationWorkflow = new CalculationWorkflow();

/**
 * Calculate total adjustment magnitude between two CMYK values
 */
function calculateTotalAdjustment(cmyk1, cmyk2) {
    return Math.abs(cmyk1.c - cmyk2.c) + 
           Math.abs(cmyk1.m - cmyk2.m) + 
           Math.abs(cmyk1.y - cmyk2.y) + 
           Math.abs(cmyk1.k - cmyk2.k);
}

/**
 * Show the results section with animation
 */
function showResultsSection() {
    if (domElements.resultsSection) {
        domElements.resultsSection.classList.add('visible');
        domElements.resultsSection.style.display = 'block';
    }
}

/**
 * Scroll to results section for better user experience
 */
function scrollToResults() {
    if (domElements.resultsSection) {
        setTimeout(() => {
            domElements.resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
}

/**
 * Validate that we have sufficient color data for calculation
 */
function hasValidColorData(colorValues) {
    // Check if we have LAB values for both colors (preferred for Delta E calculation)
    const targetLabComplete = colorValues.target.lab.l !== 50 || 
                             colorValues.target.lab.a !== 0 || 
                             colorValues.target.lab.b !== 0;
    
    const sampleLabComplete = colorValues.sample.lab.l !== 50 || 
                             colorValues.sample.lab.a !== 0 || 
                             colorValues.sample.lab.b !== 0;
    
    // For now, require LAB values for accurate Delta E calculation
    // Future enhancement could convert CMYK to LAB if only CMYK is provided
    return targetLabComplete && sampleLabComplete;
}

/**
 * Set calculate button state (ready, calculating, error)
 */
function setCalculateButtonState(state) {
    if (!domElements.calculateBtn) return;
    
    const states = {
        ready: {
            text: 'Calculate Color Difference',
            disabled: false,
            className: 'calculate-button'
        },
        calculating: {
            text: 'Calculating...',
            disabled: true,
            className: 'calculate-button calculating'
        },
        error: {
            text: 'Error - Try Again',
            disabled: false,
            className: 'calculate-button error'
        }
    };
    
    const currentState = states[state] || states.ready;
    
    domElements.calculateBtn.textContent = currentState.text;
    domElements.calculateBtn.disabled = currentState.disabled;
    domElements.calculateBtn.className = currentState.className;
}

/**
 * Show calculation error message
 */
function showCalculationError(message) {
    console.error('Calculation error:', message);
    
    // Update button state
    setCalculateButtonState('error');
    
    // Show error in results section
    if (domElements.resultsSection) {
        domElements.resultsSection.innerHTML = `
            <div class="calculation-error">
                <h3>Calculation Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">Refresh Page</button>
            </div>
        `;
        domElements.resultsSection.classList.add('visible', 'error');
        domElements.resultsSection.style.display = 'block';
    }
    
    // Reset button state after 3 seconds
    setTimeout(() => {
        setCalculateButtonState('ready');
    }, 3000);
}

/**
 * Clear results display
 */
function clearResults() {
    // Reset Delta E display
    if (domElements.deltaENumber) {
        domElements.deltaENumber.textContent = '--';
    }
    
    // Reset component deltas
    const deltaElements = [domElements.deltaL, domElements.deltaA, domElements.deltaB, domElements.deltaC, domElements.deltaH];
    deltaElements.forEach(element => {
        if (element) {
            element.textContent = '--';
            element.className = '';
        }
    });
    
    // Clear tolerance zone
    if (domElements.toleranceZone) {
        domElements.toleranceZone.innerHTML = '';
        domElements.toleranceZone.className = 'tolerance-zone';
    }
    
    // Hide results section
    if (domElements.resultsSection) {
        domElements.resultsSection.classList.remove('visible', 'error');
        domElements.resultsSection.style.display = 'none';
    }
    
    // Clear application state
    appState.results = null;
    
    // Update export button states
    if (typeof window.colorExport !== 'undefined' && window.colorExport.updateExportButtonStates) {
        window.colorExport.updateExportButtonStates();
    }
    
    console.log('Results cleared');
}

/**
 * Save completed calculation to history
 * Requirements: 8.1 - Automatically save recent color comparisons to local storage
 */
function saveCalculationToHistory(colorValues, analysis) {
    try {
        // Check if storage module is available
        if (typeof window.colorStorage === 'undefined') {
            console.warn('Storage module not available, skipping history save');
            return;
        }
        
        // Prepare comparison data for storage
        const comparison = {
            target: {
                cmyk: { ...colorValues.target.cmyk },
                lab: { ...colorValues.target.lab }
            },
            sample: {
                cmyk: { ...colorValues.sample.cmyk },
                lab: { ...colorValues.sample.lab }
            },
            deltaE: analysis.deltaE,
            tolerance: analysis.tolerance,
            componentDeltas: analysis.componentDeltas,
            notes: '' // Could be extended to allow user notes
        };
        
        // Save to history using storage module
        const historyEntry = window.colorStorage.saveToHistory(comparison);
        
        if (historyEntry) {
            console.log('Calculation saved to history successfully');
            
            // Refresh history display
            window.colorStorage.displayHistory();
        } else {
            console.warn('Failed to save calculation to history');
        }
        
    } catch (error) {
        console.error('Error saving calculation to history:', error);
    }
}

// Export functions for use by other modules (simple approach without ES6 modules)
window.calculatorApp = {
    appState,
    domElements,
    areAllInputsValid,
    getCurrentColorValues,
    updateInputValidationState,
    updateColorSwatch,
    updateAllColorSwatches,
    forceUpdateSwatches,
    testValidation,
    loadTestData,
    performColorDifferenceCalculation,
    displayCalculationResults,
    clearResults,
    hasValidColorData,
    saveCalculationToHistory
};
/**

 * Apply a suggestion to the sample color inputs
 * Requirements: 5.3 - Show complete CMYK values for each option
 */
function applySuggestion(suggestionIndex) {
    if (!window.currentSuggestions || !window.currentSuggestions[suggestionIndex]) {
        console.error('Invalid suggestion index:', suggestionIndex);
        return;
    }
    
    const suggestion = window.currentSuggestions[suggestionIndex];
    const cmyk = suggestion.cmyk;
    
    // Update sample CMYK input fields
    domElements.sampleC.value = cmyk.c.toFixed(1);
    domElements.sampleM.value = cmyk.m.toFixed(1);
    domElements.sampleY.value = cmyk.y.toFixed(1);
    domElements.sampleK.value = cmyk.k.toFixed(1);
    
    // Trigger input events to update validation and color swatches
    [domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK].forEach(input => {
        input.dispatchEvent(new Event('input'));
    });
    
    // Update application state
    appState.sample.cmyk = { ...cmyk };
    
    // Update color swatch
    updateColorSwatch('sample');
    
    // Provide user feedback
    showSuggestionAppliedFeedback(suggestionIndex + 1, suggestion.description);
    
    console.log(`Applied suggestion ${suggestionIndex + 1}: ${suggestion.description}`);
}

/**
 * Copy suggestion CMYK values to clipboard
 * Requirements: 8.4 - Copy-to-clipboard functionality for CMYK suggestions
 */
function copySuggestionToClipboard(suggestionIndex) {
    if (!window.currentSuggestions || !window.currentSuggestions[suggestionIndex]) {
        console.error('Invalid suggestion index:', suggestionIndex);
        return;
    }
    
    const suggestion = window.currentSuggestions[suggestionIndex];
    const cmyk = suggestion.cmyk;
    
    // Format CMYK values for clipboard
    const cmykText = `C: ${cmyk.c.toFixed(1)}%, M: ${cmyk.m.toFixed(1)}%, Y: ${cmyk.y.toFixed(1)}%, K: ${cmyk.k.toFixed(1)}%`;
    
    // Copy to clipboard using modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(cmykText).then(() => {
            showCopySuccessFeedback(suggestionIndex + 1);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            fallbackCopyToClipboard(cmykText, suggestionIndex + 1);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(cmykText, suggestionIndex + 1);
    }
    
    console.log(`Copied suggestion ${suggestionIndex + 1} to clipboard: ${cmykText}`);
}

/**
 * Fallback clipboard copy method for older browsers
 */
function fallbackCopyToClipboard(text, suggestionNumber) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccessFeedback(suggestionNumber);
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyErrorFeedback(suggestionNumber);
    } finally {
        document.body.removeChild(textArea);
    }
}

/**
 * Show feedback when suggestion is applied
 */
function showSuggestionAppliedFeedback(suggestionNumber, description) {
    const feedback = document.createElement('div');
    feedback.className = 'suggestion-feedback applied';
    feedback.innerHTML = `
        <span class="feedback-icon">✓</span>
        <span class="feedback-text">Applied suggestion ${suggestionNumber}: ${description}</span>
    `;
    
    showTemporaryFeedback(feedback);
}

/**
 * Show feedback when suggestion is copied to clipboard
 */
function showCopySuccessFeedback(suggestionNumber) {
    const feedback = document.createElement('div');
    feedback.className = 'suggestion-feedback copied';
    feedback.innerHTML = `
        <span class="feedback-icon">📋</span>
        <span class="feedback-text">Copied suggestion ${suggestionNumber} to clipboard</span>
    `;
    
    showTemporaryFeedback(feedback);
}

/**
 * Show feedback when clipboard copy fails
 */
function showCopyErrorFeedback(suggestionNumber) {
    const feedback = document.createElement('div');
    feedback.className = 'suggestion-feedback error';
    feedback.innerHTML = `
        <span class="feedback-icon">⚠</span>
        <span class="feedback-text">Failed to copy suggestion ${suggestionNumber}</span>
    `;
    
    showTemporaryFeedback(feedback);
}

/**
 * Show temporary feedback message
 */
function showTemporaryFeedback(feedbackElement) {
    // Add to page
    document.body.appendChild(feedbackElement);
    
    // Position feedback
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.top = '20px';
    feedbackElement.style.right = '20px';
    feedbackElement.style.zIndex = '10000';
    
    // Animate in
    setTimeout(() => {
        feedbackElement.classList.add('visible');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        feedbackElement.classList.remove('visible');
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 300);
    }, 3000);
}

// Make functions globally available for onclick handlers
window.applySuggestion = applySuggestion;
window.copySuggestionToClipboard = copySuggestionToClipboard;
/**
 * Ini
tialize preset color dropdowns
 * Requirements: 8.4 - Preset CMYK colors for common spot colors and brand colors
 */
function initializePresetColors() {
    console.log('Initializing preset colors...');
    
    // Populate target preset dropdown
    if (domElements.targetPresetSelect) {
        populatePresetDropdown(domElements.targetPresetSelect);
        domElements.targetPresetSelect.addEventListener('change', function(e) {
            handlePresetSelection('target', e.target.value);
        });
    }
    
    // Populate sample preset dropdown
    if (domElements.samplePresetSelect) {
        populatePresetDropdown(domElements.samplePresetSelect);
        domElements.samplePresetSelect.addEventListener('change', function(e) {
            handlePresetSelection('sample', e.target.value);
        });
    }
    
    console.log('Preset colors initialized successfully');
}

/**
 * Populate a preset dropdown with available colors
 * Enhanced with Pantone Color Database integration
 */
function populatePresetDropdown(selectElement) {
    console.log('Populating preset dropdown...', selectElement);
    
    // Clear existing options (except the first placeholder)
    while (selectElement.children.length > 1) {
        selectElement.removeChild(selectElement.lastChild);
    }
    
    try {
        // Check if Pantone colors are available
        if (window.pantoneColors && window.pantoneColors.generatePantonePresetOptions) {
            console.log('Using Pantone color database');
            // Use Pantone color database
            const pantoneOptions = window.pantoneColors.generatePantonePresetOptions();
            console.log('Generated Pantone options:', pantoneOptions.length);
            
            pantoneOptions.forEach(option => {
                if (option.type === 'header') {
                    // Create optgroup for color family
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = option.label;
                    selectElement.appendChild(optgroup);
                } else if (option.type === 'color') {
                    // Create option for individual color
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    optionElement.dataset.colorData = JSON.stringify(option.color);
                    
                    // Add to the last optgroup
                    const lastOptgroup = selectElement.querySelector('optgroup:last-child');
                    if (lastOptgroup) {
                        lastOptgroup.appendChild(optionElement);
                    } else {
                        selectElement.appendChild(optionElement);
                    }
                }
            });
            
            console.log('Populated dropdown with Pantone colors');
            
        } else {
            // Fallback to basic colors if Pantone database not available
            console.warn('Pantone database not available, using fallback colors');
            populateFallbackColors(selectElement);
        }
        
    } catch (error) {
        console.error('Error populating preset dropdown:', error);
        populateFallbackColors(selectElement);
    }
}

/**
 * Fallback color population if Pantone database is not available
 */
function populateFallbackColors(selectElement) {
    console.log('Using fallback color population');
    
    const fallbackColors = {
        'Process Colors': [
            { name: 'Process Cyan', cmyk: { c: 100, m: 0, y: 0, k: 0 }, lab: { l: 55, a: -37, b: -50 } },
            { name: 'Process Magenta', cmyk: { c: 0, m: 100, y: 0, k: 0 }, lab: { l: 60, a: 94, b: -60 } },
            { name: 'Process Yellow', cmyk: { c: 0, m: 0, y: 100, k: 0 }, lab: { l: 89, a: -5, b: 93 } },
            { name: 'Process Black', cmyk: { c: 0, m: 0, y: 0, k: 100 }, lab: { l: 16, a: 0, b: 0 } }
        ],
        'Common Spot Colors': [
            { name: 'Reflex Blue', cmyk: { c: 100, m: 72, y: 0, k: 18 }, lab: { l: 25, a: 68, b: -112 } },
            { name: 'Warm Red', cmyk: { c: 0, m: 100, y: 100, k: 0 }, lab: { l: 48, a: 74, b: 64 } },
            { name: 'Green', cmyk: { c: 100, m: 0, y: 100, k: 0 }, lab: { l: 51, a: -68, b: 67 } }
        ]
    };
    
    Object.keys(fallbackColors).forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        fallbackColors[category].forEach(color => {
            const option = document.createElement('option');
            option.value = color.name;
            option.textContent = color.name;
            option.dataset.colorData = JSON.stringify(color);
            optgroup.appendChild(option);
        });
        
        selectElement.appendChild(optgroup);
    });
}

/**
 * Handle preset color selection
 * Requirements: 8.4 - Quick-fill buttons for frequently used color combinations
 */
function handlePresetSelection(colorType, presetName) {
    if (!presetName || !PRESET_COLORS[presetName]) {
        return;
    }
    
    console.log(`Applying preset color "${presetName}" to ${colorType}`);
    
    const presetColor = PRESET_COLORS[presetName];
    
    // Get the appropriate input elements
    const inputs = getColorInputElements(colorType);
    
    if (!inputs) {
        console.error(`Could not find input elements for ${colorType}`);
        return;
    }
    
    // Apply the preset CMYK values
    inputs.c.value = presetColor.c.toFixed(1);
    inputs.m.value = presetColor.m.toFixed(1);
    inputs.y.value = presetColor.y.toFixed(1);
    inputs.k.value = presetColor.k.toFixed(1);
    
    // Trigger input events to update validation and swatches
    [inputs.c, inputs.m, inputs.y, inputs.k].forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Clear LAB values to let CMYK take precedence
    inputs.l.value = '';
    inputs.a.value = '';
    inputs.b.value = '';
    
    // Trigger LAB input events
    [inputs.l, inputs.a, inputs.b].forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Reset dropdown to placeholder
    const selectElement = colorType === 'target' ? domElements.targetPresetSelect : domElements.samplePresetSelect;
    if (selectElement) {
        selectElement.value = '';
    }
    
    // Show feedback
    showPresetAppliedFeedback(colorType, presetName);
    
    console.log(`Applied preset "${presetName}": C:${presetColor.c}% M:${presetColor.m}% Y:${presetColor.y}% K:${presetColor.k}%`);
}

/**
 * Get input elements for a specific color type
 */
function getColorInputElements(colorType) {
    if (colorType === 'target') {
        return {
            c: domElements.targetC,
            m: domElements.targetM,
            y: domElements.targetY,
            k: domElements.targetK,
            l: domElements.targetL,
            a: domElements.targetA,
            b: domElements.targetB
        };
    } else if (colorType === 'sample') {
        return {
            c: domElements.sampleC,
            m: domElements.sampleM,
            y: domElements.sampleY,
            k: domElements.sampleK,
            l: domElements.sampleL,
            a: domElements.sampleA,
            b: domElements.sampleB
        };
    }
    return null;
}

/**
 * Setup workflow enhancement event listeners
 * Requirements: 7.4 - Complete 90% of comparisons with minimal clicks
 */
function setupWorkflowEnhancements() {
    console.log('Setting up workflow enhancements...');
    
    // Clear buttons
    if (domElements.targetClearBtn) {
        domElements.targetClearBtn.addEventListener('click', function() {
            clearColorInputs('target');
        });
    }
    
    if (domElements.sampleClearBtn) {
        domElements.sampleClearBtn.addEventListener('click', function() {
            clearColorInputs('sample');
        });
    }
    
    // Copy CMYK buttons
    if (domElements.targetCopyBtn) {
        domElements.targetCopyBtn.addEventListener('click', function() {
            copyCMYKToClipboard('target');
        });
    }
    
    if (domElements.sampleCopyBtn) {
        domElements.sampleCopyBtn.addEventListener('click', function() {
            copyCMYKToClipboard('sample');
        });
    }
    
    // Reset all button
    if (domElements.resetAllBtn) {
        domElements.resetAllBtn.addEventListener('click', function() {
            resetAllInputs();
        });
    }
    
    // Workflow toggle button
    const workflowToggleBtn = document.getElementById('workflow-toggle-btn');
    if (workflowToggleBtn) {
        workflowToggleBtn.addEventListener('click', function() {
            if (calculationWorkflow.isVisible) {
                calculationWorkflow.hideWorkflow();
                workflowToggleBtn.textContent = 'Show Process';
                workflowToggleBtn.classList.remove('active');
            } else {
                calculationWorkflow.showWorkflow();
                workflowToggleBtn.textContent = 'Hide Process';
                workflowToggleBtn.classList.add('active');
            }
        });
    }
    
    // Professional help toggle button
    const helpToggleBtn = document.getElementById('help-toggle-btn');
    const helpPanel = document.getElementById('professional-help-panel');
    if (helpToggleBtn && helpPanel) {
        helpToggleBtn.addEventListener('click', function() {
            if (helpPanel.classList.contains('visible')) {
                helpPanel.classList.remove('visible');
                helpToggleBtn.textContent = 'Help Guide';
                helpToggleBtn.classList.remove('active');
            } else {
                helpPanel.classList.add('visible');
                helpToggleBtn.textContent = 'Hide Guide';
                helpToggleBtn.classList.add('active');
            }
        });
    }
    
    console.log('Workflow enhancements set up successfully');
}

/**
 * Clear all inputs for a specific color type
 * Requirements: 7.4 - Clear/reset functionality for all input fields
 */
function clearColorInputs(colorType) {
    console.log(`Clearing ${colorType} color inputs...`);
    
    const inputs = getColorInputElements(colorType);
    
    if (!inputs) {
        console.error(`Could not find input elements for ${colorType}`);
        return;
    }
    
    // Clear all input values
    Object.values(inputs).forEach(input => {
        if (input) {
            input.value = '';
            input.classList.remove('valid', 'invalid');
            clearValidationError(input);
        }
    });
    
    // Reset application state for this color
    if (colorType === 'target') {
        appState.target = { 
            cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
            lab: { l: 50, a: 0, b: 0 } 
        };
    } else {
        appState.sample = { 
            cmyk: { c: 0, m: 0, y: 0, k: 0 }, 
            lab: { l: 50, a: 0, b: 0 } 
        };
    }
    
    // Update color swatch to default
    updateColorSwatch(colorType);
    
    // Show feedback
    showClearFeedback(colorType);
    
    console.log(`${colorType} color inputs cleared`);
}

/**
 * Copy CMYK values to clipboard
 * Requirements: 8.4 - Copy-to-clipboard functionality for CMYK suggestions
 */
function copyCMYKToClipboard(colorType) {
    console.log(`Copying ${colorType} CMYK values to clipboard...`);
    
    const inputs = getColorInputElements(colorType);
    
    if (!inputs) {
        console.error(`Could not find input elements for ${colorType}`);
        return;
    }
    
    // Get current CMYK values
    const c = parseFloat(inputs.c.value) || 0;
    const m = parseFloat(inputs.m.value) || 0;
    const y = parseFloat(inputs.y.value) || 0;
    const k = parseFloat(inputs.k.value) || 0;
    
    // Format CMYK string
    const cmykString = `C:${c.toFixed(1)}% M:${m.toFixed(1)}% Y:${y.toFixed(1)}% K:${k.toFixed(1)}%`;
    
    // Copy to clipboard
    copyTextToClipboard(cmykString)
        .then(() => {
            showCopyFeedback(colorType, cmykString, true);
            console.log(`Copied to clipboard: ${cmykString}`);
        })
        .catch(error => {
            console.error('Failed to copy to clipboard:', error);
            showCopyFeedback(colorType, cmykString, false);
        });
}

/**
 * Reset all inputs and application state
 * Requirements: 7.4 - Clear/reset functionality for all input fields
 */
function resetAllInputs() {
    console.log('Resetting all inputs...');
    
    // Clear both target and sample inputs
    clearColorInputs('target');
    clearColorInputs('sample');
    
    // Clear results
    if (domElements.resultsSection) {
        domElements.resultsSection.classList.remove('visible');
        domElements.resultsSection.style.display = 'none';
    }
    
    // Reset component deltas
    if (domElements.deltaL) domElements.deltaL.textContent = '--';
    if (domElements.deltaA) domElements.deltaA.textContent = '--';
    if (domElements.deltaB) domElements.deltaB.textContent = '--';
    if (domElements.deltaC) domElements.deltaC.textContent = '--';
    if (domElements.deltaH) domElements.deltaH.textContent = '--';
    
    // Reset Delta E display
    if (domElements.deltaENumber) domElements.deltaENumber.textContent = '--';
    if (domElements.toleranceZone) domElements.toleranceZone.innerHTML = '';
    if (domElements.suggestionsList) domElements.suggestionsList.innerHTML = '';
    
    // Reset application state
    appState.results = null;
    
    // Reset preset dropdowns
    if (domElements.targetPresetSelect) domElements.targetPresetSelect.value = '';
    if (domElements.samplePresetSelect) domElements.samplePresetSelect.value = '';
    
    // Show feedback
    showResetAllFeedback();
    
    console.log('All inputs reset successfully');
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 */
async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers or non-secure contexts
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command failed'));
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }
}

/**
 * Show feedback when preset color is applied
 */
function showPresetAppliedFeedback(colorType, presetName) {
    const button = colorType === 'target' ? domElements.targetClearBtn : domElements.sampleClearBtn;
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Applied!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 2000);
    }
}

/**
 * Show feedback when inputs are cleared
 */
function showClearFeedback(colorType) {
    const button = colorType === 'target' ? domElements.targetClearBtn : domElements.sampleClearBtn;
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Cleared!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 1500);
    }
}

/**
 * Show feedback when CMYK values are copied
 */
function showCopyFeedback(colorType, cmykString, success) {
    const button = colorType === 'target' ? domElements.targetCopyBtn : domElements.sampleCopyBtn;
    if (button) {
        const originalText = button.textContent;
        
        if (success) {
            button.textContent = 'Copied!';
            button.classList.add('success');
        } else {
            button.textContent = 'Failed';
            button.style.backgroundColor = '#dc3545';
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
            button.style.backgroundColor = '';
        }, 2000);
    }
}

/**
 * Show feedback when all inputs are reset
 */
function showResetAllFeedback() {
    if (domElements.resetAllBtn) {
        const originalText = domElements.resetAllBtn.textContent;
        domElements.resetAllBtn.textContent = 'Reset Complete!';
        domElements.resetAllBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            domElements.resetAllBtn.textContent = originalText;
            domElements.resetAllBtn.style.backgroundColor = '';
        }, 2000);
    }
}

/**
 * Enhanced copy functionality for CMYK suggestions
 * Requirements: 8.4 - Copy-to-clipboard functionality for CMYK suggestions
 */
function copySuggestionToClipboard(suggestionIndex) {
    if (!appState.results || !appState.results.suggestions) {
        console.error('No suggestions available to copy');
        return;
    }
    
    const suggestion = appState.results.suggestions[suggestionIndex];
    if (!suggestion) {
        console.error(`Suggestion ${suggestionIndex} not found`);
        return;
    }
    
    const cmyk = suggestion.cmyk;
    const cmykString = `C:${cmyk.c.toFixed(1)}% M:${cmyk.m.toFixed(1)}% Y:${cmyk.y.toFixed(1)}% K:${cmyk.k.toFixed(1)}%`;
    
    copyTextToClipboard(cmykString)
        .then(() => {
            showSuggestionCopyFeedback(suggestionIndex, true);
            console.log(`Copied suggestion to clipboard: ${cmykString}`);
        })
        .catch(error => {
            console.error('Failed to copy suggestion to clipboard:', error);
            showSuggestionCopyFeedback(suggestionIndex, false);
        });
}

/**
 * Show feedback when suggestion is copied
 */
function showSuggestionCopyFeedback(suggestionIndex, success) {
    const suggestionItem = document.querySelector(`[data-suggestion-index="${suggestionIndex}"]`);
    if (!suggestionItem) return;
    
    const copyButton = suggestionItem.querySelector('.copy-suggestion-btn');
    if (!copyButton) return;
    
    const originalText = copyButton.textContent;
    
    if (success) {
        copyButton.textContent = 'Copied!';
        copyButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else {
        copyButton.textContent = 'Failed';
        copyButton.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
    }
    
    setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.background = '';
    }, 2000);
}

// Debug function to test validation (can be removed in production)
function testValidation() {
    console.log('Testing validation system...');
    
    // Test CMYK validation
    console.log('CMYK 50:', validateCMYKValue(50)); // Should be true
    console.log('CMYK 150:', validateCMYKValue(150)); // Should be false
    console.log('CMYK -10:', validateCMYKValue(-10)); // Should be false
    
    // Test LAB validation
    console.log('LAB L* 50:', validateLABValue(50, 'l')); // Should be true
    console.log('LAB L* 150:', validateLABValue(150, 'l')); // Should be false
    console.log('LAB a* 50:', validateLABValue(50, 'a')); // Should be true
    console.log('LAB a* 150:', validateLABValue(150, 'a')); // Should be false
    
    console.log('Validation tests completed');
}

// Debug function to test preset colors
function testPresetColors() {
    console.log('Testing preset colors...');
    
    // Test applying a preset to target
    handlePresetSelection('target', 'Process Cyan');
    
    setTimeout(() => {
        // Test applying a preset to sample
        handlePresetSelection('sample', 'Pantone Red 032');
    }, 1000);
    
    console.log('Preset color tests completed');
}

// Debug function to test workflow enhancements
function testWorkflowEnhancements() {
    console.log('Testing workflow enhancements...');
    
    // Load some test data first
    loadTestData();
    
    setTimeout(() => {
        // Test copy functionality
        copyCMYKToClipboard('target');
    }, 1000);
    
    setTimeout(() => {
        // Test clear functionality
        clearColorInputs('sample');
    }, 2000);
    
    setTimeout(() => {
        // Test reset all functionality
        resetAllInputs();
    }, 3000);
    
    console.log('Workflow enhancement tests completed');
}/**

 * G7 Integration Functions
 * Integrates G7 gray balance analysis with existing LAB Color Matching Calculator
 * Following established methodologies and maintaining backward compatibility
 */

// G7 Analysis State
const g7State = {
    enabled: true,
    prioritizeG7: false,
    lastAnalysis: null,
    analysisCache: new Map()
};

/**
 * Initialize G7 Analysis Integration
 * Sets up G7 controls and event listeners
 */
function initializeG7Integration() {
    console.log('Initializing G7 integration...');
    
    try {
        // Cache G7 DOM elements
        domElements.g7Container = document.getElementById('g7-analysis-container');
        domElements.g7ComplianceStatus = document.getElementById('g7-compliance-status');
        domElements.g7ComplianceIndicator = document.getElementById('compliance-indicator');
        domElements.g7ComplianceDetails = document.getElementById('compliance-details');
        domElements.g7RecommendationsList = document.getElementById('g7-recommendations-list');
        domElements.enableG7Checkbox = document.getElementById('enable-g7-analysis');
        domElements.prioritizeG7Checkbox = document.getElementById('prioritize-g7-suggestions');
        
        // Set up G7 control event listeners
        if (domElements.enableG7Checkbox) {
            domElements.enableG7Checkbox.addEventListener('change', function(e) {
                g7State.enabled = e.target.checked;
                toggleG7Analysis(g7State.enabled);
                console.log(`G7 analysis ${g7State.enabled ? 'enabled' : 'disabled'}`);
            });
        }
        
        if (domElements.prioritizeG7Checkbox) {
            domElements.prioritizeG7Checkbox.addEventListener('change', function(e) {
                g7State.prioritizeG7 = e.target.checked;
                console.log(`G7 prioritization ${g7State.prioritizeG7 ? 'enabled' : 'disabled'}`);
                
                // Refresh suggestions if we have current results
                if (appState.results && g7State.enabled) {
                    updateG7Analysis();
                }
            });
        }
        
        console.log('G7 integration initialized successfully');
        
    } catch (error) {
        console.error('Error initializing G7 integration:', error);
    }
}

/**
 * Toggle G7 Analysis Display
 * Shows/hides G7 analysis section based on enabled state
 */
function toggleG7Analysis(enabled) {
    if (!domElements.g7Container) return;
    
    if (enabled) {
        domElements.g7Container.style.display = 'block';
        domElements.g7Container.classList.add('active');
        
        // Trigger analysis if we have current color data
        const currentColors = getCurrentColorValues();
        if (hasValidColorData(currentColors.sample)) {
            performG7Analysis(currentColors.sample.cmyk);
        }
    } else {
        domElements.g7Container.style.display = 'none';
        domElements.g7Container.classList.remove('active');
    }
}

/**
 * Perform G7 Analysis on CMYK Values
 * Analyzes sample color for G7 compliance and updates display
 */
function performG7Analysis(cmykValues) {
    if (!g7State.enabled || !window.colorScience?.calculateG7GrayBalance) {
        return null;
    }
    
    try {
        // Generate cache key for performance
        const cacheKey = `g7_${cmykValues.c}_${cmykValues.m}_${cmykValues.y}_${cmykValues.k}`;
        
        // Check cache first
        if (g7State.analysisCache.has(cacheKey)) {
            const cachedResult = g7State.analysisCache.get(cacheKey);
            updateG7Display(cachedResult);
            return cachedResult;
        }
        
        // Perform G7 analysis
        const g7Analysis = window.colorScience.calculateG7GrayBalance(
            cmykValues.c, 
            cmykValues.m, 
            cmykValues.y, 
            cmykValues.k
        );
        
        // Cache the result
        g7State.analysisCache.set(cacheKey, g7Analysis);
        g7State.lastAnalysis = g7Analysis;
        
        // Update display
        updateG7Display(g7Analysis);
        
        console.log('G7 Analysis completed:', {
            compliant: g7Analysis.isG7Compliant,
            grayLevel: g7Analysis.grayLevel,
            deviation: g7Analysis.totalDeviation,
            recommendations: g7Analysis.recommendations?.length || 0
        });
        
        return g7Analysis;
        
    } catch (error) {
        console.error('Error performing G7 analysis:', error);
        displayG7Error(error.message);
        return null;
    }
}

/**
 * Update G7 Analysis Display
 * Updates the G7 analysis section with current analysis results
 */
function updateG7Display(g7Analysis) {
    if (!g7Analysis || !domElements.g7ComplianceIndicator) return;
    
    try {
        // Update compliance status
        const complianceIcon = domElements.g7ComplianceIndicator.querySelector('.compliance-icon');
        const complianceText = domElements.g7ComplianceIndicator.querySelector('.compliance-text');
        
        if (complianceIcon && complianceText) {
            // Set compliance level styling
            const complianceLevel = g7Analysis.complianceLevel || 'unknown';
            complianceIcon.className = `compliance-icon ${complianceLevel}`;
            
            // Set compliance icon and text
            const complianceInfo = getG7ComplianceDisplayInfo(g7Analysis);
            complianceIcon.textContent = complianceInfo.icon;
            complianceText.textContent = complianceInfo.text;
        }
        
        // Update compliance details
        if (domElements.g7ComplianceDetails) {
            const grayLevelSpan = domElements.g7ComplianceDetails.querySelector('.gray-level');
            const deviationSpan = domElements.g7ComplianceDetails.querySelector('.deviation');
            
            if (grayLevelSpan) {
                grayLevelSpan.textContent = `Gray Level: ${g7Analysis.grayLevel}%`;
            }
            
            if (deviationSpan) {
                deviationSpan.textContent = `Total Deviation: ${g7Analysis.totalDeviation.toFixed(2)}`;
            }
        }
        
        // Update recommendations
        updateG7Recommendations(g7Analysis.recommendations || []);
        
        // Show the G7 container if it's hidden
        if (domElements.g7Container && domElements.g7Container.style.display === 'none') {
            domElements.g7Container.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error updating G7 display:', error);
    }
}

/**
 * Get G7 Compliance Display Information
 * Returns appropriate icon and text for compliance level
 */
function getG7ComplianceDisplayInfo(g7Analysis) {
    const complianceLevel = g7Analysis.complianceLevel || 'unknown';
    
    const displayInfo = {
        excellent: { icon: '✅', text: 'Excellent G7 Compliance' },
        good: { icon: '✅', text: 'Good G7 Compliance' },
        acceptable: { icon: '⚠️', text: 'Acceptable G7 Compliance' },
        poor: { icon: '❌', text: 'Poor G7 Compliance' },
        unknown: { icon: '❓', text: 'G7 Analysis Error' }
    };
    
    return displayInfo[complianceLevel] || displayInfo.unknown;
}

/**
 * Update G7 Recommendations Display
 * Populates the G7 recommendations list with current recommendations
 */
function updateG7Recommendations(recommendations) {
    if (!domElements.g7RecommendationsList) return;
    
    // Clear existing recommendations
    domElements.g7RecommendationsList.innerHTML = '';
    
    if (!recommendations || recommendations.length === 0) {
        domElements.g7RecommendationsList.innerHTML = '<div class="no-recommendations">No G7 adjustments needed</div>';
        return;
    }
    
    // Create recommendation items
    recommendations.forEach((rec, index) => {
        const recItem = document.createElement('div');
        recItem.className = `g7-recommendation-item ${rec.priority || 'medium'}-priority`;
        
        // Add animation delay for staggered appearance
        recItem.style.animationDelay = `${index * 0.1}s`;
        recItem.classList.add('new-recommendation');
        
        if (rec.channel === 'All') {
            // Info message
            recItem.innerHTML = `
                <div class="g7-recommendation-content">
                    <div class="g7-recommendation-channel">✅ G7 Compliance</div>
                    <div class="g7-recommendation-adjustment">${rec.message}</div>
                </div>
            `;
        } else {
            // Specific channel adjustment
            recItem.innerHTML = `
                <div class="g7-recommendation-content">
                    <div class="g7-recommendation-channel">${rec.channel} Channel</div>
                    <div class="g7-recommendation-adjustment">${rec.adjustment}</div>
                </div>
                <div class="g7-recommendation-values">
                    <div class="g7-current-value">Current: ${rec.current}%</div>
                    <div class="g7-target-value">Target: ${rec.target}%</div>
                </div>
            `;
        }
        
        domElements.g7RecommendationsList.appendChild(recItem);
    });
}

/**
 * Display G7 Error Message
 * Shows error state in G7 analysis section
 */
function displayG7Error(errorMessage) {
    if (!domElements.g7ComplianceIndicator) return;
    
    const complianceIcon = domElements.g7ComplianceIndicator.querySelector('.compliance-icon');
    const complianceText = domElements.g7ComplianceIndicator.querySelector('.compliance-text');
    
    if (complianceIcon && complianceText) {
        complianceIcon.className = 'compliance-icon error';
        complianceIcon.textContent = '❌';
        complianceText.textContent = `G7 Analysis Error: ${errorMessage}`;
    }
    
    if (domElements.g7RecommendationsList) {
        domElements.g7RecommendationsList.innerHTML = '<div class="error-message">Unable to generate G7 recommendations</div>';
    }
}

/**
 * Enhanced Color Difference Calculation with G7 Integration
 * Extends existing calculation workflow to include G7 analysis
 */
function performEnhancedColorDifferenceCalculation() {
    try {
        // Start loading state
        setLoadingState('isCalculating', true);
        
        // Get current color values
        const colorValues = getCurrentColorValues();
        
        // Validate inputs
        if (!hasValidColorData(colorValues.target) || !hasValidColorData(colorValues.sample)) {
            throw new Error('Please enter valid color values for both target and sample colors');
        }
        
        // Perform standard Delta E analysis
        const deltaEAnalysis = window.colorScience.performDeltaEAnalysis(
            colorValues.target.lab,
            colorValues.sample.lab
        );
        
        // Generate enhanced CMYK suggestions with G7 integration
        let suggestions;
        if (g7State.enabled && window.colorScience.generateCMYKSuggestionsWithG7) {
            const enhancedResult = window.colorScience.generateCMYKSuggestionsWithG7(
                colorValues.target.lab,
                colorValues.sample.cmyk,
                colorValues.sample.lab,
                {
                    includeG7: true,
                    prioritizeG7: g7State.prioritizeG7
                }
            );
            
            suggestions = enhancedResult.suggestions || [];
            
            // Update G7 analysis if available
            if (enhancedResult.g7Analysis) {
                g7State.lastAnalysis = enhancedResult.g7Analysis;
                updateG7Display(enhancedResult.g7Analysis);
            }
        } else {
            // Fallback to standard suggestions
            suggestions = window.colorScience.generateCMYKSuggestions(
                colorValues.target.lab,
                colorValues.sample.cmyk,
                colorValues.sample.lab
            );
            
            // Perform separate G7 analysis
            if (g7State.enabled) {
                performG7Analysis(colorValues.sample.cmyk);
            }
        }
        
        // Store results in app state
        appState.results = {
            ...deltaEAnalysis,
            suggestions: suggestions,
            g7Analysis: g7State.lastAnalysis,
            timestamp: new Date().toISOString(),
            colorValues: colorValues
        };
        
        // Update displays
        updateDeltaEDisplay(deltaEAnalysis);
        updateSuggestionsDisplay(suggestions);
        
        // Save to history
        if (window.colorStorage?.saveToHistory) {
            window.colorStorage.saveToHistory(appState.results);
        }
        
        console.log('Enhanced color difference calculation completed with G7 integration');
        
    } catch (error) {
        console.error('Error in enhanced color difference calculation:', error);
        displayCalculationError(error.message);
    } finally {
        setLoadingState('isCalculating', false);
    }
}

/**
 * Update G7 Analysis on Input Changes
 * Triggers G7 analysis when sample CMYK values change
 */
function updateG7Analysis() {
    if (!g7State.enabled) return;
    
    const currentColors = getCurrentColorValues();
    if (hasValidColorData(currentColors.sample)) {
        // Debounce G7 analysis to avoid excessive calculations
        clearTimeout(g7State.analysisTimeout);
        g7State.analysisTimeout = setTimeout(() => {
            performG7Analysis(currentColors.sample.cmyk);
        }, DEBOUNCE_CONFIG.CALCULATION_DELAY);
    }
}

/**
 * Check if color data is valid for G7 analysis
 */
function hasValidColorData(colorData) {
    if (!colorData || !colorData.cmyk) return false;
    
    const { c, m, y, k } = colorData.cmyk;
    return !isNaN(c) && !isNaN(m) && !isNaN(y) && !isNaN(k) &&
           c >= 0 && c <= 100 &&
           m >= 0 && m <= 100 &&
           y >= 0 && y <= 100 &&
           k >= 0 && k <= 100;
}

/**
 * Enhanced Suggestions Display with G7 Integration
 * Updates suggestion display to show G7-specific suggestions
 */
function updateEnhancedSuggestionsDisplay(suggestions) {
    if (!domElements.suggestionsList) return;
    
    // Clear existing suggestions
    domElements.suggestionsList.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) {
        domElements.suggestionsList.innerHTML = '<div class="no-suggestions">No suggestions available</div>';
        return;
    }
    
    // Create suggestion items with G7 integration
    suggestions.forEach((suggestion, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        // Add G7-specific styling
        if (suggestion.type === 'g7') {
            suggestionItem.classList.add('g7-suggestion');
        }
        
        // Add animation delay
        suggestionItem.style.animationDelay = `${index * 0.1}s`;
        
        // Create suggestion content
        const cmykText = `C${suggestion.cmyk.c.toFixed(1)} M${suggestion.cmyk.m.toFixed(1)} Y${suggestion.cmyk.y.toFixed(1)} K${suggestion.cmyk.k.toFixed(1)}`;
        
        suggestionItem.innerHTML = `
            <div class="suggestion-cmyk">${cmykText}</div>
            <div class="suggestion-description">
                ${suggestion.description}
                ${suggestion.type === 'g7' ? '<span class="suggestion-type"></span>' : ''}
            </div>
            ${suggestion.g7Analysis ? `
                <div class="suggestion-g7-info">
                    <small>G7 Level: ${suggestion.g7Analysis.grayLevel}% | Compliance: ${suggestion.g7Analysis.complianceLevel}</small>
                </div>
            ` : ''}
        `;
        
        // Add click handler to apply suggestion
        suggestionItem.addEventListener('click', () => {
            applySuggestion(suggestion);
        });
        
        domElements.suggestionsList.appendChild(suggestionItem);
    });
}

/**
 * Apply CMYK Suggestion
 * Applies a suggestion to the sample color inputs
 */
function applySuggestion(suggestion) {
    if (!suggestion || !suggestion.cmyk) return;
    
    try {
        // Update sample CMYK inputs
        if (domElements.sampleC) domElements.sampleC.value = suggestion.cmyk.c.toFixed(1);
        if (domElements.sampleM) domElements.sampleM.value = suggestion.cmyk.m.toFixed(1);
        if (domElements.sampleY) domElements.sampleY.value = suggestion.cmyk.y.toFixed(1);
        if (domElements.sampleK) domElements.sampleK.value = suggestion.cmyk.k.toFixed(1);
        
        // Trigger input events to update validation and swatches
        [domElements.sampleC, domElements.sampleM, domElements.sampleY, domElements.sampleK].forEach(input => {
            if (input) {
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('blur'));
            }
        });
        
        // Update G7 analysis with new values
        if (g7State.enabled) {
            setTimeout(() => {
                performG7Analysis(suggestion.cmyk);
            }, 100);
        }
        
        console.log('Applied suggestion:', suggestion.description);
        
        // Show feedback
        showNotification(`Applied suggestion: ${suggestion.description}`, 'success');
        
    } catch (error) {
        console.error('Error applying suggestion:', error);
        showNotification('Error applying suggestion', 'error');
    }
}

/**
 * Show Notification
 * Simple notification system for user feedback
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Extend the existing calculator app exports with G7 functions
if (window.calculatorApp) {
    Object.assign(window.calculatorApp, {
        // G7 Integration Functions
        initializeG7Integration,
        performG7Analysis,
        updateG7Analysis,
        toggleG7Analysis,
        performEnhancedColorDifferenceCalculation,
        applySuggestion,
        showNotification,
        
        // G7 State Access
        getG7State: () => g7State,
        setG7Enabled: (enabled) => {
            g7State.enabled = enabled;
            if (domElements.enableG7Checkbox) {
                domElements.enableG7Checkbox.checked = enabled;
            }
            toggleG7Analysis(enabled);
        },
        setG7Prioritized: (prioritized) => {
            g7State.prioritizeG7 = prioritized;
            if (domElements.prioritizeG7Checkbox) {
                domElements.prioritizeG7Checkbox.checked = prioritized;
            }
        }
    });
}

console.log('G7 integration functions loaded successfully');

/**
 * Test G7 Integration
 * Simple test function to verify G7 functionality is working
 */
function testG7Integration() {
    console.log('Testing G7 integration...');
    
    try {
        // Test G7 calculation with known values
        const testCmyk = { c: 19, m: 16, y: 16, k: 25 }; // Should be G7 compliant
        
        if (window.colorScience?.calculateG7GrayBalance) {
            const g7Result = window.colorScience.calculateG7GrayBalance(
                testCmyk.c, testCmyk.m, testCmyk.y, testCmyk.k
            );
            
            console.log('G7 Test Result:', {
                compliant: g7Result.isG7Compliant,
                grayLevel: g7Result.grayLevel,
                deviation: g7Result.totalDeviation,
                complianceLevel: g7Result.complianceLevel
            });
            
            // Test enhanced suggestions
            if (window.colorScience.generateCMYKSuggestionsWithG7) {
                const testTargetLab = { l: 60, a: 0, b: 0 };
                const testSampleLab = { l: 55, a: 2, b: -1 };
                
                const enhancedSuggestions = window.colorScience.generateCMYKSuggestionsWithG7(
                    testTargetLab, testCmyk, testSampleLab, { includeG7: true }
                );
                
                console.log('Enhanced Suggestions Test:', {
                    totalSuggestions: enhancedSuggestions.suggestions?.length || 0,
                    g7Suggestions: enhancedSuggestions.suggestions?.filter(s => s.type === 'g7').length || 0,
                    hasG7Analysis: !!enhancedSuggestions.g7Analysis
                });
            }
            
            return true;
        } else {
            console.warn('G7 functions not available in colorScience module');
            return false;
        }
        
    } catch (error) {
        console.error('G7 integration test failed:', error);
        return false;
    }
}

// Add G7 test to the calculator app exports
if (window.calculatorApp) {
    window.calculatorApp.testG7Integration = testG7Integration;
}
/**
 * Initialize comprehensive accessibility features
 */
function initializeAccessibilityFeatures() {
    console.log('Initializing accessibility features...');
    
    // Set up ARIA labels for main sections
    const targetSection = document.getElementById('target-section');
    if (targetSection) {
        targetSection.setAttribute('role', 'region');
        targetSection.setAttribute('aria-label', 'Target color input section');
    }
    
    const sampleSection = document.getElementById('sample-section');
    if (sampleSection) {
        sampleSection.setAttribute('role', 'region');
        sampleSection.setAttribute('aria-label', 'Sample color input section');
    }
    
    const deltaSection = document.getElementById('delta-section');
    if (deltaSection) {
        deltaSection.setAttribute('role', 'region');
        deltaSection.setAttribute('aria-label', 'Color difference results section');
    }
    
    // Set up ARIA labels for color swatches
    const targetSwatch = document.getElementById('target-swatch');
    if (targetSwatch) {
        targetSwatch.setAttribute('role', 'img');
        targetSwatch.setAttribute('aria-label', 'Target color preview swatch');
    }
    
    const sampleSwatch = document.getElementById('sample-swatch');
    if (sampleSwatch) {
        sampleSwatch.setAttribute('role', 'img');
        sampleSwatch.setAttribute('aria-label', 'Sample color preview swatch');
    }
    
    // Set up ARIA live regions for dynamic content
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.setAttribute('aria-live', 'polite');
        resultsSection.setAttribute('aria-atomic', 'false');
    }
    
    const deltaEValue = document.getElementById('delta-e-value');
    if (deltaEValue) {
        deltaEValue.setAttribute('role', 'status');
        deltaEValue.setAttribute('aria-live', 'polite');
        deltaEValue.setAttribute('aria-label', 'Total color difference result');
    }
    
    // Set up input descriptions
    setupInputAccessibility();
    
    console.log('Accessibility features initialized');
}

// Set up accessibility for input fields
function setupInputAccessibility() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        const label = input.closest('.input-field')?.querySelector('label')?.textContent;
        const section = input.closest('.color-section, .delta-section')?.querySelector('h2')?.textContent;
        
        if (label && section) {
            input.setAttribute('aria-label', `${label} value for ${section} section`);
            input.setAttribute('aria-describedby', `${input.id}-description`);
            
            // Create description element
            const description = document.createElement('span');
            description.id = `${input.id}-description`;
            description.className = 'sr-only';
            description.textContent = `Enter ${label} value. Use arrow keys or type to adjust.`;
            input.parentNode.appendChild(description);
        }
    });
}

// Set up comprehensive keyboard navigation
function setupKeyboardNavigation() {
    console.log('Setting up keyboard navigation...');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyboardShortcuts);
    
    // Enhance focus management for tooltips
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // Set up skip links for screen readers
    setupSkipLinks();
    
    console.log('Keyboard navigation setup complete');
}

// Handle global keyboard shortcuts
function handleGlobalKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter: Calculate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn && !calculateBtn.disabled) {
            calculateBtn.click();
            announceToScreenReader('Calculating color difference');
        }
        return;
    }
    
    // Ctrl/Cmd + R: Reset (prevent browser refresh)
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        const resetBtn = document.getElementById('reset-all-btn');
        if (resetBtn) {
            resetBtn.click();
            announceToScreenReader('All inputs reset');
        }
        return;
    }
    
    // Escape: Close any open tooltips or modals
    if (event.key === 'Escape') {
        if (window.tooltipManager && window.tooltipManager.activeTooltip) {
            window.tooltipManager.activeTooltip.blur();
        }
        // Close any open modals or dropdowns
        const openModals = document.querySelectorAll('.modal.show, .dropdown.show, .keyboard-help-modal');
        openModals.forEach(modal => modal.remove());
        return;
    }
    
    // F1: Show help (prevent browser help)
    if (event.key === 'F1') {
        event.preventDefault();
        showKeyboardShortcutsHelp();
        return;
    }
}

// Handle focus events for enhanced accessibility
function handleFocusIn(event) {
    const element = event.target;
    
    // Announce section changes to screen readers
    const section = element.closest('.color-section, .delta-section');
    if (section && !element.hasAttribute('data-section-announced')) {
        const sectionName = section.querySelector('h2')?.textContent || 'Section';
        announceToScreenReader(`Entered ${sectionName} section`);
        element.setAttribute('data-section-announced', 'true');
    }
}

// Handle focus out events
function handleFocusOut(event) {
    const element = event.target;
    
    // Clean up temporary attributes
    element.removeAttribute('data-section-announced');
}

// Announce messages to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

// Set up skip links for screen readers
function setupSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#calculator-main';
    skipLink.textContent = 'Skip to main calculator';
    skipLink.className = 'skip-link sr-only';
    skipLink.addEventListener('focus', () => skipLink.classList.remove('sr-only'));
    skipLink.addEventListener('blur', () => skipLink.classList.add('sr-only'));
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ID to main calculator for skip link target
    const calculatorMain = document.querySelector('.calculator-main');
    if (calculatorMain) {
        calculatorMain.id = 'calculator-main';
        calculatorMain.setAttribute('tabindex', '-1');
    }
}

// Show keyboard shortcuts help
function showKeyboardShortcutsHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'keyboard-help-modal modal-overlay';
    helpModal.setAttribute('role', 'dialog');
    helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
    helpModal.setAttribute('aria-modal', 'true');
    
    helpModal.innerHTML = `
        <div class="modal-content">
            <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
            <ul class="shortcuts-list">
                <li><kbd>Ctrl/Cmd + Enter</kbd> - Calculate color difference</li>
                <li><kbd>Ctrl/Cmd + R</kbd> - Reset all inputs</li>
                <li><kbd>Escape</kbd> - Close tooltips and modals</li>
                <li><kbd>Tab</kbd> - Navigate between elements</li>
                <li><kbd>Space/Enter</kbd> - Activate buttons and links</li>
                <li><kbd>Arrow Keys</kbd> - Adjust number inputs</li>
                <li><kbd>F1</kbd> - Show this help</li>
            </ul>
            <button class="close-help-btn btn-outlined" onclick="this.closest('.keyboard-help-modal').remove()">
                Close (Escape)
            </button>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Focus the close button
    const closeBtn = helpModal.querySelector('.close-help-btn');
    closeBtn.focus();
    
    // Handle escape key to close
    helpModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            helpModal.remove();
        }
    });
    
    // Trap focus within modal
    trapFocusInModal(helpModal);
}

// Trap focus within modal for accessibility
function trapFocusInModal(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}