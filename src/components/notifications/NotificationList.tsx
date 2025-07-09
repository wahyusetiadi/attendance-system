// src/components/notifications/NotificationList.tsx
'use client';

import React from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isPolling,
    clearAll,
    startPolling,
    stopPolling
  } = useNotificationContext();

  return (
    <div className="max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={isPolling ? stopPolling : startPolling}
              className={`text-xs px-2 py-1 rounded ${
                isPolling 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPolling ? 'Stop' : 'Start'}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${
            isPolling ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-xs text-gray-500">
            {isPolling ? 'Live' : 'Stopped'} • {notifications.length} notifikasi
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && notifications.length === 0 && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {notifications.length} notifikasi
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800"
              disabled={isLoading}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
