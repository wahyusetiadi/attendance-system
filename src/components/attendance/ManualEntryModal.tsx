// src/components/attendance/ManualEntryModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types/attendance';
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

// Mock data guru untuk dropdown
const mockTeachers = [
  { id: '1', name: 'Dr. Ahmad Wijaya', nip: '198501152010011001' },
  { id: '2', name: 'Siti Nurhaliza, S.Pd', nip: '198703122012012002' },
  { id: '3', name: 'Budi Santoso, M.Pd', nip: '198902282015011003' },
  { id: '4', name: 'Maya Sari, S.Pd', nip: '199001052018012004' },
  { id: '5', name: 'Rina Wahyuni, S.Pd', nip: '199205102019032005' },
  { id: '6', name: 'Agung Prasetyo, S.Pd', nip: '199103152020011006' },
  { id: '7', name: 'Dewi Kartika, M.Pd', nip: '198812202018012007' },
];

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRecord: AttendanceRecord) => void;
  existingRecords: AttendanceRecord[];
}

export function ManualEntryModal({ isOpen, onClose, onSave, existingRecords }: ManualEntryModalProps) {
  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    teacherNip: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
    status: 'present' as AttendanceRecord['status'],
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
        teacherId: '',
        teacherName: '',
        teacherNip: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '',
        clockOut: '',
        status: 'present',
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

  const filteredTeachers = mockTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.nip.includes(searchTerm)
  );

  const handleTeacherSelect = (teacher: typeof mockTeachers[0]) => {
    setFormData(prev => ({
      ...prev,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherNip: teacher.nip
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

  const calculateWorkingHours = (clockIn: string, clockOut: string): number | null => {
    if (!clockIn || !clockOut) return null;

    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);

    const inTime = inHour + inMinute / 60;
    const outTime = outHour + outMinute / 60;

    return Math.max(0, outTime - inTime);
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
    if (formData.status === 'present' || formData.status === 'late') {
      if (!formData.clockIn) {
        newErrors.clockIn = 'Jam masuk harus diisi untuk status hadir/terlambat';
      }
    }

    // Time validation
    if (formData.clockIn && formData.clockOut) {
      const workingHours = calculateWorkingHours(formData.clockIn, formData.clockOut);
      if (workingHours !== null && workingHours < 0) {
        newErrors.clockOut = 'Jam keluar tidak boleh lebih awal dari jam masuk';
      }
    }

    // Date validation (not future date)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      newErrors.date = 'Tidak dapat membuat absensi untuk tanggal masa depan';
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
      // Calculate working hours
      const workingHours = calculateWorkingHours(
        formData.clockIn || '', 
        formData.clockOut || ''
      );

      // Create new record
      const newRecord: AttendanceRecord = {
        id: `manual_${Date.now()}`, // Generate unique ID
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        teacherNip: formData.teacherNip,
        date: formData.date,
        clockIn: formData.clockIn || null,
        clockOut: formData.clockOut || null,
        status: formData.status,
        location: formData.location || null,
        notes: formData.notes || null,
        photo: null,
        workingHours
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(newRecord);
      onClose();
    } catch (error) {
      console.error('Error saving manual entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Hadir', color: 'text-green-600' },
    { value: 'late', label: 'Terlambat', color: 'text-yellow-600' },
    { value: 'absent', label: 'Tidak Hadir', color: 'text-red-600' },
    { value: 'sick', label: 'Sakit', color: 'text-pink-600' },
    { value: 'permission', label: 'Izin', color: 'text-purple-600' }
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
                    Input data absensi guru secara manual
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
                            <div className="text-sm text-gray-500">NIP: {teacher.nip}</div>
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
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={formData.clockIn}
                    onChange={(e) => handleInputChange('clockIn', e.target.value)}
                    disabled={formData.status === 'absent' || formData.status === 'sick'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.clockIn ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.clockIn && (
                    <p className="mt-1 text-sm text-red-600">{errors.clockIn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Jam Keluar
                  </label>
                  <input
                    type="time"
                    value={formData.clockOut}
                    onChange={(e) => handleInputChange('clockOut', e.target.value)}
                    disabled={formData.status === 'absent' || formData.status === 'sick'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.clockOut ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.clockOut && (
                    <p className="mt-1 text-sm text-red-600">{errors.clockOut}</p>
                  )}
                </div>
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

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Lokasi
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Lokasi</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
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
