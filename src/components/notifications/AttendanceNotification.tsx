// src/components/notifications/AttendanceNotificationBell.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Clock, Calendar, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { attendanceAPI } from '@/api/api';
import { AttendanceRecord } from '@/types/attendance';

interface AttendanceNotificationBellProps {
  className?: string;
}

interface AttendanceNotification {
  id: number;
  teacherName: string;
  type: 'check-in' | 'check-out';
  time: string;
  date: string;
  status: 'HADIR' | 'TERLAMBAT' | 'TIDAK HADIR' | 'SAKIT' | 'IZIN';
  location?: string;
  notes?: string;
  teacherNip?: string;
  timestamp: number;
}

export function AttendanceNotificationBell({ className = '' }: AttendanceNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Key for localStorage
  const STORAGE_KEY = 'attendance_read_notifications';

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const readIds = JSON.parse(stored);
        setReadNotifications(new Set(readIds));
      } catch (error) {
        console.error('Error parsing read notifications:', error);
      }
    }
  }, []);

  // Save read notifications to localStorage
  const saveReadNotifications = (readIds: Set<number>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const allIds = new Set<number>();
    notifications.forEach(notification => {
      allIds.add(notification.id);
    });
    setReadNotifications(allIds);
    saveReadNotifications(allIds);
  };

  // Convert timestamp to date string (YYYY-MM-DD)
  const timestampToDateString = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  // Convert timestamp to time string (HH:MM)
  const timestampToTimeString = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if timestamp is from today
  const isToday = (timestamp: number) => {
    const today = getTodayDate();
    const recordDate = timestampToDateString(timestamp);
    return recordDate === today;
  };

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter(notification => !readNotifications.has(notification.id)).length;
  };

  // Fetch latest attendance data
  const fetchAttendanceNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.getAll({
        page: 1,
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        // Process attendance data to create notifications
        const processedNotifications: AttendanceNotification[] = [];

        response.data.forEach((record: any) => {
          const teacherName = record.teacher?.name || record.teacherName || 'Unknown';
          const teacherNip = record.teacher?.nip || record.teacherNip;

          // Check-in notification
          if (record.checkIn && isToday(record.checkIn)) {
            processedNotifications.push({
              id: record.id || 0,
              teacherName,
              teacherNip,
              type: 'check-in',
              time: timestampToTimeString(record.checkIn),
              date: timestampToDateString(record.checkIn),
              status: record.status,
              location: record.location || undefined,
              notes: record.notes || undefined,
              timestamp: record.checkIn
            });
          }

          // Check-out notification
          if (record.checkOut && isToday(record.checkOut)) {
            processedNotifications.push({
              id: (record.id || 0) + 1000,
              teacherName,
              teacherNip,
              type: 'check-out',
              time: timestampToTimeString(record.checkOut),
              date: timestampToDateString(record.checkOut),
              status: record.status,
              location: record.location || undefined,
              notes: record.notes || undefined,
              timestamp: record.checkOut
            });
          }
        });

        // Sort by timestamp (newest first) and take only 5 latest
        const sortedNotifications = processedNotifications
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setNotifications(sortedNotifications);
      } else {
        setError('Tidak ada data dari API');
      }
    } catch (err: any) {
      console.error('Error fetching attendance notifications:', err);
      setError(`Gagal memuat notifikasi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown open/close
  const handleDropdownToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      // When opening, fetch new data
      fetchAttendanceNotifications();
      // Mark all current notifications as read after a short delay
      setTimeout(() => {
        markAllAsRead();
      }, 500);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when component mounts and every 30 seconds
  useEffect(() => {
    fetchAttendanceNotifications();

    const interval = setInterval(fetchAttendanceNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Clear old read notifications from localStorage (older than 7 days)
  useEffect(() => {
    const cleanupOldReadNotifications = () => {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const currentNotificationIds = new Set(notifications.map(n => n.id));

      // Only keep read notifications for current notifications
      const cleanedReadNotifications = new Set<number>();
      readNotifications.forEach(id => {
        if (currentNotificationIds.has(id)) {
          cleanedReadNotifications.add(id);
        }
      });

      if (cleanedReadNotifications.size !== readNotifications.size) {
        setReadNotifications(cleanedReadNotifications);
        saveReadNotifications(cleanedReadNotifications);
      }
    };

    if (notifications.length > 0) {
      cleanupOldReadNotifications();
    }
  }, [notifications, readNotifications]);

  // Format time for display (native JavaScript) - for today only
  const formatNotificationTime = (timestamp: number) => {
    try {
      const now = new Date();
      const recordTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - recordTime.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        return 'Baru saja';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} menit yang lalu`;
      } else {
        const hoursAgo = Math.floor(diffInMinutes / 60);
        return `${hoursAgo} jam yang lalu`;
      }
    } catch {
      return 'Tidak diketahui';
    }
  };

  // Format time for display (native JavaScript)
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return time.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get current date display
  const getCurrentDateDisplay = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status icon and color
  const getStatusIcon = (type: string, status: string) => {
    if (type === 'check-in') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (type === 'check-out') {
      return <XCircle className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'text-green-600 bg-green-100';
      case 'TERLAMBAT':
        return 'text-yellow-600 bg-yellow-100';
      case 'TIDAK HADIR':
        return 'text-red-600 bg-red-100';
      case 'SAKIT':
        return 'text-purple-600 bg-purple-100';
      case 'IZIN':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get notification text
  const getNotificationText = (notification: AttendanceNotification) => {
    const action = notification.type === 'check-in' ? 'masuk' : 'keluar';
    return `${notification.teacherName} ${action}`;
  };

  const unreadCount = getUnreadCount();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleDropdownToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <Bell className="h-5 w-5" />

        {/* Notification Count Badge - Only show if there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount}
          </span>
        )}

        {/* Live indicator */}
        <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-3 w-3 border-2 border-white animate-pulse"></span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifikasi Absensi</h3>
                <p className="text-xs text-gray-500">Hari ini - {getCurrentDateDisplay()}</p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Mark all as read button */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Memuat notifikasi hari ini...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={fetchAttendanceNotifications}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  Coba lagi
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tidak ada notifikasi absensi hari ini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const isRead = readNotifications.has(notification.id);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(notification.type, notification.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 flex items-center space-x-2">
                              <p className={`text-sm font-medium truncate ${
                                !isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {getNotificationText(notification)}
                              </p>
                              {!isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                          </div>

                          {notification.teacherNip && (
                            <p className="text-xs text-gray-500 mt-1">
                              NIP: {notification.teacherNip}
                            </p>
                          )}

                          {/* Status Badge */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                              {notification.status}
                            </span>
                          </div>

                          {/* Date and Time */}
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.date)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.time)}
                              </span>
                            </div>
                          </div>

                          {/* Location */}
                          {notification.location && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {notification.location}
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {notification.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{notification.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50">
            <button
              onClick={fetchAttendanceNotifications}
              disabled={loading}
              className="w-full text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
