// src/components/attendance/AttendanceTable.tsx
'use client';

import { useState } from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { AttendanceDetailModal } from './AttendanceDetailModal';
import { AttendanceEditModal } from './AttendanceEditModal';
import { AttendanceNotesModal } from './AttendanceNotesModal';
import { 
  Eye, 
  Edit2, 
  Clock, 
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  FileText
} from 'lucide-react';

interface AttendanceTableProps {
  data: AttendanceRecord[];
  onRefresh: () => void;
  isLoading: boolean;
  onUpdateRecord?: (updatedRecord: AttendanceRecord) => void;
}

export function AttendanceTable({ data, onRefresh, isLoading, onUpdateRecord }: AttendanceTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sick':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'permission':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      case 'sick':
        return 'Sakit';
      case 'permission':
        return 'Izin';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sick':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'permission':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWorkingHours = (hours: number | null) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}j ${m}m`;
  };

  // Action Handlers
  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleViewNotes = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setNotesModalOpen(true);
  };

  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    if (onUpdateRecord) {
      onUpdateRecord(updatedRecord);
    }
    console.log('Updated record:', updatedRecord);
    // Here you would typically make an API call to save the changes
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Riwayat Absensi
          </h3>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data absensi</h3>
        <p className="text-gray-500 mb-4">
          Tidak ada data absensi yang sesuai dengan filter yang dipilih.
        </p>
        <Button onClick={onRefresh} disabled={isLoading}>
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Riwayat Absensi ({data.length} data)
            </h3>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Kerja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {record.teacherName?.charAt(0)?.toUpperCase() || 'N'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.teacherName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {record.teacherNip || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDate(record.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(record.clockIn)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(record.clockOut)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatWorkingHours(record.workingHours)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.location ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {record.location}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Lihat Detail"
                        onClick={() => handleViewDetail(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Edit"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {record.notes && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Lihat Catatan"
                          onClick={() => handleViewNotes(record)}
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan {data.length} data absensi
            </div>
            <div className="text-sm text-gray-500">
              {isLoading && 'Memuat data...'}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AttendanceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        record={selectedRecord}
      />

      <AttendanceEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />

      <AttendanceNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        record={selectedRecord}
      />
    </>
  );
}
