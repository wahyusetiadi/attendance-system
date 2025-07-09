// src/components/notifications/ConnectionStatus.tsx
'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionStatus } = useNotifications();

  const getStatusIcon = () => {
    if (isConnected) {
      return <WifiIcon className="h-3 w-3" />;
    }

    if (connectionStatus.includes('Reconnecting')) {
      return <ArrowPathIcon className="h-3 w-3 animate-spin" />;
    }

    if (connectionStatus.includes('Error')) {
      return <XCircleIcon className="h-3 w-3" />;
    }

    return <ExclamationTriangleIcon className="h-3 w-3" />;
  };

  const getStatusColor = () => {
    if (isConnected) {
      return 'bg-green-100 text-green-700 border-green-200';
    }

    if (connectionStatus.includes('Reconnecting')) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }

    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="max-w-32 truncate" title={connectionStatus}>
        {isConnected ? 'Live' : connectionStatus}
      </span>
    </div>
  );
};
