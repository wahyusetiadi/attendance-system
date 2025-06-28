'use client';

import { useState } from 'react';
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Calendar,
  Users,
  Filter,
  CheckCircle
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceRecord[];
  filter: AttendanceFilter;
}

export function ExportModal({ isOpen, onClose, data, filter }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [customFileName, setCustomFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const generateFileName = () => {
    if (customFileName.trim()) {
      return customFileName.trim();
    }

    const startDate = new Date(filter.startDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const endDate = new Date(filter.endDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    return `Absensi_${startDate}_${endDate}`;
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fileName = generateFileName();
      const exportData = prepareExportData();

      // Create and download file based on format
      switch (exportFormat) {
        case 'excel':
          downloadAsExcel(exportData, fileName);
          break;
        case 'pdf':
          downloadAsPDF(exportData, fileName);
          break;
        case 'csv':
          downloadAsCSV(exportData, fileName);
          break;
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const prepareExportData = () => {
    return data.map(record => ({
      'Nama Guru': record.teacherName,
      'NIP': record.teacherNip,
      'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
      'Jam Masuk': record.clockIn || '-',
      'Jam Keluar': record.clockOut || '-',
      'Jam Kerja': record.workingHours ? `${record.workingHours.toFixed(2)} jam` : '-',
      'Status': getStatusLabel(record.status),
      'Lokasi': record.location || '-',
      'Catatan': record.notes || '-'
    }));
  };

  const getStatusLabel = (status: AttendanceRecord['status']) => {
    const labels = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Tidak Hadir',
      sick: 'Sakit',
      permission: 'Izin'
    };
    return labels[status] || status;
  };

  const downloadAsCSV = (data: any[], fileName: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const downloadAsExcel = (data: any[], fileName: string) => {
    // Simplified Excel export simulation
    const csvContent = prepareCSVContent(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
  };

  const downloadAsPDF = (data: any[], fileName: string) => {
    // Simplified PDF export simulation
    const content = data.map(row => Object.values(row).join(' | ')).join('\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.pdf`;
    link.click();
  };

  const prepareCSVContent = (data: any[]) => {
    const headers = Object.keys(data[0]);
    return [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
  };

  const formatOptions = [
    {
      value: 'excel',
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Format terbaik untuk analisis data'
    },
    // {
    //   value: 'pdf',
    //   label: 'PDF (.pdf)',
    //   icon: FileText,
    //   description: 'Format untuk dokumen dan laporan'
    // },
    {
      value: 'csv',
      label: 'CSV (.csv)',
      icon: FileImage,
      description: 'Format universal untuk import/export'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Data Absensi</h2>
              <p className="text-sm text-gray-500">{data.length} record akan di-export</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Format Export
            </label>
            <div className="grid grid-cols-1 gap-3">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportFormat === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="sr-only"
                  />
                  <option.icon className={`h-6 w-6 mr-3 ${
                    exportFormat === option.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  {exportFormat === option.value && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* File Name */}
          <div>
            <Input
              label="Nama File (Opsional)"
              placeholder={generateFileName()}
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan untuk menggunakan nama default berdasarkan tanggal
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Opsi Export
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeFilters}
                onChange={(e) => setIncludeFilters(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Sertakan Info Filter</span>
                <p className="text-xs text-gray-500">Tampilkan informasi filter yang digunakan</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Sertakan Ringkasan</span>
                <p className="text-xs text-gray-500">Tampilkan statistik dan ringkasan data</p>
              </div>
            </label>
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Preview Export</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(filter.startDate).toLocaleDateString('id-ID')} - {new Date(filter.endDate).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{data.length} record</span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {filter.teacherId ? '1 guru' : 'Semua guru'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Format: {formatOptions.find(f => f.value === exportFormat)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Batal
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengexport...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
