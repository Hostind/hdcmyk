// HD CMYK Color Engine - Advanced Extension
// Extends the existing color-science.js with HD color matching capabilities
// Integrates seamlessly with existing Print Calculator architecture

console.log('HD Color Engine module loading...');

// HD Color Engine State Management
let HD_STATE = {
    currentICC: null,
    deviceLinkData: null,
    substrates: {},
    activeSubstrate: 'hpw',
    grid: [],
    clientProfiles: {},
    sops: {},
    ccmMatrix: null,
    bridgeConnected: false
};

// HD Color Constants and Utilities
const HD_CONSTANTS = {
    // Extended CMYKOGV support
    EXTENDED_GAMUT: {
        maxTAC: 400, // Total Area Coverage limit
        channels: ['c', 'm', 'y', 'k', 'o', 'g', 'v'],
        channelNames: {
            c: 'Cyan', m: 'Magenta', y: 'Yellow', k: 'Black',
            o: 'Orange', g: 'Green', v: 'Violet'
        }
    },

    // Substrate profiles from the HD CMYK application
    SUBSTRATES: {
        hpw: {
            name: "Hot Press White", 
            toneA: 0.2, toneB: 1.2, gain: 0.10, 
            weight: {C: 0.9, M: 1.0, Y: 1.0, K: 0.9, O: 0.9, G: 0.9, V: 0.9}
        },
        inver: {
            name: "Invercote", 
            toneA: 0.3, toneB: 1.6, gain: 0.12, 
            weight: {C: 0.95, M: 1.0, Y: 1.0, K: 0.95, O: 0.9, G: 0.9, V: 0.9}
        },
        gsm250: {
            name: "250 gsm", 
            toneA: 0.1, toneB: 0.8, gain: 0.09, 
            weight: {C: 1.0, M: 1.0, Y: 1.0, K: 1.0, O: 1.0, G: 1.0, V: 1.0}
        },
        foil: {
            name: "Foil Board", 
            toneA: -0.5, toneB: 2.8, gain: 0.06, 
            weight: {C: 0.85, M: 0.9, Y: 0.9, K: 0.8, O: 0.8, G: 0.8, V: 0.8}
        }
    },

    // Default SOP templates
    DEFAULT_SOP: {
        hpw: [
            'Verify plate curve / cutback curve ID',
            'Check trapping & overprint in Illustrator (company standard)',
            'Ink limits OK; densities within spec',
            'Color bar + registration tree placed',
            'Ink eaters & takeoff bars per color present',
            'Substrate: Hot Press White confirmed',
            'Proof EPL aligned',
            '10 random patches within ΔE00 tolerance',
            'Customer/QA sign-off recorded'
        ],
        inver: [
            'Verify plate curve / cutback curve ID',
            'Trapping & overprint checked',
            'Ink limits OK; densities within spec',
            'Color bar + registration tree placed',
            'Ink eaters & takeoff bars per color present',
            'Substrate: Invercote confirmed',
            'EPL / proof profile aligned',
            'ΔE00 within tolerance (record)',
            'Sign-off recorded'
        ],
        gsm250: [
            'Curve ID verified',
            'Overprint preview matches',
            'Ink limits & densities OK',
            'Color bar present',
            'Takeoff bars per channel',
            'Substrate: 250 gsm confirmed',
            'Proof/press alignment check',
            'ΔE00 audit',
            'Sign-off'
        ],
        foil: [
            'Curve ID verified',
            'White underprint where needed',
            'Overprint & trapping correct',
            'Ink limits adjusted for Foil Board',
            'Color bar + reg marks present',
            'Substrate: Foil Board confirmed',
            'Proof EPL aligned',
            'ΔE00 audit incl. metallic areas',
            'Sign-off'
        ]
    }
};

/**
 * Extended CMYKOGV to RGB Conversion
 * Supports Orange, Green, Violet extended gamut channels
 */
function cmykogvToRgb(C, M, Y, K, O = 0, G = 0, V = 0) {
    try {
        // Start with basic CMYK to RGB conversion
        let rgb = window.colorScience.cmykToRgb(C, M, Y, K);
        
        // Apply extended gamut adjustments
        let R = rgb.r / 255, Gc = rgb.g / 255, B = rgb.b / 255;
        
        // Orange affects Red and Green channels
        R = Math.max(0, Math.min(1, R + (O / 100) * 0.25));
        Gc = Math.max(0, Math.min(1, Gc + (O / 100) * 0.05));
        
        // Green affects Green channel primarily
        Gc = Math.max(0, Math.min(1, Gc + (G / 100) * 0.25));
        R = Math.max(0, Math.min(1, R + (G / 100) * 0.05));
        
        // Violet affects Blue and Red channels
        B = Math.max(0, Math.min(1, B + (V / 100) * 0.25));
        R = Math.max(0, Math.min(1, R + (V / 100) * 0.05));
        
        return {
            r: Math.round(R * 255),
            g: Math.round(Gc * 255),
            b: Math.round(B * 255)
        };
    } catch (error) {
        console.error('Error in CMYKOGV to RGB conversion:', error);
        return { r: 255, g: 255, b: 255 };
    }
}

/**
 * Enhanced Delta E Calculations
 * Supports both ΔE76, ΔE94, and ΔE2000 calculations
 */
function calculateEnhancedDeltaE(lab1, lab2, method = 'de2000') {
    try {
        switch (method) {
            case 'de76':
                return window.colorScience.calculateDeltaE(lab1, lab2);
            case 'de94':
                return calculateDeltaE94(lab1, lab2);
            case 'de2000':
                return window.colorScience.calculateDeltaE2000(lab1, lab2);
            default:
                return window.colorScience.calculateDeltaE2000(lab1, lab2);
        }
    } catch (error) {
        console.error('Error in enhanced Delta E calculation:', error);
        return 999;
    }
}

/**
 * Delta E 94 Calculation
 * Intermediate accuracy between ΔE76 and ΔE2000
 */
function calculateDeltaE94(lab1, lab2) {
    try {
        const [L1, a1, b1] = [lab1.l, lab1.a, lab1.b];
        const [L2, a2, b2] = [lab2.l, lab2.a, lab2.b];
        
        const C1 = Math.sqrt(a1 * a1 + b1 * b1);
        const C2 = Math.sqrt(a2 * a2 + b2 * b2);
        
        const dL = L1 - L2;
        const dC = C1 - C2;
        const da = a1 - a2;
        const db = b1 - b2;
        
        const dH = Math.sqrt(Math.max(0, da * da + db * db - dC * dC));
        
        const kL = 1, kC = 1, kH = 1;
        const K1 = 0.045, K2 = 0.015;
        
        const SL = 1;
        const SC = 1 + K1 * C1;
        const SH = 1 + K2 * C1;
        
        return Math.sqrt(
            Math.pow(dL / (kL * SL), 2) +
            Math.pow(dC / (kC * SC), 2) +
            Math.pow(dH / (kH * SH), 2)
        );
    } catch (error) {
        console.error('Error in ΔE94 calculation:', error);
        return window.colorScience.calculateDeltaE(lab1, lab2);
    }
}

/**
 * HD Color Matching Suggestions
 * Extended CMYKOGV suggestion engine with substrate compensation
 */
function generateHDColorSuggestions(targetLab, sampleCmykogv, sampleLab, options = {}) {
    try {
        const {
            substrate = HD_STATE.activeSubstrate,
            tolerance = 2.0,
            includeExtendedGamut = true,
            prioritizeSmallAdjustments = true
        } = options;
        
        const suggestions = [];
        const substrateDef = HD_CONSTANTS.SUBSTRATES[substrate];
        
        if (!substrateDef) {
            throw new Error(`Unknown substrate: ${substrate}`);
        }
        
        // Calculate LAB deltas with substrate compensation
        const compensatedTarget = applySubstrateCompensation(targetLab, substrateDef);
        const componentDeltas = window.colorScience.calculateComponentDeltas(compensatedTarget, sampleLab);
        
        // Generate basic CMYK suggestions using existing engine
        const basicCmyk = {
            c: sampleCmykogv.c, m: sampleCmykogv.m, 
            y: sampleCmykogv.y, k: sampleCmykogv.k
        };
        
        const basicSuggestions = window.colorScience.generateCMYKSuggestions(
            compensatedTarget, basicCmyk, sampleLab
        );
        
        // Extend basic suggestions to include OGV channels
        basicSuggestions.forEach(suggestion => {
            const extendedSuggestion = {
                ...suggestion,
                cmykogv: {
                    ...suggestion.cmyk,
                    o: sampleCmykogv.o || 0,
                    g: sampleCmykogv.g || 0,
                    v: sampleCmykogv.v || 0
                },
                type: 'basic'
            };
            suggestions.push(extendedSuggestion);
        });
        
        // Generate extended gamut suggestions if enabled
        if (includeExtendedGamut && (sampleCmykogv.o > 0 || sampleCmykogv.g > 0 || sampleCmykogv.v > 0)) {
            const extendedSuggestions = generateExtendedGamutSuggestions(
                compensatedTarget, sampleCmykogv, componentDeltas, substrateDef
            );
            suggestions.push(...extendedSuggestions);
        }
        
        // Apply substrate weighting and validation
        const validatedSuggestions = suggestions
            .map(suggestion => applySubstrateWeighting(suggestion, substrateDef))
            .filter(suggestion => validateHDCMYKOGV(suggestion.cmykogv))
            .slice(0, 5);
        
        return {
            suggestions: validatedSuggestions,
            substrate: substrate,
            compensatedTarget: compensatedTarget,
            componentDeltas: componentDeltas,
            metadata: {
                totalSuggestions: suggestions.length,
                extendedGamutUsed: includeExtendedGamut,
                substrateApplied: substrate
            }
        };
        
    } catch (error) {
        console.error('Error generating HD color suggestions:', error);
        return {
            suggestions: [],
            error: error.message
        };
    }
}

/**
 * Apply Substrate Compensation to Target LAB
 * Adjusts target based on substrate characteristics
 */
function applySubstrateCompensation(targetLab, substrateDef) {
    try {
        return {
            l: targetLab.l, // Lightness remains the same
            a: targetLab.a + substrateDef.toneA,
            b: targetLab.b + substrateDef.toneB
        };
    } catch (error) {
        console.error('Error applying substrate compensation:', error);
        return targetLab;
    }
}

/**
 * Generate Extended Gamut Suggestions
 * Creates suggestions that utilize O, G, V channels
 */
function generateExtendedGamutSuggestions(targetLab, baseCmykogv, componentDeltas, substrateDef) {
    const suggestions = [];
    
    try {
        // Determine hue angle for extended gamut channel selection
        const hue = Math.atan2(componentDeltas.deltaB, componentDeltas.deltaA);
        const sector = ((hue + Math.PI) / (2 * Math.PI)) * 6;
        
        // Orange adjustments for red-yellow hues
        if (sector >= 0 && sector < 2) {
            const orangeAdjustment = Math.min(15, Math.abs(componentDeltas.deltaA) * 0.3);
            if (orangeAdjustment > 1) {
                const newCmykogv = { ...baseCmykogv };
                newCmykogv.o = Math.min(100, baseCmykogv.o + orangeAdjustment);
                newCmykogv.m = Math.max(0, baseCmykogv.m - orangeAdjustment * 0.2);
                
                suggestions.push({
                    cmykogv: newCmykogv,
                    description: `Add Orange (+${orangeAdjustment.toFixed(1)}%) for warmer reds`,
                    type: 'extended_gamut',
                    magnitude: orangeAdjustment,
                    channel: 'orange'
                });
            }
        }
        
        // Green adjustments for cyan-yellow hues
        if (sector >= 2 && sector < 4) {
            const greenAdjustment = Math.min(15, Math.abs(componentDeltas.deltaB) * 0.25);
            if (greenAdjustment > 1) {
                const newCmykogv = { ...baseCmykogv };
                newCmykogv.g = Math.min(100, baseCmykogv.g + greenAdjustment);
                newCmykogv.c = Math.max(0, baseCmykogv.c - greenAdjustment * 0.15);
                
                suggestions.push({
                    cmykogv: newCmykogv,
                    description: `Add Green (+${greenAdjustment.toFixed(1)}%) for cleaner greens`,
                    type: 'extended_gamut',
                    magnitude: greenAdjustment,
                    channel: 'green'
                });
            }
        }
        
        // Violet adjustments for blue-magenta hues
        if (sector >= 4 && sector < 6) {
            const violetAdjustment = Math.min(15, Math.abs(componentDeltas.deltaA) * 0.3);
            if (violetAdjustment > 1) {
                const newCmykogv = { ...baseCmykogv };
                newCmykogv.v = Math.min(100, baseCmykogv.v + violetAdjustment);
                newCmykogv.m = Math.max(0, baseCmykogv.m - violetAdjustment * 0.2);
                
                suggestions.push({
                    cmykogv: newCmykogv,
                    description: `Add Violet (+${violetAdjustment.toFixed(1)}%) for cleaner purples`,
                    type: 'extended_gamut',
                    magnitude: violetAdjustment,
                    channel: 'violet'
                });
            }
        }
        
        return suggestions;
        
    } catch (error) {
        console.error('Error generating extended gamut suggestions:', error);
        return [];
    }
}

/**
 * Apply Substrate Weighting to Suggestions
 * Adjusts suggestions based on substrate ink behavior
 */
function applySubstrateWeighting(suggestion, substrateDef) {
    try {
        const weightedCmykogv = { ...suggestion.cmykogv };
        const weights = substrateDef.weight;
        
        // Apply substrate-specific ink weights
        Object.keys(weights).forEach(channel => {
            const channelKey = channel.toLowerCase();
            if (weightedCmykogv.hasOwnProperty(channelKey)) {
                const adjustment = (weightedCmykogv[channelKey] * weights[channel]) - weightedCmykogv[channelKey];
                weightedCmykogv[channelKey] = Math.max(0, Math.min(100, 
                    weightedCmykogv[channelKey] + adjustment * 0.1
                ));
            }
        });
        
        return {
            ...suggestion,
            cmykogv: weightedCmykogv,
            description: suggestion.description + ` (${substrateDef.name} optimized)`
        };
        
    } catch (error) {
        console.error('Error applying substrate weighting:', error);
        return suggestion;
    }
}

/**
 * Validate CMYKOGV Values
 * Ensures all channels are within valid ranges and TAC limits
 */
function validateHDCMYKOGV(cmykogv) {
    try {
        // Check individual channel ranges
        const channels = ['c', 'm', 'y', 'k', 'o', 'g', 'v'];
        for (const channel of channels) {
            const value = cmykogv[channel] || 0;
            if (value < 0 || value > 100) return false;
        }
        
        // Check Total Area Coverage
        const totalCoverage = channels.reduce((sum, channel) => 
            sum + (cmykogv[channel] || 0), 0);
        
        if (totalCoverage > HD_CONSTANTS.EXTENDED_GAMUT.maxTAC) return false;
        
        return true;
        
    } catch (error) {
        console.error('Error validating CMYKOGV:', error);
        return false;
    }
}

/**
 * CSV Import Functionality
 * Enhanced CSV parsing for LAB data import
 */
function parseCSVForLAB(csvText) {
    try {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must contain at least a header and one data row');
        }
        
        // Parse header to find L, A, B columns
        const header = lines[0].split(/,|;|\t/).map(h => h.trim().toLowerCase());
        const lIndex = header.findIndex(h => /^l\*?$/i.test(h));
        const aIndex = header.findIndex(h => /^a\*?$/i.test(h));
        const bIndex = header.findIndex(h => /^b\*?$/i.test(h));
        
        if (lIndex === -1 || aIndex === -1 || bIndex === -1) {
            throw new Error('CSV must contain L*, a*, b* columns');
        }
        
        // Parse data rows
        const labData = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(/,|;|\t/);
            const L = parseFloat(cols[lIndex]);
            const a = parseFloat(cols[aIndex]);
            const b = parseFloat(cols[bIndex]);
            
            if (!isNaN(L) && !isNaN(a) && !isNaN(b)) {
                labData.push({
                    l: Math.max(0, Math.min(100, L)),
                    a: Math.max(-128, Math.min(127, a)),
                    b: Math.max(-128, Math.min(127, b))
                });
            }
        }
        
        return {
            success: true,
            data: labData,
            count: labData.length,
            message: `Imported ${labData.length} LAB color values`
        };
        
    } catch (error) {
        console.error('Error parsing CSV:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

/**
 * Client Profile Management
 * Store and manage client-specific settings
 */
function saveClientProfile(name, profile) {
    try {
        const profiles = JSON.parse(localStorage.getItem('hd_client_profiles') || '{}');
        profiles[name] = {
            ...profile,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('hd_client_profiles', JSON.stringify(profiles));
        HD_STATE.clientProfiles = profiles;
        
        return {
            success: true,
            message: `Client profile "${name}" saved successfully`
        };
    } catch (error) {
        console.error('Error saving client profile:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function loadClientProfile(name) {
    try {
        const profiles = JSON.parse(localStorage.getItem('hd_client_profiles') || '{}');
        const profile = profiles[name];
        
        if (!profile) {
            throw new Error(`Client profile "${name}" not found`);
        }
        
        return {
            success: true,
            profile: profile
        };
    } catch (error) {
        console.error('Error loading client profile:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * SOP (Standard Operating Procedure) Management
 * Substrate-specific checklists and procedures
 */
function saveSOP(substrate, sopItems) {
    try {
        const sops = JSON.parse(localStorage.getItem('hd_sops') || '{}');
        sops[substrate] = {
            items: sopItems,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('hd_sops', JSON.stringify(sops));
        HD_STATE.sops = sops;
        
        return {
            success: true,
            message: `SOP for ${substrate} saved successfully`
        };
    } catch (error) {
        console.error('Error saving SOP:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function loadSOP(substrate) {
    try {
        const sops = JSON.parse(localStorage.getItem('hd_sops') || '{}');
        let sopItems = sops[substrate]?.items;
        
        // Fall back to default SOP if not found
        if (!sopItems) {
            sopItems = HD_CONSTANTS.DEFAULT_SOP[substrate] || HD_CONSTANTS.DEFAULT_SOP.hpw;
        }
        
        return {
            success: true,
            items: sopItems,
            isDefault: !sops[substrate]
        };
    } catch (error) {
        console.error('Error loading SOP:', error);
        return {
            success: false,
            error: error.message,
            items: []
        };
    }
}

/**
 * Initialize HD Color Engine
 * Set up state and integrate with existing color science
 */
function initializeHDColorEngine() {
    try {
        // Load stored state
        const storedClientProfiles = localStorage.getItem('hd_client_profiles');
        if (storedClientProfiles) {
            HD_STATE.clientProfiles = JSON.parse(storedClientProfiles);
        }
        
        const storedSOPs = localStorage.getItem('hd_sops');
        if (storedSOPs) {
            HD_STATE.sops = JSON.parse(storedSOPs);
        }
        
        console.log('HD Color Engine initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing HD Color Engine:', error);
        return false;
    }
}

// Export HD Color Engine functions
window.hdColorEngine = {
    // Core HD color functions
    cmykogvToRgb,
    calculateEnhancedDeltaE,
    calculateDeltaE94,
    generateHDColorSuggestions,
    applySubstrateCompensation,
    validateHDCMYKOGV,
    
    // CSV and data import
    parseCSVForLAB,
    
    // Client and workflow management
    saveClientProfile,
    loadClientProfile,
    saveSOP,
    loadSOP,
    
    // State management
    getState: () => HD_STATE,
    setState: (newState) => { HD_STATE = { ...HD_STATE, ...newState }; },
    
    // Constants access
    CONSTANTS: HD_CONSTANTS,
    
    // Initialization
    initialize: initializeHDColorEngine
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeHDColorEngine();
});

// Integrate with existing color science module
if (window.colorScience) {
    window.colorScience.hdEngine = window.hdColorEngine;
    console.log('HD Color Engine integrated with existing color science module');
}

console.log('HD Color Engine module loaded successfully');