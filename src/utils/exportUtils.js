/**
 * Utility functions for exporting table data to various formats
 */

/**
 * Generates HTML content for table export
 * @param {Object} tableData - The table data object
 * @param {Array} tableData.data - Array of data rows
 * @param {Array} tableData.columns - Array of column definitions
 * @param {string} tableData.title - Title for the export
 * @returns {string} Complete HTML document as string
 */
export const generateTableHTML = ({ data, columns, title }) => {
  const timestamp = new Date().toLocaleString();
  
  // Get clean data range for highlighting logic
  const getHighlightStyle = (value, accessor, label) => {
    const cleanDataRange = localStorage.getItem('cleanDataRange') || '-0200/1750';
    const [minValue, maxValue] = cleanDataRange.split('/').map(val => parseInt(val.trim()));
    const isOutsideRange = (accessor === 'Ganancia' || accessor === 'Proyeccion' || label === 'PRY') && 
                           value !== '—' && 
                           (parseInt(value) <= minValue || parseInt(value) >= maxValue);
    return isOutsideRange ? ' class="highlight"' : '';
  };

  // Generate table headers
  const tableHeaders = columns.map(col => `<th>${col.label}</th>`).join('');
  
  // Generate table rows
  const tableRows = data.map(row => `
    <tr>
      ${columns.map(col => {
        const value = row[col.accessor] || '—';
        const highlightStyle = getHighlightStyle(value, col.accessor, col.label);
        return `<td${highlightStyle}>${value}</td>`;
      }).join('')}
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Exportado</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #333; 
            text-align: center; 
            margin-bottom: 10px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .export-info { 
            text-align: center; 
            color: #666; 
            margin-bottom: 20px; 
            font-style: italic;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            font-size: 14px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background-color: #007bff; 
            color: white;
            font-weight: bold; 
            text-align: center;
        }
        tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
        tr:hover {
            background-color: #f0f8ff;
        }
        .highlight { 
            background-color: yellow !important; 
            font-weight: bold; 
        }
        .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #e9ecef;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        }
        @media print {
            body { margin: 0; background-color: white; }
            .container { box-shadow: none; }
            tr:hover { background-color: transparent; }
        }
        @media (max-width: 768px) {
            body { margin: 10px; }
            .container { padding: 10px; }
            table { font-size: 12px; }
            th, td { padding: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="export-info">Exportado el: ${timestamp}</div>
        <table>
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <div class="summary">
            Total de registros: ${data.length}
        </div>
    </div>
</body>
</html>`;
};

/**
 * Downloads a file with the given content
 * @param {string} content - File content
 * @param {string} filename - Name for the downloaded file
 * @param {string} mimeType - MIME type for the file
 */
export const downloadFile = (content, filename, mimeType = 'text/html;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates a filename for export based on title and current date
 * @param {string} title - Base title for the filename
 * @returns {string} Generated filename
 */
export const generateExportFilename = (title) => {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedTitle = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${sanitizedTitle}_${date}.html`;
};

/**
 * Main export function that combines all the utilities
 * @param {Object} tableData - The table data to export
 */
export const exportTableAsHTML = (tableData) => {
  if (!tableData.data || tableData.data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const htmlContent = generateTableHTML(tableData);
  const filename = generateExportFilename(tableData.title);
  downloadFile(htmlContent, filename);
};
