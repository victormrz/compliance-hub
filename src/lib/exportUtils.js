/**
 * CSV/Excel Export Utility for ComplianceHub
 * Provides data export for any table in the application.
 */

/**
 * Convert array of objects to CSV string
 * Handles commas, quotes, and newlines in values
 */
function toCSV(data, columns) {
  if (!data || data.length === 0) return '';

  // Use provided columns or derive from first object
  const cols = columns || Object.keys(data[0]);

  // Header row
  const header = cols.map(col => `"${String(col.label || col.key || col).replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map(row => {
    return cols.map(col => {
      const key = col.key || col;
      let val = row[key];
      if (val === null || val === undefined) val = '';
      if (Array.isArray(val)) val = val.join('; ');
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Trigger browser download of a string as a file
 */
function downloadFile(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType }); // BOM for Excel UTF-8
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - File name (without extension)
 * @param {Array} columns - Optional column definitions [{key, label}]
 */
export function exportToCSV(data, filename, columns) {
  const csv = toCSV(data, columns);
  if (!csv) return;
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(csv, `${filename}_${timestamp}.csv`);
}

/**
 * Export data as JSON file (for backup/transfer)
 */
export function exportToJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(json, `${filename}_${timestamp}.json`, 'application/json;charset=utf-8;');
}
