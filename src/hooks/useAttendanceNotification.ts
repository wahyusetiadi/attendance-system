// src/hooks/useAttendanceNotification.ts
"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { attendanceService } from '@/service/attendance.service';
import { AttendanceData } from '@/types/attendance';

export const useAttendanceNotification = () => {
  const { addNotification } = useNotification();
  const processedIds = useRef<Set<string>>(new Set());

  const fetchLatestAttendance = useCallback(async () => {
    try {
      console.log('🔍 Fetching latest attendance data from API...');

      const data = await attendanceService.getLatestAttendance(50);

      if (data.length === 0) {
        console.log('📭 No attendance data available');
        return;
      }

      console.log('📊 Attendance data received:', data.length, 'records');

      // Ambil record terbaru
      const latestRecord = data[0];
      const latestTime = latestRecord.timestamp;

      console.log('⏰ Latest attendance time:', latestTime.toLocaleString());

      // Ambil data dalam rentang 5 menit dari waktu terakhir
      const fiveMinutesBefore = new Date(latestTime.getTime() - 5 * 60 * 1000);

      console.log('📅 Time range:', fiveMinutesBefore.toLocaleString(), 'to', latestTime.toLocaleString());

      // Filter data dalam rentang 5 menit
      const relevantRecords = data.filter(record => {
        const recordTime = record.timestamp;
        return recordTime >= fiveMinutesBefore && recordTime <= latestTime;
      });

      console.log('✅ Relevant records found:', relevantRecords.length);

      // Tampilkan notifikasi untuk setiap record yang belum diproses
      relevantRecords.forEach(record => {
        // Skip jika sudah diproses
        if (processedIds.current.has(record.id)) {
          return;
        }

        const notificationData = {
          id: record.id,
          employeeName: record.employeeName,
          type: record.type,
          time: record.timestamp.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          date: record.timestamp.toLocaleDateString('id-ID'),
          location: record.location
        };

        console.log('🔔 Adding notification:', notificationData);
        addNotification(notificationData);

        // Mark as processed
        processedIds.current.add(record.id);
      });

      // Cleanup processed IDs (keep only last 100 to prevent memory leak)
      if (processedIds.current.size > 100) {
        const idsArray = Array.from(processedIds.current);
        processedIds.current = new Set(idsArray.slice(-50));
      }

    } catch (error) {
      console.error('🚨 Error fetching attendance data:', error);
    }
  }, [addNotification]);

  const checkForNewAttendance = useCallback(() => {
    fetchLatestAttendance();
  }, [fetchLatestAttendance]);

  useEffect(() => {
    console.log('🚀 Initializing attendance notification system...');

    // Cek absensi pertama kali saat komponen dimount
    checkForNewAttendance();

    // Set interval untuk cek absensi baru setiap 30 detik
    const interval = setInterval(checkForNewAttendance, 30000);

    return () => {
      console.log('🛑 Cleaning up attendance notification system...');
      clearInterval(interval);
    };
  }, [checkForNewAttendance]);

  return { 
    checkForNewAttendance,
    clearProcessedIds: () => processedIds.current.clear()
  };
};
