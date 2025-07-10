'use client';

import { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';
import { Teacher } from '@/types/teacher';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { attendanceAPI } from '@/api/api';
import { teachersAPI } from '@/api/api';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Users,
  Filter,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceRecord[];
  filter: AttendanceFilter;
}

interface ExportOptions {
  convertPastAbsent: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
}

export function ExportModal({ isOpen, onClose, data, filter }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('csv');
  const [customFileName, setCustomFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Enhanced options with past absent conversion
  const [options, setOptions] = useState<ExportOptions>({
    convertPastAbsent: true,
    includeFilters: true,
    includeSummary: true,
  });

  // ✅ States untuk fetch all data
  const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoadingAllData, setIsLoadingAllData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch all data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, filter]);

  const loadAllData = async () => {
    setIsLoadingAllData(true);
    setError(null);

    try {
      console.log('🔍 Loading all data for export...');

      // ✅ Fetch all teachers dengan error handling
      const teachersResponse = await teachersAPI.getAll({ 
        limit: 1000,
        page: 1,
        isActive: true
      });

      let teachers: Teacher[] = [];
      if (teachersResponse.success) {
        teachers = teachersResponse.data;
        setAllTeachers(teachers);
        console.log(`✅ Loaded ${teachers.length} teachers`);
      } else {
        console.warn('⚠️ Failed to load teachers:', teachersResponse.message);
      }

      // Fetch all attendance data in date range
      const params = {
        page: 1,
        limit: 10000,
        startDate: filter.startDate,
        endDate: filter.endDate,
        teacherId: filter.teacherId,
        status: filter.status,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      };

      const attendanceResponse = await attendanceAPI.getAll(params);

      if (attendanceResponse.success) {
        const attendanceRecords = attendanceResponse.data || [];
        console.log(`✅ Loaded ${attendanceRecords.length} attendance records`);

        // ✅ Generate complete data dengan error handling
        try {
          const completeData = generateCompleteAttendanceData(
            attendanceRecords, 
            teachers, 
            filter.startDate, 
            filter.endDate
          );

          setAllAttendanceData(completeData);
          console.log(`✅ Generated ${completeData.length} complete attendance records`);
        } catch (generateError) {
          console.error('❌ Error generating complete data:', generateError);
          setError('Gagal memproses data absensi');
          setAllAttendanceData(data);
        }
      } else {
        console.warn('⚠️ Failed to load attendance:', attendanceResponse.message);
        setError('Gagal mengambil data lengkap absensi');
        setAllAttendanceData(data);
      }
    } catch (err: any) {
      console.error('❌ Error loading all data:', err);
      setError('Gagal mengambil data lengkap');
      setAllAttendanceData(data);
    } finally {
      setIsLoadingAllData(false);
    }
  };

  // ✅ Helper function untuk membuat placeholder record
  const createPlaceholderRecord = (teacher: Teacher, date: string): AttendanceRecord => {
    return {
      id: undefined,
      teacherId: teacher.id!,
      teacherName: teacher.name,
      teacherNip: teacher.nip || null,
      teacher: {
        id: teacher.id!,
        name: teacher.name,
        nip: teacher.nip,
        email: teacher.email,
      },
      date: date,
      checkIn: null,
      checkOut: null,
      workingHours: null,
      status: "TIDAK HADIR" as AttendanceRecord["status"],
      location: null,
      notes: "Belum melakukan absensi",
      createdAt: undefined,
      updatedAt: undefined,
    } as AttendanceRecord;
  };

  // ✅ FIXED: Generate complete attendance data dengan safe date handling
  const generateCompleteAttendanceData = (
    attendanceRecords: any[], 
    teachers: Teacher[], 
    startDate: string, 
    endDate: string
  ): AttendanceRecord[] => {
    const result: AttendanceRecord[] = [];

    try {
      // Create date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateArray: string[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateArray.push(d.toISOString().split('T')[0]);
      }

      console.log('📅 Date range:', dateArray);
      console.log('👥 Teachers count:', teachers.length);
      console.log('📋 Attendance records count:', attendanceRecords.length);

      // ✅ Safe processing of attendance records
      const attendanceMap = new Map<string, any>();

      if (Array.isArray(attendanceRecords)) {
        attendanceRecords.forEach((record, index) => {
          try {
            if (!record || !record.teacherId) {
              console.warn(`⚠️ Invalid record at index ${index}:`, record);
              return;
            }

            let dateStr = '';

            // ✅ Very defensive date handling
            if (record.date) {
              if (typeof record.date === 'string') {
                dateStr = record.date.includes('T') ? record.date.split('T')[0] : record.date;
              } else if (typeof record.date === 'number') {
                dateStr = new Date(record.date).toISOString().split('T')[0];
              } else if (record.date instanceof Date) {
                dateStr = record.date.toISOString().split('T')[0];
              } else {
                console.warn(`⚠️ Unknown date format at index ${index}:`, record.date);
                return;
              }
            } else {
              console.warn(`⚠️ Missing date at index ${index}:`, record);
              return;
            }

            const key = `${record.teacherId}_${dateStr}`;
            attendanceMap.set(key, record);
          } catch (recordError) {
            console.error(`❌ Error processing record at index ${index}:`, record, recordError);
          }
        });
      }

      // Generate complete data
      teachers.forEach(teacher => {
        if (!teacher.id) return;

        dateArray.forEach(date => {
          const key = `${teacher.id}_${date}`;
          const existingRecord = attendanceMap.get(key);

          if (existingRecord) {
            try {
              result.push(normalizeAttendanceRecord(existingRecord));
            } catch (normalizeError) {
              console.error('❌ Error normalizing record:', existingRecord, normalizeError);
              // Fallback ke placeholder
              result.push(createPlaceholderRecord(teacher, date));
            }
          } else {
            result.push(createPlaceholderRecord(teacher, date));
          }
        });
      });

      return result;
    } catch (error) {
      console.error('❌ Error in generateCompleteAttendanceData:', error);
      return [];
    }
  };

  // ✅ FIXED: Normalize attendance record dengan safe date handling
  const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
    const normalizeStatus = (status: string): AttendanceRecord["status"] => {
      if (!status) return "TIDAK HADIR";

      switch (status.toUpperCase()) {
        case "HADIR": return "HADIR";
        case "TERLAMBAT": return "TERLAMBAT";
        case "TIDAK_HADIR":
        case "ALPHA": return "TIDAK HADIR";
        case "SAKIT": return "SAKIT";
        case "IZIN": return "IZIN";
        default: return "TIDAK HADIR";
      }
    };

    const formatTimestamp = (timestamp: number | null): string | null => {
      if (!timestamp) return null;
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (error) {
        console.error('Error formatting timestamp:', timestamp, error);
        return null;
      }
    };

    // ✅ Safe date handling
    const getSafeDate = (date: any): string => {
      try {
        if (typeof date === 'string') {
          return date.includes('T') ? date.split('T')[0] : date;
        } else if (typeof date === 'number') {
          return new Date(date).toISOString().split('T')[0];
        } else if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        } else {
          console.warn('⚠️ Invalid date in record:', date);
          return new Date().toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('❌ Error processing date:', date, error);
        return new Date().toISOString().split('T')[0];
      }
    };

    return {
      id: record.id || undefined,
      teacherId: record.teacherId,
      teacherName: record.teacher?.name || record.teacherName || null,
      teacherNip: record.teacher?.nip || record.teacherNip || null,
      teacher: record.teacher || undefined,
      date: getSafeDate(record.date),
      checkIn: formatTimestamp(record.checkIn),
      checkOut: formatTimestamp(record.checkOut),
      workingHours: record.workingHours || null,
      status: normalizeStatus(record.status),
      location: record.location || null,
      notes: record.notes || null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  if (!isOpen) return null;

  // ✅ Use allAttendanceData for export
  const exportData = allAttendanceData.length > 0 ? allAttendanceData : data;

  // ✅ Function to check if date is in the past
  const isPastDate = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(dateString);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  };

  // ✅ Process data with past absent conversion
  const processExportData = (rawData: AttendanceRecord[]): AttendanceRecord[] => {
    if (!options.convertPastAbsent) {
      return rawData;
    }

    return rawData.map(record => {
      if (
        record.notes === "Belum melakukan absensi" && 
        isPastDate(record.date) &&
        record.status === "TIDAK HADIR"
      ) {
        return {
          ...record,
          notes: "Tidak hadir (sistem otomatis)",
          status: "TIDAK HADIR" as AttendanceRecord["status"]
        };
      }

      return record;
    });
  };

  const generateFileName = (): string => {
    if (customFileName.trim()) {
      return customFileName.trim();
    }

    const startDate = new Date(filter.startDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const endDate = new Date(filter.endDate).toLocaleDateString('id-ID').replace(/\//g, '-');
    const totalRecords = exportData.length;
    const suffix = options.convertPastAbsent ? '_processed' : '';
    return `Absensi_${startDate}_${endDate}_${totalRecords}${suffix}`;
  };

  const handleExport = async () => {
    if (isLoadingAllData) {
      alert('Mohon tunggu, sedang mengambil data lengkap...');
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fileName = generateFileName();
      const processedData = processExportData(exportData);
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

  const prepareExportData = (processedData: AttendanceRecord[]) => {
    return processedData.map(record => ({
      'Nama Guru': record.teacherName || '-',
      'NIP': record.teacherNip || '-',
      'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
      'Jam Masuk': record.checkIn || '-',
      'Jam Keluar': record.checkOut || '-',
      'Jam Kerja': record.workingHours ? `${record.workingHours.toFixed(2)} jam` : '-',
      'Status': getStatusLabel(record.status),
      'Lokasi': record.location || '-',
      'Catatan': record.notes || '-'
    }));
  };

  const getStatusLabel = (status: AttendanceRecord['status']): string => {
    const labels: Record<AttendanceRecord['status'], string> = {
      HADIR: 'HADIR',
      TERLAMBAT: 'TERLAMBAT',
      'TIDAK HADIR': 'TIDAK HADIR',
      SAKIT: 'SAKIT',
      IZIN: 'IZIN'
    };
    return labels[status] || status;
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
    const csvContent = prepareCSVContent(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
  };

  const downloadAsPDF = (data: any[], fileName: string) => {
    const content = data.map(row => Object.values(row).join(' | ')).join('\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.pdf`;
    link.click();
  };

  const prepareCSVContent = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    return [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
  };

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Format universal untuk import/export'
    }
  ];

  // ✅ Calculate statistics for processed data
  const processedData = processExportData(exportData);
  const stats = {
    total: processedData.length,
    belumAbsen: processedData.filter(r => r.notes === "Belum melakukan absensi").length,
    tidakHadirOtomatis: processedData.filter(r => r.notes === "Tidak hadir (sistem otomatis)").length,
    hadir: processedData.filter(r => r.status === "HADIR").length,
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

        {/* Loading State */}
        {isLoadingAllData && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">Mengambil semua data absensi...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs">Menggunakan data halaman saat ini ({data.length} record)</p>
              </div>
            </div>
          </div>
        )}

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

          {/* Export Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 block">
              Opsi Export
            </label>

            {/* Convert Past Absent Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={options.convertPastAbsent}
                  onChange={(e) => setOptions(prev => ({ ...prev, convertPastAbsent: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Ubah "Belum Absen" Hari Lalu Menjadi "Tidak Hadir"
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Secara otomatis mengubah status guru yang belum melakukan absensi pada hari-hari sebelumnya menjadi "Tidak Hadir"
                  </p>
                  {options.convertPastAbsent && (
                    <div className="mt-2 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                      <strong>Akan diproses:</strong> {stats.belumAbsen} record "Belum Absen" → "Tidak Hadir"
                    </div>
                  )}
                </div>
              </label>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.includeFilters}
                onChange={(e) => setOptions(prev => ({ ...prev, includeFilters: e.target.checked }))}
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
                checked={options.includeSummary}
                onChange={(e) => setOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Sertakan Ringkasan</span>
                <p className="text-xs text-gray-500">Tampilkan statistik dan ringkasan data</p>
              </div>
            </label>
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
              Kosongkan untuk menggunakan nama default berdasarkan tanggal dan jumlah record
            </p>
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
                <span className="text-gray-600">
                  {isLoadingAllData ? '...' : `${exportData.length} record`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {filter.teacherId ? '1 guru' : 'Semua guru'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Format: {formatOptions.find(f => f.value === exportFormat)?.label}
                </span>
              </div>
            </div>

            {/* Processing Preview */}
            {options.convertPastAbsent && !isLoadingAllData && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Pemrosesan Data:</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-blue-700">Total record:</span>
                    <span className="font-medium ml-1">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Hadir:</span>
                    <span className="font-medium ml-1">{stats.hadir}</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Belum absen:</span>
                    <span className="font-medium ml-1">{stats.belumAbsen}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Akan jadi tidak hadir:</span>
                    <span className="font-medium ml-1">{stats.belumAbsen}</span>
                  </div>
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
            disabled={isExporting || isLoadingAllData || exportData.length === 0}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengexport...
              </>
            ) : isLoadingAllData ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengambil Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportData.length} Data
                {options.convertPastAbsent && stats.belumAbsen > 0 && (
                  <span className="ml-1 text-xs">({stats.belumAbsen} diproses)</span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
