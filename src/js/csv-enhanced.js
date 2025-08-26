// Enhanced CSV Import/Export Module
// Extends existing export.js functionality with advanced HD features
// Supports batch color analysis, grid import/export, and heatmap data

console.log('Enhanced CSV module loading...');

// CSV Processing State
let CSV_STATE = {
    importBuffer: [],
    exportQueue: [],
    processingStatus: 'idle',
    lastImport: null,
    batchSize: 1000
};

/**
 * Enhanced CSV Import with Streaming for Large Files
 * Supports LAB data import with validation and error handling
 */
async function importCSVWithStreaming(file, options = {}) {
    const {
        maxRows = 10000,
        validateData = true,
        onProgress = null,
        chunkSize = 1024 * 1024 // 1MB chunks
    } = options;
    
    try {
        CSV_STATE.processingStatus = 'importing';
        let processedRows = 0;
        let validRows = 0;
        const results = [];
        
        // For small files, use direct processing
        if (file.size < chunkSize) {
            const text = await file.text();
            return parseCSVText(text, { maxRows, validateData });
        }
        
        // Stream processing for large files
        let offset = 0;
        let leftoverText = '';
        let headerParsed = false;
        let columnIndices = null;
        
        while (offset < file.size && validRows < maxRows) {
            const slice = file.slice(offset, Math.min(file.size, offset + chunkSize));
            const chunk = await slice.text();
            
            const textToProcess = leftoverText + chunk;
            const lines = textToProcess.split(/\r?\n/);
            
            // Keep the last incomplete line for next iteration
            leftoverText = lines.pop() || '';
            
            for (const line of lines) {
                if (!line.trim()) continue;
                
                processedRows++;
                
                if (!headerParsed) {
                    columnIndices = parseCSVHeader(line);
                    if (!columnIndices) {
                        throw new Error('Invalid CSV header - must contain L*, a*, b* columns');
                    }
                    headerParsed = true;
                    continue;
                }
                
                const rowData = parseCSVRow(line, columnIndices, validateData);
                if (rowData) {
                    results.push(rowData);
                    validRows++;
                }
                
                // Report progress
                if (onProgress && processedRows % 100 === 0) {
                    onProgress({
                        processed: processedRows,
                        valid: validRows,
                        progress: Math.min(1, offset / file.size)
                    });
                }
                
                if (validRows >= maxRows) break;
            }
            
            offset += chunkSize;
        }
        
        // Process any remaining text
        if (leftoverText.trim() && validRows < maxRows) {
            const rowData = parseCSVRow(leftoverText, columnIndices, validateData);
            if (rowData) {
                results.push(rowData);
                validRows++;
            }
        }
        
        CSV_STATE.processingStatus = 'idle';
        CSV_STATE.lastImport = {
            timestamp: new Date().toISOString(),
            filename: file.name,
            totalRows: processedRows,
            validRows: validRows
        };
        
        return {
            success: true,
            data: results,
            totalRows: processedRows,
            validRows: validRows,
            message: `Imported ${validRows} valid rows from ${processedRows} total rows`
        };
        
    } catch (error) {
        CSV_STATE.processingStatus = 'error';
        console.error('Error in CSV streaming import:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

/**
 * Parse CSV Text (for smaller files)
 */
function parseCSVText(text, options = {}) {
    const { maxRows = 10000, validateData = true } = options;
    
    try {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must contain at least a header and one data row');
        }
        
        const columnIndices = parseCSVHeader(lines[0]);
        if (!columnIndices) {
            throw new Error('Invalid CSV header - must contain L*, a*, b* columns');
        }
        
        const results = [];
        let validRows = 0;
        
        for (let i = 1; i < lines.length && validRows < maxRows; i++) {
            const rowData = parseCSVRow(lines[i], columnIndices, validateData);
            if (rowData) {
                results.push(rowData);
                validRows++;
            }
        }
        
        return {
            success: true,
            data: results,
            totalRows: lines.length - 1,
            validRows: validRows,
            message: `Parsed ${validRows} valid LAB color values`
        };
        
    } catch (error) {
        console.error('Error parsing CSV text:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

/**
 * Parse CSV Header to Find Column Indices
 */
function parseCSVHeader(headerLine) {
    try {
        const columns = headerLine.split(/,|;|\t/).map(h => h.trim().toLowerCase());
        
        const lIndex = columns.findIndex(h => /^l\*?$/i.test(h));
        const aIndex = columns.findIndex(h => /^a\*?$/i.test(h));
        const bIndex = columns.findIndex(h => /^b\*?$/i.test(h));
        
        // Optional CMYK columns
        const cIndex = columns.findIndex(h => /^c(yan)?$/i.test(h));
        const mIndex = columns.findIndex(h => /^m(agenta)?$/i.test(h));
        const yIndex = columns.findIndex(h => /^y(ellow)?$/i.test(h));
        const kIndex = columns.findIndex(h => /^k|black$/i.test(h));
        
        if (lIndex === -1 || aIndex === -1 || bIndex === -1) {
            return null;
        }
        
        return {
            l: lIndex,
            a: aIndex,
            b: bIndex,
            c: cIndex >= 0 ? cIndex : null,
            m: mIndex >= 0 ? mIndex : null,
            y: yIndex >= 0 ? yIndex : null,
            k: kIndex >= 0 ? kIndex : null
        };
        
    } catch (error) {
        console.error('Error parsing CSV header:', error);
        return null;
    }
}

/**
 * Parse Individual CSV Row
 */
function parseCSVRow(line, columnIndices, validateData = true) {
    try {
        const columns = line.split(/,|;|\t/);
        
        const L = parseFloat(columns[columnIndices.l]);
        const a = parseFloat(columns[columnIndices.a]);
        const b = parseFloat(columns[columnIndices.b]);
        
        if (isNaN(L) || isNaN(a) || isNaN(b)) {
            return null; // Skip invalid rows
        }
        
        const rowData = {
            lab: {
                l: validateData ? Math.max(0, Math.min(100, L)) : L,
                a: validateData ? Math.max(-128, Math.min(127, a)) : a,
                b: validateData ? Math.max(-128, Math.min(127, b)) : b
            }
        };
        
        // Add CMYK data if available
        if (columnIndices.c !== null) {
            const C = parseFloat(columns[columnIndices.c]);
            const M = parseFloat(columns[columnIndices.m]);
            const Y = parseFloat(columns[columnIndices.y]);
            const K = parseFloat(columns[columnIndices.k]);
            
            if (!isNaN(C) && !isNaN(M) && !isNaN(Y) && !isNaN(K)) {
                rowData.cmyk = {
                    c: validateData ? Math.max(0, Math.min(100, C)) : C,
                    m: validateData ? Math.max(0, Math.min(100, M)) : M,
                    y: validateData ? Math.max(0, Math.min(100, Y)) : Y,
                    k: validateData ? Math.max(0, Math.min(100, K)) : K
                };
            }
        }
        
        return rowData;
        
    } catch (error) {
        return null; // Skip rows with parsing errors
    }
}

/**
 * Export Grid Data to CSV
 * Supports both basic and extended formats
 */
function exportGridToCSV(gridData, options = {}) {
    const {
        includeDeltas = true,
        includeCMYK = true,
        includeHeatmapData = false,
        filename = 'color_grid_export.csv'
    } = options;
    
    try {
        if (!gridData || !Array.isArray(gridData) || gridData.length === 0) {
            throw new Error('No grid data to export');
        }
        
        // Build CSV header
        const headers = ['Row', 'Column', 'Target_L', 'Target_A', 'Target_B', 'Sample_L', 'Sample_A', 'Sample_B'];
        
        if (includeDeltas) {
            headers.push('Delta_E', 'Delta_E2000', 'Delta_L', 'Delta_A', 'Delta_B');
        }
        
        if (includeCMYK) {
            headers.push('C', 'M', 'Y', 'K');
        }
        
        if (includeHeatmapData) {
            headers.push('Heatmap_Value', 'Zone_Classification');
        }
        
        // Build CSV rows
        const csvRows = [headers.join(',')];
        
        gridData.forEach((row, rowIndex) => {
            if (Array.isArray(row)) {
                row.forEach((cell, colIndex) => {
                    const csvRow = buildGridRowCSV(cell, rowIndex, colIndex, {
                        includeDeltas,
                        includeCMYK,
                        includeHeatmapData
                    });
                    csvRows.push(csvRow);
                });
            }
        });
        
        const csvContent = csvRows.join('\n');
        downloadCSV(csvContent, filename);
        
        return {
            success: true,
            rows: csvRows.length - 1, // Excluding header
            message: `Exported ${csvRows.length - 1} color measurements to ${filename}`
        };
        
    } catch (error) {
        console.error('Error exporting grid to CSV:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Build Individual Grid Row for CSV Export
 */
function buildGridRowCSV(cell, rowIndex, colIndex, options) {
    const { includeDeltas, includeCMYK, includeHeatmapData } = options;
    
    const row = [
        rowIndex + 1,
        colIndex + 1,
        cell.target?.l?.toFixed(2) || '',
        cell.target?.a?.toFixed(2) || '',
        cell.target?.b?.toFixed(2) || '',
        cell.sample?.l?.toFixed(2) || '',
        cell.sample?.a?.toFixed(2) || '',
        cell.sample?.b?.toFixed(2) || ''
    ];
    
    if (includeDeltas) {
        row.push(
            cell.deltaE?.toFixed(2) || '',
            cell.deltaE2000?.toFixed(2) || '',
            cell.deltaL?.toFixed(2) || '',
            cell.deltaA?.toFixed(2) || '',
            cell.deltaB?.toFixed(2) || ''
        );
    }
    
    if (includeCMYK && cell.cmyk) {
        row.push(
            cell.cmyk.c?.toFixed(1) || '',
            cell.cmyk.m?.toFixed(1) || '',
            cell.cmyk.y?.toFixed(1) || '',
            cell.cmyk.k?.toFixed(1) || ''
        );
    }
    
    if (includeHeatmapData) {
        const zone = window.colorScience?.getToleranceZone(cell.deltaE || 0) || 'unknown';
        row.push(
            cell.deltaE?.toFixed(2) || '0',
            zone
        );
    }
    
    return row.join(',');
}

/**
 * Export Color Analysis Report
 * Comprehensive analysis with statistics and recommendations
 */
function exportColorAnalysisReport(analysisData, options = {}) {
    const {
        includeStatistics = true,
        includeRecommendations = true,
        includeHistory = false,
        filename = 'color_analysis_report.csv'
    } = options;
    
    try {
        const csvRows = [];
        
        // Report Header
        csvRows.push('HD CMYK Color Analysis Report');
        csvRows.push(`Generated: ${new Date().toLocaleString()}`);
        csvRows.push('');
        
        // Main Analysis Data
        if (analysisData.target && analysisData.sample) {
            csvRows.push('TARGET,L*,a*,b*');
            csvRows.push(`Target Color,${analysisData.target.l},${analysisData.target.a},${analysisData.target.b}`);
            csvRows.push('');
            
            csvRows.push('SAMPLE,L*,a*,b*');
            csvRows.push(`Sample Color,${analysisData.sample.l},${analysisData.sample.a},${analysisData.sample.b}`);
            csvRows.push('');
            
            csvRows.push('COLOR DIFFERENCE');
            csvRows.push(`Delta E (CIE76),${analysisData.deltaE?.toFixed(2) || 'N/A'}`);
            csvRows.push(`Delta E2000,${analysisData.deltaE2000?.toFixed(2) || 'N/A'}`);
            csvRows.push(`Tolerance Zone,${analysisData.toleranceZone || 'Unknown'}`);
            csvRows.push('');
        }
        
        // Statistics Section
        if (includeStatistics && analysisData.statistics) {
            csvRows.push('STATISTICAL ANALYSIS');
            csvRows.push('Metric,Value');
            Object.entries(analysisData.statistics).forEach(([key, value]) => {
                csvRows.push(`${key},${typeof value === 'number' ? value.toFixed(2) : value}`);
            });
            csvRows.push('');
        }
        
        // Recommendations Section
        if (includeRecommendations && analysisData.recommendations) {
            csvRows.push('RECOMMENDATIONS');
            csvRows.push('Priority,Channel,Adjustment,Description');
            analysisData.recommendations.forEach(rec => {
                csvRows.push(`${rec.priority},${rec.channel || 'General'},${rec.adjustment || 'N/A'},${rec.description}`);
            });
            csvRows.push('');
        }
        
        // History Section
        if (includeHistory && analysisData.history) {
            csvRows.push('CALCULATION HISTORY');
            csvRows.push('Timestamp,Target_L,Target_A,Target_B,Sample_L,Sample_A,Sample_B,Delta_E');
            analysisData.history.forEach(entry => {
                csvRows.push(`${entry.timestamp},${entry.target.l},${entry.target.a},${entry.target.b},${entry.sample.l},${entry.sample.a},${entry.sample.b},${entry.deltaE}`);
            });
        }
        
        const csvContent = csvRows.join('\n');
        downloadCSV(csvContent, filename);
        
        return {
            success: true,
            message: `Analysis report exported to ${filename}`
        };
        
    } catch (error) {
        console.error('Error exporting analysis report:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Import Color Library from CSV/JSON
 * Supports both Pantone-style libraries and custom color libraries
 */
function importColorLibrary(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                let libraryData = [];
                const fileContent = event.target.result;
                const isJSON = file.name.toLowerCase().endsWith('.json');
                
                if (isJSON) {
                    libraryData = JSON.parse(fileContent);
                } else {
                    // Parse CSV format
                    const parseResult = parseCSVText(fileContent, { validateData: true, maxRows: 5000 });
                    if (parseResult.success) {
                        libraryData = parseResult.data.map((item, index) => ({
                            id: `imported_${index}`,
                            name: `Color ${index + 1}`,
                            lab: item.lab,
                            cmyk: item.cmyk,
                            source: 'imported',
                            timestamp: new Date().toISOString()
                        }));
                    } else {
                        throw new Error(parseResult.error);
                    }
                }
                
                // Validate library format
                if (!Array.isArray(libraryData)) {
                    throw new Error('Library data must be an array of color objects');
                }
                
                // Validate each color entry
                const validatedLibrary = libraryData.filter(color => {
                    return color.lab && 
                           typeof color.lab.l === 'number' &&
                           typeof color.lab.a === 'number' &&
                           typeof color.lab.b === 'number';
                });
                
                resolve({
                    success: true,
                    data: validatedLibrary,
                    totalColors: libraryData.length,
                    validColors: validatedLibrary.length,
                    message: `Imported ${validatedLibrary.length} colors from ${file.name}`
                });
                
            } catch (error) {
                resolve({
                    success: false,
                    error: error.message,
                    data: []
                });
            }
        };
        
        reader.onerror = () => {
            resolve({
                success: false,
                error: 'Failed to read file',
                data: []
            });
        };
        
        reader.readAsText(file);
    });
}

/**
 * Download CSV Content
 * Universal CSV download function
 */
function downloadCSV(content, filename) {
    try {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
            throw new Error('Browser does not support CSV download');
        }
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw error;
    }
}

/**
 * Batch Color Processing
 * Process multiple colors efficiently with progress reporting
 */
async function batchProcessColors(colorData, processingFunction, options = {}) {
    const {
        batchSize = 100,
        onProgress = null,
        onComplete = null,
        validateResults = true
    } = options;
    
    try {
        CSV_STATE.processingStatus = 'processing';
        const results = [];
        const total = colorData.length;
        let processed = 0;
        
        for (let i = 0; i < colorData.length; i += batchSize) {
            const batch = colorData.slice(i, i + batchSize);
            
            // Process batch
            const batchResults = await Promise.all(
                batch.map(async (colorItem) => {
                    try {
                        const result = await processingFunction(colorItem);
                        return validateResults ? validateProcessingResult(result) : result;
                    } catch (error) {
                        return { error: error.message, originalData: colorItem };
                    }
                })
            );
            
            results.push(...batchResults);
            processed += batch.length;
            
            // Report progress
            if (onProgress) {
                onProgress({
                    processed,
                    total,
                    progress: processed / total,
                    currentBatch: Math.floor(i / batchSize) + 1,
                    totalBatches: Math.ceil(total / batchSize)
                });
            }
            
            // Yield control to prevent blocking
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        CSV_STATE.processingStatus = 'idle';
        
        if (onComplete) {
            onComplete(results);
        }
        
        return {
            success: true,
            results,
            processed,
            total
        };
        
    } catch (error) {
        CSV_STATE.processingStatus = 'error';
        console.error('Error in batch processing:', error);
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
}

/**
 * Validate Processing Result
 */
function validateProcessingResult(result) {
    if (!result || typeof result !== 'object') {
        return { error: 'Invalid processing result' };
    }
    
    // Add any specific validation logic here
    return result;
}

// Export enhanced CSV functions
window.csvEnhanced = {
    // Import functions
    importCSVWithStreaming,
    parseCSVText,
    importColorLibrary,
    
    // Export functions
    exportGridToCSV,
    exportColorAnalysisReport,
    downloadCSV,
    
    // Processing functions
    batchProcessColors,
    
    // State management
    getState: () => CSV_STATE,
    
    // Utility functions
    parseCSVHeader,
    parseCSVRow,
    buildGridRowCSV
};

// Integrate with existing export module if available
if (window.colorExport) {
    window.colorExport.enhanced = window.csvEnhanced;
    console.log('Enhanced CSV functionality integrated with existing export module');
} else {
    // Create basic export namespace if it doesn't exist
    window.colorExport = { enhanced: window.csvEnhanced };
}

console.log('Enhanced CSV module loaded successfully');