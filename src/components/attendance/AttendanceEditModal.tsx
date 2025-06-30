'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { attendanceAPI } from '@/api/api';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  Save, 
  Clock, 
  MapPin, 
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  onSave: (updatedRecord: AttendanceRecord) => void;
}

export function AttendanceEditModal({ isOpen, onClose, record, onSave }: AttendanceEditModalProps) {
  const [formData, setFormData] = useState<{
    status: string;
    notes: string;
  }>({
    status: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        status: record.status || '',
        notes: record.notes || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(false);
  };

  // Status options yang sesuai dengan backend
  const statusOptions = [
    { value: 'HADIR', label: 'Hadir', color: 'text-green-600' },
    { value: 'TERLAMBAT', label: 'Terlambat', color: 'text-yellow-600' },
    { value: 'TIDAK_HADIR', label: 'Tidak Hadir', color: 'text-red-600' },
    { value: 'SAKIT', label: 'Sakit', color: 'text-pink-600' },
    { value: 'IZIN', label: 'Izin', color: 'text-purple-600' }
  ];

  const handleSave = async () => {
    if (!record.teacherId || !record.date) {
      setError('Data guru atau tanggal tidak valid');
      return;
    }

    if (!formData.status) {
      setError('Status wajib dipilih');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Menggunakan endpoint yang sesuai dengan backend
      const response = await attendanceAPI.updateAttendanceStatus(
        record.teacherId,
        record.date,
        formData.status,
        formData.notes || undefined
      );

      if (response.success) {
        // Update local record with new data
        const updatedRecord: AttendanceRecord = {
          ...record,
          status: formData.status as AttendanceRecord['status'],
          notes: formData.notes,
          updatedAt: new Date().toISOString()
        };

        setSuccess(true);
        onSave(updatedRecord);

        // Close modal after short delay to show success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Gagal mengupdate status absensi');
      }
    } catch (error: any) {
      console.error('Error updating attendance status:', error);
      setError(error.message || 'Terjadi kesalahan saat mengupdate status');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusLabel = () => {
    const currentStatus = statusOptions.find(opt => opt.value === record.status);
    return currentStatus?.label || record.status;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Status Absensi
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Teacher Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">{record.teacherName}</h4>
              <p className="text-sm text-gray-600">NIP: {record.teacherNip || '-'}</p>
              <p className="text-sm text-gray-600">
                Tanggal: {new Date(record.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Status saat ini: <span className="font-medium">{getCurrentStatusLabel()}</span>
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Status absensi berhasil diupdate!
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Absensi *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isLoading || success}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={isLoading || success}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Info Alert */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Catatan Penting:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Perubahan status akan mengupdate record absensi</li>
                      <li>• Waktu check-in dan check-out tidak dapat diubah melalui form ini</li>
                      <li>• Gunakan catatan untuk memberikan keterangan tambahan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Current Record Info */}
              {(record.checkIn || record.checkOut) && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Informasi Waktu:</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Jam Masuk:</span>
                      <div className="font-mono text-gray-900">
                        {record.checkIn ? record.checkIn.substring(0, 5) : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Jam Keluar:</span>
                      <div className="font-mono text-gray-900">
                        {record.checkOut ? record.checkOut.substring(0, 5) : '-'}
                      </div>
                    </div>
                  </div>
                  {record.workingHours && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Total Jam Kerja:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {record.workingHours.toFixed(2)} jam
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              {success ? 'Tutup' : 'Batal'}
            </Button>
            {!success && (
              <Button 
                onClick={handleSave} 
                disabled={isLoading || !formData.status}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
