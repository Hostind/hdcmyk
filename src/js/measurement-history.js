// LAB Color Matching Calculator - Measurement History and Statistical Analysis
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5 - Measurement history and statistical analysis

console.log('Measurement History module loading...');

// Storage keys for measurement history
const HISTORY_STORAGE_KEYS = {
    MEASUREMENTS: 'measurementHistory',
    STATISTICS: 'measurementStatistics',
    SETTINGS: 'historySettings'
};

// Configuration constants
const HISTORY_CONFIG = {
    MAX_ENTRIES: 1000,
    STATISTICS_WINDOW: 100, // Number of recent measurements for statistics
    TREND_WINDOW: 20, // Number of measurements for trend analysis
    EXPORT_BATCH_SIZE: 500,
    AUTO_CLEANUP_DAYS: 90
};

// Statistical thresholds for process stability
const STABILITY_THRESHOLDS = {
    EXCELLENT: { median: 1.0, p95: 2.0, max: 3.0 },
    GOOD: { median: 2.0, p95: 4.0, max: 6.0 },
    ACCEPTABLE: { median: 3.0, p95: 6.0, max: 10.0 },
    POOR: { median: Infinity, p95: Infinity, max: Infinity }
};

/**
 * Measurement History Manager Class
 * Requirements: 9.1 - Implement automatic calculation logging with timestamps and metadata
 */
class MeasurementHistoryManager {
    constructor() {
        this.measurements = [];
        this.statistics = null;
        this.settings = this.loadSettings();
        this.init();
    }

    /**
     * Initialize the measurement history system
     */
    init() {
        console.log('Initializing Measurement History Manager...');
        this.loadMeasurements();
        this.calculateStatistics();
        this.setupEventListeners();
        this.initializeUI();
        console.log('Measurement History Manager initialized');
    }

    /**
     * Log a new measurement automatically
     * Requirements: 9.1 - Automatic calculation logging with timestamps and metadata
     */
    logMeasurement(calculationData) {
        try {
            const measurement = {
                id: this.generateMeasurementId(),
                timestamp: new Date().toISOString(),
                target: {
                    lab: { ...calculationData.target.lab },
                    cmyk: calculationData.target.cmyk ? { ...calculationData.target.cmyk } : null
                },
                press: {
                    lab: { ...calculationData.sample.lab },
                    cmyk: calculationData.sample.cmyk ? { ...calculationData.sample.cmyk } : null
                },
                deltaE: {
                    de76: calculationData.results?.deltaE76 || null,
                    de94: calculationData.results?.deltaE94 || null,
                    de2000: calculationData.results?.deltaE || calculationData.deltaE
                },
                componentDeltas: calculationData.componentDeltas ? { ...calculationData.componentDeltas } : null,
                tolerance: calculationData.tolerance || this.calculateToleranceZone(calculationData.deltaE || calculationData.results?.deltaE),
                substrate: calculationData.substrate || 'Unknown',
                operator: calculationData.operator || 'System',
                jobId: calculationData.jobId || null,
                notes: calculationData.notes || '',
                metadata: {
                    userAgent: navigator.userAgent,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    colorSpace: calculationData.colorSpace || 'sRGB',
                    calculationMethod: calculationData.method || 'DE2000'
                }
            };

            // Add to measurements array
            this.measurements.unshift(measurement);

            // Limit array size
            if (this.measurements.length > HISTORY_CONFIG.MAX_ENTRIES) {
                this.measurements = this.measurements.slice(0, HISTORY_CONFIG.MAX_ENTRIES);
            }

            // Save to storage
            this.saveMeasurements();

            // Recalculate statistics
            this.calculateStatistics();

            // Update UI
            this.updateHistoryDisplay();

            console.log('Measurement logged:', measurement.id);
            return measurement;

        } catch (error) {
            console.error('Error logging measurement:', error);
            return null;
        }
    }

    /**
     * Calculate comprehensive statistics
     * Requirements: 9.3 - Add statistical analysis showing median, 95th percentile, and maximum ΔE
     */
    calculateStatistics() {
        try {
            if (this.measurements.length === 0) {
                this.statistics = null;
                return;
            }

            // Get recent measurements for statistics
            const recentMeasurements = this.measurements.slice(0, HISTORY_CONFIG.STATISTICS_WINDOW);
            const deltaEValues = recentMeasurements
                .map(m => m.deltaE.de2000)
                .filter(de => de !== null && !isNaN(de))
                .sort((a, b) => a - b);

            if (deltaEValues.length === 0) {
                this.statistics = null;
                return;
            }

            // Calculate basic statistics
            const count = deltaEValues.length;
            const sum = deltaEValues.reduce((acc, val) => acc + val, 0);
            const mean = sum / count;
            const median = this.calculatePercentile(deltaEValues, 50);
            const p95 = this.calculatePercentile(deltaEValues, 95);
            const max = Math.max(...deltaEValues);
            const min = Math.min(...deltaEValues);

            // Calculate standard deviation
            const variance = deltaEValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
            const stdDev = Math.sqrt(variance);

            // Calculate process capability metrics
            const processCapability = this.calculateProcessCapability(deltaEValues);

            // Calculate trend analysis
            const trendAnalysis = this.calculateTrendAnalysis();

            // Determine process stability
            const stability = this.determineProcessStability(median, p95, max);

            this.statistics = {
                count,
                mean: parseFloat(mean.toFixed(3)),
                median: parseFloat(median.toFixed(3)),
                p95: parseFloat(p95.toFixed(3)),
                max: parseFloat(max.toFixed(3)),
                min: parseFloat(min.toFixed(3)),
                stdDev: parseFloat(stdDev.toFixed(3)),
                range: parseFloat((max - min).toFixed(3)),
                processCapability,
                trendAnalysis,
                stability,
                lastUpdated: new Date().toISOString(),
                timeWindow: HISTORY_CONFIG.STATISTICS_WINDOW
            };

            // Save statistics
            this.saveStatistics();

            console.log('Statistics calculated:', this.statistics);

        } catch (error) {
            console.error('Error calculating statistics:', error);
            this.statistics = null;
        }
    }

    /**
     * Calculate percentile value from sorted array
     */
    calculatePercentile(sortedArray, percentile) {
        if (sortedArray.length === 0) return 0;
        if (sortedArray.length === 1) return sortedArray[0];

        const index = (percentile / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;

        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        if (lower < 0) return sortedArray[0];

        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    /**
     * Calculate process capability metrics
     */
    calculateProcessCapability(deltaEValues) {
        const mean = deltaEValues.reduce((acc, val) => acc + val, 0) / deltaEValues.length;
        const stdDev = Math.sqrt(deltaEValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / deltaEValues.length);

        // Assuming target tolerance of 2.0 ΔE
        const targetTolerance = 2.0;
        const cp = targetTolerance / (6 * stdDev); // Process capability
        const cpk = Math.min((targetTolerance - mean) / (3 * stdDev), (mean - 0) / (3 * stdDev)); // Process capability index

        return {
            cp: parseFloat(cp.toFixed(3)),
            cpk: parseFloat(cpk.toFixed(3)),
            interpretation: this.interpretProcessCapability(cp, cpk)
        };
    }

    /**
     * Interpret process capability values
     */
    interpretProcessCapability(cp, cpk) {
        if (cp >= 2.0 && cpk >= 2.0) return 'Excellent';
        if (cp >= 1.33 && cpk >= 1.33) return 'Good';
        if (cp >= 1.0 && cpk >= 1.0) return 'Acceptable';
        return 'Poor';
    }

    /**
     * Calculate trend analysis
     * Requirements: 9.4 - Include trend analysis and process stability indicators
     */
    calculateTrendAnalysis() {
        try {
            if (this.measurements.length < HISTORY_CONFIG.TREND_WINDOW) {
                return {
                    trend: 'insufficient_data',
                    slope: 0,
                    correlation: 0,
                    prediction: null
                };
            }

            // Get recent measurements for trend analysis
            const recentMeasurements = this.measurements.slice(0, HISTORY_CONFIG.TREND_WINDOW);
            const dataPoints = recentMeasurements
                .map((m, index) => ({
                    x: index,
                    y: m.deltaE.de2000,
                    timestamp: new Date(m.timestamp).getTime()
                }))
                .filter(point => point.y !== null && !isNaN(point.y))
                .reverse(); // Reverse to get chronological order

            if (dataPoints.length < 5) {
                return {
                    trend: 'insufficient_data',
                    slope: 0,
                    correlation: 0,
                    prediction: null
                };
            }

            // Calculate linear regression
            const n = dataPoints.length;
            const sumX = dataPoints.reduce((acc, point) => acc + point.x, 0);
            const sumY = dataPoints.reduce((acc, point) => acc + point.y, 0);
            const sumXY = dataPoints.reduce((acc, point) => acc + point.x * point.y, 0);
            const sumXX = dataPoints.reduce((acc, point) => acc + point.x * point.x, 0);
            const sumYY = dataPoints.reduce((acc, point) => acc + point.y * point.y, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Calculate correlation coefficient
            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
            const correlation = denominator !== 0 ? numerator / denominator : 0;

            // Determine trend direction
            let trend = 'stable';
            if (Math.abs(slope) > 0.05) {
                trend = slope > 0 ? 'increasing' : 'decreasing';
            }

            // Predict next value
            const nextX = dataPoints[dataPoints.length - 1].x + 1;
            const prediction = slope * nextX + intercept;

            return {
                trend,
                slope: parseFloat(slope.toFixed(4)),
                correlation: parseFloat(correlation.toFixed(3)),
                prediction: parseFloat(prediction.toFixed(3)),
                dataPoints: dataPoints.length,
                timeSpan: dataPoints.length > 1 ? 
                    dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp : 0
            };

        } catch (error) {
            console.error('Error calculating trend analysis:', error);
            return {
                trend: 'error',
                slope: 0,
                correlation: 0,
                prediction: null
            };
        }
    }

    /**
     * Determine process stability based on statistical thresholds
     * Requirements: 9.4 - Process stability indicators
     */
    determineProcessStability(median, p95, max) {
        for (const [level, thresholds] of Object.entries(STABILITY_THRESHOLDS)) {
            if (median <= thresholds.median && p95 <= thresholds.p95 && max <= thresholds.max) {
                return {
                    level: level.toLowerCase(),
                    score: this.calculateStabilityScore(median, p95, max),
                    recommendations: this.getStabilityRecommendations(level.toLowerCase())
                };
            }
        }
        return {
            level: 'poor',
            score: 0,
            recommendations: this.getStabilityRecommendations('poor')
        };
    }

    /**
     * Calculate stability score (0-100)
     */
    calculateStabilityScore(median, p95, max) {
        const excellent = STABILITY_THRESHOLDS.EXCELLENT;
        
        // Calculate individual scores
        const medianScore = Math.max(0, 100 - (median / excellent.median) * 100);
        const p95Score = Math.max(0, 100 - (p95 / excellent.p95) * 100);
        const maxScore = Math.max(0, 100 - (max / excellent.max) * 100);
        
        // Weighted average (median is most important)
        const score = (medianScore * 0.5 + p95Score * 0.3 + maxScore * 0.2);
        return Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * Get stability recommendations based on level
     */
    getStabilityRecommendations(level) {
        const recommendations = {
            excellent: [
                'Process is highly stable',
                'Continue current practices',
                'Consider tightening tolerances'
            ],
            good: [
                'Process is stable with minor variations',
                'Monitor for consistency',
                'Review occasional outliers'
            ],
            acceptable: [
                'Process shows moderate variation',
                'Investigate common causes',
                'Consider process improvements'
            ],
            poor: [
                'Process is unstable',
                'Immediate investigation required',
                'Review measurement procedures',
                'Check equipment calibration'
            ]
        };
        
        return recommendations[level] || recommendations.poor;
    }

    /**
     * Generate measurement ID
     */
    generateMeasurementId() {
        return `meas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate tolerance zone for a ΔE value
     */
    calculateToleranceZone(deltaE) {
        if (deltaE <= 1.0) return { zone: 'excellent', threshold: 1.0 };
        if (deltaE <= 2.0) return { zone: 'good', threshold: 2.0 };
        if (deltaE <= 4.0) return { zone: 'acceptable', threshold: 4.0 };
        return { zone: 'poor', threshold: Infinity };
    }

    /**
     * Load measurements from storage
     */
    loadMeasurements() {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEYS.MEASUREMENTS);
            this.measurements = stored ? JSON.parse(stored) : [];
            console.log(`Loaded ${this.measurements.length} measurements from storage`);
        } catch (error) {
            console.error('Error loading measurements:', error);
            this.measurements = [];
        }
    }

    /**
     * Save measurements to storage
     */
    saveMeasurements() {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEYS.MEASUREMENTS, JSON.stringify(this.measurements));
        } catch (error) {
            console.error('Error saving measurements:', error);
        }
    }

    /**
     * Save statistics to storage
     */
    saveStatistics() {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEYS.STATISTICS, JSON.stringify(this.statistics));
        } catch (error) {
            console.error('Error saving statistics:', error);
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEYS.SETTINGS);
            return stored ? JSON.parse(stored) : {
                autoLog: true,
                statisticsWindow: HISTORY_CONFIG.STATISTICS_WINDOW,
                trendWindow: HISTORY_CONFIG.TREND_WINDOW
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                autoLog: true,
                statisticsWindow: HISTORY_CONFIG.STATISTICS_WINDOW,
                trendWindow: HISTORY_CONFIG.TREND_WINDOW
            };
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for calculation events to auto-log measurements
        document.addEventListener('calculationComplete', (event) => {
            if (this.settings.autoLog && event.detail) {
                this.logMeasurement(event.detail);
            }
        });
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // This will be called when the UI is ready
        console.log('Measurement history UI initialized');
    }

    /**
     * Update history display
     */
    updateHistoryDisplay() {
        // Update any existing history displays
        const historyContainer = document.querySelector('.measurement-history-container');
        if (historyContainer) {
            // Refresh the display
            this.updateHistoryTable(historyContainer.parentElement, {});
        }
    }

    /**
     * Export measurements to CSV
     * Requirements: 9.2, 9.5 - Export capabilities and data export functionality
     */
    exportToCSV() {
        try {
            const headers = [
                'Timestamp', 'Target_L', 'Target_a', 'Target_b', 'Target_C', 'Target_M', 'Target_Y', 'Target_K',
                'Press_L', 'Press_a', 'Press_b', 'Press_C', 'Press_M', 'Press_Y', 'Press_K',
                'DeltaE_76', 'DeltaE_94', 'DeltaE_2000', 'Tolerance_Zone', 'Substrate', 'Operator', 'Job_ID', 'Notes'
            ];

            const csvData = [headers.join(',')];

            this.measurements.forEach(measurement => {
                const row = [
                    measurement.timestamp,
                    measurement.target.lab.l || '',
                    measurement.target.lab.a || '',
                    measurement.target.lab.b || '',
                    measurement.target.cmyk?.c || '',
                    measurement.target.cmyk?.m || '',
                    measurement.target.cmyk?.y || '',
                    measurement.target.cmyk?.k || '',
                    measurement.press.lab.l || '',
                    measurement.press.lab.a || '',
                    measurement.press.lab.b || '',
                    measurement.press.cmyk?.c || '',
                    measurement.press.cmyk?.m || '',
                    measurement.press.cmyk?.y || '',
                    measurement.press.cmyk?.k || '',
                    measurement.deltaE.de76 || '',
                    measurement.deltaE.de94 || '',
                    measurement.deltaE.de2000 || '',
                    measurement.tolerance.zone || '',
                    measurement.substrate || '',
                    measurement.operator || '',
                    measurement.jobId || '',
                    `"${(measurement.notes || '').replace(/"/g, '""')}"`
                ];
                csvData.push(row.join(','));
            });

            const csvContent = csvData.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `measurement-history-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            console.log('Measurement history exported to CSV');

        } catch (error) {
            console.error('Error exporting to CSV:', error);
        }
    }

    /**
     * Export measurements to JSON
     * Requirements: 9.5 - Data export functionality
     */
    exportToJSON() {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                statistics: this.statistics,
                measurements: this.measurements,
                settings: this.settings
            };

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `measurement-history-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            console.log('Measurement history exported to JSON');

        } catch (error) {
            console.error('Error exporting to JSON:', error);
        }
    }
}

// Create global instance
const measurementHistory = new MeasurementHistoryManager();

// Export for use by other modules
window.measurementHistory = measurementHistory;

console.log('Measurement History module loaded successfully');
/**

 * History Visualization Component
 * Requirements: 9.5 - Add history visualization and data export functionality
 */
class HistoryVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.canvas = null;
        this.ctx = null;
        this.data = [];
        this.config = {
            width: 800,
            height: 400,
            margin: { top: 20, right: 30, bottom: 40, left: 60 },
            colors: {
                excellent: '#10b981',
                good: '#f59e0b', 
                acceptable: '#ef4444',
                poor: '#7c2d12',
                grid: '#e5e7eb',
                axis: '#6b7280',
                text: '#374151'
            }
        };
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
    }

    createCanvas() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Visualization container not found:', this.containerId);
            return;
        }

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.style.border = '1px solid #e5e7eb';
        this.canvas.style.borderRadius = '8px';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Clear container and add canvas
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }

    setupEventListeners() {
        // Listen for measurement updates
        document.addEventListener('measurementLogged', () => {
            this.updateVisualization();
        });

        // Handle canvas resize
        window.addEventListener('resize', () => {
            this.debounce(() => this.updateVisualization(), 300);
        });
    }

    updateVisualization(measurements = null) {
        if (!measurements) {
            measurements = measurementHistory.measurements.slice(0, 50); // Last 50 measurements
        }

        this.data = measurements.reverse(); // Chronological order
        this.render();
    }

    render() {
        if (!this.ctx || this.data.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);

        // Calculate drawing area
        const drawWidth = this.config.width - this.config.margin.left - this.config.margin.right;
        const drawHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

        // Extract ΔE values
        const deltaEValues = this.data.map(m => m.deltaE.de2000).filter(de => de !== null && !isNaN(de));
        
        if (deltaEValues.length === 0) {
            this.renderEmptyState();
            return;
        }

        const maxDeltaE = Math.max(...deltaEValues, 5); // Minimum scale of 5
        const minDeltaE = 0;

        // Draw grid and axes
        this.drawGrid(drawWidth, drawHeight, maxDeltaE);
        this.drawAxes(drawWidth, drawHeight);

        // Draw tolerance zones
        this.drawToleranceZones(drawWidth, drawHeight, maxDeltaE);

        // Draw data points and trend line
        this.drawDataPoints(drawWidth, drawHeight, maxDeltaE, minDeltaE);
        this.drawTrendLine(drawWidth, drawHeight, maxDeltaE, minDeltaE);

        // Draw labels
        this.drawLabels(drawWidth, drawHeight, maxDeltaE);
    }

    drawGrid(width, height, maxDeltaE) {
        this.ctx.strokeStyle = this.config.colors.grid;
        this.ctx.lineWidth = 1;

        // Horizontal grid lines
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = this.config.margin.top + (height / ySteps) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(this.config.margin.left, y);
            this.ctx.lineTo(this.config.margin.left + width, y);
            this.ctx.stroke();
        }

        // Vertical grid lines
        const xSteps = Math.min(10, this.data.length - 1);
        if (xSteps > 0) {
            for (let i = 0; i <= xSteps; i++) {
                const x = this.config.margin.left + (width / xSteps) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.config.margin.top);
                this.ctx.lineTo(x, this.config.margin.top + height);
                this.ctx.stroke();
            }
        }
    }

    drawAxes(width, height) {
        this.ctx.strokeStyle = this.config.colors.axis;
        this.ctx.lineWidth = 2;

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.margin.left, this.config.margin.top);
        this.ctx.lineTo(this.config.margin.left, this.config.margin.top + height);
        this.ctx.stroke();

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.margin.left, this.config.margin.top + height);
        this.ctx.lineTo(this.config.margin.left + width, this.config.margin.top + height);
        this.ctx.stroke();
    }

    drawToleranceZones(width, height, maxDeltaE) {
        const zones = [
            { threshold: 1.0, color: this.config.colors.excellent, alpha: 0.1 },
            { threshold: 2.0, color: this.config.colors.good, alpha: 0.1 },
            { threshold: 4.0, color: this.config.colors.acceptable, alpha: 0.1 }
        ];

        zones.forEach(zone => {
            const y = this.config.margin.top + height - (zone.threshold / maxDeltaE) * height;
            
            // Draw zone background
            this.ctx.fillStyle = zone.color + Math.round(zone.alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(this.config.margin.left, y, width, this.config.margin.top + height - y);
            
            // Draw threshold line
            this.ctx.strokeStyle = zone.color;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.config.margin.left, y);
            this.ctx.lineTo(this.config.margin.left + width, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }

    drawDataPoints(width, height, maxDeltaE, minDeltaE) {
        if (this.data.length === 0) return;

        const xStep = width / Math.max(1, this.data.length - 1);

        this.data.forEach((measurement, index) => {
            const deltaE = measurement.deltaE.de2000;
            if (deltaE === null || isNaN(deltaE)) return;

            const x = this.config.margin.left + index * xStep;
            const y = this.config.margin.top + height - ((deltaE - minDeltaE) / (maxDeltaE - minDeltaE)) * height;

            // Determine point color based on tolerance
            let color = this.config.colors.poor;
            if (deltaE <= 1.0) color = this.config.colors.excellent;
            else if (deltaE <= 2.0) color = this.config.colors.good;
            else if (deltaE <= 4.0) color = this.config.colors.acceptable;

            // Draw point
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw point border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    drawTrendLine(width, height, maxDeltaE, minDeltaE) {
        if (this.data.length < 2) return;

        // Calculate trend line using linear regression
        const points = this.data.map((m, index) => ({
            x: index,
            y: m.deltaE.de2000
        })).filter(p => p.y !== null && !isNaN(p.y));

        if (points.length < 2) return;

        const n = points.length;
        const sumX = points.reduce((acc, p) => acc + p.x, 0);
        const sumY = points.reduce((acc, p) => acc + p.y, 0);
        const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
        const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Draw trend line
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);

        const startX = this.config.margin.left;
        const endX = this.config.margin.left + width;
        const startY = this.config.margin.top + height - ((intercept - minDeltaE) / (maxDeltaE - minDeltaE)) * height;
        const endY = this.config.margin.top + height - ((slope * (this.data.length - 1) + intercept - minDeltaE) / (maxDeltaE - minDeltaE)) * height;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawLabels(width, height, maxDeltaE) {
        this.ctx.fillStyle = this.config.colors.text;
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'center';

        // Y-axis labels
        this.ctx.textAlign = 'right';
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const value = (maxDeltaE / ySteps) * (ySteps - i);
            const y = this.config.margin.top + (height / ySteps) * i;
            this.ctx.fillText(value.toFixed(1), this.config.margin.left - 10, y + 4);
        }

        // X-axis label
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Measurement Sequence', this.config.margin.left + width / 2, this.config.height - 10);

        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.config.margin.top + height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('ΔE 2000', 0, 0);
        this.ctx.restore();

        // Title
        this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillText('Measurement History Trend', this.config.margin.left + width / 2, 15);
    }

    renderEmptyState() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        
        // Draw empty state message
        this.ctx.fillStyle = this.config.colors.text;
        this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No measurement data available', this.config.width / 2, this.config.height / 2);
        
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fillText('Perform some color calculations to see the trend analysis', this.config.width / 2, this.config.height / 2 + 25);
    }

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

    exportChart() {
        if (!this.canvas) return null;
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.download = `measurement-trend-${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        console.log('Chart exported as PNG');
    }
}

// Add visualization to the measurement history manager
MeasurementHistoryManager.prototype.createVisualization = function(containerId) {
    return new HistoryVisualization(containerId);
};

// Update the global instance
window.HistoryVisualization = HistoryVisualization;