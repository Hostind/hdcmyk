/**
 * Keyboard Shortcuts System
 * Provides power user keyboard shortcuts with accessibility support
 */

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.helpModalVisible = false;
        this.init();
    }

    init() {
        this.registerDefaultShortcuts();
        this.setupEventListeners();
        this.setupHelpModal();
        console.log('Keyboard shortcuts system initialized');
    }

    registerDefaultShortcuts() {
        // Calculation shortcuts
        this.register('Enter', {
            description: 'Calculate color difference',
            action: () => this.performCalculation(),
            global: false // Only when not in input
        });

        this.register('Space', {
            description: 'Calculate color difference',
            action: () => this.performCalculation(),
            global: false
        });

        // Reset shortcuts
        this.register('Ctrl+R', {
            description: 'Reset all inputs',
            action: () => this.resetAllInputs(),
            preventDefault: true
        });

        this.register('Ctrl+Shift+R', {
            description: 'Reset and clear history',
            action: () => this.resetAndClearHistory(),
            preventDefault: true
        });

        // Export shortcuts
        this.register('Ctrl+E', {
            description: 'Export to CSV',
            action: () => this.exportToCSV(),
            preventDefault: true
        });

        this.register('Ctrl+Shift+E', {
            description: 'Export to PDF',
            action: () => this.exportToPDF(),
            preventDefault: true
        });

        // Copy shortcuts
        this.register('Ctrl+C', {
            description: 'Copy current calculation',
            action: () => this.copyCalculation(),
            preventDefault: true,
            condition: () => this.hasCalculationResults()
        });

        this.register('Ctrl+Shift+C', {
            description: 'Copy color values',
            action: () => this.copyColorValues(),
            preventDefault: true
        });

        // Navigation shortcuts
        this.register('Alt+1', {
            description: 'Focus target color inputs',
            action: () => this.focusColorSection('target'),
            preventDefault: true
        });

        this.register('Alt+2', {
            description: 'Focus sample color inputs',
            action: () => this.focusColorSection('sample'),
            preventDefault: true
        });

        this.register('Alt+3', {
            description: 'Focus results section',
            action: () => this.focusResultsSection(),
            preventDefault: true
        });

        // Tool shortcuts
        this.register('Ctrl+G', {
            description: 'Toggle grid view',
            action: () => this.toggleGridView(),
            preventDefault: true
        });

        this.register('Ctrl+H', {
            description: 'Toggle measurement history',
            action: () => this.toggleHistory(),
            preventDefault: true
        });

        this.register('Ctrl+L', {
            description: 'Toggle color library',
            action: () => this.toggleColorLibrary(),
            preventDefault: true
        });

        // File shortcuts
        this.register('Ctrl+O', {
            description: 'Open CSV file',
            action: () => this.openCSVFile(),
            preventDefault: true
        });

        this.register('Ctrl+I', {
            description: 'Load ICC profile',
            action: () => this.loadICCProfile(),
            preventDefault: true
        });

        // View shortcuts
        this.register('Ctrl+D', {
            description: 'Toggle dark mode',
            action: () => this.toggleDarkMode(),
            preventDefault: true
        });

        this.register('Ctrl+Plus', {
            description: 'Zoom in',
            action: () => this.zoomIn(),
            preventDefault: true
        });

        this.register('Ctrl+Minus', {
            description: 'Zoom out',
            action: () => this.zoomOut(),
            preventDefault: true
        });

        this.register('Ctrl+0', {
            description: 'Reset zoom',
            action: () => this.resetZoom(),
            preventDefault: true
        });

        // Help shortcuts
        this.register('F1', {
            description: 'Show keyboard shortcuts help',
            action: () => this.showHelp(),
            preventDefault: true
        });

        this.register('Ctrl+/', {
            description: 'Show keyboard shortcuts help',
            action: () => this.showHelp(),
            preventDefault: true
        });

        this.register('Escape', {
            description: 'Close modals and help',
            action: () => this.handleEscape(),
            global: true
        });

        // Quick preset shortcuts
        this.register('Ctrl+1', {
            description: 'Load preset 1',
            action: () => this.loadPreset(1),
            preventDefault: true
        });

        this.register('Ctrl+2', {
            description: 'Load preset 2',
            action: () => this.loadPreset(2),
            preventDefault: true
        });

        this.register('Ctrl+3', {
            description: 'Load preset 3',
            action: () => this.loadPreset(3),
            preventDefault: true
        });

        // Advanced shortcuts
        this.register('Ctrl+Shift+D', {
            description: 'Toggle debug mode',
            action: () => this.toggleDebugMode(),
            preventDefault: true
        });

        this.register('Ctrl+Shift+T', {
            description: 'Run color accuracy test',
            action: () => this.runColorTest(),
            preventDefault: true
        });
    }

    register(keyCombo, config) {
        const normalizedCombo = this.normalizeKeyCombo(keyCombo);
        this.shortcuts.set(normalizedCombo, {
            ...config,
            keyCombo: normalizedCombo
        });
    }

    normalizeKeyCombo(keyCombo) {
        return keyCombo
            .split('+')
            .map(key => key.trim())
            .map(key => {
                // Normalize key names
                const keyMap = {
                    'ctrl': 'Control',
                    'cmd': 'Meta',
                    'alt': 'Alt',
                    'shift': 'Shift',
                    'space': ' ',
                    'enter': 'Enter',
                    'esc': 'Escape',
                    'escape': 'Escape',
                    'plus': '+',
                    'minus': '-'
                };
                return keyMap[key.toLowerCase()] || key;
            })
            .join('+');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (!this.isEnabled) return;

            const keyCombo = this.getKeyComboFromEvent(event);
            const shortcut = this.shortcuts.get(keyCombo);

            if (shortcut) {
                // Check if we should handle this shortcut
                if (!this.shouldHandleShortcut(event, shortcut)) {
                    return;
                }

                // Check condition if provided
                if (shortcut.condition && !shortcut.condition()) {
                    return;
                }

                // Prevent default if specified
                if (shortcut.preventDefault) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                // Execute action
                try {
                    shortcut.action(event);
                    this.logShortcutUsage(keyCombo);
                } catch (error) {
                    console.error(`Error executing shortcut ${keyCombo}:`, error);
                    if (window.toastSystem) {
                        window.toastSystem.error('Shortcut Error', `Failed to execute ${keyCombo}`);
                    }
                }
            }
        });

        // Handle special cases for input fields
        document.addEventListener('keydown', (event) => {
            if (this.isInInputField(event.target)) {
                this.handleInputFieldShortcuts(event);
            }
        });
    }

    getKeyComboFromEvent(event) {
        const keys = [];
        
        if (event.ctrlKey || event.metaKey) keys.push('Control');
        if (event.altKey) keys.push('Alt');
        if (event.shiftKey) keys.push('Shift');
        
        // Add the main key
        let mainKey = event.key;
        
        // Handle special keys
        if (mainKey === ' ') mainKey = 'Space';
        if (mainKey === '+') mainKey = 'Plus';
        if (mainKey === '-') mainKey = 'Minus';
        
        keys.push(mainKey);
        
        return keys.join('+');
    }

    shouldHandleShortcut(event, shortcut) {
        // Don't handle if shortcut is not global and we're in an input field
        if (!shortcut.global && this.isInInputField(event.target)) {
            return false;
        }

        // Don't handle if help modal is visible and it's not an escape key
        if (this.helpModalVisible && event.key !== 'Escape') {
            return false;
        }

        return true;
    }

    isInInputField(element) {
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(element.tagName) || element.contentEditable === 'true';
    }

    handleInputFieldShortcuts(event) {
        // Handle Enter key in input fields to trigger calculation
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
            this.performCalculation();
        }

        // Handle Tab navigation enhancements
        if (event.key === 'Tab') {
            this.enhanceTabNavigation(event);
        }
    }

    enhanceTabNavigation(event) {
        // Add visual feedback for tab navigation
        const currentElement = event.target;
        currentElement.classList.add('keyboard-focused');
        
        setTimeout(() => {
            currentElement.classList.remove('keyboard-focused');
        }, 2000);
    }

    // Shortcut action implementations
    performCalculation() {
        if (window.performColorDifferenceCalculation) {
            window.performColorDifferenceCalculation();
            if (window.toastSystem) {
                window.toastSystem.info('Calculation', 'Color difference calculated');
            }
        }
    }

    resetAllInputs() {
        if (confirm('Reset all inputs to default values?')) {
            if (window.resetAllInputs) {
                window.resetAllInputs();
                if (window.toastSystem) {
                    window.toastSystem.success('Reset', 'All inputs reset to default values');
                }
            }
        }
    }

    resetAndClearHistory() {
        if (confirm('Reset all inputs and clear calculation history?')) {
            if (window.resetAllInputs) {
                window.resetAllInputs();
            }
            if (window.measurementHistory && window.measurementHistory.clearHistory) {
                window.measurementHistory.clearHistory();
            }
            if (window.toastSystem) {
                window.toastSystem.success('Reset', 'Inputs and history cleared');
            }
        }
    }

    exportToCSV() {
        if (window.colorExport && window.colorExport.exportToCSV) {
            window.colorExport.exportToCSV();
        } else {
            if (window.toastSystem) {
                window.toastSystem.warning('Export', 'No calculation results to export');
            }
        }
    }

    exportToPDF() {
        if (window.colorExport && window.colorExport.exportToPDF) {
            window.colorExport.exportToPDF();
        } else {
            if (window.toastSystem) {
                window.toastSystem.warning('Export', 'No calculation results to export');
            }
        }
    }

    copyCalculation() {
        if (window.appState && window.appState.results) {
            const result = window.appState.results;
            const text = `ΔE: ${result.deltaE.toFixed(2)} | Target: L*${result.target.lab.l} a*${result.target.lab.a} b*${result.target.lab.b} | Sample: L*${result.sample.lab.l} a*${result.sample.lab.a} b*${result.sample.lab.b}`;
            
            navigator.clipboard.writeText(text).then(() => {
                if (window.toastSystem) {
                    window.toastSystem.success('Copied', 'Calculation results copied to clipboard');
                }
            }).catch(() => {
                if (window.toastSystem) {
                    window.toastSystem.error('Copy Failed', 'Could not copy to clipboard');
                }
            });
        }
    }

    copyColorValues() {
        const targetInputs = this.getColorInputValues('target');
        const sampleInputs = this.getColorInputValues('sample');
        
        const text = `Target: ${targetInputs}\nSample: ${sampleInputs}`;
        
        navigator.clipboard.writeText(text).then(() => {
            if (window.toastSystem) {
                window.toastSystem.success('Copied', 'Color values copied to clipboard');
            }
        }).catch(() => {
            if (window.toastSystem) {
                window.toastSystem.error('Copy Failed', 'Could not copy to clipboard');
            }
        });
    }

    getColorInputValues(colorType) {
        const channels = ['c', 'm', 'y', 'k', 'l', 'a', 'b'];
        const values = channels.map(channel => {
            const input = document.getElementById(`${colorType}-${channel}`);
            return input ? `${channel.toUpperCase()}:${input.value}` : '';
        }).filter(v => v);
        
        return values.join(' ');
    }

    focusColorSection(colorType) {
        const firstInput = document.getElementById(`${colorType}-c`);
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
            
            // Scroll into view
            firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (window.toastSystem) {
                window.toastSystem.info('Navigation', `Focused ${colorType} color inputs`);
            }
        }
    }

    focusResultsSection() {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            resultsSection.focus();
        }
    }

    toggleGridView() {
        const gridContainer = document.querySelector('.grid-container');
        if (gridContainer) {
            gridContainer.style.display = gridContainer.style.display === 'none' ? 'block' : 'none';
            if (window.toastSystem) {
                window.toastSystem.info('View', `Grid view ${gridContainer.style.display === 'none' ? 'hidden' : 'shown'}`);
            }
        }
    }

    toggleHistory() {
        const historyPanel = document.querySelector('.history-panel');
        if (historyPanel) {
            historyPanel.style.display = historyPanel.style.display === 'none' ? 'block' : 'none';
            if (window.toastSystem) {
                window.toastSystem.info('View', `History ${historyPanel.style.display === 'none' ? 'hidden' : 'shown'}`);
            }
        }
    }

    toggleColorLibrary() {
        if (window.colorLibrary && window.colorLibrary.toggleLibrary) {
            window.colorLibrary.toggleLibrary();
        }
    }

    openCSVFile() {
        const fileInput = document.getElementById('csv-file-input') || document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.click();
    }

    loadICCProfile() {
        const fileInput = document.getElementById('icc-profile-input') || document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.icc,.icm';
        fileInput.click();
    }

    toggleDarkMode() {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (window.toastSystem) {
            window.toastSystem.info('Theme', `Switched to ${newTheme} mode`);
        }
    }

    zoomIn() {
        this.adjustZoom(1.1);
    }

    zoomOut() {
        this.adjustZoom(0.9);
    }

    resetZoom() {
        document.body.style.zoom = '1';
        if (window.toastSystem) {
            window.toastSystem.info('Zoom', 'Zoom reset to 100%');
        }
    }

    adjustZoom(factor) {
        const currentZoom = parseFloat(document.body.style.zoom || '1');
        const newZoom = Math.max(0.5, Math.min(2, currentZoom * factor));
        document.body.style.zoom = newZoom.toString();
        
        if (window.toastSystem) {
            window.toastSystem.info('Zoom', `Zoom: ${Math.round(newZoom * 100)}%`);
        }
    }

    loadPreset(presetNumber) {
        if (window.PRESET_COLORS) {
            const presets = Object.keys(window.PRESET_COLORS);
            if (presets[presetNumber - 1]) {
                const presetName = presets[presetNumber - 1];
                const preset = window.PRESET_COLORS[presetName];
                
                // Load preset into target inputs
                Object.keys(preset).forEach(channel => {
                    const input = document.getElementById(`target-${channel}`);
                    if (input) {
                        input.value = preset[channel];
                    }
                });
                
                if (window.toastSystem) {
                    window.toastSystem.success('Preset', `Loaded preset: ${presetName}`);
                }
            }
        }
    }

    toggleDebugMode() {
        window.debugMode = !window.debugMode;
        document.body.classList.toggle('debug-mode', window.debugMode);
        
        if (window.toastSystem) {
            window.toastSystem.info('Debug', `Debug mode ${window.debugMode ? 'enabled' : 'disabled'}`);
        }
    }

    runColorTest() {
        if (window.colorScience && window.colorScience.runAccuracyTest) {
            window.colorScience.runAccuracyTest();
        } else {
            if (window.toastSystem) {
                window.toastSystem.info('Test', 'Running basic color accuracy test...');
            }
        }
    }

    handleEscape() {
        if (this.helpModalVisible) {
            this.hideHelp();
        } else {
            // Close any open modals
            const modals = document.querySelectorAll('.modal, .modal-overlay');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            });
        }
    }

    hasCalculationResults() {
        return window.appState && window.appState.results && window.appState.results.deltaE !== null;
    }

    // Help modal methods
    setupHelpModal() {
        // Create help modal HTML if it doesn't exist
        if (!document.getElementById('keyboard-shortcuts-modal')) {
            const modal = document.createElement('div');
            modal.id = 'keyboard-shortcuts-modal';
            modal.className = 'keyboard-shortcuts-modal';
            modal.style.display = 'none';
            modal.innerHTML = this.createHelpModalHTML();
            document.body.appendChild(modal);
        }
    }

    createHelpModalHTML() {
        const shortcuts = Array.from(this.shortcuts.entries())
            .filter(([_, config]) => config.description)
            .sort(([a], [b]) => a.localeCompare(b));

        const groups = this.groupShortcuts(shortcuts);

        let html = `
            <div class="modal-overlay" onclick="window.keyboardShortcuts.hideHelp()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="window.keyboardShortcuts.hideHelp()">×</button>
                </div>
                <div class="modal-body">
        `;

        Object.keys(groups).forEach(groupName => {
            html += `<div class="shortcut-group">
                <h4>${groupName}</h4>`;
            
            groups[groupName].forEach(([keyCombo, config]) => {
                html += `<div class="shortcut-item">
                    <kbd>${this.formatKeyCombo(keyCombo)}</kbd>
                    <span>${config.description}</span>
                </div>`;
            });
            
            html += `</div>`;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    groupShortcuts(shortcuts) {
        const groups = {
            'Calculation': [],
            'Navigation': [],
            'Export': [],
            'File Operations': [],
            'View': [],
            'Tools': [],
            'Help': []
        };

        shortcuts.forEach(([keyCombo, config]) => {
            const desc = config.description.toLowerCase();
            
            if (desc.includes('calculate') || desc.includes('reset')) {
                groups['Calculation'].push([keyCombo, config]);
            } else if (desc.includes('focus') || desc.includes('navigation')) {
                groups['Navigation'].push([keyCombo, config]);
            } else if (desc.includes('export') || desc.includes('copy')) {
                groups['Export'].push([keyCombo, config]);
            } else if (desc.includes('open') || desc.includes('load') || desc.includes('file')) {
                groups['File Operations'].push([keyCombo, config]);
            } else if (desc.includes('toggle') || desc.includes('zoom') || desc.includes('theme')) {
                groups['View'].push([keyCombo, config]);
            } else if (desc.includes('grid') || desc.includes('history') || desc.includes('library') || desc.includes('test')) {
                groups['Tools'].push([keyCombo, config]);
            } else if (desc.includes('help') || desc.includes('shortcut')) {
                groups['Help'].push([keyCombo, config]);
            }
        });

        // Remove empty groups
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });

        return groups;
    }

    formatKeyCombo(keyCombo) {
        return keyCombo
            .split('+')
            .map(key => {
                // Format key names for display
                const keyMap = {
                    'Control': 'Ctrl',
                    'Meta': 'Cmd',
                    ' ': 'Space'
                };
                return keyMap[key] || key;
            })
            .join(' + ');
    }

    showHelp() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.style.display = 'block';
            this.helpModalVisible = true;
            
            // Focus the modal for accessibility
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.focus();
            }
        }
    }

    hideHelp() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.style.display = 'none';
            this.helpModalVisible = false;
        }
    }

    logShortcutUsage(keyCombo) {
        console.log(`Keyboard shortcut used: ${keyCombo}`);
        
        // Track usage for analytics (could be enhanced)
        if (window.analytics && window.analytics.track) {
            window.analytics.track('keyboard_shortcut_used', { shortcut: keyCombo });
        }
    }

    // Public methods for enabling/disabling shortcuts
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    // Method to add custom shortcuts
    addShortcut(keyCombo, config) {
        this.register(keyCombo, config);
    }

    // Method to remove shortcuts
    removeShortcut(keyCombo) {
        const normalizedCombo = this.normalizeKeyCombo(keyCombo);
        this.shortcuts.delete(normalizedCombo);
    }
}

// Create global instance
window.keyboardShortcuts = new KeyboardShortcutsManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcutsManager;
}