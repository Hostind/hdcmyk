// Heatmap Visualization Component
// High-performance canvas-based visualization for color difference analysis
// Integrates with existing Print Calculator UI framework

console.log('Heatmap Visualization module loading...');

// Heatmap State Management
let HEATMAP_STATE = {
    canvases: new Map(), // Track multiple heatmap instances
    animationFrameId: null,
    renderQueue: [],
    settings: {
        colorScale: 'deltaE',
        interpolation: 'bilinear',
        showLabels: true,
        showGrid: true,
        dpiScaling: true
    }
};

/**
 * Enhanced Heatmap Renderer
 * High-performance canvas rendering with DPI scaling and smooth animations
 */
class HeatmapRenderer {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.options = {
            showLabels: true,
            showGrid: true,
            colorScale: 'deltaE',
            tolerance: 2.0,
            maxDeltaE: 10,
            interpolation: 'bilinear',
            backgroundColor: '#0b0f14',
            gridColor: 'rgba(255,255,255,0.1)',
            textColor: 'rgba(255,255,255,0.9)',
            ...options
        };
        
        this.data = null;
        this.dimensions = { rows: 0, cols: 0 };
        this.cellSize = { width: 0, height: 0 };
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
        // Performance optimization
        this.renderCache = new Map();
        this.lastRenderTime = 0;
        this.renderThrottle = 16; // ~60fps
        
        this.setupCanvas();
        this.bindEvents();
        
        // Register with state manager
        HEATMAP_STATE.canvases.set(canvasElement.id || `heatmap_${Date.now()}`, this);
    }
    
    setupCanvas() {
        // Setup DPI scaling
        const rect = this.canvas.getBoundingClientRect();
        const cssWidth = rect.width || this.canvas.clientWidth || 400;
        const cssHeight = rect.height || this.canvas.clientHeight || 300;
        
        if (this.options.dpiScaling) {
            this.canvas.width = cssWidth * this.devicePixelRatio;
            this.canvas.height = cssHeight * this.devicePixelRatio;
            this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        } else {
            this.canvas.width = cssWidth;
            this.canvas.height = cssHeight;
        }
        
        this.canvas.style.width = cssWidth + 'px';
        this.canvas.style.height = cssHeight + 'px';
        
        // Set canvas properties for crisp rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }
    
    bindEvents() {
        // Handle resize
        window.addEventListener('resize', () => {
            this.debounce(this.handleResize.bind(this), 250)();
        });
        
        // Handle mouse interactions for tooltips
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
    
    /**
     * Update heatmap with new data
     */
    updateData(gridData, options = {}) {
        try {
            if (!gridData || !Array.isArray(gridData) || gridData.length === 0) {
                this.clearHeatmap();
                return;
            }
            
            // Process grid data
            this.data = this.processGridData(gridData);
            this.dimensions = {
                rows: gridData.length,
                cols: gridData[0]?.length || 0
            };
            
            // Update options if provided
            if (options) {
                this.options = { ...this.options, ...options };
            }
            
            // Calculate cell sizes
            const cssWidth = this.canvas.clientWidth;
            const cssHeight = this.canvas.clientHeight;
            
            this.cellSize = {
                width: cssWidth / this.dimensions.cols,
                height: cssHeight / this.dimensions.rows
            };
            
            // Trigger render
            this.render();
            
        } catch (error) {
            console.error('Error updating heatmap data:', error);
        }
    }
    
    /**
     * Process raw grid data into heatmap format
     */
    processGridData(gridData) {
        const processed = [];
        let maxDeltaE = 0;
        
        gridData.forEach((row, rowIndex) => {
            const processedRow = [];
            
            if (Array.isArray(row)) {
                row.forEach((cell, colIndex) => {
                    const deltaE = this.extractDeltaE(cell);
                    const processedCell = {
                        row: rowIndex,
                        col: colIndex,
                        deltaE: deltaE,
                        target: cell.target || cell.t,
                        sample: cell.sample || cell.p,
                        zone: this.getToleranceZone(deltaE),
                        originalData: cell
                    };
                    
                    maxDeltaE = Math.max(maxDeltaE, deltaE);
                    processedRow.push(processedCell);
                });
            }
            
            processed.push(processedRow);
        });
        
        // Update max delta E for scaling
        this.options.maxDeltaE = Math.max(this.options.maxDeltaE, maxDeltaE);
        
        return processed;
    }
    
    /**
     * Extract Delta E value from cell data
     */
    extractDeltaE(cell) {
        if (typeof cell.deltaE === 'number') return cell.deltaE;
        if (typeof cell.de00 === 'number') return cell.de00;
        if (typeof cell.de === 'number') return cell.de;
        
        // Calculate if target and sample LAB values are available
        const target = cell.target || cell.t;
        const sample = cell.sample || cell.p;
        
        if (target && sample && window.colorScience) {
            try {
                return window.colorScience.calculateDeltaE(target, sample);
            } catch (error) {
                console.warn('Error calculating Delta E for cell:', error);
            }
        }
        
        return 0;
    }
    
    /**
     * Get tolerance zone for color coding
     */
    getToleranceZone(deltaE) {
        const tolerance = this.options.tolerance;
        
        if (deltaE <= tolerance * 0.5) return 'excellent';
        if (deltaE <= tolerance) return 'good';
        if (deltaE <= tolerance * 2.5) return 'acceptable';
        return 'poor';
    }
    
    /**
     * Main render function
     */
    render() {
        const now = performance.now();
        
        // Throttle rendering for performance
        if (now - this.lastRenderTime < this.renderThrottle) {
            if (HEATMAP_STATE.animationFrameId) {
                cancelAnimationFrame(HEATMAP_STATE.animationFrameId);
            }
            HEATMAP_STATE.animationFrameId = requestAnimationFrame(() => this.render());
            return;
        }
        
        this.lastRenderTime = now;
        
        try {
            // Clear canvas
            this.ctx.fillStyle = this.options.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            
            if (!this.data || this.data.length === 0) {
                this.renderEmptyState();
                return;
            }
            
            // Render heatmap cells
            this.renderCells();
            
            // Render grid lines if enabled
            if (this.options.showGrid) {
                this.renderGrid();
            }
            
            // Render labels if enabled
            if (this.options.showLabels) {
                this.renderLabels();
            }
            
            // Render legend
            this.renderLegend();
            
        } catch (error) {
            console.error('Error rendering heatmap:', error);
        }
    }
    
    /**
     * Render heatmap cells with color mapping
     */
    renderCells() {
        this.data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const x = colIndex * this.cellSize.width;
                const y = rowIndex * this.cellSize.height;
                
                // Get color for cell based on Delta E
                const color = this.getCellColor(cell.deltaE, cell.zone);
                
                // Draw cell
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, this.cellSize.width - 1, this.cellSize.height - 1);
                
                // Add subtle border for definition
                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(x, y, this.cellSize.width - 1, this.cellSize.height - 1);
            });
        });
    }
    
    /**
     * Get color for cell based on Delta E value and zone
     */
    getCellColor(deltaE, zone) {
        const normalizedValue = Math.min(1, deltaE / this.options.maxDeltaE);
        
        switch (this.options.colorScale) {
            case 'zone':
                return this.getZoneColor(zone);
            case 'thermal':
                return this.getThermalColor(normalizedValue);
            case 'deltaE':
            default:
                return this.getDeltaEColor(normalizedValue);
        }
    }
    
    /**
     * Get zone-based color (discrete color zones)
     */
    getZoneColor(zone) {
        const zoneColors = {
            excellent: '#22c55e', // Green
            good: '#3b82f6',     // Blue  
            acceptable: '#f59e0b', // Yellow
            poor: '#ef4444'      // Red
        };
        
        return zoneColors[zone] || '#6b7280';
    }
    
    /**
     * Get thermal color mapping (continuous blue to red)
     */
    getThermalColor(normalized) {
        const colors = [
            { pos: 0.0, r: 0, g: 0, b: 255 },     // Blue
            { pos: 0.25, r: 0, g: 128, b: 255 },  // Light Blue
            { pos: 0.5, r: 0, g: 255, b: 128 },   // Green
            { pos: 0.75, r: 255, g: 255, b: 0 },  // Yellow
            { pos: 1.0, r: 255, g: 0, b: 0 }      // Red
        ];
        
        return this.interpolateColor(colors, normalized);
    }
    
    /**
     * Get Delta E color mapping (green to red)
     */
    getDeltaEColor(normalized) {
        const intensity = Math.round(40 + normalized * 160);
        return `rgb(${intensity}, 40, 40)`;
    }
    
    /**
     * Interpolate between color points
     */
    interpolateColor(colors, position) {
        if (position <= colors[0].pos) {
            return `rgb(${colors[0].r}, ${colors[0].g}, ${colors[0].b})`;
        }
        
        if (position >= colors[colors.length - 1].pos) {
            const last = colors[colors.length - 1];
            return `rgb(${last.r}, ${last.g}, ${last.b})`;
        }
        
        // Find surrounding colors
        let lowerIndex = 0;
        for (let i = 0; i < colors.length - 1; i++) {
            if (position >= colors[i].pos && position <= colors[i + 1].pos) {
                lowerIndex = i;
                break;
            }
        }
        
        const lower = colors[lowerIndex];
        const upper = colors[lowerIndex + 1];
        const range = upper.pos - lower.pos;
        const factor = range === 0 ? 0 : (position - lower.pos) / range;
        
        const r = Math.round(lower.r + (upper.r - lower.r) * factor);
        const g = Math.round(lower.g + (upper.g - lower.g) * factor);
        const b = Math.round(lower.b + (upper.b - lower.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Render grid lines
     */
    renderGrid() {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let col = 1; col < this.dimensions.cols; col++) {
            const x = col * this.cellSize.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.clientHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = 1; row < this.dimensions.rows; row++) {
            const y = row * this.cellSize.height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.clientWidth, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Render cell labels (Delta E values)
     */
    renderLabels() {
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = `${Math.min(12, this.cellSize.height * 0.3)}px system-ui, sans-serif`;
        
        this.data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const x = colIndex * this.cellSize.width + this.cellSize.width / 2;
                const y = rowIndex * this.cellSize.height + this.cellSize.height / 2;
                
                // Only show label if cell is large enough
                if (this.cellSize.width > 40 && this.cellSize.height > 30) {
                    this.ctx.fillText(cell.deltaE.toFixed(1), x, y);
                }
            });
        });
    }
    
    /**
     * Render color legend
     */
    renderLegend() {
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = this.canvas.clientWidth - legendWidth - 10;
        const legendY = 10;
        
        // Draw legend background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(legendX - 5, legendY - 5, legendWidth + 10, legendHeight + 30);
        
        // Draw color gradient
        const gradient = this.ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
        
        if (this.options.colorScale === 'zone') {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(0.33, '#3b82f6');
            gradient.addColorStop(0.66, '#f59e0b');
            gradient.addColorStop(1, '#ef4444');
        } else {
            gradient.addColorStop(0, 'rgb(40, 40, 40)');
            gradient.addColorStop(1, 'rgb(200, 40, 40)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
        
        // Draw legend labels
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '10px system-ui, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('0', legendX, legendY + legendHeight + 12);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this.options.maxDeltaE.toFixed(1)} ΔE`, legendX + legendWidth, legendY + legendHeight + 12);
        this.ctx.textAlign = 'center';
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '14px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'No heatmap data available',
            this.canvas.clientWidth / 2,
            this.canvas.clientHeight / 2
        );
    }
    
    /**
     * Handle mouse movement for tooltips
     */
    handleMouseMove(event) {
        if (!this.data) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize.width);
        const row = Math.floor(y / this.cellSize.height);
        
        if (row >= 0 && row < this.dimensions.rows && col >= 0 && col < this.dimensions.cols) {
            const cell = this.data[row][col];
            this.showTooltip(event, cell);
        } else {
            this.hideTooltip();
        }
    }
    
    /**
     * Handle click events
     */
    handleClick(event) {
        if (!this.data) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize.width);
        const row = Math.floor(y / this.cellSize.height);
        
        if (row >= 0 && row < this.dimensions.rows && col >= 0 && col < this.dimensions.cols) {
            const cell = this.data[row][col];
            this.onCellClick(cell, event);
        }
    }
    
    /**
     * Show tooltip for cell
     */
    showTooltip(event, cell) {
        // Create or update tooltip element
        let tooltip = document.getElementById('heatmap-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'heatmap-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10000;
                font-family: system-ui, sans-serif;
                line-height: 1.4;
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <div><strong>Row ${cell.row + 1}, Col ${cell.col + 1}</strong></div>
            <div>ΔE: ${cell.deltaE.toFixed(2)}</div>
            <div>Zone: ${cell.zone}</div>
            ${cell.target ? `<div>Target: L*${cell.target.l?.toFixed(1)} a*${cell.target.a?.toFixed(1)} b*${cell.target.b?.toFixed(1)}</div>` : ''}
            ${cell.sample ? `<div>Sample: L*${cell.sample.l?.toFixed(1)} a*${cell.sample.a?.toFixed(1)} b*${cell.sample.b?.toFixed(1)}</div>` : ''}
        `;
        
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        tooltip.style.display = 'block';
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    /**
     * Handle cell click events (override in subclasses)
     */
    onCellClick(cell, event) {
        console.log('Cell clicked:', cell);
        // Dispatch custom event for integration
        this.canvas.dispatchEvent(new CustomEvent('heatmapCellClick', {
            detail: { cell, event }
        }));
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        this.setupCanvas();
        if (this.data) {
            this.render();
        }
    }
    
    /**
     * Clear heatmap
     */
    clearHeatmap() {
        this.data = null;
        this.dimensions = { rows: 0, cols: 0 };
        this.render();
    }
    
    /**
     * Export heatmap as image
     */
    exportAsImage(format = 'png', quality = 1.0) {
        try {
            const dataURL = this.canvas.toDataURL(`image/${format}`, quality);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `heatmap_export_${new Date().toISOString().slice(0, 10)}.${format}`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return { success: true, dataURL };
        } catch (error) {
            console.error('Error exporting heatmap:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
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
    
    /**
     * Destroy heatmap instance
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('click', this.handleClick);
        
        // Remove from state manager
        HEATMAP_STATE.canvases.delete(this.canvas.id);
        
        // Clean up tooltip
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        console.log('Heatmap instance destroyed');
    }
}

/**
 * Factory function to create heatmap instances
 */
function createHeatmap(canvasSelector, options = {}) {
    const canvas = typeof canvasSelector === 'string' 
        ? document.querySelector(canvasSelector) 
        : canvasSelector;
        
    if (!canvas || canvas.tagName !== 'CANVAS') {
        throw new Error('Invalid canvas element provided');
    }
    
    return new HeatmapRenderer(canvas, options);
}

/**
 * Update all heatmap instances
 */
function updateAllHeatmaps(data, options = {}) {
    HEATMAP_STATE.canvases.forEach(heatmap => {
        heatmap.updateData(data, options);
    });
}

/**
 * Get heatmap statistics for current data
 */
function getHeatmapStatistics(heatmapInstance) {
    if (!heatmapInstance.data) {
        return {
            totalCells: 0,
            averageDeltaE: 0,
            maxDeltaE: 0,
            minDeltaE: 0,
            zones: {}
        };
    }
    
    const flatData = heatmapInstance.data.flat();
    const deltaEValues = flatData.map(cell => cell.deltaE);
    const zones = { excellent: 0, good: 0, acceptable: 0, poor: 0 };
    
    flatData.forEach(cell => {
        zones[cell.zone] = (zones[cell.zone] || 0) + 1;
    });
    
    return {
        totalCells: flatData.length,
        averageDeltaE: deltaEValues.reduce((sum, val) => sum + val, 0) / deltaEValues.length,
        maxDeltaE: Math.max(...deltaEValues),
        minDeltaE: Math.min(...deltaEValues),
        zones: zones,
        zonePercentages: Object.keys(zones).reduce((acc, zone) => {
            acc[zone] = (zones[zone] / flatData.length * 100).toFixed(1);
            return acc;
        }, {})
    };
}

// Export heatmap functionality
window.heatmapVisualization = {
    // Core classes and functions
    HeatmapRenderer,
    createHeatmap,
    updateAllHeatmaps,
    getHeatmapStatistics,
    
    // State management
    getState: () => HEATMAP_STATE,
    setState: (newState) => { HEATMAP_STATE = { ...HEATMAP_STATE, ...newState }; },
    
    // Utility functions
    clearAllHeatmaps: () => {
        HEATMAP_STATE.canvases.forEach(heatmap => heatmap.clearHeatmap());
    },
    
    destroyAllHeatmaps: () => {
        HEATMAP_STATE.canvases.forEach(heatmap => heatmap.destroy());
        HEATMAP_STATE.canvases.clear();
    }
};

// Auto-initialize any existing heatmap canvases
document.addEventListener('DOMContentLoaded', () => {
    const heatmapCanvases = document.querySelectorAll('canvas[data-heatmap]');
    heatmapCanvases.forEach(canvas => {
        const options = JSON.parse(canvas.dataset.heatmapOptions || '{}');
        createHeatmap(canvas, options);
    });
});

console.log('Heatmap Visualization module loaded successfully');