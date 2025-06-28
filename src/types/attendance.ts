export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'late' | 'absent' | 'sick' | 'permission';
  notes: string | null;
  location: string | null;
  photo: string | null;
  workingHours: number | null;
}

export interface AttendanceFilter {
  startDate: string;
  endDate: string;
  teacherId?: string;
  status?: AttendanceRecord['status'];
  sortBy: 'date' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface AttendanceSummary {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalSick: number;
  totalPermission: number;
  attendanceRate: number;
  averageWorkingHours: number;
}
