'use client';

import { useState, useRef } from 'react';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Eye
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teachers: Teacher[]) => void;
}

interface ImportResult {
  success: Teacher[];
  errors: { row: number; error: string; data: any }[];
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const processExcelFile = async (file: File): Promise<ImportResult> => {
    // Simulate Excel processing - in real app, use libraries like SheetJS
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data simulation
        const mockData = [
          {
            nip: '199001052018012005',
            name: 'John Doe, S.Pd',
            email: 'john.doe@sekolah.edu',
            phone: '081234567895',
            address: 'Jl. Contoh No. 1, Jakarta',
            subject: 'Matematika',
            grade: 'X, XI',
            status: 'active',
            joinDate: '2024-01-15'
          },
          {
            nip: '199002052018012006',
            name: 'Jane Smith, M.Pd',
            email: 'jane.smith@sekolah.edu',
            phone: '081234567896',
            address: 'Jl. Contoh No. 2, Jakarta',
            subject: 'Bahasa Inggris',
            grade: 'XI, XII',
            status: 'active',
            joinDate: '2024-02-01'
          },
          {
            nip: '', // Missing NIP - will cause error
            name: 'Invalid Entry',
            email: 'invalid-email',
            phone: '123',
            address: '',
            subject: '',
            grade: '',
            status: 'active',
            joinDate: '2024-03-01'
          }
        ];

        const success: Teacher[] = [];
        const errors: { row: number; error: string; data: any }[] = [];

        mockData.forEach((row, index) => {
          const rowNumber = index + 2; // Excel rows start from 2 (after header)

          // Validation
          if (!row.nip) {
            errors.push({ row: rowNumber, error: 'NIP tidak boleh kosong', data: row });
            return;
          }
          if (!row.name) {
            errors.push({ row: rowNumber, error: 'Nama tidak boleh kosong', data: row });
            return;
          }
          if (!row.email || !row.email.includes('@')) {
            errors.push({ row: rowNumber, error: 'Email tidak valid', data: row });
            return;
          }

          // If validation passes, add to success
          success.push({
            id: Date.now().toString() + index,
            nip: row.nip,
            name: row.name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            subject: row.subject,
            grade: row.grade,
            status: row.status as 'active' | 'inactive',
            joinDate: row.joinDate
          });
        });

        resolve({ success, errors });
      }, 2000);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await processExcelFile(file);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Gagal memproses file. Pastikan format file benar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.success) {
      onSuccess(importResult.success);
    }
  };

  const downloadTemplate = () => {
    const template = `NIP,Nama,Email,Telepon,Alamat,Mata Pelajaran,Kelas,Status,Tanggal Bergabung
198501152010011001,"Dr. Ahmad Wijaya",ahmad.wijaya@sekolah.edu,081234567890,"Jl. Pendidikan No. 123, Jakarta",Matematika,"X, XI, XII",active,2020-01-15
198703122012012002,"Siti Nurhaliza, S.Pd",siti.nurhaliza@sekolah.edu,081234567891,"Jl. Guru Raya No. 45, Jakarta",Bahasa Indonesia,"X, XI",active,2021-03-20`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_data_guru.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Data Guru</h2>
              <p className="text-sm text-gray-500">Upload file Excel untuk import data guru</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {!importResult ? (
            // Upload Section
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Petunjuk Import</h3>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• File harus dalam format Excel (.xlsx atau .xls)</li>
                      <li>• Baris pertama harus berisi header kolom</li>
                      <li>• Kolom yang wajib: NIP, Nama, Email</li>
                      <li>• Status harus berisi 'active' atau 'inactive'</li>
                      <li>• Format tanggal: YYYY-MM-DD</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Template Excel</h4>
                    <p className="text-sm text-gray-500">Download template untuk format yang benar</p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 block">
                  Pilih File Excel
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Ganti File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Klik untuk pilih file atau drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Format: .xlsx atau .xls (Maksimal 10MB)
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Pilih File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Results Section
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Berhasil</p>
                      <p className="text-2xl font-bold text-green-700">
                        {importResult.success.length}
                      </p>
                      <p className="text-sm text-green-600">data guru</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-2xl font-bold text-red-700">
                        {importResult.errors.length}
                      </p>
                      <p className="text-sm text-red-600">data bermasalah</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Button */}
              {importResult.success.length > 0 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Sembunyikan' : 'Tampilkan'} Preview
                  </Button>
                </div>
              )}

              {/* Preview Table */}
              {showPreview && importResult.success.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-60">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importResult.success.slice(0, 5).map((teacher, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">{teacher.nip}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{teacher.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{teacher.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{teacher.subject}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                teacher.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importResult.success.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                        ... dan {importResult.success.length - 5} data lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-900">Data Bermasalah</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-2">
                        <strong>Baris {error.row}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>
            {importResult ? 'Tutup' : 'Batal'}
          </Button>

          {!importResult ? (
            <Button 
              onClick={handleImport} 
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          ) : (
            importResult.success.length > 0 && (
              <Button onClick={handleConfirmImport}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Konfirmasi Import ({importResult.success.length} data)
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
