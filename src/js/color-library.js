// Brand Color Library Management System
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5

class ColorLibraryManager {
    constructor() {
        this.library = [];
        this.filteredLibrary = [];
        this.currentFilter = '';
        this.currentSubstrate = 'all';
        this.storageKey = 'hd-cmyk-color-library';
        
        this.init();
    }

    init() {
        console.log('Initializing Color Library Manager...');
        this.loadLibraryFromStorage();
        this.setupEventListeners();
        this.renderLibraryInterface();
        
        // Load demo library if no library exists
        if (this.library.length === 0) {
            this.loadDemoLibrary();
        }
        
        console.log('Color Library Manager initialized');
    }

    // Load library from localStorage
    loadLibraryFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.library = JSON.parse(stored);
                this.filteredLibrary = [...this.library];
                console.log(`Loaded ${this.library.length} colors from storage`);
            }
        } catch (error) {
            console.error('Error loading library from storage:', error);
            this.library = [];
            this.filteredLibrary = [];
        }
    }

    // Save library to localStorage
    saveLibraryToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.library));
            console.log(`Saved ${this.library.length} colors to storage`);
        } catch (error) {
            console.error('Error saving library to storage:', error);
        }
    }

    // Load demo library with Pantone colors
    loadDemoLibrary() {
        console.log('Loading demo library...');
        
        // Use comprehensive Pantone data if available, otherwise fallback to basic set
        let demoColors = [];
        
        if (window.PANTONE_LIBRARY_DATA) {
            demoColors = [...window.PANTONE_LIBRARY_DATA];
            console.log('Using comprehensive Pantone library data');
        } else {
            // Fallback basic set
            demoColors = [
                // Process Colors
                { code: 'Process Cyan', name: 'Process Cyan', L: 55, a: -37, b: -50, substrate: 'Coated', notes: 'Standard process cyan' },
                { code: 'Process Magenta', name: 'Process Magenta', L: 48, a: 74, b: -3, substrate: 'Coated', notes: 'Standard process magenta' },
                { code: 'Process Yellow', name: 'Process Yellow', L: 89, a: -5, b: 93, substrate: 'Coated', notes: 'Standard process yellow' },
                { code: 'Process Black', name: 'Process Black', L: 16, a: 0, b: 0, substrate: 'Coated', notes: 'Standard process black' },
                
                // Popular Pantone Colors
                { code: 'PANTONE Red 032 PC', name: 'Pantone Red 032', L: 48, a: 74, b: 48, substrate: 'Coated', notes: 'Classic red' },
                { code: 'PANTONE Blue 072 PC', name: 'Pantone Blue 072', L: 25, a: 25, b: -65, substrate: 'Coated', notes: 'Classic blue' },
                { code: 'PANTONE Green PC', name: 'Pantone Green', L: 56, a: -50, b: 45, substrate: 'Coated', notes: 'Classic green' },
                { code: 'PANTONE Or. 021 PC', name: 'Pantone Orange 021', L: 65, a: 55, b: 75, substrate: 'Coated', notes: 'Vibrant orange' },
                { code: 'PANTONE Purple PC', name: 'Pantone Purple', L: 35, a: 65, b: -45, substrate: 'Coated', notes: 'Deep purple' },
                { code: 'PANTONE Yellow PC', name: 'Pantone Yellow', L: 89, a: -5, b: 93, substrate: 'Coated', notes: 'Pure yellow' },
                
                // Brand Colors (Generic examples)
                { code: 'CORP-BLUE-001', name: 'Corporate Blue', L: 35, a: 15, b: -45, substrate: 'Coated', notes: 'Primary brand blue' },
                { code: 'CORP-RED-001', name: 'Corporate Red', L: 45, a: 65, b: 45, substrate: 'Coated', notes: 'Primary brand red' },
                { code: 'CORP-GREEN-001', name: 'Corporate Green', L: 45, a: -35, b: 35, substrate: 'Coated', notes: 'Primary brand green' },
                { code: 'CORP-GRAY-001', name: 'Corporate Gray', L: 50, a: 0, b: 0, substrate: 'Coated', notes: 'Neutral gray' }
            ];
            console.log('Using fallback basic library data');
        }

        this.library = demoColors;
        this.filteredLibrary = [...this.library];
        this.saveLibraryToStorage();
        this.renderLibrary();
        
        console.log(`Demo library loaded with ${demoColors.length} colors`);
    }

    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('library-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter = e.target.value.toLowerCase();
                this.filterLibrary();
            });
        }

        // Substrate filter
        const substrateFilter = document.getElementById('library-substrate-filter');
        if (substrateFilter) {
            substrateFilter.addEventListener('change', (e) => {
                this.currentSubstrate = e.target.value;
                this.filterLibrary();
            });
        }

        // Import/Export buttons
        const importBtn = document.getElementById('library-import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportDialog());
        }

        const exportBtn = document.getElementById('library-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLibrary());
        }

        // Add color button
        const addBtn = document.getElementById('library-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddColorDialog());
        }
    }

    // Filter library based on search and substrate
    filterLibrary() {
        this.filteredLibrary = this.library.filter(color => {
            const matchesSearch = !this.currentFilter || 
                color.name.toLowerCase().includes(this.currentFilter) ||
                color.code.toLowerCase().includes(this.currentFilter);
            
            const matchesSubstrate = this.currentSubstrate === 'all' || 
                color.substrate.toLowerCase() === this.currentSubstrate.toLowerCase();
            
            return matchesSearch && matchesSubstrate;
        });

        this.renderLibrary();
    }

    // Render the library interface
    renderLibraryInterface() {
        const container = document.getElementById('color-library-container');
        if (!container) return;

        container.innerHTML = `
            <div class="library-header">
                <h3>Brand Color Library</h3>
                <div class="library-controls">
                    <button id="library-import-btn" class="library-btn library-btn-secondary">
                        📁 Import
                    </button>
                    <button id="library-export-btn" class="library-btn library-btn-secondary">
                        💾 Export
                    </button>
                    <button id="library-add-btn" class="library-btn library-btn-primary">
                        ➕ Add Color
                    </button>
                </div>
            </div>
            
            <div class="library-filters">
                <div class="filter-group">
                    <label for="library-search">Search Colors:</label>
                    <input type="text" id="library-search" placeholder="Search by name or code..." />
                </div>
                <div class="filter-group">
                    <label for="library-substrate-filter">Substrate:</label>
                    <select id="library-substrate-filter">
                        <option value="all">All Substrates</option>
                        <option value="coated">Coated</option>
                        <option value="uncoated">Uncoated</option>
                        <option value="newsprint">Newsprint</option>
                        <option value="matte">Matte</option>
                    </select>
                </div>
            </div>
            
            <div class="library-stats">
                <span class="library-count">0 colors</span>
            </div>
            
            <div id="library-grid" class="library-grid">
                <!-- Library entries will be rendered here -->
            </div>
        `;

        // Re-setup event listeners after rendering
        this.setupEventListeners();
        this.renderLibrary();
    }

    // Render library entries
    renderLibrary() {
        const grid = document.getElementById('library-grid');
        const countElement = document.querySelector('.library-count');
        
        if (!grid) return;

        if (countElement) {
            countElement.textContent = `${this.filteredLibrary.length} color${this.filteredLibrary.length !== 1 ? 's' : ''}`;
        }

        if (this.filteredLibrary.length === 0) {
            grid.innerHTML = `
                <div class="library-empty">
                    <p>No colors found matching your criteria.</p>
                    <button onclick="colorLibrary.showAddColorDialog()" class="library-btn library-btn-primary">
                        Add Your First Color
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredLibrary.map(color => `
            <div class="library-entry" data-color-id="${color.code}">
                <div class="library-swatch" style="background-color: ${this.labToRgbHex(color.L, color.a, color.b)}"></div>
                <div class="library-info">
                    <div class="library-name">${color.name}</div>
                    <div class="library-code">${color.code}</div>
                    <div class="library-substrate">${color.substrate}</div>
                    <div class="library-lab">L*${color.L} a*${color.a} b*${color.b}</div>
                    ${color.notes ? `<div class="library-notes">${color.notes}</div>` : ''}
                </div>
                <div class="library-actions">
                    <button onclick="colorLibrary.useColor('${color.code}')" class="library-use-btn" title="Use this color as target">
                        Use
                    </button>
                    <button onclick="colorLibrary.editColor('${color.code}')" class="library-edit-btn" title="Edit color">
                        ✏️
                    </button>
                    <button onclick="colorLibrary.deleteColor('${color.code}')" class="library-delete-btn" title="Delete color">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Convert LAB to RGB hex for display
    labToRgbHex(L, a, b) {
        // Simple LAB to RGB conversion for display purposes
        // This is an approximation for swatch display
        
        // Convert LAB to XYZ
        let y = (L + 16) / 116;
        let x = a / 500 + y;
        let z = y - b / 200;

        // Convert XYZ to RGB (simplified)
        let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        let bl = x * 0.0557 + y * -0.2040 + z * 1.0570;

        // Gamma correction and clamping
        r = Math.max(0, Math.min(1, r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r));
        g = Math.max(0, Math.min(1, g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g));
        bl = Math.max(0, Math.min(1, bl > 0.0031308 ? 1.055 * Math.pow(bl, 1/2.4) - 0.055 : 12.92 * bl));

        // Convert to hex
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
    }

    // Use color as target in calculator
    useColor(colorCode) {
        const color = this.library.find(c => c.code === colorCode);
        if (!color) return;

        // Populate target LAB values
        const targetL = document.getElementById('target-l');
        const targetA = document.getElementById('target-a');
        const targetB = document.getElementById('target-b');

        if (targetL) targetL.value = color.L;
        if (targetA) targetA.value = color.a;
        if (targetB) targetB.value = color.b;

        // Update color swatch if function exists
        if (window.updateColorSwatch) {
            window.updateColorSwatch('target');
        } else if (window.appState) {
            // Update app state if available
            window.appState.target.lab = { l: color.L, a: color.a, b: color.b };
            
            // Trigger swatch update event
            const event = new CustomEvent('colorLibraryColorApplied', {
                detail: { color: color, type: 'target' }
            });
            window.dispatchEvent(event);
        }

        // Show success message
        this.showMessage(`Applied ${color.name} to target color`, 'success');
        
        console.log(`Applied color ${color.name} (${color.code}) to target`);
    }

    // Show add color dialog
    showAddColorDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'library-modal';
        dialog.innerHTML = `
            <div class="library-modal-content">
                <div class="library-modal-header">
                    <h3>Add New Color</h3>
                    <button onclick="this.closest('.library-modal').remove()" class="library-modal-close">×</button>
                </div>
                <div class="library-modal-body">
                    <form id="add-color-form">
                        <div class="form-group">
                            <label for="new-color-name">Color Name:</label>
                            <input type="text" id="new-color-name" required placeholder="e.g., Corporate Blue" />
                        </div>
                        <div class="form-group">
                            <label for="new-color-code">Color Code:</label>
                            <input type="text" id="new-color-code" required placeholder="e.g., CORP-BLUE-001" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="new-color-l">L*:</label>
                                <input type="number" id="new-color-l" required min="0" max="100" step="0.1" />
                            </div>
                            <div class="form-group">
                                <label for="new-color-a">a*:</label>
                                <input type="number" id="new-color-a" required min="-128" max="127" step="0.1" />
                            </div>
                            <div class="form-group">
                                <label for="new-color-b">b*:</label>
                                <input type="number" id="new-color-b" required min="-128" max="127" step="0.1" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="new-color-substrate">Substrate:</label>
                            <select id="new-color-substrate" required>
                                <option value="Coated">Coated</option>
                                <option value="Uncoated">Uncoated</option>
                                <option value="Newsprint">Newsprint</option>
                                <option value="Matte">Matte</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-color-notes">Notes (optional):</label>
                            <textarea id="new-color-notes" placeholder="Additional information about this color..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="this.closest('.library-modal').remove()" class="library-btn library-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" class="library-btn library-btn-primary">
                                Add Color
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Handle form submission
        const form = document.getElementById('add-color-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addColor({
                name: document.getElementById('new-color-name').value,
                code: document.getElementById('new-color-code').value,
                L: parseFloat(document.getElementById('new-color-l').value),
                a: parseFloat(document.getElementById('new-color-a').value),
                b: parseFloat(document.getElementById('new-color-b').value),
                substrate: document.getElementById('new-color-substrate').value,
                notes: document.getElementById('new-color-notes').value
            });
            dialog.remove();
        });
    }

    // Add new color to library
    addColor(colorData) {
        // Check if code already exists
        if (this.library.find(c => c.code === colorData.code)) {
            this.showMessage('Color code already exists', 'error');
            return;
        }

        this.library.push(colorData);
        this.saveLibraryToStorage();
        this.filterLibrary();
        this.showMessage(`Added ${colorData.name} to library`, 'success');
        
        console.log('Added color to library:', colorData);
    }

    // Edit existing color
    editColor(colorCode) {
        const color = this.library.find(c => c.code === colorCode);
        if (!color) return;

        const dialog = document.createElement('div');
        dialog.className = 'library-modal';
        dialog.innerHTML = `
            <div class="library-modal-content">
                <div class="library-modal-header">
                    <h3>Edit Color</h3>
                    <button onclick="this.closest('.library-modal').remove()" class="library-modal-close">×</button>
                </div>
                <div class="library-modal-body">
                    <form id="edit-color-form">
                        <div class="form-group">
                            <label for="edit-color-name">Color Name:</label>
                            <input type="text" id="edit-color-name" required value="${color.name}" />
                        </div>
                        <div class="form-group">
                            <label for="edit-color-code">Color Code:</label>
                            <input type="text" id="edit-color-code" required value="${color.code}" readonly />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-color-l">L*:</label>
                                <input type="number" id="edit-color-l" required min="0" max="100" step="0.1" value="${color.L}" />
                            </div>
                            <div class="form-group">
                                <label for="edit-color-a">a*:</label>
                                <input type="number" id="edit-color-a" required min="-128" max="127" step="0.1" value="${color.a}" />
                            </div>
                            <div class="form-group">
                                <label for="edit-color-b">b*:</label>
                                <input type="number" id="edit-color-b" required min="-128" max="127" step="0.1" value="${color.b}" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-color-substrate">Substrate:</label>
                            <select id="edit-color-substrate" required>
                                <option value="Coated" ${color.substrate === 'Coated' ? 'selected' : ''}>Coated</option>
                                <option value="Uncoated" ${color.substrate === 'Uncoated' ? 'selected' : ''}>Uncoated</option>
                                <option value="Newsprint" ${color.substrate === 'Newsprint' ? 'selected' : ''}>Newsprint</option>
                                <option value="Matte" ${color.substrate === 'Matte' ? 'selected' : ''}>Matte</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-color-notes">Notes (optional):</label>
                            <textarea id="edit-color-notes">${color.notes || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="this.closest('.library-modal').remove()" class="library-btn library-btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" class="library-btn library-btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Handle form submission
        const form = document.getElementById('edit-color-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateColor(colorCode, {
                name: document.getElementById('edit-color-name').value,
                code: colorCode,
                L: parseFloat(document.getElementById('edit-color-l').value),
                a: parseFloat(document.getElementById('edit-color-a').value),
                b: parseFloat(document.getElementById('edit-color-b').value),
                substrate: document.getElementById('edit-color-substrate').value,
                notes: document.getElementById('edit-color-notes').value
            });
            dialog.remove();
        });
    }

    // Update existing color
    updateColor(colorCode, newData) {
        const index = this.library.findIndex(c => c.code === colorCode);
        if (index === -1) return;

        this.library[index] = newData;
        this.saveLibraryToStorage();
        this.filterLibrary();
        this.showMessage(`Updated ${newData.name}`, 'success');
        
        console.log('Updated color:', newData);
    }

    // Delete color from library
    deleteColor(colorCode) {
        const color = this.library.find(c => c.code === colorCode);
        if (!color) return;

        if (confirm(`Are you sure you want to delete "${color.name}"?`)) {
            this.library = this.library.filter(c => c.code !== colorCode);
            this.saveLibraryToStorage();
            this.filterLibrary();
            this.showMessage(`Deleted ${color.name}`, 'success');
            
            console.log('Deleted color:', color);
        }
    }

    // Show import dialog
    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importLibrary(file);
            }
        };
        input.click();
    }

    // Import library from JSON file
    importLibrary(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid file format');
                }

                // Validate imported data
                const validColors = importedData.filter(color => 
                    color.code && color.name && 
                    typeof color.L === 'number' && 
                    typeof color.a === 'number' && 
                    typeof color.b === 'number'
                );

                if (validColors.length === 0) {
                    throw new Error('No valid colors found in file');
                }

                // Merge with existing library (avoid duplicates)
                let addedCount = 0;
                validColors.forEach(color => {
                    if (!this.library.find(c => c.code === color.code)) {
                        this.library.push(color);
                        addedCount++;
                    }
                });

                this.saveLibraryToStorage();
                this.filterLibrary();
                this.showMessage(`Imported ${addedCount} colors`, 'success');
                
                console.log(`Imported ${addedCount} colors from file`);
                
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage('Error importing file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Export library to JSON file
    exportLibrary() {
        const dataStr = JSON.stringify(this.library, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `color-library-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage(`Exported ${this.library.length} colors`, 'success');
        console.log('Library exported');
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `library-toast library-toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Get library statistics
    getStats() {
        const substrates = {};
        this.library.forEach(color => {
            substrates[color.substrate] = (substrates[color.substrate] || 0) + 1;
        });

        return {
            total: this.library.length,
            substrates: substrates
        };
    }
}

// Initialize global color library instance
window.colorLibrary = new ColorLibraryManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorLibraryManager;
}