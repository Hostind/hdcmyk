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
    const fx = xn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(xn, 1 / 3) : (COLOR_CONSTANTS.LAB_KAPPA * xn + 16) / 116;
    const fy = yn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(yn, 1 / 3) : (COLOR_CONSTANTS.LAB_KAPPA * yn + 16) / 116;
    const fz = zn > COLOR_CONSTANTS.LAB_EPSILON ? Math.pow(zn, 1 / 3) : (COLOR_CONSTANTS.LAB_KAPPA * zn + 16) / 116;

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
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

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
                    const prevMagnitude = calculateAdjustmentMagnitude(suggestions[i - 1].cmyk, testCase.sampleCmyk);
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
    cmykToLab,
    labToRgb,
    rgbToXyz,
    xyzToLab,
    labToXyz,
    xyzToRgb,

    // Delta E calculation functions
    calculateDeltaE,
    calculateDeltaE2000,
    calculateComponentDeltas,
    getToleranceZone,
    getToleranceZoneInfo,
    performDeltaEAnalysis,
    applyPaperWhiteCompensation,

    // CMYK Suggestion Engine
    generateCMYKSuggestions,
    analyzeLABToCMYKMapping,
    isValidCMYKSuggestion,
    validateCMYKGamut,
    runCMYKSuggestionTests,
    optimizeCMYKForTarget,

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

    if (deltaE <= 0.5) {
        return 'excellent';  // Premium gold accent category
    } else if (deltaE <= 2.0) {
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
        excellent: {
            cssClass: 'excellent',
            description: 'Exceptional Match',
            range: '≤ 0.5',
            message: 'Outstanding color precision - premium quality match with gold standard accuracy'
        },
        good: {
            cssClass: 'good',
            description: 'Good Match',
            range: '0.6 - 2.0',
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

        // Also calculate ΔE2000 for more accurate results
        const deltaE2000 = calculateDeltaE2000(targetLab, sampleLab);

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
            deltaE2000: deltaE2000,
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
/**
 * 
G7 Calibration Functions
 * G7 is a method for calibrating printing presses to achieve consistent and predictable color reproduction
 * Focuses on creating a neutral print density curve (NPDC) for gray balance across different printing systems
 * 
 * Integration with existing LAB Color Matching Calculator following established methodologies
 */

/**
 * G7 Gray Balance Calculation
 * Determines if CMYK values produce neutral gray according to G7 standards
 * Requirements: Industry-standard color conversion methods with G7 compliance
 */
function calculateG7GrayBalance(c, m, y, k) {
    try {
        // G7 neutral gray targets for different paper types and gray levels
        const g7Targets = {
            // Coated paper targets (ISO Coated v2 profile)
            coated: {
                25: { c: 19, m: 16, y: 16, tolerance: 2 },
                50: { c: 40, m: 31, y: 31, tolerance: 3 },
                75: { c: 65, m: 53, y: 53, tolerance: 4 }
            },
            // Uncoated paper targets (similar to GRACoL)
            uncoated: {
                25: { c: 16, m: 13, y: 13, tolerance: 2 },
                50: { c: 35, m: 26, y: 26, tolerance: 3 },
                75: { c: 58, m: 45, y: 45, tolerance: 4 }
            },
            // Newsprint targets
            newsprint: {
                25: { c: 14, m: 11, y: 11, tolerance: 3 },
                50: { c: 32, m: 24, y: 24, tolerance: 4 },
                75: { c: 55, m: 42, y: 42, tolerance: 5 }
            }
        };

        // Determine closest gray level based on K value
        let grayLevel;
        if (k <= 37.5) grayLevel = 25;
        else if (k <= 62.5) grayLevel = 50;
        else grayLevel = 75;

        // Default to coated paper (could be made configurable)
        const paperType = 'coated';
        const target = g7Targets[paperType][grayLevel];

        // Calculate deviations from G7 target
        const cDeviation = c - target.c;
        const mDeviation = m - target.m;
        const yDeviation = y - target.y;

        // Calculate total absolute deviation
        const totalDeviation = Math.abs(cDeviation) + Math.abs(mDeviation) + Math.abs(yDeviation);

        // Determine compliance based on tolerance
        const isCompliant = totalDeviation <= target.tolerance * 3; // Total tolerance across all channels

        return {
            isG7Compliant: isCompliant,
            grayLevel: grayLevel,
            paperType: paperType,
            target: target,
            deviations: {
                c: Math.round(cDeviation * 100) / 100,
                m: Math.round(mDeviation * 100) / 100,
                y: Math.round(yDeviation * 100) / 100
            },
            totalDeviation: Math.round(totalDeviation * 100) / 100,
            complianceLevel: getG7ComplianceLevel(totalDeviation, target.tolerance * 3),
            recommendations: generateG7Recommendations(c, m, y, k, target)
        };

    } catch (error) {
        console.error('Error calculating G7 gray balance:', error);
        return {
            error: error.message,
            isG7Compliant: false,
            recommendations: []
        };
    }
}

/**
 * Determine G7 compliance level
 */
function getG7ComplianceLevel(totalDeviation, maxTolerance) {
    const ratio = totalDeviation / maxTolerance;

    if (ratio <= 0.5) return 'excellent';
    if (ratio <= 1.0) return 'good';
    if (ratio <= 1.5) return 'acceptable';
    return 'poor';
}

/**
 * Generate G7 Compliance Recommendations
 * Provides specific adjustment guidance for achieving G7 gray balance
 */
function generateG7Recommendations(c, m, y, k, target) {
    const recommendations = [];

    const cDiff = c - target.c;
    const mDiff = m - target.m;
    const yDiff = y - target.y;

    // Generate recommendations for each channel that's out of tolerance
    if (Math.abs(cDiff) > target.tolerance) {
        recommendations.push({
            channel: 'Cyan',
            current: Math.round(c * 10) / 10,
            target: target.c,
            deviation: Math.round(cDiff * 10) / 10,
            adjustment: cDiff > 0 ?
                `Reduce cyan by ${Math.abs(cDiff).toFixed(1)}%` :
                `Increase cyan by ${Math.abs(cDiff).toFixed(1)}%`,
            priority: Math.abs(cDiff) > target.tolerance * 1.5 ? 'high' : 'medium'
        });
    }

    if (Math.abs(mDiff) > target.tolerance) {
        recommendations.push({
            channel: 'Magenta',
            current: Math.round(m * 10) / 10,
            target: target.m,
            deviation: Math.round(mDiff * 10) / 10,
            adjustment: mDiff > 0 ?
                `Reduce magenta by ${Math.abs(mDiff).toFixed(1)}%` :
                `Increase magenta by ${Math.abs(mDiff).toFixed(1)}%`,
            priority: Math.abs(mDiff) > target.tolerance * 1.5 ? 'high' : 'medium'
        });
    }

    if (Math.abs(yDiff) > target.tolerance) {
        recommendations.push({
            channel: 'Yellow',
            current: Math.round(y * 10) / 10,
            target: target.y,
            deviation: Math.round(yDiff * 10) / 10,
            adjustment: yDiff > 0 ?
                `Reduce yellow by ${Math.abs(yDiff).toFixed(1)}%` :
                `Increase yellow by ${Math.abs(yDiff).toFixed(1)}%`,
            priority: Math.abs(yDiff) > target.tolerance * 1.5 ? 'high' : 'medium'
        });
    }

    // If all channels are within tolerance
    if (recommendations.length === 0) {
        recommendations.push({
            channel: 'All',
            message: `CMYK values are within G7 compliance tolerance for ${target.grayLevel || 'current'} gray level`,
            priority: 'info'
        });
    }

    // Sort by priority (high first)
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1, info: 0 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

/**
 * Calculate Neutral Print Density Curve (NPDC)
 * Core G7 calculation for achieving neutral gray balance across tone scale
 */
function calculateNPDC(cmykSeries) {
    try {
        // Validate input - should be array of CMYK objects representing tone scale
        if (!Array.isArray(cmykSeries) || cmykSeries.length < 3) {
            throw new Error('NPDC calculation requires at least 3 CMYK tone values');
        }

        // Calculate density values for each tone
        const densityData = cmykSeries.map((cmyk, index) => {
            // Convert CMYK to approximate density
            const totalInk = cmyk.c + cmyk.m + cmyk.y + cmyk.k;
            const density = totalInk / 400; // Normalize to 0-1 range

            // Calculate expected neutral density for this position in tone scale
            const expectedDensity = index / (cmykSeries.length - 1);
            const deviation = Math.abs(density - expectedDensity);

            return {
                position: index,
                cmyk: cmyk,
                actualDensity: Math.round(density * 1000) / 1000,
                expectedDensity: Math.round(expectedDensity * 1000) / 1000,
                deviation: Math.round(deviation * 1000) / 1000
            };
        });

        // Calculate overall curve quality metrics
        const totalDeviation = densityData.reduce((sum, point) => sum + point.deviation, 0);
        const averageDeviation = totalDeviation / densityData.length;
        const maxDeviation = Math.max(...densityData.map(point => point.deviation));

        // Determine curve quality
        const curveQuality = getCurveQuality(averageDeviation, maxDeviation);

        return {
            densityData: densityData,
            metrics: {
                totalDeviation: Math.round(totalDeviation * 1000) / 1000,
                averageDeviation: Math.round(averageDeviation * 1000) / 1000,
                maxDeviation: Math.round(maxDeviation * 1000) / 1000
            },
            quality: curveQuality,
            isWithinTolerance: averageDeviation <= 0.05 && maxDeviation <= 0.1,
            recommendations: generateNPDCRecommendations(densityData, averageDeviation)
        };

    } catch (error) {
        console.error('Error calculating NPDC:', error);
        return {
            error: error.message,
            isWithinTolerance: false,
            recommendations: []
        };
    }
}

/**
 * Determine curve quality based on deviation metrics
 */
function getCurveQuality(averageDeviation, maxDeviation) {
    if (averageDeviation <= 0.02 && maxDeviation <= 0.05) return 'excellent';
    if (averageDeviation <= 0.05 && maxDeviation <= 0.1) return 'good';
    if (averageDeviation <= 0.1 && maxDeviation <= 0.2) return 'acceptable';
    return 'poor';
}

/**
 * Generate NPDC improvement recommendations
 */
function generateNPDCRecommendations(densityData, averageDeviation) {
    const recommendations = [];

    // Find points with highest deviations
    const problematicPoints = densityData
        .filter(point => point.deviation > 0.05)
        .sort((a, b) => b.deviation - a.deviation);

    if (problematicPoints.length === 0) {
        recommendations.push({
            type: 'success',
            message: 'NPDC is within acceptable tolerance',
            priority: 'info'
        });
    } else {
        problematicPoints.slice(0, 3).forEach(point => { // Top 3 issues
            const adjustment = point.actualDensity > point.expectedDensity ? 'reduce' : 'increase';
            const inkAdjustment = adjustment === 'reduce' ? 'Reduce total ink coverage' : 'Increase total ink coverage';

            recommendations.push({
                type: 'adjustment',
                position: point.position,
                message: `${inkAdjustment} at ${Math.round(point.position * 25)}% gray level`,
                currentDensity: point.actualDensity,
                targetDensity: point.expectedDensity,
                deviation: point.deviation,
                priority: point.deviation > 0.1 ? 'high' : 'medium'
            });
        });
    }

    // Overall curve recommendations
    if (averageDeviation > 0.1) {
        recommendations.push({
            type: 'calibration',
            message: 'Consider full press calibration - multiple tone values need adjustment',
            priority: 'high'
        });
    }

    return recommendations;
}

/**
 * Enhanced CMYK Suggestion Engine with G7 Compliance
 * Integrates G7 gray balance considerations into existing suggestion system
 * Maintains compatibility with existing generateCMYKSuggestions function
 */
function generateCMYKSuggestionsWithG7(targetLab, sampleCmyk, sampleLab, options = {}) {
    try {
        const { includeG7 = true, paperType = 'coated', prioritizeG7 = false } = options;

        // Generate basic Delta E-based suggestions using existing function
        const basicSuggestions = generateCMYKSuggestions(targetLab, sampleCmyk, sampleLab);

        let allSuggestions = [...basicSuggestions.map(s => ({ ...s, type: 'deltaE', priority: 'medium' }))];

        if (includeG7) {
            // Analyze G7 compliance of sample color
            const g7Analysis = calculateG7GrayBalance(sampleCmyk.c, sampleCmyk.m, sampleCmyk.y, sampleCmyk.k);

            if (!g7Analysis.isG7Compliant && g7Analysis.recommendations) {
                // Generate G7-specific suggestions
                g7Analysis.recommendations.forEach(rec => {
                    if (rec.channel !== 'All' && rec.adjustment) {
                        const adjustedCmyk = { ...sampleCmyk };

                        // Apply G7 target adjustments
                        switch (rec.channel) {
                            case 'Cyan':
                                adjustedCmyk.c = rec.target;
                                break;
                            case 'Magenta':
                                adjustedCmyk.m = rec.target;
                                break;
                            case 'Yellow':
                                adjustedCmyk.y = rec.target;
                                break;
                        }

                        // Validate the adjusted CMYK is within gamut
                        const validatedSuggestion = validateCMYKGamut({
                            cmyk: adjustedCmyk,
                            description: `G7 Compliance: ${rec.adjustment}`,
                            type: 'g7',
                            priority: prioritizeG7 ? 'high' : rec.priority,
                            g7Analysis: {
                                grayLevel: g7Analysis.grayLevel,
                                complianceLevel: g7Analysis.complianceLevel,
                                deviation: rec.deviation
                            }
                        });

                        allSuggestions.push(validatedSuggestion);
                    }
                });
            }
        }

        // Remove duplicates and sort by priority and adjustment magnitude
        const uniqueSuggestions = removeDuplicateSuggestions(allSuggestions);
        const sortedSuggestions = sortSuggestionsByPriorityAndSize(uniqueSuggestions, sampleCmyk, prioritizeG7);

        // Return top 5 suggestions with G7 analysis included
        const finalSuggestions = sortedSuggestions.slice(0, 5);

        return {
            suggestions: finalSuggestions,
            g7Analysis: includeG7 ? calculateG7GrayBalance(sampleCmyk.c, sampleCmyk.m, sampleCmyk.y, sampleCmyk.k) : null,
            metadata: {
                totalSuggestions: allSuggestions.length,
                g7Suggestions: allSuggestions.filter(s => s.type === 'g7').length,
                deltaESuggestions: allSuggestions.filter(s => s.type === 'deltaE').length
            }
        };

    } catch (error) {
        console.error('Error generating CMYK suggestions with G7:', error);
        return {
            suggestions: [],
            g7Analysis: null,
            error: error.message
        };
    }
}

/**
 * Sort suggestions by priority and adjustment size
 * G7 suggestions can be prioritized when specified
 */
function sortSuggestionsByPriorityAndSize(suggestions, baseCmyk, prioritizeG7 = false) {
    return suggestions.sort((a, b) => {
        // Priority order
        const priorityOrder = { high: 4, medium: 3, low: 2, info: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;

        // Type priority (G7 first if prioritized)
        const typeOrder = prioritizeG7 ? { g7: 2, deltaE: 1 } : { deltaE: 2, g7: 1 };
        const aType = typeOrder[a.type] || 0;
        const bType = typeOrder[b.type] || 0;

        // First sort by priority
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }

        // Then by type preference
        if (aType !== bType) {
            return bType - aType;
        }

        // Finally by adjustment magnitude (smaller first)
        const magnitudeA = calculateAdjustmentMagnitude(a.cmyk, baseCmyk);
        const magnitudeB = calculateAdjustmentMagnitude(b.cmyk, baseCmyk);
        return magnitudeA - magnitudeB;
    });
}

/**
 * G7 Testing Suite
 * Comprehensive tests for G7 functionality
 */
function runG7Tests() {
    console.log('Running G7 calculation tests...');

    const g7Tests = [
        {
            name: 'G7 Compliant 25% Gray',
            cmyk: { c: 19, m: 16, y: 16, k: 25 },
            expectedCompliant: true,
            expectedLevel: 25
        },
        {
            name: 'G7 Compliant 50% Gray',
            cmyk: { c: 40, m: 31, y: 31, k: 50 },
            expectedCompliant: true,
            expectedLevel: 50
        },
        {
            name: 'G7 Non-Compliant - Too much cyan',
            cmyk: { c: 25, m: 16, y: 16, k: 25 },
            expectedCompliant: false,
            expectedLevel: 25
        },
        {
            name: 'G7 Non-Compliant - Unbalanced CMY',
            cmyk: { c: 40, m: 35, y: 25, k: 50 },
            expectedCompliant: false,
            expectedLevel: 50
        }
    ];

    let passedTests = 0;

    g7Tests.forEach(test => {
        try {
            const result = calculateG7GrayBalance(test.cmyk.c, test.cmyk.m, test.cmyk.y, test.cmyk.k);

            const complianceMatch = result.isG7Compliant === test.expectedCompliant;
            const levelMatch = result.grayLevel === test.expectedLevel;

            if (complianceMatch && levelMatch) {
                console.log(`✅ ${test.name}: PASSED`);
                console.log(`   Compliance: ${result.isG7Compliant}, Level: ${result.grayLevel}, Deviation: ${result.totalDeviation}`);
                passedTests++;
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Expected compliance: ${test.expectedCompliant}, Got: ${result.isG7Compliant}`);
                console.log(`   Expected level: ${test.expectedLevel}, Got: ${result.grayLevel}`);
            }

            // Log recommendations for non-compliant colors
            if (!result.isG7Compliant && result.recommendations.length > 0) {
                console.log(`   Recommendations: ${result.recommendations.length} adjustments needed`);
            }

        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    });

    console.log(`\nG7 Tests: ${passedTests}/${g7Tests.length} passed`);
    return passedTests === g7Tests.length;
}

/**
 * Test NPDC calculation with sample tone scale
 */
function runNPDCTests() {
    console.log('Running NPDC calculation tests...');

    // Sample tone scale data (5-point scale)
    const testToneScale = [
        { c: 0, m: 0, y: 0, k: 0 },     // 0% (paper white)
        { c: 19, m: 16, y: 16, k: 25 }, // 25% gray
        { c: 40, m: 31, y: 31, k: 50 }, // 50% gray
        { c: 65, m: 53, y: 53, k: 75 }, // 75% gray
        { c: 0, m: 0, y: 0, k: 100 }    // 100% (solid black)
    ];

    try {
        const result = calculateNPDC(testToneScale);

        if (result.error) {
            console.log(`❌ NPDC Test: ERROR - ${result.error}`);
            return false;
        }

        console.log(`✅ NPDC Test: PASSED`);
        console.log(`   Quality: ${result.quality}`);
        console.log(`   Average Deviation: ${result.metrics.averageDeviation}`);
        console.log(`   Within Tolerance: ${result.isWithinTolerance}`);
        console.log(`   Recommendations: ${result.recommendations.length}`);

        return true;

    } catch (error) {
        console.log(`❌ NPDC Test: ERROR - ${error.message}`);
        return false;
    }
}

// Add G7 functions to the existing exports
if (window.colorScience) {
    // Extend existing colorScience object with G7 functions
    Object.assign(window.colorScience, {
        // G7 Calculation Functions
        calculateG7GrayBalance,
        generateG7Recommendations,
        calculateNPDC,
        generateCMYKSuggestionsWithG7,
        getG7ComplianceLevel,
        getCurveQuality,

        // G7 Testing Functions
        runG7Tests,
        runNPDCTests,

        // Enhanced suggestion function (maintains backward compatibility)
        generateEnhancedCMYKSuggestions: generateCMYKSuggestionsWithG7
    });
} else {
    console.error('colorScience object not found - G7 functions not exported');
}

console.log('G7 Color Science extensions loaded successfully');

/**
 * CMYK Optimization Algorithm (from ChatGPT code)
 * Finds optimal CMYK values to match target LAB color
 */
function optimizeCMYKForTarget(targetLab, initialCmyk = [50, 50, 50, 0], options = {}) {
    const {
        allowK = true,
        inkLimit = 320,
        step = 5,
        rangePct = 20,
        maxIterations = 100
    } = options;

    try {
        let best = initialCmyk.slice().map(v => Math.max(0, Math.min(100, v)));
        let bestLab = cmykToLab(best[0], best[1], best[2], best[3]);
        let bestDE = calculateDeltaE(targetLab, bestLab);

        // Multi-pass optimization with decreasing step sizes
        const passes = [
            { range: rangePct, step: step * 2 },
            { range: Math.max(6, Math.floor(rangePct / 2)), step: step },
            { range: Math.max(3, Math.floor(rangePct / 3)), step: Math.max(1, Math.floor(step / 2)) }
        ];

        passes.forEach(pass => {
            const [c0, m0, y0, k0] = best;

            for (let C = Math.max(0, c0 - pass.range); C <= Math.min(100, c0 + pass.range); C += pass.step) {
                for (let M = Math.max(0, m0 - pass.range); M <= Math.min(100, m0 + pass.range); M += pass.step) {
                    for (let Y = Math.max(0, y0 - pass.range); Y <= Math.min(100, y0 + pass.range); Y += pass.step) {
                        const kmin = allowK ? Math.max(0, k0 - pass.range) : k0;
                        const kmax = allowK ? Math.min(100, k0 + pass.range) : k0;

                        for (let K = kmin; K <= kmax; K += pass.step) {
                            if (C + M + Y + K > inkLimit) continue;

                            const lab = cmykToLab(C, M, Y, K);
                            const dE = calculateDeltaE(targetLab, lab);

                            if (dE < bestDE) {
                                bestDE = dE;
                                best = [C, M, Y, K];
                                bestLab = lab;
                            }
                        }
                    }
                }
            }
        });

        return {
            cmyk: best,
            lab: bestLab,
            deltaE: bestDE,
            totalInk: best.reduce((sum, val) => sum + val, 0)
        };

    } catch (error) {
        console.error('Error in CMYK optimization:', error);
        return {
            cmyk: initialCmyk,
            lab: cmykToLab(initialCmyk[0], initialCmyk[1], initialCmyk[2], initialCmyk[3]),
            deltaE: 999,
            totalInk: initialCmyk.reduce((sum, val) => sum + val, 0)
        };
    }
}

/**
 * Enhanced CMYK to LAB Conversion
 * More accurate conversion using improved color model
 */
function cmykToLab(c, m, y, k) {
    try {
        // First convert CMYK to RGB using the existing function
        const rgb = cmykToRgb(c, m, y, k);

        // Then convert RGB to XYZ
        const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);

        // Finally convert XYZ to LAB
        const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

        return lab;
    } catch (error) {
        console.error('Error in CMYK to LAB conversion:', error);
        return { l: 50, a: 0, b: 0 }; // Return neutral gray as fallback
    }
}

/**
 * Enhanced CMYK to LAB Conversion
 * More accurate conversion using improved color model
 */
function cmykToLab(c, m, y, k) {
    try {
        // First convert CMYK to RGB using the existing function
        const rgb = cmykToRgb(c, m, y, k);

        // Then convert RGB to XYZ
        const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);

        // Finally convert XYZ to LAB
        const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

        return lab;
    } catch (error) {
        console.error('Error in CMYK to LAB conversion:', error);
        return { l: 50, a: 0, b: 0 }; // Return neutral gray as fallback
    }
}

/**
 * Paper White Compensation
 * Adjusts LAB values for different paper substrates
 * Based on SCCA methodology: L' = L + (Lpaper - 100), a' = a + apaper, b' = b + bpaper
 */
function applyPaperWhiteCompensation(targetLab, paperWhite = { l: 95, a: 0, b: -2 }) {
    try {
        return {
            l: targetLab.l + (paperWhite.l - 100),
            a: targetLab.a + paperWhite.a,
            b: targetLab.b + paperWhite.b
        };
    } catch (error) {
        console.error('Error in paper white compensation:', error);
        return targetLab;
    }
}

/**
 * ΔE2000 Calculation - More accurate than CIE76
 * Based on the CIEDE2000 color difference formula
 */
function calculateDeltaE2000(lab1, lab2) {
    try {
        const [L1, a1, b1] = [lab1.l, lab1.a, lab1.b];
        const [L2, a2, b2] = [lab2.l, lab2.a, lab2.b];

        const C1 = Math.hypot(a1, b1);
        const C2 = Math.hypot(a2, b2);
        const Cm = (C1 + C2) / 2;

        const G = 0.5 * (1 - Math.sqrt((Cm ** 7) / ((Cm ** 7) + (25 ** 7))));

        const a1p = (1 + G) * a1;
        const a2p = (1 + G) * a2;
        const C1p = Math.hypot(a1p, b1);
        const C2p = Math.hypot(a2p, b2);
        const Cpm = (C1p + C2p) / 2;

        const h1p = (Math.atan2(b1, a1p) * 180 / Math.PI + 360) % 360;
        const h2p = (Math.atan2(b2, a2p) * 180 / Math.PI + 360) % 360;

        const dLp = L2 - L1;
        const dCp = C2p - C1p;

        let dh = h2p - h1p;
        if (C1p * C2p === 0) dh = 0;
        else {
            if (dh > 180) dh -= 360;
            if (dh < -180) dh += 360;
        }

        const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * Math.PI / 180);

        let hp = (h1p + h2p) / 2;
        if (Math.abs(h1p - h2p) > 180) {
            hp += (h1p + h2p < 360) ? 180 : -180;
        }

        const Tt = 1 - 0.17 * Math.cos((hp - 30) * Math.PI / 180) +
            0.24 * Math.cos((2 * hp) * Math.PI / 180) +
            0.32 * Math.cos((3 * hp + 6) * Math.PI / 180) -
            0.20 * Math.cos((4 * hp - 63) * Math.PI / 180);

        const Sl = 1 + (0.015 * (((L1 + L2) / 2 - 50) ** 2)) / Math.sqrt(20 + (((L1 + L2) / 2 - 50) ** 2));
        const Sc = 1 + 0.045 * Cpm;
        const Sh = 1 + 0.015 * Cpm * Tt;

        const dRo = 30 * Math.exp(-(((hp - 275) / 25) ** 2));
        const Rc = 2 * Math.sqrt((Cpm ** 7) / ((Cpm ** 7) + (25 ** 7)));
        const Rt = -Math.sin(2 * dRo * Math.PI / 180) * Rc;

        return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));

    } catch (error) {
        console.error('Error in ΔE2000 calculation:', error);
        // Fallback to CIE76
        return calculateDeltaE(lab1, lab2);
    }
}

// Auto-run G7 tests in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setTimeout(() => {
        console.log('\n=== Running G7 Extension Tests ===');
        runG7Tests();
        runNPDCTests();
    }, 2000);
}