// ICC Profile Manager
// Professional ICC profile loading, parsing, and color space conversion
// Supports RGB matrix/TRC profiles and DeviceLink tables

console.log('ICC Profile Manager module loading...');

// ICC Profile State Management
let ICC_STATE = {
    currentProfile: null,
    deviceLinkData: null,
    profileCache: new Map(),
    supportedTypes: ['RGB', 'CMYK', 'LAB', 'XYZ'],
    maxCacheSize: 10,
    settings: {
        renderingIntent: 'relative_colorimetric',
        blackPointCompensation: true,
        adaptationMethod: 'bradford'
    }
};

/**
 * ICC Profile Parser and Manager
 * Handles ICC profile loading, parsing, and color space conversions
 */
class ICCProfileManager {
    constructor() {
        this.whitePoint = { x: 95.047, y: 100.000, z: 108.883 }; // D65
        this.adaptationMatrix = {
            bradford: [
                [0.8951, 0.2664, -0.1614],
                [-0.7502, 1.7135, 0.0367],
                [0.0389, -0.0685, 1.0296]
            ]
        };
    }
    
    /**
     * Load and parse ICC profile from file
     */
    async loadProfile(file) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }
            
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const profile = this.parseICCProfile(arrayBuffer);
            
            if (profile) {
                ICC_STATE.currentProfile = profile;
                this.cacheProfile(file.name, profile);
                
                // Dispatch event for UI updates
                window.dispatchEvent(new CustomEvent('iccProfileLoaded', {
                    detail: { profile, filename: file.name }
                }));
                
                return {
                    success: true,
                    profile: profile,
                    filename: file.name,
                    message: `ICC profile "${file.name}" loaded successfully`
                };
            } else {
                throw new Error('Failed to parse ICC profile');
            }
            
        } catch (error) {
            console.error('Error loading ICC profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Read file as ArrayBuffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Parse ICC profile from binary data
     */
    parseICCProfile(arrayBuffer) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Read ICC profile header
            const header = this.parseProfileHeader(dataView);
            if (!header.isValid) {
                throw new Error('Invalid ICC profile header');
            }
            
            // Read tag table
            const tags = this.parseTagTable(dataView, header);
            
            // Build profile object based on color space
            const profile = {
                header: header,
                tags: tags,
                colorSpace: header.colorSpace,
                filename: null,
                loadedAt: new Date().toISOString()
            };
            
            // Parse specific profile type
            switch (header.colorSpace) {
                case 'RGB ':
                    return this.parseRGBProfile(profile, dataView);
                case 'CMYK':
                    return this.parseCMYKProfile(profile, dataView);
                default:
                    console.warn(`Unsupported color space: ${header.colorSpace}`);
                    return profile;
            }
            
        } catch (error) {
            console.error('Error parsing ICC profile:', error);
            return null;
        }
    }
    
    /**
     * Parse ICC profile header
     */
    parseProfileHeader(dataView) {
        try {
            const signature = this.getString(dataView, 36, 4);
            if (signature !== 'acsp') {
                return { isValid: false };
            }
            
            return {
                isValid: true,
                size: dataView.getUint32(0),
                cmmType: this.getString(dataView, 4, 4),
                version: dataView.getUint32(8),
                deviceClass: this.getString(dataView, 12, 4),
                colorSpace: this.getString(dataView, 16, 4),
                pcs: this.getString(dataView, 20, 4), // Profile Connection Space
                creationDate: this.parseDateTime(dataView, 24),
                signature: signature,
                platform: this.getString(dataView, 40, 4),
                flags: dataView.getUint32(44),
                manufacturer: this.getString(dataView, 48, 4),
                model: this.getString(dataView, 52, 4),
                attributes: dataView.getUint32(56, false) + dataView.getUint32(60, false),
                renderingIntent: dataView.getUint32(64),
                illuminant: {
                    x: this.parseS15Fixed16(dataView, 68),
                    y: this.parseS15Fixed16(dataView, 72),
                    z: this.parseS15Fixed16(dataView, 76)
                }
            };
        } catch (error) {
            console.error('Error parsing ICC header:', error);
            return { isValid: false };
        }
    }
    
    /**
     * Parse tag table
     */
    parseTagTable(dataView, header) {
        try {
            const tagCount = dataView.getUint32(128);
            const tags = {};
            
            for (let i = 0; i < tagCount; i++) {
                const offset = 128 + 4 + i * 12;
                const signature = this.getString(dataView, offset, 4);
                const tagOffset = dataView.getUint32(offset + 4);
                const tagSize = dataView.getUint32(offset + 8);
                
                tags[signature] = {
                    offset: tagOffset,
                    size: tagSize
                };
            }
            
            return tags;
        } catch (error) {
            console.error('Error parsing tag table:', error);
            return {};
        }
    }
    
    /**
     * Parse RGB matrix/TRC profile
     */
    parseRGBProfile(profile, dataView) {
        try {
            const tags = profile.tags;
            
            // Parse colorant matrices (rXYZ, gXYZ, bXYZ)
            const rXYZ = tags['rXYZ'] ? this.parseXYZTag(dataView, tags['rXYZ']) : null;
            const gXYZ = tags['gXYZ'] ? this.parseXYZTag(dataView, tags['gXYZ']) : null;
            const bXYZ = tags['bXYZ'] ? this.parseXYZTag(dataView, tags['bXYZ']) : null;
            
            // Parse tone reproduction curves (rTRC, gTRC, bTRC)
            const rTRC = tags['rTRC'] ? this.parseTRCTag(dataView, tags['rTRC']) : null;
            const gTRC = tags['gTRC'] ? this.parseTRCTag(dataView, tags['gTRC']) : null;
            const bTRC = tags['bTRC'] ? this.parseTRCTag(dataView, tags['bTRC']) : null;
            
            if (rXYZ && gXYZ && bXYZ) {
                // Build transformation matrix
                const matrix = [
                    [rXYZ.x, gXYZ.x, bXYZ.x],
                    [rXYZ.y, gXYZ.y, bXYZ.y],
                    [rXYZ.z, gXYZ.z, bXYZ.z]
                ];
                
                const inverseMatrix = this.invertMatrix3x3(matrix);
                
                profile.colorConversion = {
                    type: 'matrix_trc',
                    matrix: matrix,
                    inverseMatrix: inverseMatrix,
                    trc: { r: rTRC, g: gTRC, b: bTRC }
                };
                
                // Add conversion functions
                profile.rgbToXYZ = this.createRGBToXYZFunction(matrix, { r: rTRC, g: gTRC, b: bTRC });
                profile.xyzToRGB = this.createXYZToRGBFunction(inverseMatrix, { r: rTRC, g: gTRC, b: bTRC });
                profile.labToRGB = this.createLABToRGBFunction(profile);
            }
            
            return profile;
            
        } catch (error) {
            console.error('Error parsing RGB profile:', error);
            return profile;
        }
    }
    
    /**
     * Parse CMYK profile (basic support)
     */
    parseCMYKProfile(profile, dataView) {
        try {
            // CMYK profiles typically use LUT tables which are complex
            // For now, we'll add basic support and suggest DeviceLink CSV import
            profile.colorConversion = {
                type: 'lut_based',
                requiresDeviceLink: true
            };
            
            profile.cmykToLAB = (c, m, y, k) => {
                // Use device link data if available
                if (ICC_STATE.deviceLinkData) {
                    return this.lookupDeviceLink(c, m, y, k);
                }
                
                // Fallback to basic CMYK to LAB conversion
                console.warn('CMYK profile requires DeviceLink data for accurate conversion');
                return window.colorScience?.cmykToLab?.(c, m, y, k) || { l: 50, a: 0, b: 0 };
            };
            
            return profile;
            
        } catch (error) {
            console.error('Error parsing CMYK profile:', error);
            return profile;
        }
    }
    
    /**
     * Parse XYZ tag
     */
    parseXYZTag(dataView, tag) {
        try {
            const offset = tag.offset + 8; // Skip tag signature and reserved bytes
            return {
                x: this.parseS15Fixed16(dataView, offset),
                y: this.parseS15Fixed16(dataView, offset + 4),
                z: this.parseS15Fixed16(dataView, offset + 8)
            };
        } catch (error) {
            console.error('Error parsing XYZ tag:', error);
            return null;
        }
    }
    
    /**
     * Parse TRC (Tone Reproduction Curve) tag
     */
    parseTRCTag(dataView, tag) {
        try {
            const offset = tag.offset;
            const signature = this.getString(dataView, offset, 4);
            
            if (signature === 'curv') {
                const count = dataView.getUint32(offset + 8);
                
                if (count === 0) {
                    // Linear gamma
                    return { type: 'gamma', gamma: 1.0 };
                } else if (count === 1) {
                    // Simple gamma
                    const gamma = dataView.getUint16(offset + 12) / 256;
                    return { type: 'gamma', gamma: gamma };
                } else {
                    // Curve table
                    const table = [];
                    for (let i = 0; i < count; i++) {
                        table.push(dataView.getUint16(offset + 12 + i * 2) / 65535);
                    }
                    return { type: 'table', table: table };
                }
            } else if (signature === 'para') {
                // Parametric curve - simplified support
                const functionType = dataView.getUint16(offset + 8);
                const gamma = this.parseS15Fixed16(dataView, offset + 12);
                return { type: 'gamma', gamma: gamma };
            }
            
            // Default to sRGB gamma
            return { type: 'gamma', gamma: 2.2 };
            
        } catch (error) {
            console.error('Error parsing TRC tag:', error);
            return { type: 'gamma', gamma: 2.2 };
        }
    }
    
    /**
     * Create RGB to XYZ conversion function
     */
    createRGBToXYZFunction(matrix, trc) {
        return (r, g, b) => {
            // Normalize RGB to 0-1
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;
            
            // Apply TRC (gamma correction)
            const rLinear = this.applyTRC(rNorm, trc.r, false);
            const gLinear = this.applyTRC(gNorm, trc.g, false);
            const bLinear = this.applyTRC(bNorm, trc.b, false);
            
            // Apply matrix transformation
            const x = matrix[0][0] * rLinear + matrix[0][1] * gLinear + matrix[0][2] * bLinear;
            const y = matrix[1][0] * rLinear + matrix[1][1] * gLinear + matrix[1][2] * bLinear;
            const z = matrix[2][0] * rLinear + matrix[2][1] * gLinear + matrix[2][2] * bLinear;
            
            return { x: x * 100, y: y * 100, z: z * 100 };
        };
    }
    
    /**
     * Create XYZ to RGB conversion function
     */
    createXYZToRGBFunction(inverseMatrix, trc) {
        return (x, y, z) => {
            // Normalize XYZ
            const xNorm = x / 100;
            const yNorm = y / 100;
            const zNorm = z / 100;
            
            // Apply inverse matrix transformation
            const rLinear = inverseMatrix[0][0] * xNorm + inverseMatrix[0][1] * yNorm + inverseMatrix[0][2] * zNorm;
            const gLinear = inverseMatrix[1][0] * xNorm + inverseMatrix[1][1] * yNorm + inverseMatrix[1][2] * zNorm;
            const bLinear = inverseMatrix[2][0] * xNorm + inverseMatrix[2][1] * yNorm + inverseMatrix[2][2] * zNorm;
            
            // Apply inverse TRC (gamma correction)
            const rNorm = this.applyTRC(Math.max(0, Math.min(1, rLinear)), trc.r, true);
            const gNorm = this.applyTRC(Math.max(0, Math.min(1, gLinear)), trc.g, true);
            const bNorm = this.applyTRC(Math.max(0, Math.min(1, bLinear)), trc.b, true);
            
            return {
                r: Math.round(Math.max(0, Math.min(255, rNorm * 255))),
                g: Math.round(Math.max(0, Math.min(255, gNorm * 255))),
                b: Math.round(Math.max(0, Math.min(255, bNorm * 255)))
            };
        };
    }
    
    /**
     * Create LAB to RGB conversion function
     */
    createLABToRGBFunction(profile) {
        return (l, a, b) => {
            // Convert LAB to XYZ
            const xyz = this.labToXYZ(l, a, b);
            
            // Convert XYZ to RGB using profile
            return profile.xyzToRGB(xyz.x, xyz.y, xyz.z);
        };
    }
    
    /**
     * Apply Tone Reproduction Curve
     */
    applyTRC(value, trc, inverse = false) {
        if (!trc || value < 0 || value > 1) return value;
        
        switch (trc.type) {
            case 'gamma':
                const gamma = trc.gamma || 2.2;
                return inverse ? Math.pow(value, gamma) : Math.pow(value, 1 / gamma);
                
            case 'table':
                if (trc.table && trc.table.length > 0) {
                    const index = value * (trc.table.length - 1);
                    const lowerIndex = Math.floor(index);
                    const upperIndex = Math.ceil(index);
                    const fraction = index - lowerIndex;
                    
                    if (lowerIndex === upperIndex) {
                        return trc.table[lowerIndex];
                    }
                    
                    // Linear interpolation
                    const lowerValue = trc.table[lowerIndex];
                    const upperValue = trc.table[upperIndex];
                    return lowerValue + (upperValue - lowerValue) * fraction;
                }
                return value;
                
            default:
                return value;
        }
    }
    
    /**
     * LAB to XYZ conversion
     */
    labToXYZ(l, a, b) {
        const fy = (l + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;
        
        const epsilon = 0.008856;
        const kappa = 903.3;
        
        const xr = fx * fx * fx > epsilon ? fx * fx * fx : (116 * fx - 16) / kappa;
        const yr = l > kappa * epsilon ? fy * fy * fy : l / kappa;
        const zr = fz * fz * fz > epsilon ? fz * fz * fz : (116 * fz - 16) / kappa;
        
        return {
            x: xr * this.whitePoint.x,
            y: yr * this.whitePoint.y,
            z: zr * this.whitePoint.z
        };
    }
    
    /**
     * Load DeviceLink CSV data for CMYK profiles
     */
    async loadDeviceLink(file) {
        try {
            const text = await this.readFileAsText(file);
            const deviceLinkData = this.parseDeviceLinkCSV(text);
            
            if (deviceLinkData) {
                ICC_STATE.deviceLinkData = deviceLinkData;
                
                return {
                    success: true,
                    entries: Object.keys(deviceLinkData).length,
                    message: `DeviceLink data loaded with ${Object.keys(deviceLinkData).length} entries`
                };
            } else {
                throw new Error('Failed to parse DeviceLink CSV');
            }
            
        } catch (error) {
            console.error('Error loading DeviceLink:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    /**
     * Parse DeviceLink CSV
     */
    parseDeviceLinkCSV(text) {
        try {
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            if (lines.length < 2) return null;
            
            const header = lines[0].split(/,|;|\t/).map(h => h.trim().toLowerCase());
            const cIndex = header.indexOf('c');
            const mIndex = header.indexOf('m');
            const yIndex = header.indexOf('y');
            const kIndex = header.indexOf('k');
            const lIndex = header.indexOf('l');
            const aIndex = header.indexOf('a');
            const bIndex = header.indexOf('b');
            
            if ([cIndex, mIndex, yIndex, kIndex, lIndex, aIndex, bIndex].some(i => i === -1)) {
                throw new Error('DeviceLink CSV must contain C, M, Y, K, L, A, B columns');
            }
            
            const deviceLinkMap = {};
            
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(/,|;|\t/);
                const c = Math.round(parseFloat(cols[cIndex]) || 0);
                const m = Math.round(parseFloat(cols[mIndex]) || 0);
                const y = Math.round(parseFloat(cols[yIndex]) || 0);
                const k = Math.round(parseFloat(cols[kIndex]) || 0);
                const l = parseFloat(cols[lIndex]) || 0;
                const a = parseFloat(cols[aIndex]) || 0;
                const b = parseFloat(cols[bIndex]) || 0;
                
                const key = `${c},${m},${y},${k}`;
                deviceLinkMap[key] = { l, a, b };
            }
            
            return deviceLinkMap;
            
        } catch (error) {
            console.error('Error parsing DeviceLink CSV:', error);
            return null;
        }
    }
    
    /**
     * Lookup DeviceLink data
     */
    lookupDeviceLink(c, m, y, k) {
        if (!ICC_STATE.deviceLinkData) {
            return null;
        }
        
        const key = `${Math.round(c)},${Math.round(m)},${Math.round(y)},${Math.round(k)}`;
        return ICC_STATE.deviceLinkData[key] || null;
    }
    
    /**
     * Cache profile for performance
     */
    cacheProfile(key, profile) {
        if (ICC_STATE.profileCache.size >= ICC_STATE.maxCacheSize) {
            // Remove oldest entry
            const firstKey = ICC_STATE.profileCache.keys().next().value;
            ICC_STATE.profileCache.delete(firstKey);
        }
        
        ICC_STATE.profileCache.set(key, profile);
    }
    
    /**
     * Get current profile
     */
    getCurrentProfile() {
        return ICC_STATE.currentProfile;
    }
    
    /**
     * Clear current profile
     */
    clearProfile() {
        ICC_STATE.currentProfile = null;
        ICC_STATE.deviceLinkData = null;
        
        window.dispatchEvent(new CustomEvent('iccProfileCleared'));
    }
    
    /**
     * Utility functions
     */
    getString(dataView, offset, length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const char = dataView.getUint8(offset + i);
            if (char === 0) break;
            str += String.fromCharCode(char);
        }
        return str;
    }
    
    parseDateTime(dataView, offset) {
        // ICC DateTime is a 12-byte structure
        const year = dataView.getUint16(offset);
        const month = dataView.getUint16(offset + 2);
        const day = dataView.getUint16(offset + 4);
        const hours = dataView.getUint16(offset + 6);
        const minutes = dataView.getUint16(offset + 8);
        const seconds = dataView.getUint16(offset + 10);
        
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
    parseS15Fixed16(dataView, offset) {
        const value = dataView.getInt32(offset);
        return value / 65536;
    }
    
    invertMatrix3x3(matrix) {
        const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        
        const A = e * i - f * h;
        const B = -(d * i - f * g);
        const C = d * h - e * g;
        const D = -(b * i - c * h);
        const E = a * i - c * g;
        const F = -(a * h - b * g);
        const G = b * f - c * e;
        const H = -(a * f - c * d);
        const I = a * e - b * d;
        
        const det = a * A + b * B + c * C;
        
        if (Math.abs(det) < 1e-10) {
            console.error('Matrix is not invertible');
            return matrix; // Return original matrix as fallback
        }
        
        return [
            [A / det, D / det, G / det],
            [B / det, E / det, H / det],
            [C / det, F / det, I / det]
        ];
    }
}

// Initialize ICC Profile Manager
const iccProfileManager = new ICCProfileManager();

// Export ICC profile functionality
window.iccProfileManager = {
    // Core functions
    manager: iccProfileManager,
    loadProfile: iccProfileManager.loadProfile.bind(iccProfileManager),
    loadDeviceLink: iccProfileManager.loadDeviceLink.bind(iccProfileManager),
    getCurrentProfile: iccProfileManager.getCurrentProfile.bind(iccProfileManager),
    clearProfile: iccProfileManager.clearProfile.bind(iccProfileManager),
    
    // DeviceLink functions
    lookupDeviceLink: iccProfileManager.lookupDeviceLink.bind(iccProfileManager),
    
    // State access
    getState: () => ICC_STATE,
    
    // Utility functions
    isProfileLoaded: () => ICC_STATE.currentProfile !== null,
    getProfileInfo: () => {
        const profile = ICC_STATE.currentProfile;
        return profile ? {
            colorSpace: profile.colorSpace,
            filename: profile.filename,
            loadedAt: profile.loadedAt,
            type: profile.colorConversion?.type || 'unknown'
        } : null;
    }
};

// Integrate with existing HD Color Engine
if (window.hdColorEngine) {
    window.hdColorEngine.icc = window.iccProfileManager;
    console.log('ICC Profile Manager integrated with HD Color Engine');
}

console.log('ICC Profile Manager module loaded successfully');