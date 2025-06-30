export interface AttendanceRecord {
  id?: number;
  teacherId: number;
  teacherName?: string;
  teacherNip?: string;
  date: string;
  checkIn: string | null;   // ✅ Ubah dari clockIn ke checkIn
  checkOut: string | null;  // ✅ Ubah dari clockOut ke checkOut
  status: 'HADIR' | 'TERLAMBAT' | 'TIDAK HADIR' | 'SAKIT' | 'IZIN';
  notes: string | null;
  location: string | null;
  workingHours: number | null;
  createdAt?: string;
  updatedAt?: string;
  teacher?: {
    id: number;
    name: string;
    nip?: string;
    email?: string;
  };
}


export interface CheckInRequest {
  teacherId: number;
  location?: string;
  photo?: string;
  notes?: string;
}

export interface CheckOutRequest {
  teacherId: number;
  location?: string;
  photo?: string;
  notes?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord;
  message: string;
}

export interface AttendanceListResponse {
  success: boolean;
  data: AttendanceRecord[];
  message?: string;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// src/types/attendance.ts
export interface AttendanceFilter {
  startDate: string;
  endDate: string;
  teacherId?: number;
  status?: string; // ✅ Change to string to accept backend format
  sortBy: 'date' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

export interface CheckInOutStatus {
  canCheckIn: boolean;
  canCheckOut: boolean;
  todayAttendance?: AttendanceRecord;
  message?: string;
}
