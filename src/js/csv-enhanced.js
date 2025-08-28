// Enhanced CSV Import and Processing Module
// Requirements: 3.1, 3.2 - CSV import functionality with robust parsing for L*a*b* data

console.log('Enhanced CSV module loading...');

/**
 * CSV Parser with robust error handling and multiple format support
 * Supports various CSV formats commonly used in color measurement
 */
class CSVParser {
    constructor() {
        this.supportedFormats = [
            'lab', // L*, a*, b* columns
            'xyz', // X, Y, Z columns  
            'rgb', // R, G, B columns
            'cmyk', // C, M, Y, K columns
            'mixed' // Mixed format detection
        ];
        
        this.commonDelimiters = [',', ';', '\t', '|'];
        this.parseStats = {
            totalRows: 0,
            validRows: 0,
            errors: []
        };
    }

    /**
     * Parse CSV file with automatic format detection
     * Requirements: 3.1 - Implement CSV import functionality with robust parsing
     */
    async parseFile(file, options = {}) {
        try {
            console.log(`Parsing CSV file: ${file.name} (${file.size} bytes)`);
            
            // Reset parse statistics
            this.resetParseStats();
            
            // Read file content
            const content = await this.readFileContent(file);
            
            // Detect format and delimiter
            const formatInfo = this.detectFormat(content);
            console.log('Detected format:', formatInfo);
            
            // Parse content based on detected format
            const parsedData = this.parseContent(content, formatInfo, options);
            
            // Validate and clean data
            const cleanedData = this.validateAndCleanData(parsedData, formatInfo);
            
            console.log(`CSV parsing complete: ${this.parseStats.validRows}/${this.parseStats.totalRows} valid rows`);
            
            return {
                success: true,
                data: cleanedData,
                format: formatInfo,
                stats: { ...this.parseStats },
                metadata: {
                    filename: file.name,
                    fileSize: file.size,
                    parseTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('CSV parsing error:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                stats: { ...this.parseStats }
            };
        }
    }

    /**
     * Read file content with encoding detection
     */
    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    let content = e.target.result;
                    
                    // Handle different encodings and line endings
                    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                    
                    // Remove BOM if present
                    if (content.charCodeAt(0) === 0xFEFF) {
                        content = content.slice(1);
                    }
                    
                    resolve(content);
                } catch (error) {
                    reject(new Error(`Failed to read file content: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Detect CSV format and delimiter
     */
    detectFormat(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Empty CSV file');
        }

        // Detect delimiter
        const delimiter = this.detectDelimiter(lines[0]);
        
        // Parse header row
        const headers = this.parseRow(lines[0], delimiter)
            .map(h => h.toLowerCase().trim());
        
        // Detect format based on headers
        const format = this.detectFormatFromHeaders(headers);
        
        return {
            delimiter,
            headers,
            format,
            hasHeader: this.hasHeaderRow(headers),
            totalLines: lines.length
        };
    }

    /**
     * Detect CSV delimiter
     */
    detectDelimiter(firstLine) {
        const delimiterCounts = {};
        
        this.commonDelimiters.forEach(delimiter => {
            delimiterCounts[delimiter] = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
        });
        
        // Return delimiter with highest count
        return Object.keys(delimiterCounts).reduce((a, b) => 
            delimiterCounts[a] > delimiterCounts[b] ? a : b
        );
    }

    /**
     * Detect format from header row
     */
    detectFormatFromHeaders(headers) {
        const headerStr = headers.join(' ').toLowerCase();
        
        // Check for LAB format
        if (headerStr.includes('l*') || headerStr.includes('l_') || 
            (headerStr.includes('l') && headerStr.includes('a') && headerStr.includes('b'))) {
            return 'lab';
        }
        
        // Check for XYZ format
        if (headerStr.includes('x') && headerStr.includes('y') && headerStr.includes('z')) {
            return 'xyz';
        }
        
        // Check for RGB format
        if (headerStr.includes('r') && headerStr.includes('g') && headerStr.includes('b')) {
            return 'rgb';
        }
        
        // Check for CMYK format
        if (headerStr.includes('c') && headerStr.includes('m') && 
            headerStr.includes('y') && headerStr.includes('k')) {
            return 'cmyk';
        }
        
        return 'mixed';
    }

    /**
     * Check if first row is header
     */
    hasHeaderRow(headers) {
        // Check if any header contains non-numeric characters
        return headers.some(header => 
            isNaN(parseFloat(header)) || header.match(/[a-zA-Z*]/));
    }

    /**
     * Parse CSV content into structured data
     */
    parseContent(content, formatInfo, options) {
        const lines = content.split('\n').filter(line => line.trim());
        const data = [];
        
        // Skip header row if present
        const startIndex = formatInfo.hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            this.parseStats.totalRows++;
            
            try {
                const row = this.parseRow(lines[i], formatInfo.delimiter);
                const parsedRow = this.parseDataRow(row, formatInfo, i + 1);
                
                if (parsedRow) {
                    data.push(parsedRow);
                    this.parseStats.validRows++;
                }
            } catch (error) {
                this.parseStats.errors.push({
                    row: i + 1,
                    error: error.message,
                    data: lines[i]
                });
            }
        }
        
        return data;
    }

    /**
     * Parse individual CSV row
     */
    parseRow(line, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Parse data row based on detected format
     */
    parseDataRow(row, formatInfo, rowNumber) {
        try {
            switch (formatInfo.format) {
                case 'lab':
                    return this.parseLabRow(row, formatInfo.headers, rowNumber);
                case 'xyz':
                    return this.parseXyzRow(row, formatInfo.headers, rowNumber);
                case 'rgb':
                    return this.parseRgbRow(row, formatInfo.headers, rowNumber);
                case 'cmyk':
                    return this.parseCmykRow(row, formatInfo.headers, rowNumber);
                default:
                    return this.parseMixedRow(row, formatInfo.headers, rowNumber);
            }
        } catch (error) {
            throw new Error(`Row ${rowNumber}: ${error.message}`);
        }
    }

    /**
     * Parse LAB format row
     */
    parseLabRow(row, headers, rowNumber) {
        const labData = { type: 'lab', row: rowNumber };
        
        // Find L*, a*, b* columns
        const lIndex = this.findColumnIndex(headers, ['l*', 'l_', 'l', 'lightness']);
        const aIndex = this.findColumnIndex(headers, ['a*', 'a_', 'a', 'green_red']);
        const bIndex = this.findColumnIndex(headers, ['b*', 'b_', 'b', 'blue_yellow']);
        
        if (lIndex === -1 || aIndex === -1 || bIndex === -1) {
            throw new Error('Missing required LAB columns');
        }
        
        labData.l = this.parseNumericValue(row[lIndex], 'L*', 0, 100);
        labData.a = this.parseNumericValue(row[aIndex], 'a*', -128, 127);
        labData.b = this.parseNumericValue(row[bIndex], 'b*', -128, 127);
        
        // Look for optional patch ID or name
        const idIndex = this.findColumnIndex(headers, ['id', 'patch', 'name', 'sample']);
        if (idIndex !== -1 && row[idIndex]) {
            labData.id = row[idIndex];
        }
        
        return labData;
    }

    /**
     * Parse XYZ format row and convert to LAB
     */
    parseXyzRow(row, headers, rowNumber) {
        const xIndex = this.findColumnIndex(headers, ['x', 'x_value']);
        const yIndex = this.findColumnIndex(headers, ['y', 'y_value']);
        const zIndex = this.findColumnIndex(headers, ['z', 'z_value']);
        
        if (xIndex === -1 || yIndex === -1 || zIndex === -1) {
            throw new Error('Missing required XYZ columns');
        }
        
        const x = this.parseNumericValue(row[xIndex], 'X');
        const y = this.parseNumericValue(row[yIndex], 'Y');
        const z = this.parseNumericValue(row[zIndex], 'Z');
        
        // Convert XYZ to LAB using color science module
        if (window.xyzToLab) {
            const lab = window.xyzToLab(x, y, z);
            return {
                type: 'lab',
                row: rowNumber,
                l: lab.l,
                a: lab.a,
                b: lab.b,
                originalXyz: { x, y, z }
            };
        } else {
            throw new Error('XYZ to LAB conversion not available');
        }
    }

    /**
     * Parse RGB format row and convert to LAB
     */
    parseRgbRow(row, headers, rowNumber) {
        const rIndex = this.findColumnIndex(headers, ['r', 'red']);
        const gIndex = this.findColumnIndex(headers, ['g', 'green']);
        const bIndex = this.findColumnIndex(headers, ['b', 'blue']);
        
        if (rIndex === -1 || gIndex === -1 || bIndex === -1) {
            throw new Error('Missing required RGB columns');
        }
        
        const r = this.parseNumericValue(row[rIndex], 'R', 0, 255);
        const g = this.parseNumericValue(row[gIndex], 'G', 0, 255);
        const b = this.parseNumericValue(row[bIndex], 'B', 0, 255);
        
        // Convert RGB to LAB via XYZ
        if (window.rgbToXyz && window.xyzToLab) {
            const xyz = window.rgbToXyz(r, g, b);
            const lab = window.xyzToLab(xyz.x, xyz.y, xyz.z);
            return {
                type: 'lab',
                row: rowNumber,
                l: lab.l,
                a: lab.a,
                b: lab.b,
                originalRgb: { r, g, b }
            };
        } else {
            throw new Error('RGB to LAB conversion not available');
        }
    }

    /**
     * Parse CMYK format row and convert to LAB
     */
    parseCmykRow(row, headers, rowNumber) {
        const cIndex = this.findColumnIndex(headers, ['c', 'cyan']);
        const mIndex = this.findColumnIndex(headers, ['m', 'magenta']);
        const yIndex = this.findColumnIndex(headers, ['y', 'yellow']);
        const kIndex = this.findColumnIndex(headers, ['k', 'black', 'key']);
        
        if (cIndex === -1 || mIndex === -1 || yIndex === -1 || kIndex === -1) {
            throw new Error('Missing required CMYK columns');
        }
        
        const c = this.parseNumericValue(row[cIndex], 'C', 0, 100);
        const m = this.parseNumericValue(row[mIndex], 'M', 0, 100);
        const y = this.parseNumericValue(row[yIndex], 'Y', 0, 100);
        const k = this.parseNumericValue(row[kIndex], 'K', 0, 100);
        
        // Convert CMYK to LAB via RGB and XYZ
        if (window.cmykToRgb && window.rgbToXyz && window.xyzToLab) {
            const rgb = window.cmykToRgb(c, m, y, k);
            const xyz = window.rgbToXyz(rgb.r, rgb.g, rgb.b);
            const lab = window.xyzToLab(xyz.x, xyz.y, xyz.z);
            return {
                type: 'lab',
                row: rowNumber,
                l: lab.l,
                a: lab.a,
                b: lab.b,
                originalCmyk: { c, m, y, k }
            };
        } else {
            throw new Error('CMYK to LAB conversion not available');
        }
    }

    /**
     * Parse mixed format row (auto-detect columns)
     */
    parseMixedRow(row, headers, rowNumber) {
        // Try to find any recognizable color data
        const numericValues = row.map(val => parseFloat(val)).filter(val => !isNaN(val));
        
        if (numericValues.length >= 3) {
            // Assume first three numeric values are L*, a*, b*
            return {
                type: 'lab',
                row: rowNumber,
                l: Math.max(0, Math.min(100, numericValues[0])),
                a: Math.max(-128, Math.min(127, numericValues[1])),
                b: Math.max(-128, Math.min(127, numericValues[2]))
            };
        }
        
        throw new Error('Unable to parse row - insufficient numeric data');
    }

    /**
     * Find column index by name variations
     */
    findColumnIndex(headers, variations) {
        for (const variation of variations) {
            const index = headers.findIndex(header => 
                header.toLowerCase().includes(variation.toLowerCase()));
            if (index !== -1) return index;
        }
        return -1;
    }

    /**
     * Parse and validate numeric value
     */
    parseNumericValue(value, fieldName, min = -Infinity, max = Infinity) {
        if (!value || value.trim() === '') {
            throw new Error(`Empty ${fieldName} value`);
        }
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            throw new Error(`Invalid ${fieldName} value: ${value}`);
        }
        
        if (numValue < min || numValue > max) {
            console.warn(`${fieldName} value ${numValue} outside range [${min}, ${max}], clamping`);
            return Math.max(min, Math.min(max, numValue));
        }
        
        return numValue;
    }

    /**
     * Validate and clean parsed data
     */
    validateAndCleanData(data, formatInfo) {
        return data.filter(row => {
            // Validate LAB ranges
            if (row.type === 'lab') {
                const validL = row.l >= 0 && row.l <= 100;
                const validA = row.a >= -128 && row.a <= 127;
                const validB = row.b >= -128 && row.b <= 127;
                
                if (!validL || !validA || !validB) {
                    this.parseStats.errors.push({
                        row: row.row,
                        error: 'LAB values outside valid range',
                        data: `L:${row.l} a:${row.a} b:${row.b}`
                    });
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Reset parse statistics
     */
    resetParseStats() {
        this.parseStats = {
            totalRows: 0,
            validRows: 0,
            errors: []
        };
    }

    /**
     * Generate parsing report
     */
    generateParseReport(result) {
        const report = {
            success: result.success,
            summary: {
                totalRows: result.stats.totalRows,
                validRows: result.stats.validRows,
                errorRows: result.stats.errors.length,
                successRate: result.stats.totalRows > 0 ? 
                    (result.stats.validRows / result.stats.totalRows * 100).toFixed(1) + '%' : '0%'
            },
            format: result.format,
            errors: result.stats.errors.slice(0, 10), // Show first 10 errors
            hasMoreErrors: result.stats.errors.length > 10
        };
        
        return report;
    }
}

// Export CSV parser for use in other modules
window.CSVParser = CSVParser;

console.log('Enhanced CSV module loaded successfully');