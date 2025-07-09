// src/contexts/NotificationContext.tsx
"use client";

import React, { createContext, useContext, useState } from 'react';

interface AttendanceNotification {
  id: string;
  employeeName: string;
  type: 'check-in' | 'check-out';
  time: string;
  date: string;
  location?: string;
}

interface NotificationContextType {
  notifications: AttendanceNotification[];
  addNotification: (data: AttendanceNotification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([]);

  const addNotification = (data: AttendanceNotification) => {
    setNotifications(prev => {
      // Cek apakah notifikasi sudah ada
      const exists = prev.some(notification => notification.id === data.id);
      if (exists) return prev;

      const newNotifications = [...prev, data];

      // Auto remove notification after 5 seconds
      setTimeout(() => {
        removeNotification(data.id);
      }, 5000);

      return newNotifications;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
