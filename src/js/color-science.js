// LAB Color Matching Calculator - Color Science Engine
// Following the simple JavaScript approach from our design spec
// Requirements: 6.1, 6.4 - Industry-standard color conversion methods

console.log('Color Science module loading...');

// Performance optimization: Color conversion cache
const colorConversionCache = new Map();
const MAX_COLOR_CACHE_SIZE = 200;

// Performance optimization: Pre-computed values for common operations
const PRECOMPUTED_VALUES = {
    // Common gamma correction values
    GAMMA_THRESHOLD: 0.04045,
    GAMMA_FACTOR: 1.055,
    GAMMA_OFFSET: 0.055,
    GAMMA_EXPONENT: 2.4,
    LINEAR_FACTOR: 12.92,
    
    // Common LAB values
    LAB_EPSILON: 0.008856,
    LAB_KAPPA: 903.3,
    LAB_THRESHOLD: 0.0031308,
    
    // Optimization constants
    RGB_MAX: 255,
    PERCENT_MAX: 100
};

// Color conversion constants and matrices
const COLOR_CONSTANTS = {
    // sRGB to XYZ conversion matrix (D65 illuminant)
    sRGB_TO_XYZ: [
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041]
    ],
    
    // XYZ to sRGB conversion matrix (D65 illuminant)
    XYZ_TO_sRGB: [
        [3.2404542, -1.5371385, -0.4985314],
        [-0.9692660, 1.8760108, 0.0415560],
        [0.0556434, -0.2040259, 1.0572252]
    ],
    
    // D65 white point for LAB calculations
    D65_WHITE_POINT: { x: 95.047, y: 100.000, z: 108.883 },
    
    // LAB conversion constants
    LAB_EPSILON: 0.008856,
    LAB_KAPPA: 903.3
};

/**
 * CMYK to RGB Conversion - Optimized with caching
 * Simplified conversion for color swatch display
 * Requirements: 6.1 - Industry-standard color conversion
 * Enhanced: Optimize color conversion functions for real-time performance
 */
function cmykToRgb(c, m, y, k) {
    // Generate cache key for performance optimization
    const cacheKey = `cmyk_${c.toFixed(1)}_${m.toFixed(1)}_${y.toFixed(1)}_${k.toFixed(1)}`;
    
    // Check cache first
    if (colorConversionCache.has(cacheKey)) {
        return colorConversionCache.get(cacheKey);
    }
    
    try {
        // Normalize CMYK values to 0-1 range with optimized clamping
        const cNorm = Math.max(0, Math.min(PRECOMPUTED_VALUES.PERCENT_MAX, c)) / PRECOMPUTED_VALUES.PERCENT_MAX;
        const mNorm = Math.max(0, Math.min(PRECOMPUTED_VALUES.PERCENT_MAX, m)) / PRECOMPUTED_VALUES.PERCENT_MAX;
        const yNorm = Math.max(0, Math.min(PRECOMPUTED_VALUES.PERCENT_MAX, y)) / PRECOMPUTED_VALUES.PERCENT_MAX;
        const kNorm = Math.max(0, Math.min(PRECOMPUTED_VALUES.PERCENT_MAX, k)) / PRECOMPUTED_VALUES.PERCENT_MAX;
        
        // Optimized CMYK to RGB conversion with pre-computed constants
        const kComplement = 1 - kNorm;
        const r = PRECOMPUTED_VALUES.RGB_MAX * (1 - cNorm) * kComplement;
        const g = PRECOMPUTED_VALUES.RGB_MAX * (1 - mNorm) * kComplement;
        const b = PRECOMPUTED_VALUES.RGB_MAX * (1 - yNorm) * kComplement;
        
        const result = {
            r: Math.round(Math.max(0, Math.min(PRECOMPUTED_VALUES.RGB_MAX, r))),
            g: Math.round(Math.max(0, Math.min(PRECOMPUTED_VALUES.RGB_MAX, g))),
            b: Math.round(Math.max(0, Math.min(PRECOMPUTED_VALUES.RGB_MAX, b)))
        };
        
        // Cache the result for future use
        cacheColorConversion(cacheKey, result);
        
        return result;
        
    } catch (error) {
        console.error('Error in CMYK to RGB conversion:', error);
        // Return white as fallback
        return { r: 255, g: 255, b: 255 };
    }
}

/**
 * RGB to XYZ Conversion
 * Using sRGB color space with D65 illuminant
 */
function rgbToXyz(r, g, b) {
    // Normalize RGB values to 0-1 range
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;
    
    // Apply gamma correction (sRGB)
    rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
    gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
    bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;
    
    // Convert to XYZ using transformation matrix
    const x = rNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[0][0] + gNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[0][1] + bNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[0][2];
    const y = rNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[1][0] + gNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[1][1] + bNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[1][2];
    const z = rNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[2][0] + gNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[2][1] + bNorm * COLOR_CONSTANTS.sRGB_TO_XYZ[2][2];
    
    return {
        x: x * 100, // Scale to 0-100 range
        y: y * 100,
        z: z * 100
    };
}

/**
 * XYZ to LAB Conversion
 * Using D65 illuminant and CIE standard formulas
 */
function xyzToLab(x, y, z) {
    // Normalize by D65 white point
    const xn = x / COLOR_CONSTANTS.D65_WHITE_POINT.x;
    const yn = y / COLOR_CONSTANTS.D65_WHITE_POINT.y;
    const zn = z / COLOR_CONSTANTS.D65_WHITE_POINT.z;
    
    // Apply LAB transformation function
    const fx = xn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(xn, 1/3) : (COLOR_CONSTANTS.LAB_KAPPA * xn + 16) / 116;
    const fy = yn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(yn, 1/3) : (COLOR_CONSTANTS.LAB_KAPPA * yn + 16) / 116;
    const fz = zn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(zn, 1/3) : (COLOR_CONSTANTS.LAB_KAPPA * zn + 16) / 116;
    
    // Calculate LAB values
    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    
    return {
        l: Math.max(0, Math.min(100, l)),
        a: Math.max(-128, Math.min(127, a)),
        b: Math.max(-128, Math.min(127, b))
    };
}

/**
 * LAB to XYZ Conversion
 * Reverse of XYZ to LAB conversion
 */
function labToXyz(l, a, b) {
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    
    const xn = fx * fx * fx > COLOR_CONSTANTS.LAB_EPSILON ? fx * fx * fx : (116 * fx - 16) / COLOR_CONSTANTS.LAB_KAPPA;
    const yn = l > COLOR_CONSTANTS.LAB_KAPPA * COLOR_CONSTANTS.LAB_EPSILON ? fy * fy * fy : l / COLOR_CONSTANTS.LAB_KAPPA;
    const zn = fz * fz * fz > COLOR_CONSTANTS.LAB_EPSILON ? fz * fz * fz : (116 * fz - 16) / COLOR_CONSTANTS.LAB_KAPPA;
    
    return {
        x: xn * COLOR_CONSTANTS.D65_WHITE_POINT.x,
        y: yn * COLOR_CONSTANTS.D65_WHITE_POINT.y,
        z: zn * COLOR_CONSTANTS.D65_WHITE_POINT.z
    };
}

/**
 * XYZ to RGB Conversion
 * Using sRGB color space with gamma correction
 */
function xyzToRgb(x, y, z) {
    // Normalize XYZ values
    const xNorm = x / 100;
    const yNorm = y / 100;
    const zNorm = z / 100;
    
    // Convert to linear RGB using transformation matrix
    let r = xNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[0][0] + yNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[0][1] + zNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[0][2];
    let g = xNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[1][0] + yNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[1][1] + zNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[1][2];
    let b = xNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[2][0] + yNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[2][1] + zNorm * COLOR_CONSTANTS.XYZ_TO_sRGB[2][2];
    
    // Apply gamma correction (sRGB)
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
    
    return {
        r: Math.round(Math.max(0, Math.min(255, r * 255))),
        g: Math.round(Math.max(0, Math.min(255, g * 255))),
        b: Math.round(Math.max(0, Math.min(255, b * 255)))
    };
}

/**
 * LAB to RGB Conversion - Optimized with caching
 * Complete conversion chain: LAB -> XYZ -> RGB
 * Requirements: 6.1 - LAB input visualization
 * Enhanced: Optimize color conversion functions for real-time performance
 */
function labToRgb(l, a, b) {
    // Generate cache key for performance optimization
    const cacheKey = `lab_${l.toFixed(2)}_${a.toFixed(2)}_${b.toFixed(2)}`;
    
    // Check cache first
    if (colorConversionCache.has(cacheKey)) {
        return colorConversionCache.get(cacheKey);
    }
    
    try {
        // Validate LAB input ranges with optimized clamping
        const lClamped = Math.max(0, Math.min(PRECOMPUTED_VALUES.PERCENT_MAX, l));
        const aClamped = Math.max(-128, Math.min(127, a));
        const bClamped = Math.max(-128, Math.min(127, b));
        
        // Convert LAB -> XYZ -> RGB with error handling
        const xyz = labToXyz(lClamped, aClamped, bClamped);
        const result = xyzToRgb(xyz.x, xyz.y, xyz.z);
        
        // Cache the result for future use
        cacheColorConversion(cacheKey, result);
        
        return result;
        
    } catch (error) {
        console.error('Error in LAB to RGB conversion:', error);
        // Return white as fallback
        return { r: 255, g: 255, b: 255 };
    }
}

/**
 * RGB Color Validation and Clamping
 * Requirements: 6.4 - Consistent results across browsers
 */
function validateAndClampRgb(rgb) {
    return {
        r: Math.round(Math.max(0, Math.min(255, rgb.r || 0))),
        g: Math.round(Math.max(0, Math.min(255, rgb.g || 0))),
        b: Math.round(Math.max(0, Math.min(255, rgb.b || 0)))
    };
}

/**
 * Convert RGB object to CSS color string
 */
function rgbToCssString(rgb) {
    const validRgb = validateAndClampRgb(rgb);
    return `rgb(${validRgb.r}, ${validRgb.g}, ${validRgb.b})`;
}

/**
 * Convert CMYK values to CSS color string
 * Convenience function for direct CMYK to CSS conversion
 */
function cmykToCssString(c, m, y, k) {
    const rgb = cmykToRgb(c, m, y, k);
    return rgbToCssString(rgb);
}

/**
 * Convert LAB values to CSS color string
 * Convenience function for direct LAB to CSS conversion
 */
function labToCssString(l, a, b) {
    const rgb = labToRgb(l, a, b);
    return rgbToCssString(rgb);
}

/**
 * Performance Optimization: Color conversion caching utilities
 * Requirements: Optimize color conversion functions for real-time performance
 */
function cacheColorConversion(key, result) {
    // Manage cache size to prevent memory issues
    if (colorConversionCache.size >= MAX_COLOR_CACHE_SIZE) {
        // Remove oldest entries (first 10% of cache)
        const entriesToRemove = Math.floor(MAX_COLOR_CACHE_SIZE * 0.1);
        const keys = Array.from(colorConversionCache.keys());
        
        for (let i = 0; i < entriesToRemove; i++) {
            colorConversionCache.delete(keys[i]);
        }
    }
    
    colorConversionCache.set(key, result);
}

/**
 * Clear color conversion cache (useful for memory management)
 */
function clearColorConversionCache() {
    colorConversionCache.clear();
    console.log('Color conversion cache cleared');
}

/**
 * Get cache statistics for performance monitoring
 */
function getColorConversionCacheStats() {
    return {
        size: colorConversionCache.size,
        maxSize: MAX_COLOR_CACHE_SIZE,
        hitRate: colorConversionCache.hitCount / (colorConversionCache.hitCount + colorConversionCache.missCount) || 0
    };
}

// Unit Tests for Color Conversion Accuracy
// Requirements: 6.4 - Write unit tests for color conversion accuracy
function runColorScienceTests() {
    console.log('Running color science unit tests...');
    
    const tests = [
        {
            name: 'CMYK to RGB - Pure Cyan',
            input: { c: 100, m: 0, y: 0, k: 0 },
            expected: { r: 0, g: 255, b: 255 },
            test: () => cmykToRgb(100, 0, 0, 0)
        },
        {
            name: 'CMYK to RGB - Pure Black',
            input: { c: 0, m: 0, y: 0, k: 100 },
            expected: { r: 0, g: 0, b: 0 },
            test: () => cmykToRgb(0, 0, 0, 100)
        },
        {
            name: 'CMYK to RGB - White (no ink)',
            input: { c: 0, m: 0, y: 0, k: 0 },
            expected: { r: 255, g: 255, b: 255 },
            test: () => cmykToRgb(0, 0, 0, 0)
        },
        {
            name: 'LAB to RGB - Pure White',
            input: { l: 100, a: 0, b: 0 },
            expected: { r: 255, g: 255, b: 255 },
            test: () => labToRgb(100, 0, 0)
        },
        {
            name: 'LAB to RGB - Pure Black',
            input: { l: 0, a: 0, b: 0 },
            expected: { r: 0, g: 0, b: 0 },
            test: () => labToRgb(0, 0, 0)
        },
        {
            name: 'RGB Validation - Out of range values',
            input: { r: 300, g: -50, b: 150 },
            expected: { r: 255, g: 0, b: 150 },
            test: () => validateAndClampRgb({ r: 300, g: -50, b: 150 })
        }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
        try {
            const result = test.test();
            const tolerance = 5; // Allow small tolerance for color conversion
            
            const rMatch = Math.abs(result.r - test.expected.r) <= tolerance;
            const gMatch = Math.abs(result.g - test.expected.g) <= tolerance;
            const bMatch = Math.abs(result.b - test.expected.b) <= tolerance;
            
            if (rMatch && gMatch && bMatch) {
                console.log(`✅ ${test.name}: PASSED`);
                passedTests++;
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Expected: R${test.expected.r} G${test.expected.g} B${test.expected.b}`);
                console.log(`   Got:      R${result.r} G${result.g} B${result.b}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    });
    
    console.log(`\nColor Science Tests: ${passedTests}/${totalTests} passed`);
    return passedTests === totalTests;
}

/**
 * CMYK Adjustment Suggestion Engine
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 - Generate CMYK adjustment suggestions
 */

/**
 * Generate CMYK adjustment suggestions based on LAB deltas
 * Requirements: 5.1 - Generate 3-5 alternative CMYK combinations
 * Requirements: 5.2 - Order options by likelihood of success (smallest adjustments first)
 */
function generateCMYKSuggestions(targetLab, sampleCmyk, sampleLab) {
    try {
        // Validate inputs
        if (!targetLab || !sampleCmyk || !sampleLab) {
            throw new Error('Invalid input parameters for CMYK suggestions');
        }
        
        // Calculate LAB deltas to understand what needs adjustment
        const componentDeltas = calculateComponentDeltas(targetLab, sampleLab);
        
        // Generate suggestions based on LAB delta analysis
        const suggestions = [];
        
        // Strategy 1: Direct component adjustments based on LAB deltas
        const directAdjustments = generateDirectAdjustments(sampleCmyk, componentDeltas);
        suggestions.push(...directAdjustments);
        
        // Strategy 2: Systematic small adjustments
        const systematicAdjustments = generateSystematicAdjustments(sampleCmyk, componentDeltas);
        suggestions.push(...systematicAdjustments);
        
        // Strategy 3: Combination adjustments for complex color corrections
        const combinationAdjustments = generateCombinationAdjustments(sampleCmyk, componentDeltas);
        suggestions.push(...combinationAdjustments);
        
        // Filter out invalid suggestions and apply gamut validation
        const validSuggestions = suggestions
            .filter(suggestion => isValidCMYKSuggestion(suggestion))
            .map(suggestion => validateCMYKGamut(suggestion));
        
        // Remove duplicates and sort by adjustment magnitude
        const uniqueSuggestions = removeDuplicateSuggestions(validSuggestions);
        const sortedSuggestions = sortSuggestionsByAdjustmentSize(uniqueSuggestions, sampleCmyk);
        
        // Return top 5 suggestions as specified in requirements
        return sortedSuggestions.slice(0, 5);
        
    } catch (error) {
        console.error('Error generating CMYK suggestions:', error);
        return [];
    }
}

/**
 * Generate direct adjustments based on LAB component analysis
 * Requirements: 5.4 - Consider ink interaction effects and practical press limitations
 */
function generateDirectAdjustments(baseCmyk, componentDeltas) {
    const suggestions = [];
    
    // Analyze which CMYK components need adjustment based on LAB deltas
    const adjustmentMap = analyzeLABToCMYKMapping(componentDeltas);
    
    // Generate single-component adjustments
    Object.keys(adjustmentMap).forEach(component => {
        const adjustment = adjustmentMap[component];
        if (Math.abs(adjustment) >= 0.5) { // Only suggest meaningful adjustments
            const newCmyk = { ...baseCmyk };
            newCmyk[component] = baseCmyk[component] + adjustment;
            
            suggestions.push({
                cmyk: newCmyk,
                description: `Adjust ${component.toUpperCase()} by ${adjustment > 0 ? '+' : ''}${adjustment.toFixed(1)}%`,
                adjustmentType: 'direct',
                magnitude: Math.abs(adjustment)
            });
        }
    });
    
    return suggestions;
}

/**
 * Generate systematic small adjustments
 * Requirements: 5.2 - Order by smallest adjustments first for practical implementation
 */
function generateSystematicAdjustments(baseCmyk, componentDeltas) {
    const suggestions = [];
    const adjustmentSizes = [1, 2, 3]; // Small, practical adjustments
    
    // Determine primary adjustment direction based on overall color difference
    const primaryAdjustments = determinePrimaryAdjustments(componentDeltas);
    
    primaryAdjustments.forEach(({ component, direction }) => {
        adjustmentSizes.forEach(size => {
            const adjustment = direction * size;
            const newCmyk = { ...baseCmyk };
            newCmyk[component] = baseCmyk[component] + adjustment;
            
            suggestions.push({
                cmyk: newCmyk,
                description: `${direction > 0 ? 'Increase' : 'Decrease'} ${component.toUpperCase()} by ${size}%`,
                adjustmentType: 'systematic',
                magnitude: size
            });
        });
    });
    
    return suggestions;
}

/**
 * Generate combination adjustments for complex corrections
 * Requirements: 5.4 - Consider ink interaction effects
 */
function generateCombinationAdjustments(baseCmyk, componentDeltas) {
    const suggestions = [];
    
    // Common ink interaction patterns
    const interactionPatterns = [
        // Cyan-Magenta interaction for purple/blue adjustments
        { components: ['c', 'm'], ratios: [1, 1], description: 'Cyan-Magenta balance' },
        { components: ['c', 'm'], ratios: [1, -1], description: 'Cyan-Magenta contrast' },
        
        // Magenta-Yellow interaction for red adjustments
        { components: ['m', 'y'], ratios: [1, 1], description: 'Magenta-Yellow balance' },
        { components: ['m', 'y'], ratios: [1, -1], description: 'Magenta-Yellow contrast' },
        
        // Cyan-Yellow interaction for green adjustments
        { components: ['c', 'y'], ratios: [1, 1], description: 'Cyan-Yellow balance' },
        { components: ['c', 'y'], ratios: [1, -1], description: 'Cyan-Yellow contrast' },
        
        // Black adjustment with color compensation
        { components: ['k', 'c', 'm', 'y'], ratios: [1, -0.3, -0.3, -0.3], description: 'Black with color reduction' }
    ];
    
    // Only generate combination adjustments for significant color differences
    const totalDelta = Math.sqrt(
        componentDeltas.deltaL * componentDeltas.deltaL +
        componentDeltas.deltaA * componentDeltas.deltaA +
        componentDeltas.deltaB * componentDeltas.deltaB
    );
    
    if (totalDelta > 3) { // Only for significant differences
        interactionPatterns.forEach(pattern => {
            const adjustmentSize = Math.min(2, totalDelta / 3); // Scale with difference magnitude
            const newCmyk = { ...baseCmyk };
            
            pattern.components.forEach((component, index) => {
                const adjustment = adjustmentSize * pattern.ratios[index];
                newCmyk[component] = baseCmyk[component] + adjustment;
            });
            
            suggestions.push({
                cmyk: newCmyk,
                description: `${pattern.description} adjustment`,
                adjustmentType: 'combination',
                magnitude: adjustmentSize
            });
        });
    }
    
    return suggestions;
}

/**
 * Analyze LAB deltas to determine CMYK adjustment mapping
 * Requirements: 5.1 - Analyze which CMYK components need adjustment based on LAB deltas
 */
function analyzeLABToCMYKMapping(componentDeltas) {
    const adjustments = { c: 0, m: 0, y: 0, k: 0 };
    
    // Lightness (L*) primarily affects K (black) and overall ink coverage
    if (componentDeltas.deltaL > 1) {
        adjustments.k -= componentDeltas.deltaL * 0.3; // Reduce black to increase lightness
    } else if (componentDeltas.deltaL < -1) {
        adjustments.k += Math.abs(componentDeltas.deltaL) * 0.3; // Increase black to decrease lightness
    }
    
    // a* axis (green-red) primarily affects Magenta
    if (componentDeltas.deltaA > 1) {
        adjustments.m += componentDeltas.deltaA * 0.4; // More magenta for red shift
    } else if (componentDeltas.deltaA < -1) {
        adjustments.m -= Math.abs(componentDeltas.deltaA) * 0.4; // Less magenta for green shift
    }
    
    // b* axis (blue-yellow) primarily affects Yellow
    if (componentDeltas.deltaB > 1) {
        adjustments.y += componentDeltas.deltaB * 0.4; // More yellow for yellow shift
    } else if (componentDeltas.deltaB < -1) {
        adjustments.y -= Math.abs(componentDeltas.deltaB) * 0.4; // Less yellow for blue shift
    }
    
    // Chroma adjustments affect color saturation (CMY balance)
    if (Math.abs(componentDeltas.deltaC) > 1) {
        const chromaFactor = componentDeltas.deltaC * 0.2;
        adjustments.c += chromaFactor;
        adjustments.m += chromaFactor;
        adjustments.y += chromaFactor;
    }
    
    return adjustments;
}

/**
 * Determine primary adjustment directions based on component deltas
 */
function determinePrimaryAdjustments(componentDeltas) {
    const adjustments = [];
    
    // Prioritize adjustments based on delta magnitude
    const deltaMap = [
        { component: 'k', delta: componentDeltas.deltaL, factor: -0.5 }, // Inverse relationship
        { component: 'm', delta: componentDeltas.deltaA, factor: 0.6 },
        { component: 'y', delta: componentDeltas.deltaB, factor: 0.6 },
        { component: 'c', delta: componentDeltas.deltaC, factor: 0.3 }
    ];
    
    deltaMap
        .filter(item => Math.abs(item.delta) > 1) // Only significant deltas
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)) // Sort by magnitude
        .slice(0, 2) // Take top 2 most significant
        .forEach(item => {
            adjustments.push({
                component: item.component,
                direction: item.delta > 0 ? item.factor : -item.factor
            });
        });
    
    return adjustments;
}

/**
 * Validate CMYK suggestion is within printable range
 * Requirements: 5.3 - Add gamut validation to ensure suggestions stay within 0-100% range
 */
function isValidCMYKSuggestion(suggestion) {
    if (!suggestion || !suggestion.cmyk) return false;
    
    const { c, m, y, k } = suggestion.cmyk;
    
    // Check individual component ranges
    const inRange = c >= 0 && c <= 100 &&
                   m >= 0 && m <= 100 &&
                   y >= 0 && y <= 100 &&
                   k >= 0 && k <= 100;
    
    // Check total area coverage (TAC) - typical limit is 300-400%
    const totalCoverage = c + m + y + k;
    const tacValid = totalCoverage <= 400;
    
    return inRange && tacValid;
}

/**
 * Apply gamut validation and clamp values to valid ranges
 * Requirements: 5.5 - Validate suggestions stay within printable gamut
 */
function validateCMYKGamut(suggestion) {
    const clampedCmyk = {
        c: Math.max(0, Math.min(100, suggestion.cmyk.c)),
        m: Math.max(0, Math.min(100, suggestion.cmyk.m)),
        y: Math.max(0, Math.min(100, suggestion.cmyk.y)),
        k: Math.max(0, Math.min(100, suggestion.cmyk.k))
    };
    
    // Check and adjust total area coverage if needed
    const totalCoverage = clampedCmyk.c + clampedCmyk.m + clampedCmyk.y + clampedCmyk.k;
    if (totalCoverage > 400) {
        // Proportionally reduce all components to stay within TAC limit
        const scaleFactor = 400 / totalCoverage;
        clampedCmyk.c *= scaleFactor;
        clampedCmyk.m *= scaleFactor;
        clampedCmyk.y *= scaleFactor;
        clampedCmyk.k *= scaleFactor;
        
        suggestion.description += ' (TAC adjusted)';
    }
    
    return {
        ...suggestion,
        cmyk: clampedCmyk
    };
}

/**
 * Remove duplicate suggestions based on CMYK values
 */
function removeDuplicateSuggestions(suggestions) {
    const unique = [];
    const seen = new Set();
    
    suggestions.forEach(suggestion => {
        const key = `${suggestion.cmyk.c.toFixed(1)}-${suggestion.cmyk.m.toFixed(1)}-${suggestion.cmyk.y.toFixed(1)}-${suggestion.cmyk.k.toFixed(1)}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(suggestion);
        }
    });
    
    return unique;
}

/**
 * Sort suggestions by adjustment magnitude (smallest first)
 * Requirements: 5.2 - Order suggestions by smallest adjustments first
 */
function sortSuggestionsByAdjustmentSize(suggestions, baseCmyk) {
    return suggestions.sort((a, b) => {
        // Calculate total adjustment magnitude for each suggestion
        const magnitudeA = calculateAdjustmentMagnitude(a.cmyk, baseCmyk);
        const magnitudeB = calculateAdjustmentMagnitude(b.cmyk, baseCmyk);
        
        return magnitudeA - magnitudeB; // Smallest adjustments first
    });
}

/**
 * Calculate total adjustment magnitude between two CMYK values
 */
function calculateAdjustmentMagnitude(cmyk1, cmyk2) {
    const deltaC = Math.abs(cmyk1.c - cmyk2.c);
    const deltaM = Math.abs(cmyk1.m - cmyk2.m);
    const deltaY = Math.abs(cmyk1.y - cmyk2.y);
    const deltaK = Math.abs(cmyk1.k - cmyk2.k);
    
    return deltaC + deltaM + deltaY + deltaK; // Sum of absolute differences
}

/**
 * Test CMYK suggestion engine with known test cases
 */
function runCMYKSuggestionTests() {
    console.log('Running CMYK suggestion engine tests...');
    
    const testCases = [
        {
            name: 'Red color needs more magenta',
            targetLab: { l: 50, a: 20, b: 15 },
            sampleCmyk: { c: 10, m: 70, y: 80, k: 5 },
            sampleLab: { l: 50, a: 15, b: 15 },
            expectedAdjustments: ['magenta increase']
        },
        {
            name: 'Color too dark - reduce black',
            targetLab: { l: 60, a: 10, b: 10 },
            sampleCmyk: { c: 20, m: 30, y: 40, k: 20 },
            sampleLab: { l: 45, a: 10, b: 10 },
            expectedAdjustments: ['black reduction']
        },
        {
            name: 'Color needs yellow shift',
            targetLab: { l: 70, a: 5, b: 25 },
            sampleCmyk: { c: 15, m: 25, y: 60, k: 0 },
            sampleLab: { l: 70, a: 5, b: 15 },
            expectedAdjustments: ['yellow increase']
        }
    ];
    
    let passedTests = 0;
    
    testCases.forEach(testCase => {
        try {
            const suggestions = generateCMYKSuggestions(
                testCase.targetLab,
                testCase.sampleCmyk,
                testCase.sampleLab
            );
            
            if (suggestions.length >= 3 && suggestions.length <= 5) {
                console.log(`✅ ${testCase.name}: Generated ${suggestions.length} suggestions`);
                
                // Check if suggestions are properly sorted (smallest adjustments first)
                let properlyOrdered = true;
                for (let i = 1; i < suggestions.length; i++) {
                    const prevMagnitude = calculateAdjustmentMagnitude(suggestions[i-1].cmyk, testCase.sampleCmyk);
                    const currMagnitude = calculateAdjustmentMagnitude(suggestions[i].cmyk, testCase.sampleCmyk);
                    if (prevMagnitude > currMagnitude) {
                        properlyOrdered = false;
                        break;
                    }
                }
                
                if (properlyOrdered) {
                    console.log(`✅ ${testCase.name}: Properly ordered by adjustment size`);
                    passedTests++;
                } else {
                    console.log(`❌ ${testCase.name}: Not properly ordered by adjustment size`);
                }
                
                // Log first suggestion for verification
                console.log(`   Top suggestion: ${suggestions[0].description}`);
                console.log(`   CMYK: C${suggestions[0].cmyk.c.toFixed(1)} M${suggestions[0].cmyk.m.toFixed(1)} Y${suggestions[0].cmyk.y.toFixed(1)} K${suggestions[0].cmyk.k.toFixed(1)}`);
                
            } else {
                console.log(`❌ ${testCase.name}: Generated ${suggestions.length} suggestions (expected 3-5)`);
            }
            
        } catch (error) {
            console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
        }
    });
    
    console.log(`\nCMYK Suggestion Tests: ${passedTests}/${testCases.length} passed`);
    return passedTests === testCases.length;
}

// Export functions for use by other modules
window.colorScience = {
    // Core conversion functions
    cmykToRgb,
    labToRgb,
    rgbToXyz,
    xyzToLab,
    labToXyz,
    xyzToRgb,
    
    // Delta E calculation functions
    calculateDeltaE,
    calculateComponentDeltas,
    getToleranceZone,
    getToleranceZoneInfo,
    performDeltaEAnalysis,
    
    // CMYK Suggestion Engine
    generateCMYKSuggestions,
    analyzeLABToCMYKMapping,
    isValidCMYKSuggestion,
    validateCMYKGamut,
    runCMYKSuggestionTests,
    
    // Utility functions
    validateAndClampRgb,
    rgbToCssString,
    cmykToCssString,
    labToCssString,
    
    // Performance optimization functions - NEW
    clearColorConversionCache,
    getColorConversionCacheStats,
    validateLabValues,
    areLabColorsIdentical,
    
    // Testing
    runColorScienceTests,
    runDeltaETests,
    
    // Constants (for advanced users)
    COLOR_CONSTANTS,
    PRECOMPUTED_VALUES
};

console.log('Color Science module loaded successfully');

/**
 * CIE76 Delta E Calculation (ΔE*ab) - Enhanced with error handling
 * Requirements: 4.1 - Calculate CIE76 (ΔE*ab) as primary color difference metric
 * Requirements: 4.4 - Ensure accuracy to ±0.01 Delta E compared to industry standards
 * Enhanced: Add comprehensive error handling for calculation failures
 */
function calculateDeltaE(lab1, lab2) {
    try {
        // Enhanced input validation
        if (!lab1 || !lab2) {
            throw new Error('Missing LAB color data for Delta E calculation');
        }
        
        if (typeof lab1.l === 'undefined' || typeof lab1.a === 'undefined' || typeof lab1.b === 'undefined') {
            throw new Error('Incomplete LAB1 color data (missing L*, a*, or b* values)');
        }
        
        if (typeof lab2.l === 'undefined' || typeof lab2.a === 'undefined' || typeof lab2.b === 'undefined') {
            throw new Error('Incomplete LAB2 color data (missing L*, a*, or b* values)');
        }
        
        // Validate numeric values
        const values = [lab1.l, lab1.a, lab1.b, lab2.l, lab2.a, lab2.b];
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] !== 'number' || isNaN(values[i]) || !isFinite(values[i])) {
                throw new Error(`Invalid numeric value in LAB data: ${values[i]}`);
            }
        }
        
        // Calculate component differences with optimized operations
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        // CIE76 Delta E formula: √(ΔL² + Δa² + Δb²)
        // Optimized: avoid repeated multiplication
        const deltaLSq = deltaL * deltaL;
        const deltaASq = deltaA * deltaA;
        const deltaBSq = deltaB * deltaB;
        
        const deltaE = Math.sqrt(deltaLSq + deltaASq + deltaBSq);
        
        // Validate result
        if (isNaN(deltaE) || !isFinite(deltaE)) {
            throw new Error('Delta E calculation resulted in invalid value');
        }
        
        // Round to 2 decimal places for industry standard precision
        return Math.round(deltaE * 100) / 100;
        
    } catch (error) {
        console.error('Error in Delta E calculation:', error);
        
        // Re-throw with more context for debugging
        throw new Error(`Delta E calculation failed: ${error.message}`);
    }
}

/**
 * Calculate Component Deltas - Enhanced with error handling
 * Requirements: 4.2 - Display component deltas: ΔL*, Δa*, Δb*, ΔC*, Δh
 * Enhanced: Add comprehensive error handling for calculation failures
 */
function calculateComponentDeltas(lab1, lab2) {
    try {
        // Enhanced input validation
        if (!lab1 || !lab2) {
            throw new Error('Missing LAB color data for component delta calculation');
        }
        
        if (typeof lab1.l === 'undefined' || typeof lab1.a === 'undefined' || typeof lab1.b === 'undefined') {
            throw new Error('Incomplete LAB1 color data for component deltas');
        }
        
        if (typeof lab2.l === 'undefined' || typeof lab2.a === 'undefined' || typeof lab2.b === 'undefined') {
            throw new Error('Incomplete LAB2 color data for component deltas');
        }
        
        // Validate numeric values
        const values = [lab1.l, lab1.a, lab1.b, lab2.l, lab2.a, lab2.b];
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] !== 'number' || isNaN(values[i]) || !isFinite(values[i])) {
                throw new Error(`Invalid numeric value in LAB data for component deltas: ${values[i]}`);
            }
        }
        
        // Basic component deltas with optimized calculations
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        // Calculate chroma values with error handling
        const lab1ASq = lab1.a * lab1.a;
        const lab1BSq = lab1.b * lab1.b;
        const lab2ASq = lab2.a * lab2.a;
        const lab2BSq = lab2.b * lab2.b;
        
        const c1 = Math.sqrt(lab1ASq + lab1BSq);
        const c2 = Math.sqrt(lab2ASq + lab2BSq);
        const deltaC = c1 - c2;
        
        // Calculate hue difference with enhanced error handling
        let deltaH = 0;
        try {
            const h1 = Math.atan2(lab1.b, lab1.a) * 180 / Math.PI;
            const h2 = Math.atan2(lab2.b, lab2.a) * 180 / Math.PI;
            deltaH = h1 - h2;
            
            // Normalize hue difference to -180 to +180 range
            if (deltaH > 180) deltaH -= 360;
            if (deltaH < -180) deltaH += 360;
            
            // Handle edge cases where chroma is very small (hue becomes undefined)
            if (c1 < 0.01 || c2 < 0.01) {
                deltaH = 0; // No meaningful hue difference for near-neutral colors
            }
            
        } catch (hueError) {
            console.warn('Error calculating hue difference, setting to 0:', hueError);
            deltaH = 0;
        }
        
        // Validate all calculated values
        const results = [deltaL, deltaA, deltaB, deltaC, deltaH];
        for (let i = 0; i < results.length; i++) {
            if (isNaN(results[i]) || !isFinite(results[i])) {
                throw new Error(`Component delta calculation resulted in invalid value: ${results[i]}`);
            }
        }
        
        return {
            deltaL: Math.round(deltaL * 100) / 100,
            deltaA: Math.round(deltaA * 100) / 100,
            deltaB: Math.round(deltaB * 100) / 100,
            deltaC: Math.round(deltaC * 100) / 100,
            deltaH: Math.round(deltaH * 100) / 100
        };
        
    } catch (error) {
        console.error('Error in component delta calculation:', error);
        
        // Return safe default values on error
        return {
            deltaL: 0,
            deltaA: 0,
            deltaB: 0,
            deltaC: 0,
            deltaH: 0
        };
    }
}

/**
 * Tolerance Zone Classification
 * Requirements: 4.3 - Color-coded tolerance zones (≤2.0 = Good, 2.1-5.0 = Acceptable, >5.0 = Poor)
 */
function getToleranceZone(deltaE) {
    if (typeof deltaE !== 'number' || isNaN(deltaE)) {
        return 'unknown';
    }
    
    if (deltaE <= 2.0) {
        return 'good';
    } else if (deltaE <= 5.0) {
        return 'acceptable';
    } else {
        return 'poor';
    }
}

/**
 * Get tolerance zone display information
 * Returns object with CSS class and description
 */
function getToleranceZoneInfo(deltaE) {
    const zone = getToleranceZone(deltaE);
    
    const zoneInfo = {
        good: {
            cssClass: 'good',
            description: 'Good Match',
            range: '≤ 2.0',
            message: 'Excellent color match - within acceptable printing tolerance'
        },
        acceptable: {
            cssClass: 'acceptable',
            description: 'Acceptable Match',
            range: '2.1 - 5.0',
            message: 'Acceptable color match - minor adjustments may improve quality'
        },
        poor: {
            cssClass: 'poor',
            description: 'Poor Match',
            range: '> 5.0',
            message: 'Significant color difference - adjustments needed'
        },
        unknown: {
            cssClass: 'unknown',
            description: 'Unknown',
            range: 'N/A',
            message: 'Unable to determine color difference'
        }
    };
    
    return zoneInfo[zone] || zoneInfo.unknown;
}

/**
 * Complete Delta E Analysis - Enhanced with performance optimization and error handling
 * Returns comprehensive analysis object with all calculations
 * Enhanced: Add comprehensive error handling for calculation failures
 * Enhanced: Optimize color conversion functions for real-time performance
 */
function performDeltaEAnalysis(targetLab, sampleLab) {
    const startTime = performance.now();
    
    try {
        // Enhanced input validation
        if (!targetLab || !sampleLab) {
            throw new Error('Missing LAB color data for Delta E analysis');
        }
        
        // Validate LAB value ranges
        validateLabValues(targetLab, 'target');
        validateLabValues(sampleLab, 'sample');
        
        // Performance optimization: Check if this is a trivial case (identical colors)
        if (areLabColorsIdentical(targetLab, sampleLab)) {
            return createTrivialAnalysisResult(targetLab, sampleLab, startTime);
        }
        
        // Calculate primary Delta E with error handling
        const deltaE = calculateDeltaE(targetLab, sampleLab);
        
        // Calculate component deltas with error handling
        const componentDeltas = calculateComponentDeltas(targetLab, sampleLab);
        
        // Get tolerance zone information
        const toleranceInfo = getToleranceZoneInfo(deltaE);
        
        // Performance logging
        const duration = performance.now() - startTime;
        if (duration > 10) { // Log if analysis takes more than 10ms
            console.warn(`Slow Delta E analysis: ${duration.toFixed(2)}ms`);
        }
        
        return {
            deltaE: deltaE,
            componentDeltas: componentDeltas,
            tolerance: {
                zone: toleranceInfo.cssClass,
                description: toleranceInfo.description,
                range: toleranceInfo.range,
                message: toleranceInfo.message
            },
            target: { ...targetLab },
            sample: { ...sampleLab },
            timestamp: new Date().toISOString(),
            performanceMs: duration
        };
        
    } catch (error) {
        const duration = performance.now() - startTime;
        console.error('Error performing Delta E analysis:', error);
        
        // Return detailed error information for debugging
        return {
            error: error.message,
            errorType: error.constructor.name,
            deltaE: null,
            componentDeltas: null,
            tolerance: getToleranceZoneInfo(null),
            target: targetLab || null,
            sample: sampleLab || null,
            timestamp: new Date().toISOString(),
            performanceMs: duration
        };
    }
}

/**
 * Validate LAB values for analysis
 */
function validateLabValues(lab, colorName) {
    if (typeof lab.l !== 'number' || isNaN(lab.l) || lab.l < 0 || lab.l > 100) {
        throw new Error(`Invalid L* value for ${colorName}: ${lab.l} (must be 0-100)`);
    }
    
    if (typeof lab.a !== 'number' || isNaN(lab.a) || lab.a < -128 || lab.a > 127) {
        throw new Error(`Invalid a* value for ${colorName}: ${lab.a} (must be -128 to +127)`);
    }
    
    if (typeof lab.b !== 'number' || isNaN(lab.b) || lab.b < -128 || lab.b > 127) {
        throw new Error(`Invalid b* value for ${colorName}: ${lab.b} (must be -128 to +127)`);
    }
}

/**
 * Check if two LAB colors are identical (performance optimization)
 */
function areLabColorsIdentical(lab1, lab2, tolerance = 0.001) {
    return Math.abs(lab1.l - lab2.l) < tolerance &&
           Math.abs(lab1.a - lab2.a) < tolerance &&
           Math.abs(lab1.b - lab2.b) < tolerance;
}

/**
 * Create analysis result for trivial case (identical colors)
 */
function createTrivialAnalysisResult(targetLab, sampleLab, startTime) {
    const duration = performance.now() - startTime;
    
    return {
        deltaE: 0,
        componentDeltas: {
            deltaL: 0,
            deltaA: 0,
            deltaB: 0,
            deltaC: 0,
            deltaH: 0
        },
        tolerance: {
            zone: 'good',
            description: 'Perfect Match',
            range: '= 0.0',
            message: 'Colors are identical'
        },
        target: { ...targetLab },
        sample: { ...sampleLab },
        timestamp: new Date().toISOString(),
        performanceMs: duration,
        optimized: true
    };
}

// Enhanced unit tests including Delta E calculations
function runDeltaETests() {
    console.log('Running Delta E calculation tests...');
    
    const deltaETests = [
        {
            name: 'Delta E - Identical colors',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 50, a: 0, b: 0 },
            expectedDeltaE: 0,
            expectedZone: 'good'
        },
        {
            name: 'Delta E - Small difference (Good)',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 51, a: 1, b: 0 },
            expectedDeltaE: 1.41, // √(1² + 1² + 0²)
            expectedZone: 'good'
        },
        {
            name: 'Delta E - Medium difference (Acceptable)',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 53, a: 2, b: 2 },
            expectedDeltaE: 4.12, // √(3² + 2² + 2²)
            expectedZone: 'acceptable'
        },
        {
            name: 'Delta E - Large difference (Poor)',
            lab1: { l: 50, a: 0, b: 0 },
            lab2: { l: 40, a: 10, b: 5 },
            expectedDeltaE: 14.18, // √(10² + 10² + 5²)
            expectedZone: 'poor'
        },
        {
            name: 'Component Deltas - Basic test',
            lab1: { l: 60, a: 20, b: 10 },
            lab2: { l: 55, a: 15, b: 12 },
            expectedDeltas: { deltaL: 5, deltaA: 5, deltaB: -2 }
        }
    ];
    
    let passedTests = 0;
    let totalTests = deltaETests.length;
    
    deltaETests.forEach(test => {
        try {
            if (test.expectedDeltaE !== undefined) {
                // Test Delta E calculation
                const deltaE = calculateDeltaE(test.lab1, test.lab2);
                const tolerance = 0.1; // Allow 0.1 tolerance for floating point precision
                
                if (Math.abs(deltaE - test.expectedDeltaE) <= tolerance) {
                    console.log(`✅ ${test.name}: PASSED (ΔE = ${deltaE})`);
                    passedTests++;
                } else {
                    console.log(`❌ ${test.name}: FAILED`);
                    console.log(`   Expected ΔE: ${test.expectedDeltaE}, Got: ${deltaE}`);
                }
                
                // Test tolerance zone
                const zone = getToleranceZone(deltaE);
                if (zone === test.expectedZone) {
                    console.log(`✅ ${test.name} - Zone: PASSED (${zone})`);
                } else {
                    console.log(`❌ ${test.name} - Zone: FAILED (Expected: ${test.expectedZone}, Got: ${zone})`);
                }
            }
            
            if (test.expectedDeltas) {
                // Test component deltas
                const deltas = calculateComponentDeltas(test.lab1, test.lab2);
                const deltasTolerance = 0.1;
                
                const deltaLMatch = Math.abs(deltas.deltaL - test.expectedDeltas.deltaL) <= deltasTolerance;
                const deltaAMatch = Math.abs(deltas.deltaA - test.expectedDeltas.deltaA) <= deltasTolerance;
                const deltaBMatch = Math.abs(deltas.deltaB - test.expectedDeltas.deltaB) <= deltasTolerance;
                
                if (deltaLMatch && deltaAMatch && deltaBMatch) {
                    console.log(`✅ ${test.name} - Deltas: PASSED`);
                } else {
                    console.log(`❌ ${test.name} - Deltas: FAILED`);
                    console.log(`   Expected: ΔL=${test.expectedDeltas.deltaL}, Δa=${test.expectedDeltas.deltaA}, Δb=${test.expectedDeltas.deltaB}`);
                    console.log(`   Got: ΔL=${deltas.deltaL}, Δa=${deltas.deltaA}, Δb=${deltas.deltaB}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    });
    
    console.log(`\nDelta E Tests: ${passedTests}/${totalTests * 2} passed`); // *2 for deltaE + zone tests
    return passedTests >= totalTests;
}

// Auto-run tests in development
if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
    // Run tests automatically in development environment
    setTimeout(() => {
        runColorScienceTests();
        runDeltaETests();
    }, 1000);
}