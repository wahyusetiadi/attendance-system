// src/components/notifications/NotificationContainer.tsx
'use client';

import React from 'react';
import { ToastNotification } from './ToastNotification';

export function NotificationContainer() {
  return (
    <>
      {/* Toast Notifications - Floating di kanan atas */}
      <ToastNotification 
        position="top-right"
        autoHide={true}
        duration={5000}
        maxToasts={3}
      />
    </>
  );
}
