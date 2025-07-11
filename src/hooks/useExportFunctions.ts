// hooks/useExportFunctions.ts
import { useState } from 'react';

export function useExportFunctions() {
  const [isExporting, setIsExporting] = useState(false);

  const downloadAsCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const downloadAsExcel = (data: any[], fileName: string) => {
    // Implementation
  };

  const downloadAsPDF = (data: any[], fileName: string) => {
    // Implementation
  };

  return {
    isExporting,
    setIsExporting,
    downloadAsCSV,
    downloadAsExcel,
    downloadAsPDF
  };
}
