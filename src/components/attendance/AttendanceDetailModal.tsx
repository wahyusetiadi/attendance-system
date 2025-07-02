// src/components/attendance/AttendanceDetailModal.tsx
'use client';

import React from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  FileText,
  Camera
} from 'lucide-react';

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export function AttendanceDetailModal({ isOpen, onClose, record }: AttendanceDetailModalProps) {
  if (!isOpen || !record) return null;

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'HADIR':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'TERLAMBAT':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'TIDAK HADIR':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'SAKIT':
        return <Heart className="h-6 w-6 text-pink-500" />;
      case 'IZIN':
        return <FileText className="h-6 w-6 text-purple-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'HADIR':
        return 'Hadir';
      case 'TERLAMBAT':
        return 'Terlambat';
      case 'TIDAK HADIR':
        return 'Tidak Hadir';
      case 'SAKIT':
        return 'Sakit';
      case 'IZIN':
        return 'Izin';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatWorkingHours = (hours: number | null) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} jam ${m} menit`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Absensi
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
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {/* {record.teacherName.charAt(0).toUpperCase()} */}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{record.teacherName}</h4>
                <p className="text-sm text-gray-600 font-mono">NIP: {record.teacherNip}</p>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Status */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium">{formatDate(record.date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{getStatusLabel(record.status)}</p>
                  </div>
                </div>

                {record.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Lokasi</p>
                      <p className="font-medium">{record.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Jam Masuk</p>
                    <p className="font-medium font-mono">{formatTime(record.checkIn)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Jam Keluar</p>
                    <p className="font-medium font-mono">{formatTime(record.checkOut)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Total Jam Kerja</p>
                    <p className="font-medium">{formatWorkingHours(record.workingHours)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Catatan</p>
                    <p className="text-sm text-yellow-700 mt-1">{record.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Photo */}
            {/* {record.photo ? (
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">Foto Absensi</p>
                </div>
                <img 
                  src={record.photo} 
                  alt="Foto Absensi" 
                  className="w-full max-w-md rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tidak ada foto absensi</p>
              </div>
            )} */}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button>
              Edit Absensi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
