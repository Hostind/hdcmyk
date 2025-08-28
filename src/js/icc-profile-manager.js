// ICC Profile Manager - Professional Color Management
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5 - ICC profile support and soft proofing

console.log('ICC Profile Manager loading...');

/**
 * ICC Profile Manager Class
 * Handles ICC profile loading, parsing, and color transformations
 */
class ICCProfileManager {
    constructor() {
        this.loadedProfile = null;
        this.profileData = null;
        this.deviceLinkTable = null;
        this.substrateSettings = {
            dotGain: 0,
            paperTintA: 0,
            paperTintB: 0
        };
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('Initializing ICC Profile Manager...');
        this.setupFileInputHandlers();
        this.setupSubstrateControls();
        this.isInitialized = true;
        console.log('ICC Profile Manager initialized');
    }

    /**
     * Set up file input handlers for ICC profiles and DeviceLink CSV
     * Requirements: 6.1 - ICC profile file input and parsing
     */
    setupFileInputHandlers() {
        // ICC Profile file input
        const iccFileInput = document.getElementById('icc-profile-input');
        if (iccFileInput) {
            iccFileInput.addEventListener('change', (e) => this.handleICCProfileLoad(e));
        }

        // DeviceLink CSV file input
        const deviceLinkInput = document.getElementById('devicelink-csv-input');
        if (deviceLinkInput) {
            deviceLinkInput.addEventListener('change', (e) => this.handleDeviceLinkLoad(e));
        }

        // Create file inputs if they don't exist
        this.createFileInputsIfNeeded();
    }

    /**
     * Create file input elements if they don't exist in the DOM
     */
    createFileInputsIfNeeded() {
        // Check if ICC profile section exists
        let iccSection = document.getElementById('icc-profile-section');
        if (!iccSection) {
            iccSection = this.createICCProfileSection();
        }

        // Add file inputs to the section
        this.addFileInputsToSection(iccSection);
    }
}    
/**
     * Create ICC profile section in the UI
     */
    createICCProfileSection() {
        const container = document.querySelector('.container') || document.body;
        
        const section = document.createElement('div');
        section.id = 'icc-profile-section';
        section.className = 'feature-card icc-profile-card';
        section.innerHTML = `
            <h3>🎨 ICC Profile & Soft Proofing</h3>
            <div class="icc-controls">
                <div class="control-grid">
                    <div class="control-group">
                        <label for="icc-profile-input">ICC Profile (.icc/.icm)</label>
                        <input type="file" id="icc-profile-input" accept=".icc,.icm" class="file-input">
                        <div class="file-status" id="icc-profile-status">No profile loaded</div>
                    </div>
                    <div class="control-group">
                        <label for="devicelink-csv-input">DeviceLink CSV</label>
                        <input type="file" id="devicelink-csv-input" accept=".csv" class="file-input">
                        <div class="file-status" id="devicelink-status">No DeviceLink loaded</div>
                    </div>
                </div>
                <div class="substrate-controls">
                    <h4>Substrate Simulation</h4>
                    <div class="control-grid">
                        <div class="control-group">
                            <label for="dot-gain-slider">Dot Gain (%)</label>
                            <input type="range" id="dot-gain-slider" min="-10" max="30" value="0" step="0.5">
                            <span class="slider-value" id="dot-gain-value">0%</span>
                        </div>
                        <div class="control-group">
                            <label for="paper-tint-a-slider">Paper Tint a*</label>
                            <input type="range" id="paper-tint-a-slider" min="-5" max="5" value="0" step="0.1">
                            <span class="slider-value" id="paper-tint-a-value">0</span>
                        </div>
                        <div class="control-group">
                            <label for="paper-tint-b-slider">Paper Tint b*</label>
                            <input type="range" id="paper-tint-b-slider" min="-10" max="10" value="0" step="0.1">
                            <span class="slider-value" id="paper-tint-b-value">0</span>
                        </div>
                    </div>
                </div>
                <div class="soft-proof-preview">
                    <h4>Soft Proof Preview</h4>
                    <div class="preview-swatches">
                        <div class="preview-swatch" id="target-soft-proof">
                            <div class="swatch-color"></div>
                            <div class="swatch-label">Target</div>
                        </div>
                        <div class="preview-swatch" id="sample-soft-proof">
                            <div class="swatch-color"></div>
                            <div class="swatch-label">Sample</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert before results section or at the end
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            container.insertBefore(section, resultsSection);
        } else {
            container.appendChild(section);
        }

        return section;
    }

    /**
     * Add file input event listeners to the section
     */
    addFileInputsToSection(section) {
        const iccInput = section.querySelector('#icc-profile-input');
        const deviceLinkInput = section.querySelector('#devicelink-csv-input');

        if (iccInput) {
            iccInput.addEventListener('change', (e) => this.handleICCProfileLoad(e));
        }

        if (deviceLinkInput) {
            deviceLinkInput.addEventListener('change', (e) => this.handleDeviceLinkLoad(e));
        }
    }

    /**
     * Set up substrate control sliders
     * Requirements: 6.5 - Dot gain and paper tint adjustments
     */
    setupSubstrateControls() {
        // Dot gain slider
        const dotGainSlider = document.getElementById('dot-gain-slider');
        const dotGainValue = document.getElementById('dot-gain-value');
        if (dotGainSlider && dotGainValue) {
            dotGainSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.substrateSettings.dotGain = value;
                dotGainValue.textContent = `${value}%`;
                this.updateSoftProofPreview();
            });
        }

        // Paper tint a* slider
        const paperTintASlider = document.getElementById('paper-tint-a-slider');
        const paperTintAValue = document.getElementById('paper-tint-a-value');
        if (paperTintASlider && paperTintAValue) {
            paperTintASlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.substrateSettings.paperTintA = value;
                paperTintAValue.textContent = value.toFixed(1);
                this.updateSoftProofPreview();
            });
        }

        // Paper tint b* slider
        const paperTintBSlider = document.getElementById('paper-tint-b-slider');
        const paperTintBValue = document.getElementById('paper-tint-b-value');
        if (paperTintBSlider && paperTintBValue) {
            paperTintBSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.substrateSettings.paperTintB = value;
                paperTintBValue.textContent = value.toFixed(1);
                this.updateSoftProofPreview();
            });
        }
    }    
/**
     * Handle ICC profile file loading
     * Requirements: 6.1 - Implement ICC profile file input and parsing for RGB matrix/TRC v2 profiles
     */
    async handleICCProfileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            console.log('Loading ICC profile:', file.name);
            this.updateProfileStatus('Loading profile...', 'loading');

            const arrayBuffer = await file.arrayBuffer();
            const profileData = await this.parseICCProfile(arrayBuffer);

            if (profileData) {
                this.loadedProfile = file.name;
                this.profileData = profileData;
                this.updateProfileStatus(`Loaded: ${file.name}`, 'success');
                this.updateSoftProofPreview();
                console.log('ICC profile loaded successfully:', profileData);
            } else {
                throw new Error('Failed to parse ICC profile');
            }

        } catch (error) {
            console.error('Error loading ICC profile:', error);
            this.updateProfileStatus(`Error: ${error.message}`, 'error');
            this.loadedProfile = null;
            this.profileData = null;
        }
    }

    /**
     * Parse ICC profile data
     * Requirements: 6.2 - Add LAB to RGB conversion using ICC transformation matrices
     */
    async parseICCProfile(arrayBuffer) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Read ICC profile header
            const profileSize = dataView.getUint32(0, false); // Big-endian
            const cmmType = this.readString(dataView, 4, 4);
            const version = dataView.getUint32(8, false);
            const deviceClass = this.readString(dataView, 12, 4);
            const colorSpace = this.readString(dataView, 16, 4);
            const pcs = this.readString(dataView, 20, 4); // Profile Connection Space

            console.log('ICC Profile Info:', {
                size: profileSize,
                cmm: cmmType,
                version: version.toString(16),
                deviceClass,
                colorSpace,
                pcs
            });

            // Validate profile type (RGB matrix/TRC v2)
            if (colorSpace !== 'RGB ' || pcs !== 'XYZ ') {
                throw new Error('Only RGB matrix/TRC profiles with XYZ PCS are supported');
            }

            // Read tag table
            const tagCount = dataView.getUint32(128, false);
            const tags = {};

            for (let i = 0; i < tagCount; i++) {
                const offset = 132 + (i * 12);
                const signature = this.readString(dataView, offset, 4);
                const tagOffset = dataView.getUint32(offset + 4, false);
                const tagSize = dataView.getUint32(offset + 8, false);

                tags[signature] = { offset: tagOffset, size: tagSize };
            }

            // Parse required tags for RGB matrix/TRC profile
            const profileData = {
                header: {
                    size: profileSize,
                    version,
                    deviceClass,
                    colorSpace,
                    pcs
                },
                tags: tags,
                matrix: null,
                redTRC: null,
                greenTRC: null,
                blueTRC: null,
                whitePoint: null
            };

            // Parse colorant matrix (rXYZ, gXYZ, bXYZ tags)
            if (tags.rXYZ && tags.gXYZ && tags.bXYZ) {
                profileData.matrix = this.parseColorantMatrix(dataView, tags);
            }

            // Parse TRC curves
            if (tags.rTRC) profileData.redTRC = this.parseTRCCurve(dataView, tags.rTRC);
            if (tags.gTRC) profileData.greenTRC = this.parseTRCCurve(dataView, tags.gTRC);
            if (tags.bTRC) profileData.blueTRC = this.parseTRCCurve(dataView, tags.bTRC);

            // Parse white point
            if (tags.wtpt) {
                profileData.whitePoint = this.parseXYZType(dataView, tags.wtpt.offset);
            }

            return profileData;

        } catch (error) {
            console.error('ICC profile parsing error:', error);
            throw error;
        }
    }    /**

     * Parse colorant matrix from rXYZ, gXYZ, bXYZ tags
     */
    parseColorantMatrix(dataView, tags) {
        const rXYZ = this.parseXYZType(dataView, tags.rXYZ.offset);
        const gXYZ = this.parseXYZType(dataView, tags.gXYZ.offset);
        const bXYZ = this.parseXYZType(dataView, tags.bXYZ.offset);

        return [
            [rXYZ.x, gXYZ.x, bXYZ.x],
            [rXYZ.y, gXYZ.y, bXYZ.y],
            [rXYZ.z, gXYZ.z, bXYZ.z]
        ];
    }

    /**
     * Parse XYZ type data
     */
    parseXYZType(dataView, offset) {
        const signature = this.readString(dataView, offset, 4);
        if (signature !== 'XYZ ') {
            throw new Error('Invalid XYZ tag signature');
        }

        // Skip reserved bytes (4 bytes)
        const x = this.readS15Fixed16(dataView, offset + 8);
        const y = this.readS15Fixed16(dataView, offset + 12);
        const z = this.readS15Fixed16(dataView, offset + 16);

        return { x, y, z };
    }

    /**
     * Parse TRC (Tone Reproduction Curve) data
     */
    parseTRCCurve(dataView, tagInfo) {
        const signature = this.readString(dataView, tagInfo.offset, 4);
        
        if (signature === 'curv') {
            // Curve type
            const count = dataView.getUint32(tagInfo.offset + 8, false);
            
            if (count === 0) {
                // Linear gamma
                return { type: 'linear', gamma: 1.0 };
            } else if (count === 1) {
                // Simple gamma
                const gamma = dataView.getUint16(tagInfo.offset + 12, false) / 256.0;
                return { type: 'gamma', gamma };
            } else {
                // Curve table
                const curve = [];
                for (let i = 0; i < count; i++) {
                    const value = dataView.getUint16(tagInfo.offset + 12 + (i * 2), false) / 65535.0;
                    curve.push(value);
                }
                return { type: 'curve', curve };
            }
        } else if (signature === 'para') {
            // Parametric curve type
            return this.parseParametricCurve(dataView, tagInfo.offset);
        }

        throw new Error('Unsupported TRC curve type: ' + signature);
    }

    /**
     * Parse parametric curve
     */
    parseParametricCurve(dataView, offset) {
        const functionType = dataView.getUint16(offset + 8, false);
        
        // For simplicity, treat as sRGB gamma for now
        return { type: 'srgb', gamma: 2.4 };
    }

    /**
     * Read S15Fixed16 number (ICC fixed-point format)
     */
    readS15Fixed16(dataView, offset) {
        const value = dataView.getInt32(offset, false);
        return value / 65536.0;
    }

    /**
     * Read string from DataView
     */
    readString(dataView, offset, length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += String.fromCharCode(dataView.getUint8(offset + i));
        }
        return result;
    }    /
**
     * Handle DeviceLink CSV loading
     * Requirements: 6.4 - Add DeviceLink CSV support for CMYK→LAB conversion tables
     */
    async handleDeviceLinkLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            console.log('Loading DeviceLink CSV:', file.name);
            this.updateDeviceLinkStatus('Loading DeviceLink...', 'loading');

            const text = await file.text();
            const deviceLinkTable = this.parseDeviceLinkCSV(text);

            if (deviceLinkTable && deviceLinkTable.length > 0) {
                this.deviceLinkTable = deviceLinkTable;
                this.updateDeviceLinkStatus(`Loaded: ${file.name} (${deviceLinkTable.length} entries)`, 'success');
                console.log('DeviceLink CSV loaded successfully:', deviceLinkTable.length, 'entries');
            } else {
                throw new Error('No valid DeviceLink data found');
            }

        } catch (error) {
            console.error('Error loading DeviceLink CSV:', error);
            this.updateDeviceLinkStatus(`Error: ${error.message}`, 'error');
            this.deviceLinkTable = null;
        }
    }

    /**
     * Parse DeviceLink CSV data
     * Expected format: C,M,Y,K,L,a,b
     */
    parseDeviceLinkCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const deviceLinkTable = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue; // Skip comments

            const values = line.split(',').map(v => parseFloat(v.trim()));
            
            if (values.length >= 7 && values.every(v => !isNaN(v))) {
                deviceLinkTable.push({
                    cmyk: { c: values[0], m: values[1], y: values[2], k: values[3] },
                    lab: { l: values[4], a: values[5], b: values[6] }
                });
            }
        }

        return deviceLinkTable;
    }

    /**
     * Convert LAB to RGB using ICC profile
     * Requirements: 6.2 - Add LAB to RGB conversion using ICC transformation matrices
     */
    labToRgbICC(l, a, b) {
        if (!this.profileData || !this.profileData.matrix) {
            // Fallback to standard conversion
            return this.labToRgbFallback(l, a, b);
        }

        try {
            // Convert LAB to XYZ
            const xyz = this.labToXyz(l, a, b);

            // Apply ICC matrix transformation
            const rgb = this.xyzToRgbICC(xyz.x, xyz.y, xyz.z);

            // Apply substrate adjustments
            return this.applySubstrateAdjustments(rgb);

        } catch (error) {
            console.error('ICC LAB to RGB conversion error:', error);
            return this.labToRgbFallback(l, a, b);
        }
    }

    /**
     * Convert XYZ to RGB using ICC profile matrix
     */
    xyzToRgbICC(x, y, z) {
        const matrix = this.profileData.matrix;
        
        // Normalize XYZ values
        const xNorm = x / 100;
        const yNorm = y / 100;
        const zNorm = z / 100;

        // Apply matrix transformation
        let r = xNorm * matrix[0][0] + yNorm * matrix[0][1] + zNorm * matrix[0][2];
        let g = xNorm * matrix[1][0] + yNorm * matrix[1][1] + zNorm * matrix[1][2];
        let b = xNorm * matrix[2][0] + yNorm * matrix[2][1] + zNorm * matrix[2][2];

        // Apply TRC curves
        r = this.applyTRCCurve(r, this.profileData.redTRC);
        g = this.applyTRCCurve(g, this.profileData.greenTRC);
        b = this.applyTRCCurve(b, this.profileData.blueTRC);

        return {
            r: Math.round(Math.max(0, Math.min(255, r * 255))),
            g: Math.round(Math.max(0, Math.min(255, g * 255))),
            b: Math.round(Math.max(0, Math.min(255, b * 255)))
        };
    }    /
**
     * Apply TRC curve to linear RGB value
     */
    applyTRCCurve(value, trc) {
        if (!trc) return value;

        switch (trc.type) {
            case 'linear':
                return value;
            
            case 'gamma':
                return Math.pow(Math.max(0, value), 1.0 / trc.gamma);
            
            case 'srgb':
                // sRGB gamma correction
                return value > 0.0031308 
                    ? 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055
                    : 12.92 * value;
            
            case 'curve':
                // Interpolate in curve table
                const index = value * (trc.curve.length - 1);
                const lower = Math.floor(index);
                const upper = Math.ceil(index);
                const fraction = index - lower;
                
                if (lower === upper) {
                    return trc.curve[lower];
                } else {
                    return trc.curve[lower] * (1 - fraction) + trc.curve[upper] * fraction;
                }
            
            default:
                return value;
        }
    }

    /**
     * Apply substrate adjustments for soft proofing
     * Requirements: 6.3, 6.5 - Create soft proofing preview swatches with substrate simulation
     */
    applySubstrateAdjustments(rgb) {
        // Apply dot gain simulation (affects darker colors more)
        const dotGainFactor = 1 + (this.substrateSettings.dotGain / 100);
        const luminance = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255;
        const darknessFactor = 1 - luminance; // More effect on darker colors

        let adjustedR = rgb.r * (1 - (dotGainFactor - 1) * darknessFactor);
        let adjustedG = rgb.g * (1 - (dotGainFactor - 1) * darknessFactor);
        let adjustedB = rgb.b * (1 - (dotGainFactor - 1) * darknessFactor);

        // Apply paper tint (affects lighter colors more)
        const lightnessFactor = luminance; // More effect on lighter colors
        const paperTintStrength = 0.3; // Adjust strength of paper tint effect

        adjustedR += this.substrateSettings.paperTintA * paperTintStrength * lightnessFactor;
        adjustedG += this.substrateSettings.paperTintB * paperTintStrength * lightnessFactor;
        adjustedB += this.substrateSettings.paperTintB * paperTintStrength * lightnessFactor;

        return {
            r: Math.round(Math.max(0, Math.min(255, adjustedR))),
            g: Math.round(Math.max(0, Math.min(255, adjustedG))),
            b: Math.round(Math.max(0, Math.min(255, adjustedB)))
        };
    }

    /**
     * Convert CMYK to LAB using DeviceLink table
     */
    cmykToLabDeviceLink(c, m, y, k) {
        if (!this.deviceLinkTable) {
            return null; // No DeviceLink table loaded
        }

        // Find closest match in DeviceLink table
        let closestMatch = null;
        let minDistance = Infinity;

        for (const entry of this.deviceLinkTable) {
            const distance = Math.sqrt(
                Math.pow(c - entry.cmyk.c, 2) +
                Math.pow(m - entry.cmyk.m, 2) +
                Math.pow(y - entry.cmyk.y, 2) +
                Math.pow(k - entry.cmyk.k, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestMatch = entry;
            }
        }

        return closestMatch ? closestMatch.lab : null;
    }

    /**
     * Fallback LAB to RGB conversion (standard method)
     */
    labToRgbFallback(l, a, b) {
        // Use the standard color science conversion
        if (window.labToRgb) {
            return window.labToRgb(l, a, b);
        }
        
        // Basic fallback if color science module not available
        return { r: 128, g: 128, b: 128 };
    }   
 /**
     * LAB to XYZ conversion (standard CIE method)
     */
    labToXyz(l, a, b) {
        const fy = (l + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;

        const epsilon = 0.008856;
        const kappa = 903.3;

        const xn = fx * fx * fx > epsilon ? fx * fx * fx : (116 * fx - 16) / kappa;
        const yn = l > kappa * epsilon ? fy * fy * fy : l / kappa;
        const zn = fz * fz * fz > epsilon ? fz * fz * fz : (116 * fz - 16) / kappa;

        // D65 white point
        return {
            x: xn * 95.047,
            y: yn * 100.000,
            z: zn * 108.883
        };
    }

    /**
     * Update soft proof preview swatches
     * Requirements: 6.3 - Create soft proofing preview swatches with substrate simulation
     */
    updateSoftProofPreview() {
        // Get current color values from the calculator
        const targetLab = this.getCurrentTargetLab();
        const sampleLab = this.getCurrentSampleLab();

        if (targetLab) {
            this.updatePreviewSwatch('target-soft-proof', targetLab);
        }

        if (sampleLab) {
            this.updatePreviewSwatch('sample-soft-proof', sampleLab);
        }
    }

    /**
     * Update individual preview swatch
     */
    updatePreviewSwatch(swatchId, lab) {
        const swatch = document.querySelector(`#${swatchId} .swatch-color`);
        if (!swatch) return;

        // Convert LAB to RGB using ICC profile if available
        const rgb = this.labToRgbICC(lab.l, lab.a, lab.b);
        const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        
        swatch.style.backgroundColor = cssColor;
        swatch.setAttribute('title', `L*${lab.l.toFixed(1)} a*${lab.a.toFixed(1)} b*${lab.b.toFixed(1)}`);
    }

    /**
     * Get current target LAB values from calculator
     */
    getCurrentTargetLab() {
        const lInput = document.getElementById('target-l');
        const aInput = document.getElementById('target-a');
        const bInput = document.getElementById('target-b');

        if (lInput && aInput && bInput) {
            return {
                l: parseFloat(lInput.value) || 50,
                a: parseFloat(aInput.value) || 0,
                b: parseFloat(bInput.value) || 0
            };
        }

        return null;
    }

    /**
     * Get current sample LAB values from calculator
     */
    getCurrentSampleLab() {
        const lInput = document.getElementById('sample-l');
        const aInput = document.getElementById('sample-a');
        const bInput = document.getElementById('sample-b');

        if (lInput && aInput && bInput) {
            return {
                l: parseFloat(lInput.value) || 50,
                a: parseFloat(aInput.value) || 0,
                b: parseFloat(bInput.value) || 0
            };
        }

        return null;
    }    /*
*
     * Update profile status display
     */
    updateProfileStatus(message, type = 'info') {
        const statusElement = document.getElementById('icc-profile-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `file-status ${type}`;
        }
    }

    /**
     * Update DeviceLink status display
     */
    updateDeviceLinkStatus(message, type = 'info') {
        const statusElement = document.getElementById('devicelink-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `file-status ${type}`;
        }
    }

    /**
     * Check if ICC profile is loaded
     */
    hasICCProfile() {
        return this.profileData !== null;
    }

    /**
     * Check if DeviceLink table is loaded
     */
    hasDeviceLink() {
        return this.deviceLinkTable !== null;
    }

    /**
     * Get profile information for display
     */
    getProfileInfo() {
        if (!this.profileData) return null;

        return {
            name: this.loadedProfile,
            colorSpace: this.profileData.header.colorSpace,
            deviceClass: this.profileData.header.deviceClass,
            version: this.profileData.header.version,
            hasMatrix: !!this.profileData.matrix,
            hasTRC: !!(this.profileData.redTRC && this.profileData.greenTRC && this.profileData.blueTRC)
        };
    }

    /**
     * Reset ICC profile manager
     */
    reset() {
        this.loadedProfile = null;
        this.profileData = null;
        this.deviceLinkTable = null;
        this.substrateSettings = {
            dotGain: 0,
            paperTintA: 0,
            paperTintB: 0
        };

        // Reset UI elements
        this.updateProfileStatus('No profile loaded', 'info');
        this.updateDeviceLinkStatus('No DeviceLink loaded', 'info');

        // Reset sliders
        const dotGainSlider = document.getElementById('dot-gain-slider');
        const paperTintASlider = document.getElementById('paper-tint-a-slider');
        const paperTintBSlider = document.getElementById('paper-tint-b-slider');

        if (dotGainSlider) dotGainSlider.value = 0;
        if (paperTintASlider) paperTintASlider.value = 0;
        if (paperTintBSlider) paperTintBSlider.value = 0;

        // Update value displays
        const dotGainValue = document.getElementById('dot-gain-value');
        const paperTintAValue = document.getElementById('paper-tint-a-value');
        const paperTintBValue = document.getElementById('paper-tint-b-value');

        if (dotGainValue) dotGainValue.textContent = '0%';
        if (paperTintAValue) paperTintAValue.textContent = '0';
        if (paperTintBValue) paperTintBValue.textContent = '0';
    }
}

// Global ICC Profile Manager instance
let iccProfileManager = null;

// Initialize ICC Profile Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!iccProfileManager) {
        iccProfileManager = new ICCProfileManager();
        
        // Make it globally accessible
        window.iccProfileManager = iccProfileManager;
        
        console.log('ICC Profile Manager initialized and available globally');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ICCProfileManager;
}

console.log('ICC Profile Manager module loaded');