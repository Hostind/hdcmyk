// Heatmap Visualization Module
// Requirements: 3.4, 3.5, 3.6 - Canvas-based heatmap visualization with DPI scaling and real-time updates

console.log('Heatmap Visualization module loading...');

/**
 * Canvas-based heatmap renderer with DPI scaling and performance optimization
 * Requirements: 3.4 - Create canvas-based heatmap visualization with DPI scaling
 */
class HeatmapRenderer {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.options = {
            cellPadding: 2,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            textColor: '#374151',
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            showValues: true,
            showTooltips: true,
            animationDuration: 300,
            ...options
        };
        
        this.gridData = null;
        this.dimensions = { rows: 0, cols: 0 };
        this.cellSize = { width: 0, height: 0 };
        this.tolerance = 2.0; // Default ΔE tolerance
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.previousColors = new Map();
        
        // Performance optimization
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.isHighDPI = this.devicePixelRatio > 1;
        
        // Event handling
        this.setupEventHandlers();
        
        // Resize observer for responsive behavior
        this.setupResizeObserver();
        
        console.log('HeatmapRenderer initialized with DPI ratio:', this.devicePixelRatio);
    }

    /**
     * Setup event handlers for interactivity
     * Requirements: 3.3 - Add interactive grid with editable cells
     */
    setupEventHandlers() {
        // Mouse events for tooltips and interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e));
        
        // Keyboard events for accessibility
        this.canvas.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Make canvas focusable for keyboard navigation
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.setAttribute('role', 'grid');
        this.canvas.setAttribute('aria-label', 'Color difference heatmap grid');
    }

    /**
     * Setup resize observer for responsive behavior
     */
    setupResizeObserver() {
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.canvas.parentElement);
        } else {
            // Fallback for browsers without ResizeObserver
            window.addEventListener('resize', () => this.handleResize());
        }
    }

    /**
     * Handle canvas resize with DPI scaling
     */
    handleResize() {
        if (this.gridData) {
            // Debounce resize to avoid excessive redraws
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateCanvasSize();
                this.render();
            }, 100);
        }
    }

    /**
     * Update canvas size with DPI scaling
     * Requirements: 3.4 - DPI scaling for crisp rendering
     */
    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Calculate optimal canvas size
        const maxWidth = containerRect.width - 40; // Account for padding
        const maxHeight = Math.min(containerRect.height - 40, 600); // Max height limit
        
        // Calculate cell size based on grid dimensions
        if (this.dimensions.rows > 0 && this.dimensions.cols > 0) {
            const cellWidth = Math.floor(maxWidth / this.dimensions.cols);
            const cellHeight = Math.floor(maxHeight / this.dimensions.rows);
            
            // Use square cells for consistent appearance
            const cellSize = Math.min(cellWidth, cellHeight, 80); // Max 80px per cell
            
            this.cellSize.width = cellSize;
            this.cellSize.height = cellSize;
            
            // Calculate actual canvas size
            const canvasWidth = this.dimensions.cols * cellSize;
            const canvasHeight = this.dimensions.rows * cellSize;
            
            // Set display size
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
            
            // Set actual size with DPI scaling
            this.canvas.width = canvasWidth * this.devicePixelRatio;
            this.canvas.height = canvasHeight * this.devicePixelRatio;
            
            // Scale context for DPI
            this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
            
            // Update font size for DPI
            this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
        }
    }

    /**
     * Set grid data and render heatmap
     * Requirements: 3.5 - Add real-time ΔE calculation and color-coded visualization
     */
    setGridData(gridData, tolerance = 2.0) {
        this.gridData = gridData;
        this.tolerance = tolerance;
        
        // Update dimensions
        if (gridData && gridData.length > 0) {
            this.dimensions.rows = gridData.length;
            this.dimensions.cols = gridData[0].length;
        } else {
            this.dimensions.rows = 0;
            this.dimensions.cols = 0;
        }
        
        // Update canvas size and render
        this.updateCanvasSize();
        this.render();
    }

    /**
     * Render the complete heatmap
     * Requirements: 3.6 - Real-time updates on data changes
     */
    render() {
        if (!this.gridData || this.dimensions.rows === 0 || this.dimensions.cols === 0) {
            this.clearCanvas();
            return;
        }
        
        // Clear canvas
        this.clearCanvas();
        
        // Render grid cells
        for (let row = 0; row < this.dimensions.rows; row++) {
            for (let col = 0; col < this.dimensions.cols; col++) {
                const cellData = this.gridData[row][col];
                if (cellData) {
                    this.renderCell(row, col, cellData);
                }
            }
        }
        
        // Render grid lines
        this.renderGridLines();
    }

    /**
     * Render individual cell with color coding and animation
     */
    renderCell(row, col, cellData) {
        const x = col * this.cellSize.width;
        const y = row * this.cellSize.height;
        const width = this.cellSize.width - this.options.cellPadding;
        const height = this.cellSize.height - this.options.cellPadding;
        
        // Calculate cell color based on ΔE value
        const deltaE = cellData.de00 || 0;
        const cellColor = this.getDeltaEColor(deltaE);
        
        // Handle animation if enabled
        const cellKey = `${row}-${col}`;
        const previousColor = this.previousColors.get(cellKey);
        
        if (previousColor && previousColor !== cellColor && !this.isAnimating) {
            this.animateColorChange(x, y, width, height, previousColor, cellColor, deltaE);
        } else {
            this.drawCell(x, y, width, height, cellColor, deltaE);
        }
        
        // Store current color for next animation
        this.previousColors.set(cellKey, cellColor);
    }

    /**
     * Draw cell with color and value
     */
    drawCell(x, y, width, height, color, deltaE) {
        // Draw cell background
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + this.options.cellPadding / 2, y + this.options.cellPadding / 2, width, height);
        
        // Draw cell border
        this.ctx.strokeStyle = this.options.borderColor;
        this.ctx.lineWidth = this.options.borderWidth;
        this.ctx.strokeRect(x + this.options.cellPadding / 2, y + this.options.cellPadding / 2, width, height);
        
        // Draw ΔE value if enabled and cell is large enough
        if (this.options.showValues && this.cellSize.width > 40) {
            const textColor = this.getContrastingTextColor(color);
            this.ctx.fillStyle = textColor;
            
            const centerX = x + this.cellSize.width / 2;
            const centerY = y + this.cellSize.height / 2;
            
            // Format ΔE value
            const displayValue = deltaE < 10 ? deltaE.toFixed(1) : deltaE.toFixed(0);
            this.ctx.fillText(displayValue, centerX, centerY);
        }
    }

    /**
     * Animate color change for smooth transitions
     */
    animateColorChange(x, y, width, height, fromColor, toColor, deltaE) {
        this.isAnimating = true;
        this.animationStartTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - this.animationStartTime;
            const progress = Math.min(elapsed / this.options.animationDuration, 1);
            
            // Interpolate between colors
            const interpolatedColor = this.interpolateColors(fromColor, toColor, progress);
            
            // Clear and redraw this cell
            this.ctx.clearRect(x, y, this.cellSize.width, this.cellSize.height);
            this.drawCell(x, y, width, height, interpolatedColor, deltaE);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Get color based on ΔE value with tolerance zones
     * Requirements: 3.5 - Color-coded visualization based on tolerance levels
     */
    getDeltaEColor(deltaE) {
        // Define color zones based on industry standards
        if (deltaE <= 0.5) {
            return '#10b981'; // Excellent - Green
        } else if (deltaE <= 1.0) {
            return '#84cc16'; // Very Good - Light Green
        } else if (deltaE <= this.tolerance) {
            return '#f59e0b'; // Acceptable - Orange
        } else if (deltaE <= this.tolerance * 2) {
            return '#ef4444'; // Poor - Red
        } else {
            return '#7c2d12'; // Very Poor - Dark Red
        }
    }

    /**
     * Get contrasting text color for readability
     */
    getContrastingTextColor(backgroundColor) {
        // Convert hex to RGB and calculate luminance
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return this.options.textColor;
        
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Interpolate between two colors for animation
     */
    interpolateColors(color1, color2, progress) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color2;
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Render grid lines for better visual separation
     */
    renderGridLines() {
        this.ctx.strokeStyle = this.options.borderColor;
        this.ctx.lineWidth = this.options.borderWidth;
        
        // Vertical lines
        for (let col = 0; col <= this.dimensions.cols; col++) {
            const x = col * this.cellSize.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.dimensions.rows * this.cellSize.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = 0; row <= this.dimensions.rows; row++) {
            const y = row * this.cellSize.height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.dimensions.cols * this.cellSize.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Handle mouse movement for tooltips
     */
    handleMouseMove(e) {
        if (!this.options.showTooltips || !this.gridData) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize.width);
        const row = Math.floor(y / this.cellSize.height);
        
        if (row >= 0 && row < this.dimensions.rows && col >= 0 && col < this.dimensions.cols) {
            const cellData = this.gridData[row][col];
            if (cellData) {
                this.showTooltip(e, cellData, row, col);
            }
        } else {
            this.hideTooltip();
        }
    }

    /**
     * Handle click events for cell editing
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize.width);
        const row = Math.floor(y / this.cellSize.height);
        
        if (row >= 0 && row < this.dimensions.rows && col >= 0 && col < this.dimensions.cols) {
            this.onCellClick(row, col, this.gridData[row][col]);
        }
    }

    /**
     * Handle touch events for mobile
     */
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0] || e.changedTouches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'click' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        if (e.type === 'touchstart') {
            this.handleClick(mouseEvent);
        } else {
            this.handleMouseMove(mouseEvent);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(e) {
        // Implement keyboard navigation for accessibility
        // Arrow keys to navigate, Enter to edit, etc.
        console.log('Keyboard navigation:', e.key);
    }

    /**
     * Show tooltip with cell information
     */
    showTooltip(e, cellData, row, col) {
        // Create or update tooltip element
        let tooltip = document.getElementById('heatmap-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'heatmap-tooltip';
            tooltip.className = 'heatmap-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Format tooltip content
        const deltaE = cellData.de00 || 0;
        const toleranceStatus = deltaE <= this.tolerance ? 'Pass' : 'Fail';
        
        tooltip.innerHTML = `
            <div class="tooltip-header">Patch ${row + 1}-${col + 1}</div>
            <div class="tooltip-content">
                <div class="tooltip-row">
                    <span class="tooltip-label">ΔE2000:</span>
                    <span class="tooltip-value">${deltaE.toFixed(2)}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Status:</span>
                    <span class="tooltip-value ${toleranceStatus.toLowerCase()}">${toleranceStatus}</span>
                </div>
                ${cellData.t ? `
                <div class="tooltip-section">
                    <div class="tooltip-subtitle">Target LAB:</div>
                    <div class="tooltip-lab">L*${cellData.t[0].toFixed(1)} a*${cellData.t[1].toFixed(1)} b*${cellData.t[2].toFixed(1)}</div>
                </div>
                ` : ''}
                ${cellData.p ? `
                <div class="tooltip-section">
                    <div class="tooltip-subtitle">Press LAB:</div>
                    <div class="tooltip-lab">L*${cellData.p[0].toFixed(1)} a*${cellData.p[1].toFixed(1)} b*${cellData.p[2].toFixed(1)}</div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Position tooltip
        const tooltipRect = tooltip.getBoundingClientRect();
        const x = e.clientX + 10;
        const y = e.clientY - tooltipRect.height - 10;
        
        tooltip.style.left = Math.min(x, window.innerWidth - tooltipRect.width - 10) + 'px';
        tooltip.style.top = Math.max(y, 10) + 'px';
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
     * Set tolerance level and update colors
     */
    setTolerance(tolerance) {
        this.tolerance = tolerance;
        this.render(); // Re-render with new tolerance
    }

    /**
     * Update single cell data and re-render
     * Requirements: 3.6 - Real-time updates on data changes
     */
    updateCell(row, col, cellData) {
        if (this.gridData && row < this.dimensions.rows && col < this.dimensions.cols) {
            this.gridData[row][col] = cellData;
            this.renderCell(row, col, cellData);
        }
    }

    /**
     * Get cell data at position
     */
    getCellAt(row, col) {
        if (this.gridData && row < this.dimensions.rows && col < this.dimensions.cols) {
            return this.gridData[row][col];
        }
        return null;
    }

    /**
     * Set cell click callback
     */
    onCellClick(row, col, cellData) {
        // Override this method to handle cell clicks
        console.log(`Cell clicked: ${row}, ${col}`, cellData);
        
        // Dispatch custom event for external handling
        const event = new CustomEvent('cellClick', {
            detail: { row, col, cellData }
        });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Export heatmap as image
     */
    exportAsImage(format = 'png') {
        return this.canvas.toDataURL(`image/${format}`);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Remove event listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.hideTooltip);
        this.canvas.removeEventListener('click', this.handleClick);
        
        // Hide tooltip
        this.hideTooltip();
        
        // Clear canvas
        this.clearCanvas();
    }
}

// Export for use in other modules
window.HeatmapRenderer = HeatmapRenderer;

console.log('Heatmap Visualization module loaded successfully');