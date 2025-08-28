// Correction Suggestions UI Component
// Requirements: 1.5 - Add correction suggestions table showing recommended ink adjustments

console.log('Correction Suggestions UI loading...');

/**
 * Correction Suggestions UI Manager
 * Handles the display and interaction of correction suggestions
 */
class CorrectionSuggestionsUI {
    constructor() {
        this.container = null;
        this.currentSuggestions = null;
        this.init();
    }

    /**
     * Initialize the correction suggestions UI
     */
    init() {
        console.log('Initializing Correction Suggestions UI...');
        this.container = document.getElementById('correction-suggestions');
        this.setupEventListeners();
        console.log('Correction Suggestions UI initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for calculation updates
        document.addEventListener('calculationComplete', (event) => {
            if (event.detail && event.detail.results) {
                this.updateSuggestions(event.detail.results);
            }
        });

        // Listen for substrate profile changes
        document.addEventListener('substrateProfileChanged', () => {
            if (this.currentSuggestions) {
                this.refreshSuggestions();
            }
        });
    }

    /**
     * Update correction suggestions based on calculation results
     * Requirements: 1.5 - Add correction suggestions table showing recommended ink adjustments
     */
    updateSuggestions(results) {
        try {
            if (!results.targetLab || !results.pressLab || !results.pressCmyk) {
                this.hideSuggestions();
                return;
            }

            // Generate suggestions using substrate profile system
            if (window.substrateProfileSystem) {
                const suggestions = window.substrateProfileSystem.generateCorrectionSuggestions(
                    results.targetLab,
                    results.pressLab,
                    results.pressCmyk
                );

                this.currentSuggestions = suggestions;
                this.displaySuggestions(suggestions);
                this.showSuggestions();
            } else {
                console.warn('Substrate profile system not available');
                this.hideSuggestions();
            }

        } catch (error) {
            console.error('Error updating correction suggestions:', error);
            this.hideSuggestions();
        }
    }

    /**
     * Display correction suggestions in the UI
     */
    displaySuggestions(suggestions) {
        if (!this.container) return;

        const suggestionsGrid = this.container.querySelector('#suggestions-grid');
        if (!suggestionsGrid) return;

        // Clear existing content
        suggestionsGrid.innerHTML = '';

        // Create suggestions header
        const header = this.createSuggestionsHeader(suggestions);
        suggestionsGrid.appendChild(header);

        // Create strategy cards
        suggestions.strategies.forEach((strategy, index) => {
            const strategyCard = this.createStrategyCard(strategy, index);
            suggestionsGrid.appendChild(strategyCard);
        });

        // Create press guidance section
        const guidanceSection = this.createPressGuidanceSection(suggestions.pressGuidance);
        suggestionsGrid.appendChild(guidanceSection);
    }

    /**
     * Create suggestions header
     */
    createSuggestionsHeader(suggestions) {
        const header = document.createElement('div');
        header.className = 'suggestions-header';
        header.innerHTML = `
            <div class="suggestions-info">
                <div class="substrate-info">
                    <span class="substrate-label">Substrate:</span>
                    <span class="substrate-name">${suggestions.substrateProfile}</span>
                </div>
                <div class="delta-info">
                    <span class="delta-label">ΔE:</span>
                    <span class="delta-value ${this.getToleranceClass(suggestions.deltaE)}">${suggestions.deltaE.toFixed(2)}</span>
                </div>
            </div>
        `;
        return header;
    }

    /**
     * Create strategy card for each correction strategy
     */
    createStrategyCard(strategy, index) {
        const card = document.createElement('div');
        card.className = `strategy-card strategy-${strategy.name.toLowerCase()}`;
        card.setAttribute('data-strategy-index', index);

        // Calculate significant corrections (> 0.5%)
        const significantCorrections = this.getSignificantCorrections(strategy.corrections);
        
        card.innerHTML = `
            <div class="strategy-header">
                <div class="strategy-name">${strategy.name}</div>
                <div class="strategy-confidence confidence-${strategy.confidence.toLowerCase()}">${strategy.confidence}</div>
            </div>
            <div class="strategy-description">${strategy.description}</div>
            <div class="corrections-grid">
                ${this.renderCorrections(significantCorrections, strategy.newCmyk)}
            </div>
            <div class="strategy-actions">
                <button class="apply-correction-btn" onclick="correctionSuggestionsUI.applyCorrection(${index})">
                    Apply Correction
                </button>
                <button class="preview-correction-btn" onclick="correctionSuggestionsUI.previewCorrection(${index})">
                    Preview
                </button>
            </div>
            <div class="strategy-risk">
                <span class="risk-label">Risk:</span>
                <span class="risk-value risk-${strategy.risk.toLowerCase()}">${strategy.risk}</span>
            </div>
        `;

        return card;
    }

    /**
     * Get significant corrections (filter out small adjustments)
     */
    getSignificantCorrections(corrections) {
        const significant = {};
        Object.keys(corrections).forEach(channel => {
            if (Math.abs(corrections[channel]) >= 0.5) {
                significant[channel] = corrections[channel];
            }
        });
        return significant;
    }

    /**
     * Render corrections display
     */
    renderCorrections(corrections, newCmyk) {
        const channels = ['c', 'm', 'y', 'k', 'o', 'g', 'v'];
        let html = '';

        channels.forEach(channel => {
            if (corrections[channel] !== undefined) {
                const correction = corrections[channel];
                const newValue = newCmyk[channel] || 0;
                const sign = correction >= 0 ? '+' : '';
                
                html += `
                    <div class="correction-item">
                        <div class="correction-channel">${channel.toUpperCase()}</div>
                        <div class="correction-change ${correction >= 0 ? 'increase' : 'decrease'}">
                            ${sign}${correction.toFixed(1)}%
                        </div>
                        <div class="correction-new-value">${newValue.toFixed(1)}%</div>
                    </div>
                `;
            }
        });

        return html;
    }

    /**
     * Create press guidance section
     */
    createPressGuidanceSection(guidance) {
        const section = document.createElement('div');
        section.className = 'press-guidance-section';
        
        section.innerHTML = `
            <div class="guidance-header">
                <h4>🎯 Press-Side Guidance</h4>
            </div>
            <div class="guidance-list">
                ${guidance.map(item => `
                    <div class="guidance-item">
                        <span class="guidance-bullet">•</span>
                        <span class="guidance-text">${item}</span>
                    </div>
                `).join('')}
            </div>
        `;

        return section;
    }

    /**
     * Apply correction to the calculator inputs
     */
    applyCorrection(strategyIndex) {
        if (!this.currentSuggestions || !this.currentSuggestions.strategies[strategyIndex]) {
            console.error('Invalid strategy index');
            return;
        }

        const strategy = this.currentSuggestions.strategies[strategyIndex];
        const newCmyk = strategy.newCmyk;

        // Update the sample/press CMYK inputs
        this.updateCmykInputs(newCmyk);

        // Show confirmation message
        this.showApplyConfirmation(strategy.name);

        // Trigger recalculation
        setTimeout(() => {
            if (window.performColorDifferenceCalculation) {
                window.performColorDifferenceCalculation();
            }
        }, 100);
    }

    /**
     * Preview correction (visual preview without applying)
     */
    previewCorrection(strategyIndex) {
        if (!this.currentSuggestions || !this.currentSuggestions.strategies[strategyIndex]) {
            console.error('Invalid strategy index');
            return;
        }

        const strategy = this.currentSuggestions.strategies[strategyIndex];
        
        // Show preview modal or update swatch temporarily
        this.showPreviewModal(strategy);
    }

    /**
     * Update CMYK inputs with new values
     */
    updateCmykInputs(newCmyk) {
        const channels = ['c', 'm', 'y', 'k', 'o', 'g', 'v'];
        
        channels.forEach(channel => {
            const input = document.getElementById(`sample-${channel}`);
            if (input && newCmyk[channel] !== undefined) {
                input.value = newCmyk[channel].toFixed(1);
                
                // Trigger input event for real-time updates
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    /**
     * Show apply confirmation message
     */
    showApplyConfirmation(strategyName) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'correction-notification success';
        notification.innerHTML = `
            <span class="notification-icon">✅</span>
            <span class="notification-text">${strategyName} correction applied</span>
        `;

        // Add to container
        if (this.container) {
            this.container.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    /**
     * Show preview modal
     */
    showPreviewModal(strategy) {
        const modal = document.createElement('div');
        modal.className = 'correction-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Preview: ${strategy.name} Correction</h3>
                    <button class="modal-close" onclick="this.closest('.correction-preview-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="preview-description">${strategy.description}</div>
                    <div class="preview-corrections">
                        <h4>Recommended Changes:</h4>
                        ${this.renderCorrections(strategy.corrections, strategy.newCmyk)}
                    </div>
                    <div class="preview-actions">
                        <button class="btn btn-primary" onclick="correctionSuggestionsUI.applyCorrection(${strategy.index}); this.closest('.correction-preview-modal').remove();">
                            Apply This Correction
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.correction-preview-modal').remove();">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Get tolerance class for styling
     */
    getToleranceClass(deltaE) {
        if (deltaE <= 1.0) return 'excellent';
        if (deltaE <= 2.0) return 'good';
        if (deltaE <= 3.0) return 'acceptable';
        return 'poor';
    }

    /**
     * Show suggestions section
     */
    showSuggestions() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Hide suggestions section
     */
    hideSuggestions() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Refresh suggestions (called when substrate profile changes)
     */
    refreshSuggestions() {
        if (this.currentSuggestions && window.appState && window.appState.results) {
            this.updateSuggestions(window.appState.results);
        }
    }

    /**
     * Clear all suggestions
     */
    clearSuggestions() {
        this.currentSuggestions = null;
        this.hideSuggestions();
        
        if (this.container) {
            const suggestionsGrid = this.container.querySelector('#suggestions-grid');
            if (suggestionsGrid) {
                suggestionsGrid.innerHTML = '';
            }
        }
    }
}

// Initialize the correction suggestions UI
let correctionSuggestionsUI;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    correctionSuggestionsUI = new CorrectionSuggestionsUI();
    
    // Make it globally available
    window.correctionSuggestionsUI = correctionSuggestionsUI;
    
    console.log('Correction Suggestions UI ready');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CorrectionSuggestionsUI;
}