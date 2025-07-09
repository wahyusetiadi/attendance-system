// src/components/charts/MonthlyChart/hooks/useAttendanceCalc.tsx
import { useMemo } from 'react';
import { Teacher, AttendanceRecord } from '@/api/api';
import { TeacherAttendanceData } from '../types';
import { calculateTeacherAttendanceData } from '../utils/attendanceCalculations';

export const useAttendanceCalculations = (
  allTeachers: Teacher[],
  allAttendanceRecords: AttendanceRecord[],
  selectedYear: number,
  searchTerm: string
) => {
  const teachersData = useMemo((): TeacherAttendanceData[] => {
    if (!allTeachers.length) {
      return [];
    }

    return allTeachers.map(teacher => 
      calculateTeacherAttendanceData(teacher, allAttendanceRecords, selectedYear)
    );
  }, [allTeachers, allAttendanceRecords, selectedYear]);

  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.nip && teacher.nip.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allTeachers, searchTerm]);

  const filteredTeachersData = useMemo(() => {
    return teachersData.filter(data => 
      data.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (data.teacherNip && data.teacherNip.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => b.overallAttendanceRate - a.overallAttendanceRate);
  }, [teachersData, searchTerm]);

  return {
    teachersData,
    filteredTeachers,
    filteredTeachersData
  };
};
