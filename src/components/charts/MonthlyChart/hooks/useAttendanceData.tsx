// src/components/charts/MonthlyChart/hooks/useAttendanceData.tsx
import { useState, useEffect } from 'react';
import { teachersAPI, attendanceAPI, Teacher, AttendanceRecord } from '@/api/api';
import { normalizeAttendanceRecord } from '../utils/attendanceCalculations';

export const useAttendanceData = (selectedYear: number) => {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [teachersResponse, attendanceResponse] = await Promise.all([
          teachersAPI.getAll({ 
            page: 1, 
            limit: 1000, 
            isActive: true 
          }),
          attendanceAPI.getAll({
            startDate: `${selectedYear}-01-01`,
            endDate: `${selectedYear}-12-31`,
            page: 1,
            limit: 10000
          })
        ]);

        if (!teachersResponse.success || !teachersResponse.data) {
          throw new Error('Failed to fetch teachers data');
        }

        const teachers = teachersResponse.data;
        setAllTeachers(teachers);

        let attendanceRecords: AttendanceRecord[] = [];
        if (attendanceResponse.success && attendanceResponse.data) {
          attendanceRecords = attendanceResponse.data.map(normalizeAttendanceRecord);
        }
        setAllAttendanceRecords(attendanceRecords);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data kehadiran guru. Periksa koneksi internet Anda.');
        setAllTeachers([]);
        setAllAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedYear]);

  return {
    allTeachers,
    allAttendanceRecords,
    loading,
    error
  };
};
