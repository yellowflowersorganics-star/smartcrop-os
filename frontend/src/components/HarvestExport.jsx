import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader } from 'lucide-react';

/**
 * Harvest Export Component
 * Generate and download harvest reports in PDF and Excel formats
 */
const HarvestExport = ({ batchId, harvests = [], summary = {} }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Generate CSV (Excel-compatible)
  const generateCSV = () => {
    if (!harvests || harvests.length === 0) {
      alert('No harvest data available to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Batch ID',
      'Zone',
      'Flush Number',
      'Harvest Date',
      'Total Weight (kg)',
      'Bags Harvested',
      'Bags Discarded',
      'Quality Grade',
      'Biological Efficiency (%)',
      'Yield per Bag (kg)',
      'Harvester Name',
      'Market Destination',
      'Price per kg (₹)',
      'Revenue (₹)',
      'Defects',
      'Notes'
    ];

    // CSV Rows
    const rows = harvests.map(harvest => [
      harvest.batchId || '',
      harvest.zone?.name || '',
      harvest.flushNumber || '',
      new Date(harvest.harvestDate).toLocaleDateString(),
      harvest.totalWeightKg || 0,
      harvest.bagsHarvested || 0,
      harvest.bagsDiscarded || 0,
      harvest.qualityGrade || '',
      harvest.biologicalEfficiency || '',
      harvest.yieldPerBag || '',
      harvest.harvesterName || '',
      harvest.marketDestination || '',
      harvest.pricePerKg || '',
      harvest.totalRevenue || '',
      (harvest.defectNotes || []).join('; '),
      harvest.harvestNotes || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `harvest_report_${batchId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate HTML report for PDF printing
  const generateHTMLReport = () => {
    const reportWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Harvest Report - ${batchId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #10b981;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #10b981;
            border-bottom: 2px solid #10b981;
            padding-bottom: 10px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          .quality-premium { color: #10b981; font-weight: bold; }
          .quality-grade_a { color: #3b82f6; font-weight: bold; }
          .quality-grade_b { color: #f59e0b; font-weight: bold; }
          .quality-rejected { color: #ef4444; font-weight: bold; }
          .recommendations {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          @media print {
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
        
        <div class="header">
          <h1>🍄 Batch Harvest Report</h1>
          <p><strong>Batch ID:</strong> ${batchId}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>📊 Summary Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Yield</div>
              <div class="stat-value">${summary.totalYieldKg || 0} kg</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg BE%</div>
              <div class="stat-value">${summary.avgBiologicalEfficiency || 0}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Flushes</div>
              <div class="stat-value">${summary.totalFlushes || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">₹${summary.totalRevenue || 0}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🍄 Harvest Details</h2>
          <table>
            <thead>
              <tr>
                <th>Flush</th>
                <th>Date</th>
                <th>Weight (kg)</th>
                <th>Bags</th>
                <th>Quality</th>
                <th>BE%</th>
                <th>Revenue (₹)</th>
                <th>Harvester</th>
              </tr>
            </thead>
            <tbody>
              ${harvests.map(h => `
                <tr>
                  <td>${h.flushNumber}</td>
                  <td>${new Date(h.harvestDate).toLocaleDateString()}</td>
                  <td>${h.totalWeightKg}</td>
                  <td>${h.bagsHarvested}</td>
                  <td class="quality-${h.qualityGrade}">
                    ${h.qualityGrade ? h.qualityGrade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '-'}
                  </td>
                  <td>${h.biologicalEfficiency ? h.biologicalEfficiency.toFixed(1) : '-'}%</td>
                  <td>₹${h.totalRevenue || 0}</td>
                  <td>${h.harvesterName || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${summary.avgBiologicalEfficiency && summary.avgBiologicalEfficiency < 20 ? `
          <div class="recommendations">
            <h3>⚠️ Recommendations</h3>
            <p><strong>Biological Efficiency below target (${summary.avgBiologicalEfficiency}% vs 20-25% target)</strong></p>
            <ul>
              <li>Check spawn quality and freshness</li>
              <li>Verify substrate moisture content (target: 60-65%)</li>
              <li>Review sterilization process (ensure 3-4 hours @ 121°C)</li>
              <li>Check environmental conditions during incubation</li>
            </ul>
          </div>
        ` : ''}

        <div class="section">
          <h2>📝 Quality Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Weight (kg)</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${summary.qualityDistribution ? Object.entries(summary.qualityDistribution).map(([grade, weight]) => `
                <tr>
                  <td class="quality-${grade}">
                    ${grade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                  <td>${weight.toFixed(1)} kg</td>
                  <td>${((weight / summary.totalYieldKg) * 100).toFixed(1)}%</td>
                </tr>
              `).join('') : '<tr><td colspan="3">No data available</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="text-align: center; color: #6b7280;">
            Generated by CropWise - Intelligent IoT Platform for Controlled-Environment Agriculture<br>
            © ${new Date().getFullYear()} Yellow Flowers Organics
          </p>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  // Handle export
  const handleExport = async (format) => {
    setExporting(true);
    setExportFormat(format);

    try {
      if (format === 'csv') {
        generateCSV();
      } else if (format === 'pdf') {
        generateHTMLReport();
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportFormat(null);
      }, 1000);
    }
  };

  // Generate summary Excel report with multiple sheets
  const generateDetailedExcel = () => {
    // This would ideally use a library like XLSX.js
    // For now, we'll create a comprehensive CSV with sections
    
    const sections = [];

    // Summary section
    sections.push('=== BATCH SUMMARY ===');
    sections.push(`Batch ID,${batchId}`);
    sections.push(`Total Yield (kg),${summary.totalYieldKg || 0}`);
    sections.push(`Average BE%,${summary.avgBiologicalEfficiency || 0}`);
    sections.push(`Total Flushes,${summary.totalFlushes || 0}`);
    sections.push(`Total Revenue (₹),${summary.totalRevenue || 0}`);
    sections.push('');

    // Harvest details section
    sections.push('=== HARVEST DETAILS ===');
    sections.push('Flush,Date,Weight (kg),Bags Harvested,Bags Discarded,Quality Grade,BE%,Yield/Bag,Revenue,Harvester,Market,Defects,Notes');
    
    harvests.forEach(h => {
      sections.push([
        h.flushNumber,
        new Date(h.harvestDate).toLocaleDateString(),
        h.totalWeightKg,
        h.bagsHarvested,
        h.bagsDiscarded,
        h.qualityGrade || '',
        h.biologicalEfficiency || '',
        h.yieldPerBag || '',
        h.totalRevenue || '',
        h.harvesterName || '',
        h.marketDestination || '',
        (h.defectNotes || []).join('; '),
        (h.harvestNotes || '').replace(/,/g, ';')
      ].join(','));
    });

    sections.push('');

    // Quality distribution section
    sections.push('=== QUALITY DISTRIBUTION ===');
    sections.push('Grade,Weight (kg),Percentage');
    if (summary.qualityDistribution) {
      Object.entries(summary.qualityDistribution).forEach(([grade, weight]) => {
        const percentage = ((weight / summary.totalYieldKg) * 100).toFixed(1);
        sections.push(`${grade},${weight.toFixed(1)},${percentage}%`);
      });
    }

    const csvContent = sections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `harvest_detailed_report_${batchId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📥 Export Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF Export */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
        >
          {exporting && exportFormat === 'pdf' ? (
            <Loader className="w-12 h-12 text-red-500 animate-spin mb-2" />
          ) : (
            <FileText className="w-12 h-12 text-red-500 mb-2" />
          )}
          <span className="font-semibold text-gray-900">PDF Report</span>
          <span className="text-sm text-gray-600 mt-1">
            Print-ready format
          </span>
        </button>

        {/* Excel/CSV Export */}
        <button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50"
        >
          {exporting && exportFormat === 'csv' ? (
            <Loader className="w-12 h-12 text-green-500 animate-spin mb-2" />
          ) : (
            <FileSpreadsheet className="w-12 h-12 text-green-500 mb-2" />
          )}
          <span className="font-semibold text-gray-900">Excel (CSV)</span>
          <span className="text-sm text-gray-600 mt-1">
            Spreadsheet format
          </span>
        </button>

        {/* Detailed Excel Export */}
        <button
          onClick={generateDetailedExcel}
          disabled={exporting}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          <Download className="w-12 h-12 text-blue-500 mb-2" />
          <span className="font-semibold text-gray-900">Detailed Report</span>
          <span className="text-sm text-gray-600 mt-1">
            Multi-section CSV
          </span>
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> PDF format is best for sharing and printing. Excel/CSV formats are ideal for further analysis in spreadsheet software.
        </p>
      </div>
    </div>
  );
};

export default HarvestExport;

