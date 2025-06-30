'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  X, 
  Save, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare,
  AlertTriangle,
  Search,
  CheckCircle,
  Plus
} from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRecord: any) => void;
  teachers: Teacher[];
  existingRecords: AttendanceRecord[];
}

export function ManualEntryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  teachers, 
  existingRecords 
}: ManualEntryModalProps) {
  const [formData, setFormData] = useState({
    teacherId: 0,
    teacherName: '',
    teacherNip: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'HADIR' as string,
    location: '',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        teacherId: 0,
        teacherName: '',
        teacherNip: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'HADIR',
        location: '',
        notes: ''
      });
      setSearchTerm('');
      setErrors({});
      setDuplicateWarning(null);
    }
  }, [isOpen]);

  // Check for duplicate entries
  useEffect(() => {
    if (formData.teacherId && formData.date) {
      const duplicate = existingRecords.find(
        record => record.teacherId === formData.teacherId && record.date === formData.date
      );

      if (duplicate) {
        setDuplicateWarning(`Guru ini sudah memiliki record absensi pada tanggal ${new Date(formData.date).toLocaleDateString('id-ID')}`);
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [formData.teacherId, formData.date, existingRecords]);

  if (!isOpen) return null;

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.nip && teacher.nip.includes(searchTerm))
  );

  const handleTeacherSelect = (teacher: Teacher) => {
    setFormData(prev => ({
      ...prev,
      teacherId: teacher.id!,
      teacherName: teacher.name,
      teacherNip: teacher.nip || ''
    }));
    setSearchTerm(teacher.name);
    setShowTeacherDropdown(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string): number | null => {
    if (!checkIn || !checkOut) return null;

    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);

    const inTime = inHour + inMinute / 60;
    const outTime = outHour + outMinute / 60;

    return Math.max(0, outTime - inTime);
  };

  // ✅ FIXED: Create timestamp in Indonesia timezone
  const createTimestamp = (date: string, time: string): number | null => {
    if (!time) return null;

    // Create date object in local timezone (Indonesia)
    const dateTime = new Date(`${date}T${time}:00`);

    // Return timestamp (milliseconds since epoch)
    return dateTime.getTime();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.teacherId) {
      newErrors.teacherId = 'Pilih guru terlebih dahulu';
    }

    if (!formData.date) {
      newErrors.date = 'Tanggal harus diisi';
    }

    // Status-specific validations
    if (formData.status === 'HADIR' || formData.status === 'TERLAMBAT') {
      if (!formData.checkIn) {
        newErrors.checkIn = 'Jam masuk harus diisi untuk status hadir/terlambat';
      }
    }

    // Time validation
    if (formData.checkIn && formData.checkOut) {
      const workingHours = calculateWorkingHours(formData.checkIn, formData.checkOut);
      if (workingHours !== null && workingHours < 0) {
        newErrors.checkOut = 'Jam keluar tidak boleh lebih awal dari jam masuk';
      }
    }

    // Date validation
    if (formData.date) {
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedLocalDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      if (selectedLocalDate > todayStart) {
        newErrors.date = 'Tidak dapat membuat absensi untuk tanggal masa depan';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (duplicateWarning) {
      const confirm = window.confirm('Data absensi untuk guru ini pada tanggal tersebut sudah ada. Apakah Anda yakin ingin menambahkan?');
      if (!confirm) return;
    }

    setIsLoading(true);

    try {
      // ✅ FIXED: Create new record with proper timestamp format
      const newRecord = {
        teacherId: formData.teacherId,
        date: formData.date, // Keep as date string
        checkIn: createTimestamp(formData.date, formData.checkIn), // Send as timestamp
        checkOut: createTimestamp(formData.date, formData.checkOut), // Send as timestamp
        status: formData.status,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };

      console.log('Sending manual entry data:', newRecord);
      console.log('Timestamps created:', {
        checkInTime: formData.checkIn,
        checkInTimestamp: newRecord.checkIn,
        checkInDate: newRecord.checkIn ? new Date(newRecord.checkIn).toLocaleString('id-ID') : null,
        checkOutTime: formData.checkOut,
        checkOutTimestamp: newRecord.checkOut,
        checkOutDate: newRecord.checkOut ? new Date(newRecord.checkOut).toLocaleString('id-ID') : null,
      });

      await onSave(newRecord);
      onClose();
    } catch (error) {
      console.error('Error saving manual entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Backend status options
  const statusOptions = [
    { value: 'HADIR', label: 'Hadir', color: 'text-green-600' },
    { value: 'TERLAMBAT', label: 'Terlambat', color: 'text-yellow-600' },
    { value: 'TIDAK_HADIR', label: 'Tidak Hadir', color: 'text-red-600' },
    { value: 'SAKIT', label: 'Sakit', color: 'text-pink-600' },
    { value: 'IZIN', label: 'Izin', color: 'text-purple-600' }
  ];

  const locationOptions = [
    'Gedung A',
    'Gedung B', 
    'Gedung C',
    'Laboratorium',
    'Lapangan',
    'Perpustakaan',
    'Kantor'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tambah Absensi Manual
                  </h3>
                  <p className="text-sm text-gray-600">
                    Input data absensi guru secara manual (Zona Waktu Indonesia)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Pilih Guru *
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama guru atau NIP..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowTeacherDropdown(true);
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.teacherId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  {showTeacherDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => (
                          <button
                            key={teacher.id}
                            onClick={() => handleTeacherSelect(teacher)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-sm text-gray-500">NIP: {teacher.nip || '-'}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500">Guru tidak ditemukan</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
                )}

                {/* Selected Teacher Display */}
                {formData.teacherId && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">{formData.teacherName}</div>
                        <div className="text-sm text-green-700">NIP: {formData.teacherNip}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Duplicate Warning */}
              {duplicateWarning && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">{duplicateWarning}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Absensi *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Jam Masuk (WIB)
                  </label>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    disabled={formData.status === 'TIDAK_HADIR' || formData.status === 'SAKIT'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.checkIn ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkIn && (
                    <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Jam Keluar (WIB)
                  </label>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    disabled={formData.status === 'TIDAK_HADIR' || formData.status === 'SAKIT'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.checkOut ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkOut && (
                    <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
                  )}
                </div>
              </div>

              {/* Working Hours Display */}
              {formData.checkIn && formData.checkOut && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Total Jam Kerja: {calculateWorkingHours(formData.checkIn, formData.checkOut)?.toFixed(2)} jam
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !formData.teacherId}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Absensi
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
