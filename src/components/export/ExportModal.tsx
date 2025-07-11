// components/export/ExportModal.tsx
'use client';

import { useState } from 'react';
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Download } from 'lucide-react';

// Import komponen dan hooks yang sudah dimodularkan
import { useExportData, ExportOptions } from '@/hooks/useExportData';
import { useExportFunctions } from '@/hooks/useExportFunctions';
import { ExportFormatSelector } from './ExportFormatSelector';
import { ExportOptionsComponent } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { processExportData, prepareExportData } from '@/utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceRecord[];
  filter: AttendanceFilter;
}

export function ExportModal({ isOpen, onClose, data, filter }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('csv');
  const [customFileName, setCustomFileName] = useState('');
  const [options, setOptions] = useState<ExportOptions>({
    convertPastAbsent: true,
    includeFilters: true,
    includeSummary: true,
  });

  // Custom hooks
  const { allAttendanceData, isLoadingAllData, error } = useExportData(filter, isOpen);
  const { isExporting, setIsExporting, downloadAsCSV, downloadAsExcel, downloadAsPDF } = useExportFunctions();

  if (!isOpen) return null;

  const exportData = allAttendanceData.length > 0 ? allAttendanceData : data;
  const processedData = processExportData(exportData, options.convertPastAbsent);

  const stats = {
    total: processedData.length,
    belumAbsen: processedData.filter(r => r.notes === "Belum melakukan absensi").length,
    tidakHadirOtomatis: processedData.filter(r => r.notes === "Tidak hadir (sistem otomatis)").length,
    hadir: processedData.filter(r => r.status === "HADIR").length,
  };

  const generateFileName = (): string => {
    if (customFileName.trim()) {
      return customFileName.trim();
    }
    const startDate = new Date(filter.startDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const endDate = new Date(filter.endDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const suffix = options.convertPastAbsent ? '_processed' : '';
    return `Absensi_${startDate}_${endDate}_${exportData.length}${suffix}`;
  };

  const handleExport = async () => {
    if (isLoadingAllData) {
      alert('Mohon tunggu, sedang mengambil data lengkap...');
      return;
    }

    setIsExporting(true);
    try {
      const fileName = generateFileName();
      const preparedData = prepareExportData(processedData);

      switch (exportFormat) {
        case 'excel':
          downloadAsExcel(preparedData, fileName);
          break;
        case 'pdf':
          downloadAsPDF(preparedData, fileName);
          break;
        case 'csv':
          downloadAsCSV(preparedData, fileName);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export gagal! Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Data Absensi</h2>
              <p className="text-sm text-gray-500">
                {isLoadingAllData 
                  ? 'Mengambil data lengkap...' 
                  : `${exportData.length} record akan di-export`
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <ExportFormatSelector 
            exportFormat={exportFormat} 
            onFormatChange={setExportFormat} 
          />

          {/* Export Options */}
          <ExportOptionsComponent
            options={options}
            onOptionsChange={setOptions}
            stats={stats}
          />

          {/* File Name */}
          <div>
            <Input
              label="Nama File (Opsional)"
              placeholder={generateFileName()}
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
            />
          </div>

          {/* Preview */}
          <ExportPreview
            filter={filter}
            exportData={exportData}
            exportFormat={exportFormat}
            options={options}
            stats={stats}
            isLoadingAllData={isLoadingAllData}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || isLoadingAllData || exportData.length === 0}
          >
            {isExporting ? 'Mengexport...' : `Export ${exportData.length} Data`}
          </Button>
        </div>
      </div>
    </div>
  );
}
