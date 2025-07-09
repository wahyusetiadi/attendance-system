// src/components/charts/MonthlyChart/utils/attendanceCalculations.ts
import { Teacher, AttendanceRecord } from '@/api/api';
import { MonthlyAttendanceData, DailyAttendanceData, TeacherAttendanceData } from '../types';
import { defaultMonthsIndo, dayNames } from './constants';

export const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
  const normalizeStatus = (status: string): AttendanceRecord["status"] => {
    switch (status?.toUpperCase()) {
      case "HADIR":
        return "HADIR";
      case "TERLAMBAT":
        return "TERLAMBAT";
      case "TIDAK_HADIR":
      case "ALPHA":
        return "TIDAK HADIR";
      case "SAKIT":
        return "SAKIT";
      case "IZIN":
        return "IZIN";
      default:
        return "TIDAK HADIR";
    }
  };

  const formatTimestamp = (timestamp: number | null): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toISOString().split("T")[0];
  };

  return {
    id: record.id || undefined,
    teacherId: record.teacherId,
    teacherName: record.teacher?.name || null,
    teacherNip: record.teacher?.nip || null,
    teacher: record.teacher
      ? {
          id: record.teacher.id,
          name: record.teacher.name,
          nip: record.teacher.nip || undefined,
          email: record.teacher.email || undefined,
        }
      : undefined,
    date: formatDate(record.date),
    checkIn: formatTimestamp(record.checkIn),
    checkOut: formatTimestamp(record.checkOut),
    workingHours: record.workingHours || null,
    status: normalizeStatus(record.status),
    location: record.location,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const getWorkingDaysInMonth = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};

export const getDailyAttendanceData = (
  year: number, 
  month: number, 
  teacherRecords: AttendanceRecord[]
): DailyAttendanceData[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyData: DailyAttendanceData[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    const record = teacherRecords.find(r => r.date === dateString);

    dailyData.push({
      date: dateString,
      day,
      dayName: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      hasRecord: !!record,
      status: record?.status || null,
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      workingHours: record?.workingHours || null,
      notes: record?.notes || null
    });
  }

  return dailyData;
};

export const calculateMonthlyStats = (
  monthRecords: AttendanceRecord[]
): Pick<MonthlyAttendanceData, 'presentDays' | 'absentDays' | 'lateDays' | 'details'> => {
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  const details = {
    hadir: 0,
    terlambat: 0,
    tidakHadir: 0,
    sakit: 0,
    izin: 0
  };

  monthRecords.forEach(record => {
    switch (record.status) {
      case 'HADIR':
        presentDays++;
        details.hadir++;
        break;
      case 'TERLAMBAT':
        lateDays++;
        details.terlambat++;
        break;
      case 'TIDAK HADIR':
        absentDays++;
        details.tidakHadir++;
        break;
      case 'SAKIT':
        absentDays++;
        details.sakit++;
        break;
      case 'IZIN':
        absentDays++;
        details.izin++;
        break;
    }
  });

  return { presentDays, absentDays, lateDays, details };
};

export const calculateTeacherAttendanceData = (
  teacher: Teacher,
  allAttendanceRecords: AttendanceRecord[],
  selectedYear: number
): TeacherAttendanceData => {
  if (!teacher.id) {
    return {
      teacherId: 0,
      teacherName: teacher.name,
      teacherNip: teacher.nip,
      monthlyData: [],
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      overallAttendanceRate: 0
    };
  }

  const teacherRecords = allAttendanceRecords.filter(record => record.teacherId === teacher.id);

  const monthlyData: MonthlyAttendanceData[] = [];
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalWorkingDays = 0;

  for (let month = 0; month < 12; month++) {
    const workingDays = getWorkingDaysInMonth(selectedYear, month);

    const monthRecords = teacherRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === month;
    });

    const dailyData = getDailyAttendanceData(selectedYear, month, monthRecords);
    const stats = calculateMonthlyStats(monthRecords);

    const attendanceRate = workingDays > 0 
      ? Math.round(((stats.presentDays + stats.lateDays) / workingDays) * 100)
      : 0;

    monthlyData.push({
      month: defaultMonthsIndo[month],
      monthIndex: month,
      ...stats,
      workingDays,
      attendanceRate,
      dailyData
    });

    totalPresent += stats.presentDays;
    totalAbsent += stats.absentDays;
    totalLate += stats.lateDays;
    totalWorkingDays += workingDays;
  }

  const overallAttendanceRate = totalWorkingDays > 0 
    ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100)
    : 0;

  return {
    teacherId: teacher.id,
    teacherName: teacher.name,
    teacherNip: teacher.nip,
    monthlyData,
    totalPresent,
    totalAbsent,
    totalLate,
    overallAttendanceRate
  };
};
