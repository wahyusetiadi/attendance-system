// src/components/attendance/AttendanceEditModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  Save, 
  Clock, 
  MapPin, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  onSave: (updatedRecord: AttendanceRecord) => void;
}

export function AttendanceEditModal({ isOpen, onClose, record, onSave }: AttendanceEditModalProps) {
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleInputChange = (field: keyof AttendanceRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateWorkingHours = (clockIn: string | null, clockOut: string | null): number | null => {
    if (!clockIn || !clockOut) return null;

    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);

    const inTime = inHour + inMinute / 60;
    const outTime = outHour + outMinute / 60;

    return Math.max(0, outTime - inTime);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Calculate working hours if both times are provided
      const workingHours = calculateWorkingHours(
        formData.clockIn || null, 
        formData.clockOut || null
      );

      const updatedRecord: AttendanceRecord = {
        ...record,
        ...formData,
        workingHours
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(updatedRecord);
      onClose();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsLoading(false);
    }
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
                Edit Absensi
              </h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-sm text-gray-600">NIP: {record.teacherNip}</p>
              <p className="text-sm text-gray-600">
                Tanggal: {new Date(record.date).toLocaleDateString('id-ID')}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Absensi
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Hadir</option>
                  <option value="late">Terlambat</option>
                  <option value="absent">Tidak Hadir</option>
                  <option value="sick">Sakit</option>
                  <option value="permission">Izin</option>
                </select>
              </div>

              {/* Clock In */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={formData.clockIn || ''}
                  onChange={(e) => handleInputChange('clockIn', e.target.value || null)}
                  disabled={formData.status === 'absent' || formData.status === 'sick'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Clock Out */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Jam Keluar
                </label>
                <input
                  type="time"
                  value={formData.clockOut || ''}
                  onChange={(e) => handleInputChange('clockOut', e.target.value || null)}
                  disabled={formData.status === 'absent' || formData.status === 'sick'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Lokasi
                </label>
                <select
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Lokasi</option>
                  <option value="Gedung A">Gedung A</option>
                  <option value="Gedung B">Gedung B</option>
                  <option value="Gedung C">Gedung C</option>
                  <option value="Lapangan">Lapangan</option>
                  <option value="Laboratorium">Laboratorium</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Catatan
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value || null)}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Working Hours Display */}
              {formData.clockIn && formData.clockOut && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Total Jam Kerja: {calculateWorkingHours(formData.clockIn, formData.clockOut)?.toFixed(2)} jam
                    </span>
                  </div>
                </div>
              )}

              {/* Warning for status changes */}
              {(formData.status === 'absent' || formData.status === 'sick') && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Jam masuk dan keluar akan dihapus untuk status ini
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
