/**
 * Utilitaires pour l'export de données en différents formats
 */

/**
 * Exporter des données en CSV
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  // Déterminer les colonnes
  const headers = columns || Object.keys(data[0]);
  
  // Créer le contenu CSV
  const csvContent = [
    // Header
    headers.join(','),
    // Rows
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] || '';
        // Échapper les virgules et guillemets
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Créer et télécharger le fichier
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Exporter des données en Excel (format compatible)
 */
export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Feuille1') => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Créer le contenu HTML pour Excel
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  html += `<x:Name>${sheetName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>`;
  html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
  html += '<table border="1">';
  
  // Header
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="background-color: #4472C4; color: white; font-weight: bold; padding: 8px;">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Body
  html += '<tbody>';
  data.forEach((row, index) => {
    html += `<tr style="background-color: ${index % 2 === 0 ? '#F2F2F2' : 'white'};">`;
    headers.forEach(header => {
      html += `<td style="padding: 6px;">${row[header] || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></body></html>';

  // Créer et télécharger le fichier
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename);
};

/**
 * Exporter des données en JSON
 */
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    alert('Aucune donnée à exporter');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/**
 * Générer un PDF simple (nécessite jsPDF - à installer si besoin)
 * Alternative sans bibliothèque : utiliser window.print()
 */
export const exportToPDF = (elementId, filename = 'export.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Élément non trouvé');
    return;
  }

  // Créer une fenêtre d'impression
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #4472C4; 
            color: white; 
            font-weight: bold; 
          }
          tr:nth-child(even) { 
            background-color: #f2f2f2; 
          }
          h1 { 
            color: #333; 
            border-bottom: 3px solid #4472C4; 
            padding-bottom: 10px; 
          }
          .print-date {
            text-align: right;
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="print-date">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Télécharger un Blob
 */
const downloadBlob = (blob, filename) => {
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
 * Composant bouton d'export avec menu déroulant
 */
import { useState } from 'react';
import { FaFileExport, FaFileCsv, FaFileExcel, FaFilePdf, FaFileCode } from 'react-icons/fa';

export const ExportButton = ({ data, filename = 'export', onExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format) => {
    setIsOpen(false);
    
    if (onExport) {
      onExport(format);
      return;
    }

    const baseFilename = filename.replace(/\.[^/.]+$/, '');
    
    switch (format) {
      case 'csv':
        exportToCSV(data, `${baseFilename}.csv`);
        break;
      case 'excel':
        exportToExcel(data, `${baseFilename}.xlsx`);
        break;
      case 'json':
        exportToJSON(data, `${baseFilename}.json`);
        break;
      case 'pdf':
        exportToPDF('exportable-content', `${baseFilename}.pdf`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
      >
        <FaFileExport />
        Exporter
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
            >
              <FaFileExcel className="text-green-600" />
              <span className="font-medium">Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
            >
              <FaFileCsv className="text-blue-600" />
              <span className="font-medium">CSV (.csv)</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
            >
              <FaFilePdf className="text-red-600" />
              <span className="font-medium">PDF (.pdf)</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
            >
              <FaFileCode className="text-purple-600" />
              <span className="font-medium">JSON (.json)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Formater des données pour l'export (nettoyer et transformer)
 */
export const formatDataForExport = (data, mappings = {}) => {
  return data.map(item => {
    const formatted = {};
    Object.entries(mappings).forEach(([key, config]) => {
      if (typeof config === 'string') {
        formatted[config] = item[key];
      } else if (typeof config === 'object') {
        const { label, transform } = config;
        formatted[label] = transform ? transform(item[key], item) : item[key];
      }
    });
    return formatted;
  });
};

export default ExportButton;
