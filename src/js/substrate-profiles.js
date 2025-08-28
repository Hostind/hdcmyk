// Substrate Profile System for HD CMYK Color Matching
// Requirements: 2.2, 2.3, 2.4, 1.5 - Substrate profile system with correction suggestions

console.log('Substrate Profile System loading...');

/**
 * Substrate Profile System
 * Manages substrate-specific characteristics and correction algorithms
 */
class SubstrateProfileSystem {
    constructor() {
        this.profiles = this.initializeSubstrateProfiles();
        this.currentProfile = 'hpw'; // Default to Hot Press White
        this.correctionCache = new Map();
        this.init();
    }

    /**
     * Initialize substrate profiles with characteristics
     * Requirements: 2.2 - Integrate substrate-specific characteristics (toneA, toneB, gain, weights)
     */
    initializeSubstrateProfiles() {
        return {
            'hpw': {
                name: 'Hot Press White',
                displayName: 'Hot Press White',
                description: 'Premium coated paper with excellent ink holdout',
                characteristics: {
                    toneA: 0.5,    // Slight warm tone
                    toneB: -1.2,   // Slight blue undertone
                    gain: 0.85,    // Low dot gain
                    opacity: 0.98, // High opacity
                    smoothness: 0.95, // Very smooth surface
                    brightness: 92 // High brightness
                },
                correctionWeights: {
                    c: 1.0,  // Standard cyan response
                    m: 1.0,  // Standard magenta response
                    y: 0.95, // Slightly reduced yellow (excellent ink holdout)
                    k: 1.05, // Slightly enhanced black
                    o: 0.9,  // Reduced orange (clean substrate)
                    g: 0.9,  // Reduced green (clean substrate)
                    v: 0.9   // Reduced violet (clean substrate)
                },
                toleranceAdjustment: 1.0, // Standard tolerance
                pressGuidance: [
                    'Excellent ink holdout - use standard ink densities',
                    'Monitor for over-inking on solid areas',
                    'Ideal for high-quality process work'
                ]
            },
            'inver': {
                name: 'Invercote',
                displayName: 'Invercote',
                description: 'High-quality folding boxboard with excellent printability',
                characteristics: {
                    toneA: 0.8,    // Warmer tone
                    toneB: -0.8,   // Less blue undertone
                    gain: 1.15,    // Moderate dot gain
                    opacity: 0.96, // Good opacity
                    smoothness: 0.88, // Good smoothness
                    brightness: 88  // Good brightness
                },
                correctionWeights: {
                    c: 1.05, // Enhanced cyan for compensation
                    m: 1.02, // Slightly enhanced magenta
                    y: 1.08, // Enhanced yellow (substrate absorption)
                    k: 1.1,  // Enhanced black (dot gain compensation)
                    o: 1.0,  // Standard orange
                    g: 1.0,  // Standard green
                    v: 1.0   // Standard violet
                },
                toleranceAdjustment: 1.1, // Slightly relaxed tolerance
                pressGuidance: [
                    'Monitor dot gain in midtones',
                    'Increase ink density by 5-8% for solid coverage',
                    'Watch for show-through on reverse side'
                ]
            },
            'gsm250': {
                name: '250gsm',
                displayName: '250gsm Coated',
                description: 'Medium-weight coated stock for general commercial printing',
                characteristics: {
                    toneA: 1.2,    // Warmer tone
                    toneB: -0.5,   // Neutral undertone
                    gain: 1.25,    // Higher dot gain
                    opacity: 0.92, // Moderate opacity
                    smoothness: 0.82, // Moderate smoothness
                    brightness: 85  // Moderate brightness
                },
                correctionWeights: {
                    c: 1.08, // Enhanced cyan
                    m: 1.05, // Enhanced magenta
                    y: 1.12, // Significantly enhanced yellow
                    k: 1.15, // Significantly enhanced black
                    o: 1.05, // Slightly enhanced orange
                    g: 1.05, // Slightly enhanced green
                    v: 1.05  // Slightly enhanced violet
                },
                toleranceAdjustment: 1.2, // Relaxed tolerance
                pressGuidance: [
                    'Compensate for higher dot gain in shadows',
                    'Increase ink density by 8-12% for adequate coverage',
                    'Monitor ink penetration and strike-through'
                ]
            },
            'foil': {
                name: 'Foil Board',
                displayName: 'Foil Board',
                description: 'Specialty substrate for foil stamping and premium applications',
                characteristics: {
                    toneA: 0.2,    // Neutral tone
                    toneB: -2.0,   // Cool undertone
                    gain: 0.75,    // Very low dot gain
                    opacity: 0.99, // Excellent opacity
                    smoothness: 0.98, // Excellent smoothness
                    brightness: 95  // Excellent brightness
                },
                correctionWeights: {
                    c: 0.95, // Reduced cyan (excellent holdout)
                    m: 0.95, // Reduced magenta (excellent holdout)
                    y: 0.92, // Reduced yellow (excellent holdout)
                    k: 0.98, // Slightly reduced black
                    o: 0.85, // Significantly reduced orange
                    g: 0.85, // Significantly reduced green
                    v: 0.85  // Significantly reduced violet
                },
                toleranceAdjustment: 0.8, // Tighter tolerance (premium substrate)
                pressGuidance: [
                    'Excellent ink holdout - reduce ink density by 5-8%',
                    'Ideal for fine detail and high-end work',
                    'Monitor for ink buildup on blanket'
                ]
            }
        };
    }

    /**
     * Initialize the substrate profile system
     */
    init() {
        console.log('Initializing Substrate Profile System...');
        this.setupEventListeners();
        this.updateSubstrateDisplay();
        console.log('Substrate Profile System initialized');
    }

    /**
     * Set up event listeners for substrate selection
     */
    setupEventListeners() {
        const substrateSelect = document.getElementById('substrate-select');
        if (substrateSelect) {
            substrateSelect.addEventListener('change', (e) => {
                this.setCurrentProfile(e.target.value);
            });
        }
    }

    /**
     * Set the current substrate profile
     * Requirements: 2.4 - Include press-side guidance based on substrate properties
     */
    setCurrentProfile(profileId) {
        if (this.profiles[profileId]) {
            this.currentProfile = profileId;
            this.updateSubstrateDisplay();
            this.clearCorrectionCache();
            
            // Trigger recalculation if there are current results
            if (window.appState && window.appState.results) {
                this.updateCorrectionsForCurrentProfile();
            }
            
            console.log(`Substrate profile changed to: ${this.profiles[profileId].displayName}`);
        }
    }

    /**
     * Get the current substrate profile
     */
    getCurrentProfile() {
        return this.profiles[this.currentProfile];
    }

    /**
     * Update substrate display in UI
     */
    updateSubstrateDisplay() {
        const substrateDisplay = document.getElementById('substrate-display');
        if (substrateDisplay) {
            const profile = this.getCurrentProfile();
            substrateDisplay.textContent = profile.name;
        }
    }

    /**
     * Generate correction suggestions based on LAB differences and substrate properties
     * Requirements: 2.3 - Implement the heuristic correction algorithm
     * Requirements: 1.5 - Add correction suggestions table showing recommended ink adjustments
     */
    generateCorrectionSuggestions(targetLab, pressLab, pressCmyk) {
        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey(targetLab, pressLab, pressCmyk, this.currentProfile);
            
            // Check cache first
            if (this.correctionCache.has(cacheKey)) {
                return this.correctionCache.get(cacheKey);
            }

            const profile = this.getCurrentProfile();
            const componentDeltas = this.calculateComponentDeltas(targetLab, pressLab);
            
            // Generate base corrections using heuristic algorithm
            const baseCorrections = this.calculateHeuristicCorrections(componentDeltas, pressCmyk);
            
            // Apply substrate-specific adjustments
            const substrateAdjustedCorrections = this.applySubstrateCorrections(baseCorrections, profile);
            
            // Generate multiple correction strategies
            const correctionStrategies = this.generateCorrectionStrategies(
                substrateAdjustedCorrections, 
                pressCmyk, 
                profile,
                componentDeltas
            );
            
            // Add press-side guidance
            const pressGuidance = this.generatePressGuidance(componentDeltas, profile);
            
            const result = {
                strategies: correctionStrategies,
                pressGuidance: pressGuidance,
                substrateProfile: profile.displayName,
                deltaE: this.calculateDeltaE(targetLab, pressLab)
            };
            
            // Cache the result
            this.correctionCache.set(cacheKey, result);
            
            return result;
            
        } catch (error) {
            console.error('Error generating correction suggestions:', error);
            return {
                strategies: [],
                pressGuidance: ['Error generating corrections - check input values'],
                substrateProfile: this.getCurrentProfile().displayName,
                deltaE: 0
            };
        }
    }

    /**
     * Calculate component deltas between target and press LAB values
     */
    calculateComponentDeltas(targetLab, pressLab) {
        return {
            deltaL: targetLab.l - pressLab.l,
            deltaA: targetLab.a - pressLab.a,
            deltaB: targetLab.b - pressLab.b,
            deltaC: Math.sqrt(targetLab.a * targetLab.a + targetLab.b * targetLab.b) - 
                   Math.sqrt(pressLab.a * pressLab.a + pressLab.b * pressLab.b),
            deltaH: this.calculateHueDifference(targetLab, pressLab)
        };
    }

    /**
     * Calculate hue difference
     */
    calculateHueDifference(targetLab, pressLab) {
        const targetHue = Math.atan2(targetLab.b, targetLab.a) * 180 / Math.PI;
        const pressHue = Math.atan2(pressLab.b, pressLab.a) * 180 / Math.PI;
        let deltaH = targetHue - pressHue;
        
        // Normalize to -180 to +180 range
        if (deltaH > 180) deltaH -= 360;
        if (deltaH < -180) deltaH += 360;
        
        return deltaH;
    }

    /**
     * Calculate heuristic corrections based on LAB deltas
     * Requirements: 2.3 - Implement the heuristic correction algorithm
     */
    calculateHeuristicCorrections(componentDeltas, pressCmyk) {
        const corrections = { c: 0, m: 0, y: 0, k: 0, o: 0, g: 0, v: 0 };
        
        // Lightness corrections (primarily affects K)
        if (Math.abs(componentDeltas.deltaL) > 0.5) {
            corrections.k = -componentDeltas.deltaL * 0.4; // Inverse relationship
        }
        
        // a* corrections (green-red axis, primarily affects M)
        if (Math.abs(componentDeltas.deltaA) > 0.5) {
            corrections.m = componentDeltas.deltaA * 0.6;
            // Secondary effect on cyan for color balance
            corrections.c = -componentDeltas.deltaA * 0.1;
        }
        
        // b* corrections (blue-yellow axis, primarily affects Y)
        if (Math.abs(componentDeltas.deltaB) > 0.5) {
            corrections.y = componentDeltas.deltaB * 0.6;
            // Secondary effect on magenta for color balance
            corrections.m = -componentDeltas.deltaB * 0.1;
        }
        
        // Chroma corrections (affects overall color saturation)
        if (Math.abs(componentDeltas.deltaC) > 1.0) {
            const chromaFactor = componentDeltas.deltaC * 0.15;
            corrections.c += chromaFactor;
            corrections.m += chromaFactor;
            corrections.y += chromaFactor;
        }
        
        // Hue corrections (affects color balance)
        if (Math.abs(componentDeltas.deltaH) > 2.0) {
            const hueFactor = componentDeltas.deltaH * 0.05;
            // Adjust complementary colors based on hue shift
            if (componentDeltas.deltaH > 0) {
                corrections.c += hueFactor;
                corrections.m -= hueFactor * 0.5;
            } else {
                corrections.m += Math.abs(hueFactor);
                corrections.c -= Math.abs(hueFactor) * 0.5;
            }
        }
        
        return corrections;
    }

    /**
     * Apply substrate-specific corrections
     * Requirements: 2.2 - Integrate substrate-specific characteristics
     */
    applySubstrateCorrections(baseCorrections, profile) {
        const adjustedCorrections = {};
        
        // Apply substrate correction weights
        Object.keys(baseCorrections).forEach(channel => {
            const weight = profile.correctionWeights[channel] || 1.0;
            adjustedCorrections[channel] = baseCorrections[channel] * weight;
        });
        
        // Apply substrate tone adjustments
        adjustedCorrections.m += profile.characteristics.toneA * 0.1; // a* tone adjustment
        adjustedCorrections.y += profile.characteristics.toneB * 0.1; // b* tone adjustment
        
        // Apply dot gain compensation
        const gainFactor = (profile.characteristics.gain - 1.0) * 0.5;
        adjustedCorrections.c += gainFactor;
        adjustedCorrections.m += gainFactor;
        adjustedCorrections.y += gainFactor;
        
        return adjustedCorrections;
    }

    /**
     * Generate multiple correction strategies
     * Requirements: 1.5 - Add correction suggestions table showing recommended ink adjustments
     */
    generateCorrectionStrategies(corrections, pressCmyk, profile, componentDeltas) {
        const strategies = [];
        
        // Strategy 1: Conservative adjustment (50% of calculated correction)
        const conservativeCorrections = {};
        Object.keys(corrections).forEach(channel => {
            conservativeCorrections[channel] = corrections[channel] * 0.5;
        });
        
        strategies.push({
            name: 'Conservative',
            description: 'Safe 50% adjustment - recommended for first correction',
            corrections: conservativeCorrections,
            newCmyk: this.applyCorrectionsToCmyk(pressCmyk, conservativeCorrections),
            confidence: 'High',
            risk: 'Low'
        });
        
        // Strategy 2: Standard adjustment (full calculated correction)
        strategies.push({
            name: 'Standard',
            description: 'Full calculated correction based on LAB analysis',
            corrections: corrections,
            newCmyk: this.applyCorrectionsToCmyk(pressCmyk, corrections),
            confidence: 'Medium',
            risk: 'Medium'
        });
        
        // Strategy 3: Aggressive adjustment (125% of calculated correction)
        const aggressiveCorrections = {};
        Object.keys(corrections).forEach(channel => {
            aggressiveCorrections[channel] = corrections[channel] * 1.25;
        });
        
        strategies.push({
            name: 'Aggressive',
            description: 'Overcorrection to account for press variability',
            corrections: aggressiveCorrections,
            newCmyk: this.applyCorrectionsToCmyk(pressCmyk, aggressiveCorrections),
            confidence: 'Low',
            risk: 'High'
        });
        
        // Validate all strategies and clamp values
        return strategies.map(strategy => {
            strategy.newCmyk = this.validateAndClampCmyk(strategy.newCmyk);
            return strategy;
        });
    }

    /**
     * Apply corrections to CMYK values
     */
    applyCorrectionsToCmyk(baseCmyk, corrections) {
        return {
            c: baseCmyk.c + (corrections.c || 0),
            m: baseCmyk.m + (corrections.m || 0),
            y: baseCmyk.y + (corrections.y || 0),
            k: baseCmyk.k + (corrections.k || 0),
            o: (baseCmyk.o || 0) + (corrections.o || 0),
            g: (baseCmyk.g || 0) + (corrections.g || 0),
            v: (baseCmyk.v || 0) + (corrections.v || 0)
        };
    }

    /**
     * Validate and clamp CMYK values to valid ranges
     */
    validateAndClampCmyk(cmyk) {
        const clampedCmyk = {};
        
        ['c', 'm', 'y', 'k', 'o', 'g', 'v'].forEach(channel => {
            const value = cmyk[channel] || 0;
            clampedCmyk[channel] = Math.max(0, Math.min(100, value));
        });
        
        // Check Total Area Coverage (TAC)
        const tac = clampedCmyk.c + clampedCmyk.m + clampedCmyk.y + clampedCmyk.k + 
                   clampedCmyk.o + clampedCmyk.g + clampedCmyk.v;
        
        if (tac > 400) {
            // Proportionally reduce all channels to stay within TAC limit
            const scaleFactor = 400 / tac;
            Object.keys(clampedCmyk).forEach(channel => {
                clampedCmyk[channel] *= scaleFactor;
            });
        }
        
        return clampedCmyk;
    }

    /**
     * Generate press-side guidance based on analysis
     * Requirements: 2.4 - Include press-side guidance based on ΔE analysis and substrate properties
     */
    generatePressGuidance(componentDeltas, profile) {
        const guidance = [...profile.pressGuidance]; // Start with substrate-specific guidance
        
        // Add specific guidance based on color analysis
        const deltaE = Math.sqrt(
            componentDeltas.deltaL * componentDeltas.deltaL +
            componentDeltas.deltaA * componentDeltas.deltaA +
            componentDeltas.deltaB * componentDeltas.deltaB
        );
        
        if (deltaE > 5) {
            guidance.push('Large color difference detected - consider multiple correction passes');
        }
        
        if (Math.abs(componentDeltas.deltaL) > 3) {
            if (componentDeltas.deltaL > 0) {
                guidance.push('Press running too dark - reduce ink density or increase fountain solution');
            } else {
                guidance.push('Press running too light - increase ink density or check blanket pressure');
            }
        }
        
        if (Math.abs(componentDeltas.deltaA) > 2) {
            if (componentDeltas.deltaA > 0) {
                guidance.push('Color shift toward red - reduce magenta or increase cyan');
            } else {
                guidance.push('Color shift toward green - increase magenta or reduce cyan');
            }
        }
        
        if (Math.abs(componentDeltas.deltaB) > 2) {
            if (componentDeltas.deltaB > 0) {
                guidance.push('Color shift toward yellow - reduce yellow or increase magenta');
            } else {
                guidance.push('Color shift toward blue - increase yellow or reduce cyan');
            }
        }
        
        return guidance;
    }

    /**
     * Calculate Delta E (CIE76) for reference
     */
    calculateDeltaE(targetLab, pressLab) {
        const deltaL = targetLab.l - pressLab.l;
        const deltaA = targetLab.a - pressLab.a;
        const deltaB = targetLab.b - pressLab.b;
        
        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    /**
     * Generate cache key for correction caching
     */
    generateCacheKey(targetLab, pressLab, pressCmyk, profileId) {
        return `${targetLab.l.toFixed(2)}_${targetLab.a.toFixed(2)}_${targetLab.b.toFixed(2)}_` +
               `${pressLab.l.toFixed(2)}_${pressLab.a.toFixed(2)}_${pressLab.b.toFixed(2)}_` +
               `${pressCmyk.c.toFixed(1)}_${pressCmyk.m.toFixed(1)}_${pressCmyk.y.toFixed(1)}_${pressCmyk.k.toFixed(1)}_` +
               `${profileId}`;
    }

    /**
     * Clear correction cache
     */
    clearCorrectionCache() {
        this.correctionCache.clear();
    }

    /**
     * Update corrections for current profile (called when profile changes)
     */
    updateCorrectionsForCurrentProfile() {
        // Trigger correction update if calculator is available
        if (window.updateCorrectionSuggestions) {
            window.updateCorrectionSuggestions();
        }
    }

    /**
     * Get substrate profile information for display
     */
    getProfileInfo(profileId = null) {
        const profile = profileId ? this.profiles[profileId] : this.getCurrentProfile();
        return {
            name: profile.displayName,
            description: profile.description,
            characteristics: profile.characteristics,
            guidance: profile.pressGuidance
        };
    }

    /**
     * Get all available substrate profiles
     */
    getAllProfiles() {
        return Object.keys(this.profiles).map(id => ({
            id: id,
            name: this.profiles[id].displayName,
            description: this.profiles[id].description
        }));
    }
}

// Initialize the substrate profile system
let substrateProfileSystem;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    substrateProfileSystem = new SubstrateProfileSystem();
    
    // Make it globally available
    window.substrateProfileSystem = substrateProfileSystem;
    
    console.log('Substrate Profile System ready');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubstrateProfileSystem;
}