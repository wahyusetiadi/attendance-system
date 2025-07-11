// hooks/useExportData.ts
import { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';
import { Teacher } from '@/types/teacher';
import { attendanceAPI, teachersAPI } from '@/api/api';

export interface ExportOptions {
  convertPastAbsent: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
}

export function useExportData(filter: AttendanceFilter, isOpen: boolean) {
  const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoadingAllData, setIsLoadingAllData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, filter]);

  // ✅ Helper function untuk membuat placeholder record
  const createPlaceholderRecord = (teacher: Teacher, date: string): AttendanceRecord => {
    return {
      id: undefined,
      teacherId: teacher.id!,
      teacherName: teacher.name,
      teacherNip: teacher.nip || null,
      teacher: {
        id: teacher.id!,
        name: teacher.name,
        nip: teacher.nip,
        email: teacher.email,
      },
      date: date,
      checkIn: null,
      checkOut: null,
      workingHours: null,
      status: "TIDAK HADIR" as AttendanceRecord["status"],
      location: null,
      notes: "Belum melakukan absensi",
      createdAt: undefined,
      updatedAt: undefined,
    } as AttendanceRecord;
  };

  // ✅ FIXED: Normalize attendance record dengan safe date handling
  const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
    const normalizeStatus = (status: string): AttendanceRecord["status"] => {
      if (!status) return "TIDAK HADIR";

      switch (status.toUpperCase()) {
        case "HADIR": return "HADIR";
        case "TERLAMBAT": return "TERLAMBAT";
        case "TIDAK_HADIR":
        case "ALPHA": return "TIDAK HADIR";
        case "SAKIT": return "SAKIT";
        case "IZIN": return "IZIN";
        default: return "TIDAK HADIR";
      }
    };

    const formatTimestamp = (timestamp: number | null): string | null => {
      if (!timestamp) return null;
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (error) {
        console.error('Error formatting timestamp:', timestamp, error);
        return null;
      }
    };

    // ✅ Safe date handling
    const getSafeDate = (date: any): string => {
      try {
        if (typeof date === 'string') {
          return date.includes('T') ? date.split('T')[0] : date;
        } else if (typeof date === 'number') {
          return new Date(date).toISOString().split('T')[0];
        } else if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        } else {
          console.warn('⚠️ Invalid date in record:', date);
          return new Date().toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('❌ Error processing date:', date, error);
        return new Date().toISOString().split('T')[0];
      }
    };

    return {
      id: record.id || undefined,
      teacherId: record.teacherId,
      teacherName: record.teacher?.name || record.teacherName || null,
      teacherNip: record.teacher?.nip || record.teacherNip || null,
      teacher: record.teacher || undefined,
      date: getSafeDate(record.date),
      checkIn: formatTimestamp(record.checkIn),
      checkOut: formatTimestamp(record.checkOut),
      workingHours: record.workingHours || null,
      status: normalizeStatus(record.status),
      location: record.location || null,
      notes: record.notes || null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  // ✅ FIXED: Generate complete attendance data dengan safe date handling
  const generateCompleteAttendanceData = (
    attendanceRecords: any[], 
    teachers: Teacher[], 
    startDate: string, 
    endDate: string
  ): AttendanceRecord[] => {
    const result: AttendanceRecord[] = [];

    try {
      // Create date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateArray: string[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateArray.push(d.toISOString().split('T')[0]);
      }

      console.log('📅 Date range:', dateArray);
      console.log('👥 Teachers count:', teachers.length);
      console.log('📋 Attendance records count:', attendanceRecords.length);

      // ✅ Safe processing of attendance records
      const attendanceMap = new Map<string, any>();

      if (Array.isArray(attendanceRecords)) {
        attendanceRecords.forEach((record, index) => {
          try {
            if (!record || !record.teacherId) {
              console.warn(`⚠️ Invalid record at index ${index}:`, record);
              return;
            }

            let dateStr = '';

            // ✅ Very defensive date handling
            if (record.date) {
              if (typeof record.date === 'string') {
                dateStr = record.date.includes('T') ? record.date.split('T')[0] : record.date;
              } else if (typeof record.date === 'number') {
                dateStr = new Date(record.date).toISOString().split('T')[0];
              } else if (record.date instanceof Date) {
                dateStr = record.date.toISOString().split('T')[0];
              } else {
                console.warn(`⚠️ Unknown date format at index ${index}:`, record.date);
                return;
              }
            } else {
              console.warn(`⚠️ Missing date at index ${index}:`, record);
              return;
            }

            const key = `${record.teacherId}_${dateStr}`;
            attendanceMap.set(key, record);
          } catch (recordError) {
            console.error(`❌ Error processing record at index ${index}:`, record, recordError);
          }
        });
      }

      // Generate complete data
      teachers.forEach(teacher => {
        if (!teacher.id) return;

        dateArray.forEach(date => {
          const key = `${teacher.id}_${date}`;
          const existingRecord = attendanceMap.get(key);

          if (existingRecord) {
            try {
              result.push(normalizeAttendanceRecord(existingRecord));
            } catch (normalizeError) {
              console.error('❌ Error normalizing record:', existingRecord, normalizeError);
              // Fallback ke placeholder
              result.push(createPlaceholderRecord(teacher, date));
            }
          } else {
            result.push(createPlaceholderRecord(teacher, date));
          }
        });
      });

      return result;
    } catch (error) {
      console.error('❌ Error in generateCompleteAttendanceData:', error);
      return [];
    }
  };

  // ✅ Fetch all data when modal opens
  const loadAllData = async () => {
    setIsLoadingAllData(true);
    setError(null);

    try {
      console.log('🔍 Loading all data for export...');

      // ✅ Fetch all teachers dengan error handling
      const teachersResponse = await teachersAPI.getAll({ 
        limit: 1000,
        page: 1,
        isActive: true
      });

      let teachers: Teacher[] = [];
      if (teachersResponse.success) {
        teachers = teachersResponse.data;
        setAllTeachers(teachers);
        console.log(`✅ Loaded ${teachers.length} teachers`);
      } else {
        console.warn('⚠️ Failed to load teachers:', teachersResponse.message);
      }

      // Fetch all attendance data in date range
      const params = {
        page: 1,
        limit: 10000,
        startDate: filter.startDate,
        endDate: filter.endDate,
        teacherId: filter.teacherId,
        status: filter.status,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      };

      const attendanceResponse = await attendanceAPI.getAll(params);

      if (attendanceResponse.success) {
        const attendanceRecords = attendanceResponse.data || [];
        console.log(`✅ Loaded ${attendanceRecords.length} attendance records`);

        // ✅ Generate complete data dengan error handling
        try {
          const completeData = generateCompleteAttendanceData(
            attendanceRecords, 
            teachers, 
            filter.startDate, 
            filter.endDate
          );

          setAllAttendanceData(completeData);
          console.log(`✅ Generated ${completeData.length} complete attendance records`);
        } catch (generateError) {
          console.error('❌ Error generating complete data:', generateError);
          setError('Gagal memproses data absensi');
          // Fallback ke data kosong atau data asli
          setAllAttendanceData([]);
        }
      } else {
        console.warn('⚠️ Failed to load attendance:', attendanceResponse.message);
        setError('Gagal mengambil data lengkap absensi');
        setAllAttendanceData([]);
      }
    } catch (err: any) {
      console.error('❌ Error loading all data:', err);
      setError('Gagal mengambil data lengkap');
      setAllAttendanceData([]);
    } finally {
      setIsLoadingAllData(false);
    }
  };

  return {
    allAttendanceData,
    allTeachers,
    isLoadingAllData,
    error,
    generateCompleteAttendanceData,
    normalizeAttendanceRecord,
    createPlaceholderRecord,
    loadAllData
  };
}
