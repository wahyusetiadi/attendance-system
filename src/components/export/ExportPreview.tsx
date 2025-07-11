// components/export/ExportPreview.tsx
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';
import { ExportOptions } from '@/hooks/useExportData';
import { Calendar, Users, Filter, Settings } from 'lucide-react';

interface ExportPreviewProps {
  filter: AttendanceFilter;
  exportData: AttendanceRecord[];
  exportFormat: 'excel' | 'pdf' | 'csv';
  options: ExportOptions;
  stats: {
    total: number;
    belumAbsen: number;
    tidakHadirOtomatis: number;
    hadir: number;
  };
  isLoadingAllData: boolean;
}

export function ExportPreview({ 
  filter, 
  exportData, 
  exportFormat, 
  options, 
  stats, 
  isLoadingAllData 
}: ExportPreviewProps) {
  const formatOptions = [
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF (.pdf)' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Preview Export</h4>

      {/* Basic Info */}
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
  );
}
