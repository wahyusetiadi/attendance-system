// src/components/attendance/AttendanceNotesModal.tsx
'use client';

import React from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { X, MessageSquare, Calendar, User } from 'lucide-react';

interface AttendanceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export function AttendanceNotesModal({ isOpen, onClose, record }: AttendanceNotesModalProps) {
  if (!isOpen || !record) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Catatan Absensi
                </h3>
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
          <div className="px-6 py-6">
            {/* Teacher and Date Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{record.teacherName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
              </div>
            </div>

            {/* Notes Content */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {record.notes ? (
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-2">Catatan:</p>
                  <p className="text-sm text-yellow-700 leading-relaxed whitespace-pre-wrap">
                    {record.notes}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-600">Tidak ada catatan untuk absensi ini</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
