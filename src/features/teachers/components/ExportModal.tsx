'use client';

import { useState } from 'react';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Users,
  Filter,
  CheckCircle,
  Settings,
  Eye
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
}

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeInactive: boolean;
  includePersonalInfo: boolean;
  includeContactInfo: boolean;
  includeEmploymentInfo: boolean;
  customFields: string[];
  sortBy: 'name' | 'nip' | 'subject' | 'joinDate';
  sortOrder: 'asc' | 'desc';
}

export function ExportModal({ isOpen, onClose, teachers }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeInactive: true,
    includePersonalInfo: true,
    includeContactInfo: true,
    includeEmploymentInfo: true,
    customFields: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  if (!isOpen) return null;

  const allFields = [
    { key: 'nip', label: 'NIP', category: 'personal' },
    { key: 'name', label: 'Nama Lengkap', category: 'personal' },
    { key: 'email', label: 'Email', category: 'contact' },
    { key: 'phone', label: 'Telepon', category: 'contact' },
    { key: 'address', label: 'Alamat', category: 'contact' },
    { key: 'subject', label: 'Mata Pelajaran', category: 'employment' },
    { key: 'grade', label: 'Kelas', category: 'employment' },
    { key: 'status', label: 'Status', category: 'employment' },
    { key: 'joinDate', label: 'Tanggal Bergabung', category: 'employment' }
  ];

  // ✅ Helper function to safely parse date
  const safeParseDate = (dateString: string | undefined): Date => {
    if (!dateString) {
      return new Date(0); // Return epoch date for undefined values
    }

    const parsedDate = new Date(dateString);

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return new Date(0); // Return epoch date for invalid dates
    }

    return parsedDate;
  };

  // ✅ Helper function to format date safely
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return '-';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('id-ID');
    } catch (error) {
      return '-';
    }
  };

  const getFilteredTeachers = () => {
    let filtered = [...teachers];

    if (!options.includeInactive) {
      filtered = filtered.filter(teacher => teacher.status === 'active');
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (options.sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'nip':
          aValue = a.nip || '';
          bValue = b.nip || '';
          break;
        case 'subject':
          aValue = a.subject || '';
          bValue = b.subject || '';
          break;
        case 'joinDate':
          // ✅ Use safe date parsing
          aValue = safeParseDate(a.joinDate);
          bValue = safeParseDate(b.joinDate);
          break;
        default:
          return 0;
      }

      if (options.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getExportFields = () => {
    const fields = [];

    if (options.includePersonalInfo) {
      fields.push(...allFields.filter(f => f.category === 'personal'));
    }
    if (options.includeContactInfo) {
      fields.push(...allFields.filter(f => f.category === 'contact'));
    }
    if (options.includeEmploymentInfo) {
      fields.push(...allFields.filter(f => f.category === 'employment'));
    }

    return fields;
  };

  const generateFileName = () => {
    if (customFileName.trim()) {
      return customFileName.trim();
    }

    const date = new Date().toISOString().split('T')[0];
    const count = getFilteredTeachers().length;
    return `Data_Guru_${date}_${count}_records`;
  };

  const prepareExportData = () => {
    const filteredTeachers = getFilteredTeachers();
    const fields = getExportFields();

    return filteredTeachers.map(teacher => {
      const row: { [key: string]: any } = {};

      fields.forEach(field => {
        switch (field.key) {
          case 'status':
            row[field.label] = teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif';
            break;
          case 'joinDate':
            // ✅ Use safe date formatting
            row[field.label] = formatDate(teacher.joinDate);
            break;
          default:
            row[field.label] = teacher[field.key as keyof Teacher] || '-';
        }
      });

      return row;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fileName = generateFileName();
      const exportData = prepareExportData();

      switch (options.format) {
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
    // Simplified Excel export - in real app, use library like xlsx
    const csvContent = prepareCSVContent(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
  };

  const downloadAsPDF = (data: any[], fileName: string) => {
    // Simplified PDF export - in real app, use library like jsPDF
    const content = data.map(row => Object.values(row).join(' | ')).join('\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.pdf`;
    link.click();
  };

  const prepareCSVContent = (data: any[]) => {
    if (data.length === 0) return '';
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
      description: 'Format terbaik untuk analisis data dan import'
    },
    {
      value: 'csv',
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Format universal, kompatibel dengan semua aplikasi'
    },
    // {
    //   value: 'pdf',
    //   label: 'PDF (.pdf)',
    //   icon: FileImage,
    //   description: 'Format untuk dokumen dan laporan resmi'
    // }
  ];

  const filteredTeachers = getFilteredTeachers();
  const exportFields = getExportFields();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Data Guru</h2>
              <p className="text-sm text-gray-500">{teachers.length} guru tersedia untuk export</p>
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
              {formatOptions.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    options.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={options.format === format.value}
                    onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="sr-only"
                  />
                  <format.icon className={`h-6 w-6 mr-3 ${
                    options.format === format.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{format.label}</div>
                    <div className="text-sm text-gray-500">{format.description}</div>
                  </div>
                  {options.format === format.value && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Data Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filter Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Filter Data
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeInactive}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeInactive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sertakan guru tidak aktif</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Urutkan berdasarkan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={options.sortBy}
                    onChange={(e) => setOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="name">Nama</option>
                    <option value="nip">NIP</option>
                    <option value="subject">Mata Pelajaran</option>
                    <option value="joinDate">Tanggal Bergabung</option>
                  </select>
                  <select
                    value={options.sortOrder}
                    onChange={(e) => setOptions(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="asc">A-Z / Lama-Baru</option>
                    <option value="desc">Z-A / Baru-Lama</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Field Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Kolom yang Disertakan
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includePersonalInfo}
                    onChange={(e) => setOptions(prev => ({ ...prev, includePersonalInfo: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Informasi Personal (NIP, Nama)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeContactInfo}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeContactInfo: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Kontak (Email, Telepon, Alamat)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeEmploymentInfo}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeEmploymentInfo: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pekerjaan (Mata Pelajaran, Status)</span>
                </label>
              </div>
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
              Kosongkan untuk menggunakan nama default berdasarkan tanggal dan jumlah data
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Preview Export</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Sembunyikan' : 'Tampilkan'} Preview
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{filteredTeachers.length} guru</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{exportFields.length} kolom</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Format: {formatOptions.find(f => f.value === options.format)?.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {options.includeInactive ? 'Semua status' : 'Hanya aktif'}
                </span>
              </div>
            </div>

            {showPreview && filteredTeachers.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-48">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        {exportFields.slice(0, 4).map(field => (
                          <th key={field.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {field.label}
                          </th>
                        ))}
                        {exportFields.length > 4 && (
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            ...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTeachers.slice(0, 3).map((teacher, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {exportFields.slice(0, 4).map(field => (
                            <td key={field.key} className="px-3 py-2 text-sm text-gray-900">
                              {field.key === 'status' 
                                ? (teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif')
                                : field.key === 'joinDate'
                                ? formatDate(teacher.joinDate) // ✅ Use safe formatting
                                : teacher[field.key as keyof Teacher] || '-'
                              }
                            </td>
                          ))}
                          {exportFields.length > 4 && (
                            <td className="px-3 py-2 text-sm text-gray-400">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTeachers.length > 3 && (
                    <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                      ... dan {filteredTeachers.length - 3} guru lainnya
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || filteredTeachers.length === 0 || exportFields.length === 0}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengexport...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {filteredTeachers.length} Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
