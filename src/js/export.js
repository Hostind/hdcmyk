// LAB Color Matching Calculator - Export Functions
// Requirements: 9.1, 9.2, 9.3, 9.4 - CSV and PDF export functionality

/**
 * Export calculation results to CSV format
 * Requirements: 9.1, 9.2 - CSV export for calculation results and batch processing
 */
function exportToCSV() {
    try {
        // Check if we have calculation results to export
        if (!appState.results) {
            showExportError('No calculation results to export. Please perform a calculation first.');
            return;
        }

        // Get current color values
        const colorValues = getCurrentColorValues();
        
        // Create CSV data structure
        const csvData = createCSVData(colorValues, appState.results);
        
        // Convert to CSV string
        const csvString = convertToCSVString(csvData);
        
        // Create and download CSV file
        downloadCSVFile(csvString);
        
        console.log('CSV export completed successfully');
        showExportSuccess('CSV file downloaded successfully');
        
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showExportError(`CSV export failed: ${error.message}`);
    }
}

/**
 * Create structured data for CSV export
 * Requirements: 9.4 - Include all relevant color data, Delta E values, and suggestions
 */
function createCSVData(colorValues, results) {
    const timestamp = new Date().toISOString();
    const csvData = [];
    
    // Header information
    csvData.push(['LAB Color Matching Calculator - Export Report']);
    csvData.push(['Export Date', timestamp]);
    csvData.push(['']); // Empty row for spacing
    
    // Target Color Data
    csvData.push(['TARGET COLOR']);
    csvData.push(['CMYK Values', 'C%', 'M%', 'Y%', 'K%']);
    csvData.push(['', 
        colorValues.target.cmyk.c.toFixed(1),
        colorValues.target.cmyk.m.toFixed(1),
        colorValues.target.cmyk.y.toFixed(1),
        colorValues.target.cmyk.k.toFixed(1)
    ]);
    csvData.push(['LAB Values', 'L*', 'a*', 'b*']);
    csvData.push(['',
        colorValues.target.lab.l.toFixed(2),
        colorValues.target.lab.a.toFixed(2),
        colorValues.target.lab.b.toFixed(2)
    ]);
    csvData.push(['']); // Empty row
    
    // Sample Color Data
    csvData.push(['SAMPLE COLOR']);
    csvData.push(['CMYK Values', 'C%', 'M%', 'Y%', 'K%']);
    csvData.push(['',
        colorValues.sample.cmyk.c.toFixed(1),
        colorValues.sample.cmyk.m.toFixed(1),
        colorValues.sample.cmyk.y.toFixed(1),
        colorValues.sample.cmyk.k.toFixed(1)
    ]);
    csvData.push(['LAB Values', 'L*', 'a*', 'b*']);
    csvData.push(['',
        colorValues.sample.lab.l.toFixed(2),
        colorValues.sample.lab.a.toFixed(2),
        colorValues.sample.lab.b.toFixed(2)
    ]);
    csvData.push(['']); // Empty row
    
    // Delta E Results
    csvData.push(['COLOR DIFFERENCE ANALYSIS']);
    csvData.push(['Total Delta E (ΔE*ab)', results.deltaE.toFixed(2)]);
    csvData.push(['Tolerance Zone', results.tolerance.zone.toUpperCase()]);
    csvData.push(['Tolerance Description', results.tolerance.description]);
    csvData.push(['Tolerance Range', results.tolerance.range]);
    csvData.push(['']); // Empty row
    
    // Component Deltas
    csvData.push(['COMPONENT DELTAS']);
    csvData.push(['Component', 'Value']);
    csvData.push(['ΔL*', results.componentDeltas.deltaL.toFixed(2)]);
    csvData.push(['Δa*', results.componentDeltas.deltaA.toFixed(2)]);
    csvData.push(['Δb*', results.componentDeltas.deltaB.toFixed(2)]);
    csvData.push(['ΔC*', results.componentDeltas.deltaC.toFixed(2)]);
    csvData.push(['Δh', results.componentDeltas.deltaH.toFixed(2)]);
    csvData.push(['']); // Empty row
    
    // CMYK Adjustment Suggestions
    if (results.suggestions && results.suggestions.length > 0) {
        csvData.push(['CMYK ADJUSTMENT SUGGESTIONS']);
        csvData.push(['Suggestion', 'C%', 'M%', 'Y%', 'K%', 'Description']);
        
        results.suggestions.forEach((suggestion, index) => {
            csvData.push([
                `${index + 1}`,
                suggestion.cmyk.c.toFixed(1),
                suggestion.cmyk.m.toFixed(1),
                suggestion.cmyk.y.toFixed(1),
                suggestion.cmyk.k.toFixed(1),
                suggestion.description
            ]);
        });
    }
    
    return csvData;
}

/**
 * Convert data array to CSV string format
 */
function convertToCSVString(data) {
    return data.map(row => {
        return row.map(cell => {
            // Escape cells containing commas, quotes, or newlines
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(',');
    }).join('\n');
}

/**
 * Download CSV file to user's computer
 */
function downloadCSVFile(csvString) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `color-analysis-${timestamp}.csv`;
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Export calculation results to PDF format
 * Requirements: 9.1, 9.3 - PDF generation for print-ready adjustment sheets
 */
function exportToPDF() {
    try {
        // Check if we have calculation results to export
        if (!appState.results) {
            showExportError('No calculation results to export. Please perform a calculation first.');
            return;
        }

        // Get current color values
        const colorValues = getCurrentColorValues();
        
        // Create PDF content
        const pdfContent = createPDFContent(colorValues, appState.results);
        
        // Generate and download PDF
        generatePDFFile(pdfContent);
        
        console.log('PDF export completed successfully');
        showExportSuccess('PDF file downloaded successfully');
        
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showExportError(`PDF export failed: ${error.message}`);
    }
}

/**
 * Create HTML content for PDF generation
 * Requirements: 9.3, 9.4 - Print-ready adjustment sheets with all relevant data
 */
function createPDFContent(colorValues, results) {
    const timestamp = new Date().toLocaleString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Color Analysis Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .section {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .section-title {
                    background-color: #f0f0f0;
                    padding: 8px;
                    font-weight: bold;
                    border-left: 4px solid #007bff;
                    margin-bottom: 10px;
                }
                .color-data {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                }
                .color-block {
                    flex: 1;
                    margin-right: 20px;
                }
                .color-block:last-child {
                    margin-right: 0;
                }
                .color-values {
                    background-color: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }
                .delta-results {
                    background-color: ${getDeltaBackgroundColor(results.tolerance.zone)};
                    padding: 15px;
                    border-radius: 4px;
                    text-align: center;
                    margin-bottom: 15px;
                }
                .delta-e-large {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .tolerance-info {
                    font-size: 1.1em;
                    margin-bottom: 10px;
                }
                .component-deltas {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .delta-component {
                    text-align: center;
                    background-color: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                }
                .suggestions-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .suggestions-table th,
                .suggestions-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .suggestions-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                    font-size: 0.9em;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                    .section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LAB Color Matching Calculator</h1>
                <h2>Color Analysis Report</h2>
                <p>Generated: ${timestamp}</p>
            </div>

            <div class="section">
                <div class="section-title">Color Comparison</div>
                <div class="color-data">
                    <div class="color-block">
                        <h3>Target Color</h3>
                        <div class="color-values">
                            <strong>CMYK:</strong><br>
                            C: ${colorValues.target.cmyk.c.toFixed(1)}% | 
                            M: ${colorValues.target.cmyk.m.toFixed(1)}% | 
                            Y: ${colorValues.target.cmyk.y.toFixed(1)}% | 
                            K: ${colorValues.target.cmyk.k.toFixed(1)}%
                        </div>
                        <div class="color-values">
                            <strong>LAB:</strong><br>
                            L*: ${colorValues.target.lab.l.toFixed(2)} | 
                            a*: ${colorValues.target.lab.a.toFixed(2)} | 
                            b*: ${colorValues.target.lab.b.toFixed(2)}
                        </div>
                    </div>
                    <div class="color-block">
                        <h3>Sample Color</h3>
                        <div class="color-values">
                            <strong>CMYK:</strong><br>
                            C: ${colorValues.sample.cmyk.c.toFixed(1)}% | 
                            M: ${colorValues.sample.cmyk.m.toFixed(1)}% | 
                            Y: ${colorValues.sample.cmyk.y.toFixed(1)}% | 
                            K: ${colorValues.sample.cmyk.k.toFixed(1)}%
                        </div>
                        <div class="color-values">
                            <strong>LAB:</strong><br>
                            L*: ${colorValues.sample.lab.l.toFixed(2)} | 
                            a*: ${colorValues.sample.lab.a.toFixed(2)} | 
                            b*: ${colorValues.sample.lab.b.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Color Difference Analysis</div>
                <div class="delta-results">
                    <div class="delta-e-large">ΔE*ab = ${results.deltaE.toFixed(2)}</div>
                    <div class="tolerance-info">
                        <strong>${results.tolerance.description}</strong><br>
                        ${results.tolerance.range}
                    </div>
                    <div>${results.tolerance.message}</div>
                </div>
                
                <div class="component-deltas">
                    <div class="delta-component">
                        <strong>ΔL*</strong><br>
                        ${results.componentDeltas.deltaL.toFixed(2)}
                    </div>
                    <div class="delta-component">
                        <strong>Δa*</strong><br>
                        ${results.componentDeltas.deltaA.toFixed(2)}
                    </div>
                    <div class="delta-component">
                        <strong>Δb*</strong><br>
                        ${results.componentDeltas.deltaB.toFixed(2)}
                    </div>
                    <div class="delta-component">
                        <strong>ΔC*</strong><br>
                        ${results.componentDeltas.deltaC.toFixed(2)}
                    </div>
                    <div class="delta-component">
                        <strong>Δh</strong><br>
                        ${results.componentDeltas.deltaH.toFixed(2)}
                    </div>
                </div>
            </div>

            ${results.suggestions && results.suggestions.length > 0 ? `
            <div class="section">
                <div class="section-title">CMYK Adjustment Suggestions</div>
                <p>The following CMYK adjustments are recommended to achieve closer color matching:</p>
                <table class="suggestions-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>C%</th>
                            <th>M%</th>
                            <th>Y%</th>
                            <th>K%</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.suggestions.map((suggestion, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${suggestion.cmyk.c.toFixed(1)}</td>
                            <td>${suggestion.cmyk.m.toFixed(1)}</td>
                            <td>${suggestion.cmyk.y.toFixed(1)}</td>
                            <td>${suggestion.cmyk.k.toFixed(1)}</td>
                            <td>${suggestion.description}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="footer">
                <p>This report was generated by the LAB Color Matching Calculator.</p>
                <p>For best results, verify color accuracy using calibrated measurement equipment.</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Get background color for delta results based on tolerance zone
 */
function getDeltaBackgroundColor(zone) {
    switch (zone) {
        case 'good': return '#d4edda';
        case 'acceptable': return '#fff3cd';
        case 'poor': return '#f8d7da';
        default: return '#f8f9fa';
    }
}

/**
 * Generate PDF file using simple HTML-to-PDF approach
 * Requirements: 9.3 - Print-ready PDF reports
 */
function generatePDFFile(htmlContent) {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        showExportError('Popup blocked. Please allow popups for PDF export.');
        return;
    }
    
    // Write HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            // Close the window after printing (user can cancel)
            setTimeout(() => {
                printWindow.close();
            }, 1000);
        }, 500);
    };
}

/**
 * Show export success message
 */
function showExportSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'export-notification success';
    notification.innerHTML = `
        <span class="notification-icon">✓</span>
        <span class="notification-text">${message}</span>
    `;
    
    showNotification(notification);
}

/**
 * Show export error message
 */
function showExportError(message) {
    const notification = document.createElement('div');
    notification.className = 'export-notification error';
    notification.innerHTML = `
        <span class="notification-icon">⚠</span>
        <span class="notification-text">${message}</span>
    `;
    
    showNotification(notification);
}

/**
 * Display notification message
 */
function showNotification(notification) {
    const container = document.querySelector('.calculator-container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

/**
 * Update export button states based on available data
 */
function updateExportButtonStates() {
    const csvBtn = document.getElementById('export-csv-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');
    const hasResults = appState && appState.results;
    
    if (csvBtn) {
        csvBtn.disabled = !hasResults;
        csvBtn.title = hasResults ? 'Export calculation results to CSV' : 'Perform a calculation first to enable export';
    }
    
    if (pdfBtn) {
        pdfBtn.disabled = !hasResults;
        pdfBtn.title = hasResults ? 'Export calculation results to PDF' : 'Perform a calculation first to enable export';
    }
}

/**
 * Initialize export functionality
 * Set up event listeners for export buttons
 */
function initializeExport() {
    console.log('Initializing export functionality...');
    
    // Set up CSV export button
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
        csvBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setExportButtonState(csvBtn, 'exporting');
            
            setTimeout(() => {
                exportToCSV();
                setExportButtonState(csvBtn, 'ready');
            }, 100);
        });
        console.log('CSV export button initialized');
    } else {
        console.warn('CSV export button not found');
    }
    
    // Set up PDF export button
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setExportButtonState(pdfBtn, 'exporting');
            
            setTimeout(() => {
                exportToPDF();
                setExportButtonState(pdfBtn, 'ready');
            }, 100);
        });
        console.log('PDF export button initialized');
    } else {
        console.warn('PDF export button not found');
    }
    
    // Initial button state update
    updateExportButtonStates();
    
    // Set up periodic state updates (in case appState changes)
    setInterval(updateExportButtonStates, 1000);
    
    console.log('Export functionality initialized successfully');
}

/**
 * Set export button visual state
 */
function setExportButtonState(button, state) {
    if (!button) return;
    
    button.classList.remove('exporting');
    
    switch (state) {
        case 'exporting':
            button.classList.add('exporting');
            button.disabled = true;
            break;
        case 'ready':
            button.disabled = !appState || !appState.results;
            break;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other modules are loaded
    setTimeout(initializeExport, 200);
});

// Export functions for use by other modules
window.colorExport = {
    exportToCSV,
    exportToPDF,
    showExportSuccess,
    showExportError,
    updateExportButtonStates
};

console.log('Export module loaded successfully');