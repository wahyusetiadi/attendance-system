// src/components/notifications/NotificationItem.tsx
'use client';

import React from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { FrontendNotification } from '@/types/notification';
// import { format } from 'date-fns';

interface NotificationItemProps {
  notification: FrontendNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead } = useNotificationContext();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return '🟢';
      case 'checkout':
        return '🔴';
      default:
        return '📋';
    }
  };

  // const formatTime = (timestamp: Date) => {
  //   return format(timestamp, 'HH:mm');
  // };

  return (
    <div
      onClick={handleClick}
      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <span className="text-lg">{getTypeIcon(notification.type)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {notification.studentName}
            </p>
            <span className={`text-xs ${getStatusColor(notification.status)}`}>
              {notification.status}
            </span>
          </div>

          <p className="text-sm text-gray-700 mt-1">
            {notification.message}
          </p>

          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>📍 {notification.location}</span>
            <span>🕒 {notification.timestamp.toLocaleTimeString()}</span>
            {notification.isLate && (
              <span className="text-red-500">
                ⏰ +{notification.lateMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
