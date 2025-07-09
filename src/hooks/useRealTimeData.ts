// src/hooks/useRealTimeData.ts
import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export const useRealTimeData = () => {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch data untuk check apakah ada update
  const checkForUpdates = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/pending');
      const data = await response.json();

      if (data.success) {
        const currentTime = Date.now();

        // Check jika ada notifications baru
        if (data.notifications && data.notifications.length > 0) {
          const hasNewNotifications = data.notifications.some((n: any) => 
            new Date(n.timestamp).getTime() > lastFetchTime
          );

          if (hasNewNotifications) {
            setShouldRefresh(true);
            setLastFetchTime(currentTime);
          }
        }

        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      setConnectionStatus('disconnected');
    }
  }, [lastFetchTime]);

  useEffect(() => {
    // Initial check
    checkForUpdates();

    // Setup polling setiap 3 detik
    const interval = setInterval(checkForUpdates, 3000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Reset refresh flag
  const resetRefresh = useCallback(() => {
    setShouldRefresh(false);
  }, []);

  return { 
    shouldRefresh, 
    resetRefresh, 
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
};
