// HD Color Engine Integration Script
// Connects HD features with existing Print Calculator interface
// Maintains backward compatibility while adding advanced functionality

console.log('HD Integration module loading...');

// Integration State
let INTEGRATION_STATE = {
    hdFeaturesVisible: false,
    utilitiesVisible: false,
    currentHeatmap: null,
    activeModal: null
};

/**
 * Initialize HD Integration
 */
function initializeHDIntegration() {
    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeHDIntegration);
            return;
        }
        
        // Initialize all HD components
        setupHeaderControls();
        setupHDPanels();
        setupModalControls();
        setupHeatmapIntegration();
        setupClientProfileIntegration();
        setupICCProfileIntegration();
        setupConversionTools();
        setupExtendedGamutControls();
        
        // Integrate with existing calculator
        integrateWithExistingCalculator();
        
        console.log('HD Integration initialized successfully');
        
    } catch (error) {
        console.error('Error initializing HD Integration:', error);
    }
}

/**
 * Setup Header Controls
 */
function setupHeaderControls() {
    const clientProfileBtn = document.getElementById('client-profile-btn');
    const iccProfileBtn = document.getElementById('icc-profile-btn');
    const heatmapToggleBtn = document.getElementById('heatmap-toggle-btn');
    
    if (clientProfileBtn) {
        clientProfileBtn.addEventListener('click', () => {
            toggleModal('client-profile-modal');
        });
    }
    
    if (iccProfileBtn) {
        iccProfileBtn.addEventListener('click', () => {
            toggleSection('utilities-section');
        });
    }
    
    if (heatmapToggleBtn) {
        heatmapToggleBtn.addEventListener('click', () => {
            toggleSection('hd-features-section');
        });
    }
}

/**
 * Setup HD Panels
 */
function setupHDPanels() {
    // Substrate and Illuminant controls
    const substrateSelect = document.getElementById('substrate-select');
    const illuminantSelect = document.getElementById('illuminant-select');
    const toleranceInput = document.getElementById('tolerance-input');
    
    if (substrateSelect) {
        substrateSelect.addEventListener('change', (e) => {
            if (window.hdColorEngine) {
                window.hdColorEngine.setState({ activeSubstrate: e.target.value });
            }
            updateSOPForSubstrate(e.target.value);
        });
    }
    
    if (toleranceInput) {
        toleranceInput.addEventListener('input', (e) => {
            updateToleranceDisplay(parseFloat(e.target.value));
        });
    }
    
    // Grid controls
    const generateGridBtn = document.getElementById('generate-grid');
    const clearGridBtn = document.getElementById('clear-grid');
    const autoBalanceBtn = document.getElementById('auto-balance');
    const csvImport = document.getElementById('csv-import');
    
    if (generateGridBtn) {
        generateGridBtn.addEventListener('click', generateColorGrid);
    }
    
    if (clearGridBtn) {
        clearGridBtn.addEventListener('click', clearColorGrid);
    }
    
    if (autoBalanceBtn) {
        autoBalanceBtn.addEventListener('click', performAutoBalance);
    }
    
    if (csvImport) {
        csvImport.addEventListener('change', handleCSVImport);
    }
    
    // CCM controls
    const computeCCMBtn = document.getElementById('compute-ccm');
    const applyCCMBtn = document.getElementById('apply-ccm');
    
    if (computeCCMBtn) {
        computeCCMBtn.addEventListener('click', computeColorCorrectionMatrix);
    }
    
    if (applyCCMBtn) {
        applyCCMBtn.addEventListener('click', applyColorCorrectionMatrix);
    }
    
    // Library controls
    const librarySearchBtn = document.getElementById('library-search-btn');
    const libraryImport = document.getElementById('library-import');
    const libraryExport = document.getElementById('library-export');
    
    if (librarySearchBtn) {
        librarySearchBtn.addEventListener('click', searchColorLibrary);
    }
    
    if (libraryImport) {
        libraryImport.addEventListener('change', handleLibraryImport);
    }
    
    if (libraryExport) {
        libraryExport.addEventListener('click', exportColorLibrary);
    }
}

/**
 * Setup Modal Controls
 */
function setupModalControls() {
    // Client profile modal
    const clientModal = document.getElementById('client-profile-modal');
    const clientModalClose = document.getElementById('client-modal-close');
    
    if (clientModalClose) {
        clientModalClose.addEventListener('click', () => {
            closeModal('client-profile-modal');
        });
    }
    
    // Click outside modal to close
    if (clientModal) {
        clientModal.addEventListener('click', (e) => {
            if (e.target === clientModal) {
                closeModal('client-profile-modal');
            }
        });
    }
}

/**
 * Setup Heatmap Integration
 */
function setupHeatmapIntegration() {
    const heatmapCanvas = document.getElementById('heatmap-canvas');
    
    if (heatmapCanvas && window.heatmapVisualization) {
        try {
            INTEGRATION_STATE.currentHeatmap = window.heatmapVisualization.createHeatmap(heatmapCanvas, {
                showLabels: true,
                colorScale: 'deltaE',
                tolerance: 2.0
            });
            
            // Listen for heatmap cell clicks
            heatmapCanvas.addEventListener('heatmapCellClick', (e) => {
                const cell = e.detail.cell;
                handleHeatmapCellClick(cell);
            });
            
        } catch (error) {
            console.error('Error setting up heatmap:', error);
        }
    }
}

/**
 * Setup Client Profile Integration
 */
function setupClientProfileIntegration() {
    if (!window.clientProfiles) return;
    
    // Profile selection dropdown
    const profileSelect = document.getElementById('client-profile-select');
    const newProfileBtn = document.getElementById('new-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile');
    const deleteProfileBtn = document.getElementById('delete-profile');
    
    if (profileSelect) {
        // Populate profiles
        populateClientProfiles();
        
        profileSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                window.clientProfiles.setActiveProfile(e.target.value);
                loadProfileIntoEditor(e.target.value);
            }
        });
    }
    
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', showProfileEditor);
    }
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveCurrentProfile);
    }
    
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', deleteCurrentProfile);
    }
}

/**
 * Setup ICC Profile Integration
 */
function setupICCProfileIntegration() {
    if (!window.iccProfileManager) return;
    
    const iccFileInput = document.getElementById('icc-file-input');
    const devicelinkCSV = document.getElementById('devicelink-csv');
    
    if (iccFileInput) {
        iccFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const result = await window.iccProfileManager.loadProfile(file);
                updateICCStatus(result);
            }
        });
    }
    
    if (devicelinkCSV) {
        devicelinkCSV.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const result = await window.iccProfileManager.loadDeviceLink(file);
                updateDeviceLinkStatus(result);
            }
        });
    }
    
    // Listen for ICC profile events
    window.addEventListener('iccProfileLoaded', (e) => {
        const profile = e.detail.profile;
        updateICCProfileDisplay(profile);
    });
}

/**
 * Setup Conversion Tools
 */
function setupConversionTools() {
    const convertBtn = document.getElementById('convert-colors');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', performColorConversion);
    }
}

/**
 * Setup Extended Gamut Controls
 */
function setupExtendedGamutControls() {
    // Monitor OGV inputs for TAC calculation
    const ogvInputs = ['target-o', 'target-g', 'target-v', 'sample-o', 'sample-g', 'sample-v'];
    
    ogvInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateTACDisplay);
        }
    });
    
    // Also monitor existing CMYK inputs
    const cmykInputs = ['target-c', 'target-m', 'target-y', 'target-k', 'sample-c', 'sample-m', 'sample-y', 'sample-k'];
    
    cmykInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateTACDisplay);
        }
    });
}

/**
 * Integrate with Existing Calculator
 */
function integrateWithExistingCalculator() {
    // Enhance existing calculate function
    const originalCalculateBtn = document.getElementById('calculate-btn');
    if (originalCalculateBtn) {
        originalCalculateBtn.addEventListener('click', enhancedCalculation);
    }
    
    // Listen for existing calculation events
    window.addEventListener('colorCalculationComplete', (e) => {
        const result = e.detail;
        updateHDFeatures(result);
    });
}

/**
 * Enhanced Calculation Function
 */
function enhancedCalculation() {
    try {
        // Get color values including OGV channels
        const targetCMYKOGV = getTargetCMYKOGV();
        const sampleCMYKOGV = getSampleCMYKOGV();
        const targetLAB = getTargetLAB();
        const sampleLAB = getSampleLAB();
        
        if (!targetLAB || !sampleLAB) {
            console.warn('LAB values not available for HD calculation');
            return;
        }
        
        // Enhanced Delta E calculation
        let deltaE = 0;
        if (window.hdColorEngine) {
            deltaE = window.hdColorEngine.calculateEnhancedDeltaE(targetLAB, sampleLAB, 'de2000');
        } else if (window.colorScience) {
            deltaE = window.colorScience.calculateDeltaE(targetLAB, sampleLAB);
        }
        
        // Generate HD suggestions
        if (window.hdColorEngine) {
            const suggestions = window.hdColorEngine.generateHDColorSuggestions(
                targetLAB, 
                sampleCMYKOGV, 
                sampleLAB,
                {
                    substrate: document.getElementById('substrate-select')?.value || 'hpw',
                    tolerance: parseFloat(document.getElementById('tolerance-input')?.value || 2.0),
                    includeExtendedGamut: hasExtendedGamutValues(targetCMYKOGV, sampleCMYKOGV)
                }
            );
            
            updateHDSuggestions(suggestions);
        }
        
        // Update displays
        updateDeltaEDisplay(deltaE);
        updateTACDisplay();
        
        // Trigger event for other components
        window.dispatchEvent(new CustomEvent('hdCalculationComplete', {
            detail: {
                targetCMYKOGV,
                sampleCMYKOGV,
                targetLAB,
                sampleLAB,
                deltaE
            }
        }));
        
    } catch (error) {
        console.error('Error in enhanced calculation:', error);
    }
}

/**
 * Utility Functions
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = section.style.display !== 'none';
        section.style.display = isVisible ? 'none' : 'block';
        
        if (sectionId === 'hd-features-section') {
            INTEGRATION_STATE.hdFeaturesVisible = !isVisible;
        } else if (sectionId === 'utilities-section') {
            INTEGRATION_STATE.utilitiesVisible = !isVisible;
        }
    }
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const isVisible = modal.style.display !== 'none';
        modal.style.display = isVisible ? 'none' : 'block';
        INTEGRATION_STATE.activeModal = isVisible ? null : modalId;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        INTEGRATION_STATE.activeModal = null;
    }
}

function getTargetCMYKOGV() {
    return {
        c: parseFloat(document.getElementById('target-c')?.value || 0),
        m: parseFloat(document.getElementById('target-m')?.value || 0),
        y: parseFloat(document.getElementById('target-y')?.value || 0),
        k: parseFloat(document.getElementById('target-k')?.value || 0),
        o: parseFloat(document.getElementById('target-o')?.value || 0),
        g: parseFloat(document.getElementById('target-g')?.value || 0),
        v: parseFloat(document.getElementById('target-v')?.value || 0)
    };
}

function getSampleCMYKOGV() {
    return {
        c: parseFloat(document.getElementById('sample-c')?.value || 0),
        m: parseFloat(document.getElementById('sample-m')?.value || 0),
        y: parseFloat(document.getElementById('sample-y')?.value || 0),
        k: parseFloat(document.getElementById('sample-k')?.value || 0),
        o: parseFloat(document.getElementById('sample-o')?.value || 0),
        g: parseFloat(document.getElementById('sample-g')?.value || 0),
        v: parseFloat(document.getElementById('sample-v')?.value || 0)
    };
}

function getTargetLAB() {
    const l = parseFloat(document.getElementById('target-l')?.value);
    const a = parseFloat(document.getElementById('target-a')?.value);
    const b = parseFloat(document.getElementById('target-b')?.value);
    
    if (isNaN(l) || isNaN(a) || isNaN(b)) return null;
    return { l, a, b };
}

function getSampleLAB() {
    const l = parseFloat(document.getElementById('sample-l')?.value);
    const a = parseFloat(document.getElementById('sample-a')?.value);
    const b = parseFloat(document.getElementById('sample-b')?.value);
    
    if (isNaN(l) || isNaN(a) || isNaN(b)) return null;
    return { l, a, b };
}

function hasExtendedGamutValues(targetCMYKOGV, sampleCMYKOGV) {
    return (targetCMYKOGV.o > 0 || targetCMYKOGV.g > 0 || targetCMYKOGV.v > 0) ||
           (sampleCMYKOGV.o > 0 || sampleCMYKOGV.g > 0 || sampleCMYKOGV.v > 0);
}

function updateTACDisplay() {
    const targetCMYKOGV = getTargetCMYKOGV();
    const sampleCMYKOGV = getSampleCMYKOGV();
    
    const targetTAC = Object.values(targetCMYKOGV).reduce((sum, val) => sum + val, 0);
    const sampleTAC = Object.values(sampleCMYKOGV).reduce((sum, val) => sum + val, 0);
    const maxTAC = Math.max(targetTAC, sampleTAC);
    
    const tacDisplay = document.getElementById('tac-value');
    if (tacDisplay) {
        tacDisplay.textContent = `${maxTAC.toFixed(1)}%`;
        tacDisplay.className = maxTAC > 400 ? 'tac-over-limit' : '';
    }
}

function updateDeltaEDisplay(deltaE) {
    const deltaEValue = document.getElementById('delta-e-value');
    if (deltaEValue) {
        const numberSpan = deltaEValue.querySelector('.delta-e-number');
        if (numberSpan) {
            numberSpan.textContent = deltaE.toFixed(2);
        }
    }
}

// Event handlers for specific HD features
function generateColorGrid() {
    console.log('Generate color grid clicked');
    // Implementation would go here
}

function clearColorGrid() {
    if (INTEGRATION_STATE.currentHeatmap) {
        INTEGRATION_STATE.currentHeatmap.clearHeatmap();
    }
}

function performAutoBalance() {
    console.log('Auto balance clicked');
    // Implementation would go here
}

function handleCSVImport(event) {
    const file = event.target.files[0];
    if (file && window.csvEnhanced) {
        window.csvEnhanced.importCSVWithStreaming(file)
            .then(result => {
                console.log('CSV import result:', result);
                if (result.success && INTEGRATION_STATE.currentHeatmap) {
                    // Update heatmap with imported data
                    INTEGRATION_STATE.currentHeatmap.updateData(result.data);
                }
            });
    }
}

function computeColorCorrectionMatrix() {
    console.log('Compute CCM clicked');
    // Implementation would go here
}

function applyColorCorrectionMatrix() {
    console.log('Apply CCM clicked');
    // Implementation would go here
}

function searchColorLibrary() {
    const query = document.getElementById('library-search-input')?.value;
    console.log('Search library for:', query);
    // Implementation would go here
}

function handleLibraryImport(event) {
    const file = event.target.files[0];
    if (file && window.csvEnhanced) {
        window.csvEnhanced.importColorLibrary(file)
            .then(result => {
                console.log('Library import result:', result);
            });
    }
}

function exportColorLibrary() {
    console.log('Export library clicked');
    // Implementation would go here
}

function performColorConversion() {
    console.log('Color conversion clicked');
    // Implementation would go here
}

function populateClientProfiles() {
    if (!window.clientProfiles) return;
    
    const profileSelect = document.getElementById('client-profile-select');
    if (profileSelect) {
        const profiles = window.clientProfiles.getAllProfiles();
        profileSelect.innerHTML = '<option value="">Select a profile...</option>';
        
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            profileSelect.appendChild(option);
        });
    }
    
    // Update current profile display if there's an active profile
    const currentProfile = window.clientProfiles.getCurrentProfile();
    if (currentProfile && profileSelect) {
        profileSelect.value = currentProfile.name;
    }
}

function showProfileEditor() {
    const editor = document.getElementById('profile-editor');
    if (editor) {
        editor.style.display = 'block';
    }
}

function loadProfileIntoEditor(profileName) {
    if (!window.clientProfiles) return;
    
    const profile = window.clientProfiles.getProfile(profileName);
    if (profile) {
        document.getElementById('profile-name').value = profile.name;
        document.getElementById('profile-tolerance').value = profile.settings.tolerance || 2.0;
        document.getElementById('profile-notes').value = profile.notes || '';
        document.getElementById('profile-contact').value = profile.contact?.email || '';
        
        showProfileEditor();
    }
}

function saveCurrentProfile() {
    // Delegate to the enhanced UI handler if available
    if (window.CLIENT_PROFILE_UI_STATE) {
        // The enhanced UI will handle this
        return;
    }
    
    // Fallback for basic functionality
    if (!window.clientProfiles) return;
    
    const name = document.getElementById('profile-name').value;
    const tolerance = parseFloat(document.getElementById('profile-tolerance').value);
    const notes = document.getElementById('profile-notes').value;
    const contact = document.getElementById('profile-contact').value;
    
    const profileData = {
        settings: { tolerance },
        notes,
        contact: { email: contact }
    };
    
    const result = window.clientProfiles.createProfile(name, profileData);
    console.log('Save profile result:', result);
    
    if (result.success) {
        populateClientProfiles();
        closeModal('client-profile-modal');
    }
}

function deleteCurrentProfile() {
    const profileName = document.getElementById('profile-name').value;
    if (profileName && confirm(`Delete profile "${profileName}"?`)) {
        const result = window.clientProfiles.deleteProfile(profileName);
        console.log('Delete profile result:', result);
        
        if (result.success) {
            populateClientProfiles();
            closeModal('client-profile-modal');
        }
    }
}

function updateICCStatus(result) {
    console.log('ICC profile load result:', result);
}

function updateDeviceLinkStatus(result) {
    console.log('DeviceLink load result:', result);
}

function updateICCProfileDisplay(profile) {
    const profileNameDisplay = document.getElementById('profile-name-display');
    if (profileNameDisplay) {
        profileNameDisplay.textContent = profile.filename || 'Loaded';
    }
}

function updateSOPForSubstrate(substrate) {
    console.log('Update SOP for substrate:', substrate);
    // Implementation would load SOP items for the substrate
}

function updateToleranceDisplay(tolerance) {
    console.log('Update tolerance display:', tolerance);
    // Implementation would update tolerance displays
}

function handleHeatmapCellClick(cell) {
    console.log('Heatmap cell clicked:', cell);
    // Implementation would handle cell editing
}

function updateHDFeatures(result) {
    console.log('Update HD features with result:', result);
    // Implementation would update HD-specific displays
}

function updateHDSuggestions(suggestions) {
    console.log('Update HD suggestions:', suggestions);
    // Implementation would populate HD suggestions display
}

// Initialize when ready
initializeHDIntegration();

console.log('HD Integration module loaded successfully');