'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAttendance } from '@/hooks/useAttendance';
import { CheckInOutStatus } from '@/types/attendance';
import { Clock, MapPin, Camera, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

interface CheckInOutCardProps {
  teacherId: number;
  teacherName: string;
  onStatusChange?: () => void;
}

export function CheckInOutCard({ teacherId, teacherName, onStatusChange }: CheckInOutCardProps) {
  const { checkIn, checkOut, getTeacherStatus, isLoading, error } = useAttendance();
  const [status, setStatus] = useState<CheckInOutStatus | null>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch teacher status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const teacherStatus = await getTeacherStatus(teacherId);
      if (teacherStatus) {
        setStatus(teacherStatus);
      }
    };

    fetchStatus();
  }, [teacherId]);

  const handleCheckIn = async () => {
    const result = await checkIn({
      teacherId,
      location: location || undefined,
      notes: notes || undefined,
    });

    if (result) {
      // Refresh status
      const newStatus = await getTeacherStatus(teacherId);
      if (newStatus) {
        setStatus(newStatus);
      }
      setLocation('');
      setNotes('');
      onStatusChange?.();
    }
  };

  const handleCheckOut = async () => {
    const result = await checkOut({
      teacherId,
      location: location || undefined,
      notes: notes || undefined,
    });

    if (result) {
      // Refresh status
      const newStatus = await getTeacherStatus(teacherId);
      if (newStatus) {
        setStatus(newStatus);
      }
      setLocation('');
      setNotes('');
      onStatusChange?.();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{teacherName}</h3>
        <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
        <div className="text-3xl font-bold text-blue-600 mt-2">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Current Status */}
      {status?.todayAttendance && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Status Hari Ini</h4>
          <div className="space-y-2 text-sm">
            {status.todayAttendance.clockIn && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Check In: {status.todayAttendance.clockIn}</span>
              </div>
            )}
            {status.todayAttendance.clockOut && (
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span>Check Out: {status.todayAttendance.clockOut}</span>
              </div>
            )}
            {status.todayAttendance.workingHours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span>Jam Kerja: {status.todayAttendance.workingHours} jam</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4 mb-6">
        <Input
          label="Lokasi"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Contoh: Gedung A, Ruang Guru"
          disabled={isLoading}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Catatan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={handleCheckIn}
          disabled={isLoading || !status?.canCheckIn}
          className="w-full"
          variant={status?.canCheckIn ? 'default' : 'outline'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Check In
        </Button>

        <Button
          onClick={handleCheckOut}
          disabled={isLoading || !status?.canCheckOut}
          className="w-full"
          variant={status?.canCheckOut ? 'destructive' : 'outline'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Check Out
        </Button>
      </div>

      {/* Status Message */}
      {status?.message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">{status.message}</p>
        </div>
      )}
    </div>
  );
}
