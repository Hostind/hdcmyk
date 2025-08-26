// Client Profile and SOP Management System
// Professional workflow management for HD CMYK color matching
// Integrates with existing Print Calculator storage and UI systems

console.log('Client Profiles module loading...');

// Client Profile State Management
let PROFILE_STATE = {
    currentProfile: null,
    profiles: {},
    sops: {},
    activeSOPChecklist: {},
    settings: {
        autoSave: true,
        backupCount: 5,
        syncAcrossSessions: true
    }
};

/**
 * Client Profile Management Class
 * Handles creation, editing, and management of client-specific settings
 */
class ClientProfileManager {
    constructor() {
        this.storageKey = 'hd_client_profiles';
        this.sopStorageKey = 'hd_sops';
        this.backupPrefix = 'hd_profile_backup_';
        
        this.loadProfiles();
        this.loadSOPs();
        this.setupAutoSave();
    }
    
    /**
     * Load all client profiles from storage
     */
    loadProfiles() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            PROFILE_STATE.profiles = stored ? JSON.parse(stored) : {};
            
            // Load current profile if set
            const currentProfileName = localStorage.getItem('hd_current_profile');
            if (currentProfileName && PROFILE_STATE.profiles[currentProfileName]) {
                this.setActiveProfile(currentProfileName);
            }
            
            console.log(`Loaded ${Object.keys(PROFILE_STATE.profiles).length} client profiles`);
        } catch (error) {
            console.error('Error loading client profiles:', error);
            PROFILE_STATE.profiles = {};
        }
    }
    
    /**
     * Load all SOPs from storage
     */
    loadSOPs() {
        try {
            const stored = localStorage.getItem(this.sopStorageKey);
            PROFILE_STATE.sops = stored ? JSON.parse(stored) : {};
            
            console.log(`Loaded SOPs for ${Object.keys(PROFILE_STATE.sops).length} substrates`);
        } catch (error) {
            console.error('Error loading SOPs:', error);
            PROFILE_STATE.sops = {};
        }
    }
    
    /**
     * Create new client profile
     */
    createProfile(name, profileData) {
        try {
            if (!name || typeof name !== 'string') {
                throw new Error('Profile name is required and must be a string');
            }
            
            if (PROFILE_STATE.profiles[name]) {
                throw new Error(`Profile "${name}" already exists`);
            }
            
            const profile = {
                name: name,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                settings: {
                    tolerance: 2.0,
                    substrate: 'hpw',
                    illuminant: 'D50/2°',
                    deltaEMethod: 'de2000',
                    ...profileData.settings
                },
                colorTargets: profileData.colorTargets || {},
                approvedColors: profileData.approvedColors || [],
                notes: profileData.notes || '',
                contact: profileData.contact || {},
                workflow: profileData.workflow || {
                    requireApproval: false,
                    autoGenerateReports: true,
                    notificationEmail: ''
                }
            };
            
            PROFILE_STATE.profiles[name] = profile;
            this.saveProfiles();
            
            return {
                success: true,
                profile: profile,
                message: `Client profile "${name}" created successfully`
            };
            
        } catch (error) {
            console.error('Error creating client profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update existing client profile
     */
    updateProfile(name, updates) {
        try {
            if (!PROFILE_STATE.profiles[name]) {
                throw new Error(`Profile "${name}" not found`);
            }
            
            const profile = PROFILE_STATE.profiles[name];
            
            // Create backup before update
            this.createBackup(name, profile);
            
            // Apply updates
            PROFILE_STATE.profiles[name] = {
                ...profile,
                ...updates,
                name: name, // Preserve name
                created: profile.created, // Preserve creation date
                modified: new Date().toISOString()
            };
            
            this.saveProfiles();
            
            // If this is the active profile, update current settings
            if (PROFILE_STATE.currentProfile?.name === name) {
                this.setActiveProfile(name);
            }
            
            return {
                success: true,
                profile: PROFILE_STATE.profiles[name],
                message: `Client profile "${name}" updated successfully`
            };
            
        } catch (error) {
            console.error('Error updating client profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Delete client profile
     */
    deleteProfile(name) {
        try {
            if (!PROFILE_STATE.profiles[name]) {
                throw new Error(`Profile "${name}" not found`);
            }
            
            // Create backup before deletion
            this.createBackup(name, PROFILE_STATE.profiles[name]);
            
            delete PROFILE_STATE.profiles[name];
            this.saveProfiles();
            
            // Clear active profile if it was deleted
            if (PROFILE_STATE.currentProfile?.name === name) {
                PROFILE_STATE.currentProfile = null;
                localStorage.removeItem('hd_current_profile');
            }
            
            return {
                success: true,
                message: `Client profile "${name}" deleted successfully`
            };
            
        } catch (error) {
            console.error('Error deleting client profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Set active client profile
     */
    setActiveProfile(name) {
        try {
            if (!PROFILE_STATE.profiles[name]) {
                throw new Error(`Profile "${name}" not found`);
            }
            
            PROFILE_STATE.currentProfile = PROFILE_STATE.profiles[name];
            localStorage.setItem('hd_current_profile', name);
            
            // Apply profile settings to the application
            this.applyProfileSettings(PROFILE_STATE.currentProfile);
            
            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('profileChanged', {
                detail: { profile: PROFILE_STATE.currentProfile }
            }));
            
            return {
                success: true,
                profile: PROFILE_STATE.currentProfile,
                message: `Switched to profile "${name}"`
            };
            
        } catch (error) {
            console.error('Error setting active profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Apply profile settings to the application
     */
    applyProfileSettings(profile) {
        try {
            // Update tolerance setting
            const toleranceInput = document.getElementById('tolerance');
            if (toleranceInput && profile.settings.tolerance) {
                toleranceInput.value = profile.settings.tolerance;
            }
            
            // Update substrate setting
            const substrateSelect = document.getElementById('substrate');
            if (substrateSelect && profile.settings.substrate) {
                substrateSelect.value = profile.settings.substrate;
            }
            
            // Update illuminant setting
            const illuminantSelect = document.getElementById('illuminant');
            if (illuminantSelect && profile.settings.illuminant) {
                illuminantSelect.value = profile.settings.illuminant;
            }
            
            // Apply any custom settings through HD Color Engine
            if (window.hdColorEngine) {
                window.hdColorEngine.setState({
                    activeSubstrate: profile.settings.substrate,
                    tolerance: profile.settings.tolerance
                });
            }
            
            console.log(`Applied settings for profile "${profile.name}"`);
            
        } catch (error) {
            console.error('Error applying profile settings:', error);
        }
    }
    
    /**
     * Get all client profiles
     */
    getAllProfiles() {
        return Object.values(PROFILE_STATE.profiles);
    }
    
    /**
     * Get specific client profile
     */
    getProfile(name) {
        return PROFILE_STATE.profiles[name] || null;
    }
    
    /**
     * Get current active profile
     */
    getCurrentProfile() {
        return PROFILE_STATE.currentProfile;
    }
    
    /**
     * Save profiles to storage
     */
    saveProfiles() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(PROFILE_STATE.profiles));
        } catch (error) {
            console.error('Error saving client profiles:', error);
        }
    }
    
    /**
     * Create backup of profile before major changes
     */
    createBackup(profileName, profileData) {
        try {
            const backupKey = `${this.backupPrefix}${profileName}_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(profileData));
            
            // Clean up old backups (keep only last 5)
            this.cleanupBackups(profileName);
            
        } catch (error) {
            console.warn('Failed to create profile backup:', error);
        }
    }
    
    /**
     * Clean up old backups
     */
    cleanupBackups(profileName) {
        try {
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith(`${this.backupPrefix}${profileName}_`))
                .sort((a, b) => {
                    const timestampA = parseInt(a.split('_').pop());
                    const timestampB = parseInt(b.split('_').pop());
                    return timestampB - timestampA; // Sort newest first
                });
            
            // Remove old backups beyond the limit
            if (backupKeys.length > PROFILE_STATE.settings.backupCount) {
                backupKeys.slice(PROFILE_STATE.settings.backupCount).forEach(key => {
                    localStorage.removeItem(key);
                });
            }
            
        } catch (error) {
            console.warn('Failed to cleanup profile backups:', error);
        }
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (PROFILE_STATE.settings.autoSave) {
            // Save profiles when window is about to close
            window.addEventListener('beforeunload', () => {
                this.saveProfiles();
                this.saveSOPs();
            });
            
            // Periodic auto-save every 5 minutes
            setInterval(() => {
                if (PROFILE_STATE.currentProfile) {
                    this.saveProfiles();
                }
            }, 5 * 60 * 1000);
        }
    }
    
    /**
     * Export profile to JSON
     */
    exportProfile(name) {
        try {
            const profile = PROFILE_STATE.profiles[name];
            if (!profile) {
                throw new Error(`Profile "${name}" not found`);
            }
            
            const exportData = {
                profile: profile,
                exportDate: new Date().toISOString(),
                exportVersion: '1.0',
                source: 'HD CMYK Color Calculator'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_profile.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: `Profile "${name}" exported successfully`
            };
            
        } catch (error) {
            console.error('Error exporting profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Import profile from JSON
     */
    importProfile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (!importData.profile) {
                        throw new Error('Invalid profile file format');
                    }
                    
                    const profile = importData.profile;
                    const profileName = profile.name;
                    
                    // Check if profile already exists
                    if (PROFILE_STATE.profiles[profileName]) {
                        const confirmOverwrite = confirm(
                            `Profile "${profileName}" already exists. Do you want to overwrite it?`
                        );
                        if (!confirmOverwrite) {
                            resolve({
                                success: false,
                                error: 'Import cancelled by user'
                            });
                            return;
                        }
                    }
                    
                    // Import the profile
                    profile.imported = new Date().toISOString();
                    PROFILE_STATE.profiles[profileName] = profile;
                    this.saveProfiles();
                    
                    resolve({
                        success: true,
                        profile: profile,
                        message: `Profile "${profileName}" imported successfully`
                    });
                    
                } catch (error) {
                    resolve({
                        success: false,
                        error: error.message
                    });
                }
            };
            
            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Failed to read profile file'
                });
            };
            
            reader.readAsText(file);
        });
    }
}

/**
 * Standard Operating Procedure (SOP) Management Class
 * Manages substrate-specific checklists and procedures
 */
class SOPManager {
    constructor(profileManager) {
        this.profileManager = profileManager;
        this.initializeDefaultSOPs();
    }
    
    /**
     * Initialize default SOPs for all substrates
     */
    initializeDefaultSOPs() {
        const defaultSOPs = {
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
        };
        
        // Only set defaults if no SOPs exist
        Object.keys(defaultSOPs).forEach(substrate => {
            if (!PROFILE_STATE.sops[substrate]) {
                PROFILE_STATE.sops[substrate] = {
                    items: defaultSOPs[substrate],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    isDefault: true
                };
            }
        });
    }
    
    /**
     * Get SOP for substrate
     */
    getSOP(substrate) {
        return PROFILE_STATE.sops[substrate] || null;
    }
    
    /**
     * Update SOP for substrate
     */
    updateSOP(substrate, items, metadata = {}) {
        try {
            PROFILE_STATE.sops[substrate] = {
                items: items,
                created: PROFILE_STATE.sops[substrate]?.created || new Date().toISOString(),
                modified: new Date().toISOString(),
                isDefault: false,
                ...metadata
            };
            
            this.saveSOPs();
            
            return {
                success: true,
                message: `SOP for ${substrate} updated successfully`
            };
            
        } catch (error) {
            console.error('Error updating SOP:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Save SOPs to storage
     */
    saveSOPs() {
        try {
            localStorage.setItem(this.profileManager.sopStorageKey, JSON.stringify(PROFILE_STATE.sops));
        } catch (error) {
            console.error('Error saving SOPs:', error);
        }
    }
    
    /**
     * Get checklist state for current session
     */
    getChecklistState(substrate) {
        const sessionKey = `sop_checklist_${substrate}_${Date.now()}`;
        const stored = sessionStorage.getItem(sessionKey);
        return stored ? JSON.parse(stored) : {};
    }
    
    /**
     * Save checklist state for current session
     */
    saveChecklistState(substrate, checklistState) {
        try {
            const sessionKey = `sop_checklist_${substrate}`;
            sessionStorage.setItem(sessionKey, JSON.stringify({
                state: checklistState,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving checklist state:', error);
        }
    }
    
    /**
     * Generate SOP completion report
     */
    generateCompletionReport(substrate, checklistState) {
        try {
            const sop = this.getSOP(substrate);
            if (!sop) {
                throw new Error(`SOP for ${substrate} not found`);
            }
            
            const report = {
                substrate: substrate,
                timestamp: new Date().toISOString(),
                operator: PROFILE_STATE.currentProfile?.contact?.name || 'Unknown',
                client: PROFILE_STATE.currentProfile?.name || 'Default',
                totalItems: sop.items.length,
                completedItems: 0,
                items: []
            };
            
            sop.items.forEach((item, index) => {
                const completed = checklistState[index] || false;
                if (completed) report.completedItems++;
                
                report.items.push({
                    index: index + 1,
                    description: item,
                    completed: completed,
                    timestamp: completed ? new Date().toISOString() : null
                });
            });
            
            report.completionPercentage = Math.round((report.completedItems / report.totalItems) * 100);
            
            return {
                success: true,
                report: report
            };
            
        } catch (error) {
            console.error('Error generating completion report:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize managers
const clientProfileManager = new ClientProfileManager();
const sopManager = new SOPManager(clientProfileManager);

// Export client profile and SOP functionality
window.clientProfiles = {
    // Profile management
    manager: clientProfileManager,
    createProfile: clientProfileManager.createProfile.bind(clientProfileManager),
    updateProfile: clientProfileManager.updateProfile.bind(clientProfileManager),
    deleteProfile: clientProfileManager.deleteProfile.bind(clientProfileManager),
    setActiveProfile: clientProfileManager.setActiveProfile.bind(clientProfileManager),
    getAllProfiles: clientProfileManager.getAllProfiles.bind(clientProfileManager),
    getProfile: clientProfileManager.getProfile.bind(clientProfileManager),
    getCurrentProfile: clientProfileManager.getCurrentProfile.bind(clientProfileManager),
    exportProfile: clientProfileManager.exportProfile.bind(clientProfileManager),
    importProfile: clientProfileManager.importProfile.bind(clientProfileManager),
    
    // SOP management
    sop: sopManager,
    getSOP: sopManager.getSOP.bind(sopManager),
    updateSOP: sopManager.updateSOP.bind(sopManager),
    getChecklistState: sopManager.getChecklistState.bind(sopManager),
    saveChecklistState: sopManager.saveChecklistState.bind(sopManager),
    generateCompletionReport: sopManager.generateCompletionReport.bind(sopManager),
    
    // State access
    getState: () => PROFILE_STATE,
    
    // Utility functions
    validateProfileData: (data) => {
        return data.name && typeof data.name === 'string' && data.settings;
    }
};

// Integrate with existing storage module if available
if (window.colorStorage) {
    window.colorStorage.profiles = window.clientProfiles;
    console.log('Client profiles integrated with existing storage module');
}

console.log('Client Profiles module loaded successfully');