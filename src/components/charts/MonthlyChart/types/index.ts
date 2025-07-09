// src/components/charts/MonthlyChart/types/index.ts
import { AttendanceRecord } from '@/api/api';

export interface DailyAttendanceData {
  date: string;
  day: number;
  dayName: string;
  isWeekend: boolean;
  hasRecord: boolean;
  status: AttendanceRecord['status'] | null;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  notes: string | null;
}

export interface MonthlyAttendanceData {
  month: string;
  monthIndex: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  workingDays: number;
  attendanceRate: number;
  dailyData: DailyAttendanceData[];
  details: {
    hadir: number;
    terlambat: number;
    tidakHadir: number;
    sakit: number;
    izin: number;
  };
}

export interface TeacherAttendanceData {
  teacherId: number;
  teacherName: string;
  teacherNip?: string;
  monthlyData: MonthlyAttendanceData[];
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  overallAttendanceRate: number;
}

export type ViewMode = 'chart' | 'table' | 'daily';
export type MetricKey = 'presentDays' | 'absentDays' | 'attendanceRate' | 'lateDays';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  bgColor: string;
  suffix?: string;
}

export interface AttendanceFilters {
  selectedYear: number;
  selectedMonth: number;
  selectedTeacher: number | null;
  searchTerm: string;
}

export interface ChartViewProps {
  teachersData: TeacherAttendanceData[];
  selectedTeacher: number | null;
  selectedYear: number;
}

export interface OverallMonthlyData {
  month: string;
  monthIndex: number;
  totalTeachers: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  averageAttendanceRate: number;
  details: {
    hadir: number;
    terlambat: number;
    tidakHadir: number;
    sakit: number;
    izin: number;
  };
  topPerformers: Array<{
    name: string;
    rate: number;
  }>;
}