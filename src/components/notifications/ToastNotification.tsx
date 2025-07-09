// src/components/notifications/ToastNotification.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { FrontendNotification } from '@/types/notification';

interface ToastNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  duration?: number;
  maxToasts?: number;
}

export function ToastNotification({
  position = 'top-right',
  autoHide = true,
  duration = 5000,
  maxToasts = 3
}: ToastNotificationProps) {
  const { notifications } = useNotificationContext();
  const [visibleNotifications, setVisibleNotifications] = useState<FrontendNotification[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Detect new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show toast for new notifications
      if (latestNotification.id !== lastNotificationId) {
        setLastNotificationId(latestNotification.id);

        setVisibleNotifications(prev => {
          const exists = prev.find(n => n.id === latestNotification.id);
          if (!exists) {
            const newNotifications = [latestNotification, ...prev];
            return newNotifications.slice(0, maxToasts);
          }
          return prev;
        });

        // Auto hide
        if (autoHide) {
          setTimeout(() => {
            setVisibleNotifications(prev => 
              prev.filter(n => n.id !== latestNotification.id)
            );
          }, duration);
        }
      }
    }
  }, [notifications, lastNotificationId, autoHide, duration, maxToasts]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const dismissNotification = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'failed':
        return 'bg-red-500 border-red-600 text-white';
      default:
        return 'bg-blue-500 border-blue-600 text-white';
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

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] space-y-2 pointer-events-none`}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            ${getStatusStyles(notification.status)} 
            p-4 rounded-lg shadow-lg max-w-sm border-l-4 
            transform transition-all duration-300 
            animate-slide-in pointer-events-auto
          `}
          style={{
            animationDelay: `${index * 100}ms`,
            zIndex: 9999 - index
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{getTypeIcon(notification.type)}</span>
                <h4 className="font-medium text-sm">{notification.studentName}</h4>
                <span className="text-xs opacity-75 bg-white bg-opacity-20 px-1 py-0.5 rounded">
                  {notification.status}
                </span>
              </div>

              <p className="text-sm opacity-90 mb-2">{notification.message}</p>

              <div className="flex items-center space-x-3 text-xs opacity-75">
                <span>📍 {notification.location}</span>
                <span>🏷️ {notification.rfidTag}</span>
                {notification.isLate && (
                  <span className="bg-red-600 px-1 py-0.5 rounded">
                    ⏰ +{notification.lateMinutes}m
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-white hover:text-gray-200 ml-2 text-lg leading-none opacity-75 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
