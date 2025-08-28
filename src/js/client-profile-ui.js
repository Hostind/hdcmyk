// Client Profile UI Management
// Handles the enhanced client profile and SOP management interface

console.log('Client Profile UI module loading...');

// UI State Management
let CLIENT_PROFILE_UI_STATE = {
    activeTab: 'basic',
    currentProfile: null,
    currentSOPSubstrate: 'hpw',
    sopChecklistState: {},
    isEditing: false
};

/**
 * Initialize Client Profile UI
 */
function initializeClientProfileUI() {
    try {
        setupTabNavigation();
        setupProfileManagement();
        setupSOPManagement();
        setupImportExport();
        setupEventListeners();
        
        console.log('Client Profile UI initialized successfully');
    } catch (error) {
        console.error('Error initializing Client Profile UI:', error);
    }
}

/**
 * Setup Tab Navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    CLIENT_PROFILE_UI_STATE.activeTab = tabName;
    
    // Load tab-specific data
    if (tabName === 'sop') {
        loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
    }
}

/**
 * Setup Profile Management
 */
function setupProfileManagement() {
    // Profile selection
    const profileSelect = document.getElementById('client-profile-select');
    if (profileSelect) {
        profileSelect.addEventListener('change', handleProfileSelection);
    }
    
    // Profile actions
    const newProfileBtn = document.getElementById('new-profile-btn');
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', createNewProfile);
    }
    
    const saveProfileBtn = document.getElementById('save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveCurrentProfile);
    }
    
    const cancelEditBtn = document.getElementById('cancel-profile-edit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelProfileEdit);
    }
    
    const deleteProfileBtn = document.getElementById('delete-profile');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', deleteCurrentProfile);
    }
    
    // Load existing profiles
    populateProfileSelect();
}

/**
 * Setup SOP Management
 */
function setupSOPManagement() {
    // SOP substrate selection
    const sopSubstrateSelect = document.getElementById('sop-substrate-select');
    if (sopSubstrateSelect) {
        sopSubstrateSelect.addEventListener('change', (e) => {
            CLIENT_PROFILE_UI_STATE.currentSOPSubstrate = e.target.value;
            loadSOPForSubstrate(e.target.value);
        });
    }
    
    // SOP actions
    const loadDefaultSOPBtn = document.getElementById('load-default-sop');
    if (loadDefaultSOPBtn) {
        loadDefaultSOPBtn.addEventListener('click', loadDefaultSOP);
    }
    
    const addSOPItemBtn = document.getElementById('add-sop-item');
    if (addSOPItemBtn) {
        addSOPItemBtn.addEventListener('click', addNewSOPItem);
    }
    
    const resetChecklistBtn = document.getElementById('reset-sop-checklist');
    if (resetChecklistBtn) {
        resetChecklistBtn.addEventListener('click', resetSOPChecklist);
    }
    
    const saveSOPBtn = document.getElementById('save-sop');
    if (saveSOPBtn) {
        saveSOPBtn.addEventListener('click', saveCurrentSOP);
    }
}

/**
 * Setup Import/Export functionality
 */
function setupImportExport() {
    const importBtn = document.getElementById('import-profile-btn');
    const exportBtn = document.getElementById('export-profile-btn');
    const fileInput = document.getElementById('profile-import-input');
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleProfileImport);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCurrentProfile);
    }
}

/**
 * Setup additional event listeners
 */
function setupEventListeners() {
    // Listen for profile changes from other parts of the application
    window.addEventListener('profileChanged', (e) => {
        updateCurrentProfileDisplay(e.detail.profile);
    });
    
    // Auto-save functionality
    const autoSaveInputs = [
        'profile-name', 'profile-tolerance', 'profile-delta-method',
        'profile-notes', 'profile-substrate', 'profile-illuminant'
    ];
    
    autoSaveInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(autoSaveProfile, 1000));
        }
    });
}

/**
 * Handle profile selection
 */
function handleProfileSelection(e) {
    const profileName = e.target.value;
    
    if (profileName) {
        loadProfileIntoEditor(profileName);
        CLIENT_PROFILE_UI_STATE.currentProfile = profileName;
        
        // Enable export button
        const exportBtn = document.getElementById('export-profile-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
        }
        
        // Show current profile status
        showCurrentProfileStatus(profileName);
    } else {
        clearProfileEditor();
        CLIENT_PROFILE_UI_STATE.currentProfile = null;
        
        // Disable export button
        const exportBtn = document.getElementById('export-profile-btn');
        if (exportBtn) {
            exportBtn.disabled = true;
        }
        
        hideCurrentProfileStatus();
    }
}

/**
 * Populate profile selection dropdown
 */
function populateProfileSelect() {
    if (!window.clientProfiles) return;
    
    const profileSelect = document.getElementById('client-profile-select');
    if (!profileSelect) return;
    
    const profiles = window.clientProfiles.getAllProfiles();
    profileSelect.innerHTML = '<option value="">Select a profile...</option>';
    
    profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.name;
        option.textContent = profile.name;
        profileSelect.appendChild(option);
    });
}

/**
 * Create new profile
 */
function createNewProfile() {
    clearProfileEditor();
    showProfileEditor();
    CLIENT_PROFILE_UI_STATE.isEditing = true;
    
    // Focus on profile name input
    const nameInput = document.getElementById('profile-name');
    if (nameInput) {
        nameInput.focus();
    }
}

/**
 * Load profile into editor
 */
function loadProfileIntoEditor(profileName) {
    if (!window.clientProfiles) return;
    
    const profile = window.clientProfiles.getProfile(profileName);
    if (!profile) return;
    
    // Basic settings
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-tolerance').value = profile.settings?.tolerance || 2.0;
    document.getElementById('profile-delta-method').value = profile.settings?.deltaEMethod || 'de2000';
    document.getElementById('profile-notes').value = profile.notes || '';
    
    // Preferences
    document.getElementById('profile-substrate').value = profile.settings?.substrate || 'hpw';
    document.getElementById('profile-illuminant').value = profile.settings?.illuminant || 'D50/2°';
    document.getElementById('profile-auto-apply').checked = profile.settings?.autoApply !== false;
    
    // Approved substrates
    const approvedSubstrates = profile.preferences?.approvedSubstrates || ['hpw'];
    ['hpw', 'inver', 'gsm250', 'foil'].forEach(substrate => {
        const checkbox = document.getElementById(`substrate-${substrate}`);
        if (checkbox) {
            checkbox.checked = approvedSubstrates.includes(substrate);
        }
    });
    
    // Workflow settings
    const workflow = profile.preferences?.workflow || {};
    document.getElementById('require-approval').checked = workflow.requireApproval || false;
    document.getElementById('auto-generate-reports').checked = workflow.autoGenerateReports !== false;
    document.getElementById('enable-notifications').checked = workflow.enableNotifications || false;
    
    // Contact information
    const contact = profile.contact || {};
    document.getElementById('contact-name').value = contact.name || '';
    document.getElementById('contact-email').value = contact.email || '';
    document.getElementById('contact-phone').value = contact.phone || '';
    document.getElementById('contact-company').value = contact.company || '';
    document.getElementById('contact-address').value = contact.address || '';
    document.getElementById('contact-notes').value = contact.notes || '';
    
    showProfileEditor();
    CLIENT_PROFILE_UI_STATE.isEditing = true;
    CLIENT_PROFILE_UI_STATE.currentProfile = profileName;
}

/**
 * Save current profile
 */
function saveCurrentProfile() {
    if (!window.clientProfiles) return;
    
    const profileData = collectProfileData();
    if (!profileData) return;
    
    const profileName = profileData.name;
    const existingProfile = window.clientProfiles.getProfile(profileName);
    
    let result;
    if (existingProfile) {
        // Update existing profile
        result = window.clientProfiles.updateProfile(profileName, profileData);
    } else {
        // Create new profile
        result = window.clientProfiles.createProfile(profileName, profileData);
    }
    
    if (result.success) {
        showNotification('Profile saved successfully', 'success');
        populateProfileSelect();
        
        // Update selection
        const profileSelect = document.getElementById('client-profile-select');
        if (profileSelect) {
            profileSelect.value = profileName;
        }
        
        CLIENT_PROFILE_UI_STATE.currentProfile = profileName;
        showCurrentProfileStatus(profileName);
    } else {
        showNotification(`Error saving profile: ${result.error}`, 'error');
    }
}

/**
 * Collect profile data from form
 */
function collectProfileData() {
    const name = document.getElementById('profile-name').value.trim();
    if (!name) {
        showNotification('Profile name is required', 'error');
        return null;
    }
    
    // Collect approved substrates
    const approvedSubstrates = [];
    ['hpw', 'inver', 'gsm250', 'foil'].forEach(substrate => {
        const checkbox = document.getElementById(`substrate-${substrate}`);
        if (checkbox && checkbox.checked) {
            approvedSubstrates.push(substrate);
        }
    });
    
    return {
        name: name,
        settings: {
            tolerance: parseFloat(document.getElementById('profile-tolerance').value) || 2.0,
            deltaEMethod: document.getElementById('profile-delta-method').value || 'de2000',
            substrate: document.getElementById('profile-substrate').value || 'hpw',
            illuminant: document.getElementById('profile-illuminant').value || 'D50/2°',
            autoApply: document.getElementById('profile-auto-apply').checked
        },
        preferences: {
            approvedSubstrates: approvedSubstrates,
            workflow: {
                requireApproval: document.getElementById('require-approval').checked,
                autoGenerateReports: document.getElementById('auto-generate-reports').checked,
                enableNotifications: document.getElementById('enable-notifications').checked
            }
        },
        notes: document.getElementById('profile-notes').value || '',
        contact: {
            name: document.getElementById('contact-name').value || '',
            email: document.getElementById('contact-email').value || '',
            phone: document.getElementById('contact-phone').value || '',
            company: document.getElementById('contact-company').value || '',
            address: document.getElementById('contact-address').value || '',
            notes: document.getElementById('contact-notes').value || ''
        }
    };
}

/**
 * Cancel profile editing
 */
function cancelProfileEdit() {
    if (CLIENT_PROFILE_UI_STATE.currentProfile) {
        loadProfileIntoEditor(CLIENT_PROFILE_UI_STATE.currentProfile);
    } else {
        clearProfileEditor();
        hideProfileEditor();
    }
    CLIENT_PROFILE_UI_STATE.isEditing = false;
}

/**
 * Delete current profile
 */
function deleteCurrentProfile() {
    const profileName = CLIENT_PROFILE_UI_STATE.currentProfile;
    if (!profileName) return;
    
    if (confirm(`Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`)) {
        const result = window.clientProfiles.deleteProfile(profileName);
        
        if (result.success) {
            showNotification('Profile deleted successfully', 'success');
            populateProfileSelect();
            clearProfileEditor();
            hideProfileEditor();
            hideCurrentProfileStatus();
            CLIENT_PROFILE_UI_STATE.currentProfile = null;
        } else {
            showNotification(`Error deleting profile: ${result.error}`, 'error');
        }
    }
}

/**
 * Load SOP for substrate
 */
function loadSOPForSubstrate(substrate) {
    if (!window.clientProfiles) return;
    
    const sop = window.clientProfiles.getSOP(substrate);
    if (!sop) return;
    
    const checklistContainer = document.getElementById('sop-checklist');
    if (!checklistContainer) return;
    
    // Load checklist state
    const profileName = CLIENT_PROFILE_UI_STATE.currentProfile;
    CLIENT_PROFILE_UI_STATE.sopChecklistState = window.clientProfiles.getChecklistState(substrate, profileName);
    
    // Render SOP items
    renderSOPChecklist(sop.items, substrate);
    updateSOPProgress();
}

/**
 * Render SOP checklist
 */
function renderSOPChecklist(items, substrate) {
    const checklistContainer = document.getElementById('sop-checklist');
    if (!checklistContainer) return;
    
    checklistContainer.innerHTML = '';
    
    items.forEach((item, index) => {
        const sopItem = document.createElement('div');
        sopItem.className = 'sop-item';
        sopItem.innerHTML = `
            <input type="checkbox" class="sop-checkbox" data-index="${index}" 
                   ${CLIENT_PROFILE_UI_STATE.sopChecklistState[index] ? 'checked' : ''}>
            <span class="sop-text ${CLIENT_PROFILE_UI_STATE.sopChecklistState[index] ? 'completed' : ''}">${item}</span>
            <div class="sop-item-actions">
                <button class="sop-item-btn" onclick="editSOPItem(${index})" title="Edit item">✏️</button>
                <button class="sop-item-btn" onclick="removeSOPItem(${index})" title="Remove item">🗑️</button>
            </div>
        `;
        
        // Add checkbox event listener
        const checkbox = sopItem.querySelector('.sop-checkbox');
        checkbox.addEventListener('change', (e) => {
            handleSOPCheckboxChange(index, e.target.checked);
        });
        
        checklistContainer.appendChild(sopItem);
    });
}

/**
 * Handle SOP checkbox change
 */
function handleSOPCheckboxChange(index, checked) {
    CLIENT_PROFILE_UI_STATE.sopChecklistState[index] = checked;
    
    // Update visual state
    const sopText = document.querySelector(`[data-index="${index}"]`).nextElementSibling;
    if (sopText) {
        sopText.classList.toggle('completed', checked);
    }
    
    // Save state
    const profileName = CLIENT_PROFILE_UI_STATE.currentProfile;
    window.clientProfiles.saveChecklistState(
        CLIENT_PROFILE_UI_STATE.currentSOPSubstrate, 
        CLIENT_PROFILE_UI_STATE.sopChecklistState, 
        profileName
    );
    
    updateSOPProgress();
}

/**
 * Update SOP progress display
 */
function updateSOPProgress() {
    const progressText = document.getElementById('sop-progress-text');
    const progressFill = document.getElementById('sop-progress-fill');
    
    if (!progressText || !progressFill) return;
    
    const totalItems = Object.keys(CLIENT_PROFILE_UI_STATE.sopChecklistState).length;
    const completedItems = Object.values(CLIENT_PROFILE_UI_STATE.sopChecklistState).filter(Boolean).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    progressText.textContent = `${completedItems} of ${totalItems} completed`;
    progressFill.style.width = `${percentage}%`;
}

/**
 * Add new SOP item
 */
function addNewSOPItem() {
    const newItemText = prompt('Enter new SOP item:');
    if (!newItemText || !newItemText.trim()) return;
    
    const result = window.clientProfiles.addSOPItem(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate, newItemText.trim());
    
    if (result.success) {
        loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
        showNotification('SOP item added successfully', 'success');
    } else {
        showNotification(`Error adding SOP item: ${result.error}`, 'error');
    }
}

/**
 * Edit SOP item
 */
function editSOPItem(index) {
    const sop = window.clientProfiles.getSOP(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
    if (!sop || !sop.items[index]) return;
    
    const currentText = sop.items[index];
    const newText = prompt('Edit SOP item:', currentText);
    
    if (newText !== null && newText.trim() !== currentText) {
        const result = window.clientProfiles.editSOPItem(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate, index, newText.trim());
        
        if (result.success) {
            loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
            showNotification('SOP item updated successfully', 'success');
        } else {
            showNotification(`Error updating SOP item: ${result.error}`, 'error');
        }
    }
}

/**
 * Remove SOP item
 */
function removeSOPItem(index) {
    if (confirm('Are you sure you want to remove this SOP item?')) {
        const result = window.clientProfiles.removeSOPItem(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate, index);
        
        if (result.success) {
            loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
            showNotification('SOP item removed successfully', 'success');
        } else {
            showNotification(`Error removing SOP item: ${result.error}`, 'error');
        }
    }
}

/**
 * Reset SOP checklist
 */
function resetSOPChecklist() {
    if (confirm('Are you sure you want to reset the SOP checklist? All progress will be lost.')) {
        const profileName = CLIENT_PROFILE_UI_STATE.currentProfile;
        window.clientProfiles.resetChecklistState(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate, profileName);
        CLIENT_PROFILE_UI_STATE.sopChecklistState = {};
        loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
        showNotification('SOP checklist reset successfully', 'success');
    }
}

/**
 * Load default SOP
 */
function loadDefaultSOP() {
    if (confirm('Load default SOP for this substrate? This will replace any custom items.')) {
        // This would reset to default SOP items
        loadSOPForSubstrate(CLIENT_PROFILE_UI_STATE.currentSOPSubstrate);
        showNotification('Default SOP loaded successfully', 'success');
    }
}

/**
 * Save current SOP
 */
function saveCurrentSOP() {
    showNotification('SOP saved successfully', 'success');
}

/**
 * Handle profile import
 */
function handleProfileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    window.clientProfiles.importProfile(file).then(result => {
        if (result.success) {
            showNotification(`Profile "${result.profile.name}" imported successfully`, 'success');
            populateProfileSelect();
        } else {
            showNotification(`Error importing profile: ${result.error}`, 'error');
        }
    });
    
    // Clear file input
    e.target.value = '';
}

/**
 * Export current profile
 */
function exportCurrentProfile() {
    const profileName = CLIENT_PROFILE_UI_STATE.currentProfile;
    if (!profileName) return;
    
    const result = window.clientProfiles.exportProfile(profileName);
    
    if (result.success) {
        showNotification('Profile exported successfully', 'success');
    } else {
        showNotification(`Error exporting profile: ${result.error}`, 'error');
    }
}

/**
 * Utility functions
 */
function showProfileEditor() {
    const editor = document.getElementById('profile-editor');
    if (editor) {
        editor.style.display = 'block';
    }
}

function hideProfileEditor() {
    const editor = document.getElementById('profile-editor');
    if (editor) {
        editor.style.display = 'none';
    }
}

function clearProfileEditor() {
    const inputs = document.querySelectorAll('#profile-editor input, #profile-editor select, #profile-editor textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset to defaults
    document.getElementById('profile-tolerance').value = '2.0';
    document.getElementById('profile-delta-method').value = 'de2000';
    document.getElementById('profile-substrate').value = 'hpw';
    document.getElementById('profile-illuminant').value = 'D50/2°';
    document.getElementById('profile-auto-apply').checked = true;
    document.getElementById('substrate-hpw').checked = true;
}

function showCurrentProfileStatus(profileName) {
    const statusDiv = document.getElementById('current-profile-status');
    const infoDiv = document.getElementById('active-profile-info');
    
    if (!statusDiv || !infoDiv) return;
    
    const profile = window.clientProfiles.getProfile(profileName);
    if (!profile) return;
    
    infoDiv.innerHTML = `
        <div class="profile-info-item">
            <div class="profile-info-label">Profile Name</div>
            <div class="profile-info-value">${profile.name}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Tolerance</div>
            <div class="profile-info-value">ΔE ${profile.settings?.tolerance || 2.0}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Substrate</div>
            <div class="profile-info-value">${profile.settings?.substrate || 'hpw'}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Contact</div>
            <div class="profile-info-value">${profile.contact?.email || 'Not specified'}</div>
        </div>
    `;
    
    statusDiv.style.display = 'block';
}

function hideCurrentProfileStatus() {
    const statusDiv = document.getElementById('current-profile-status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

function updateCurrentProfileDisplay(profile) {
    if (profile) {
        showCurrentProfileStatus(profile.name);
    } else {
        hideCurrentProfileStatus();
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        default:
            notification.style.background = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function autoSaveProfile() {
    if (CLIENT_PROFILE_UI_STATE.isEditing && CLIENT_PROFILE_UI_STATE.currentProfile) {
        // Auto-save logic could go here
        console.log('Auto-saving profile...');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available for onclick handlers
window.editSOPItem = editSOPItem;
window.removeSOPItem = removeSOPItem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeClientProfileUI);
} else {
    initializeClientProfileUI();
}

console.log('Client Profile UI module loaded successfully');