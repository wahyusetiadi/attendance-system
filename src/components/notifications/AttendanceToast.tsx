// src/components/notifications/AttendanceToast.tsx
'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const AttendanceToast: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.status === 'success' 
              ? 'bg-green-50 border-l-4 border-green-400' 
              : 'bg-red-50 border-l-4 border-red-400'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.status === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  notification.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.type === 'checkin' ? 'Check In' : 'Check Out'}
                </p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <p className={`text-sm ${
                notification.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {notification.studentName}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {notification.location} • {new Date(notification.timestamp).toLocaleTimeString()}
              </p>

              {notification.message && (
                <p className="text-xs text-gray-600 mt-1">
                  {notification.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
