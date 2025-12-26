/**
 * Export Utilities for Solar Park Management
 * Functions to export panels and inspections data to CSV format
 */

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with {key, label}
 * @returns {string} CSV formatted string
 */
function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.map(h => h.label).join(',');
  }

  // Create header row
  const headerRow = headers.map(h => h.label).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      let value = row[header.key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'boolean') {
        value = value ? 'Sí' : 'No';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      
      return value;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger download of CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name for the downloaded file
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
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
 * Export panels data to CSV
 * @param {Array} paneles - Array of panel objects
 */
export function exportPanelesToCSV(paneles) {
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'codigo_serie', label: 'Código de Serie' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'ultimo_estado', label: 'Estado Actual' },
    { key: 'created_at', label: 'Fecha de Registro' }
  ];

  const data = paneles.map(panel => ({
    id: panel.id,
    codigo_serie: panel.codigo_serie || '',
    modelo: panel.modelo || '',
    ultimo_estado: panel.ultimo_estado || 'PENDIENTE',
    created_at: panel.created_at ? new Date(panel.created_at).toLocaleString('es-ES') : ''
  }));

  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `paneles_${timestamp}.csv`);
}

/**
 * Export inspections data to CSV
 * @param {Array} paneles - Array of panel objects with inspections
 */
export function exportInspeccionesToCSV(paneles) {
  const headers = [
    { key: 'panel_id', label: 'Panel ID' },
    { key: 'codigo_serie', label: 'Código de Serie' },
    { key: 'fecha', label: 'Fecha Inspección' },
    { key: 'limpieza', label: 'Limpieza' },
    { key: 'sujecion_ok', label: 'Sujeción OK' },
    { key: 'temp_hotspot', label: 'Temp. Hotspot (°C)' },
    { key: 'estado_calculado', label: 'Estado' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'tecnico_nombre', label: 'Técnico' }
  ];

  // Flatten inspections from all panels
  const data = [];
  paneles.forEach(panel => {
    if (panel.inspecciones && panel.inspecciones.length > 0) {
      panel.inspecciones.forEach(inspeccion => {
        data.push({
          panel_id: panel.id,
          codigo_serie: panel.codigo_serie || '',
          fecha: inspeccion.created_at ? new Date(inspeccion.created_at).toLocaleString('es-ES') : '',
          limpieza: inspeccion.limpieza || '',
          sujecion_ok: inspeccion.sujecion_ok,
          temp_hotspot: inspeccion.temp_hotspot || 0,
          estado_calculado: inspeccion.estado_calculado || '',
          observaciones: inspeccion.observaciones || '',
          tecnico_nombre: inspeccion.tecnico_nombre || ''
        });
      });
    }
  });

  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `inspecciones_${timestamp}.csv`);
}

/**
 * Export all data (panels and inspections)
 * @param {Array} paneles - Array of panel objects with inspections
 */
export function exportAllData(paneles) {
  exportPanelesToCSV(paneles);
  // Small delay to ensure both downloads trigger properly
  setTimeout(() => {
    exportInspeccionesToCSV(paneles);
  }, 100);
}
