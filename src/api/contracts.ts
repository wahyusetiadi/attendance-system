import { AttendanceListResponse, AttendanceRecord, AttendanceResponse, CheckInOutStatus, CheckInRequest, CheckOutRequest } from "@/types/attendance";
import { CreateTeacherRequest, Teacher, UpdateTeacherRequest } from "@/types/teacher";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
  message?: string;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
  message: string;
}

export type AuthAPI = {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
};

export type TeachersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => Promise<TeachersResponse>;
  create: (teacherData: CreateTeacherRequest) => Promise<TeacherResponse>;
  update: (id: number, teacherData: UpdateTeacherRequest) => Promise<TeacherResponse>;
  delete: (id: number) => Promise<{ success: boolean; message: string }>;
  getById: (id: number) => Promise<TeacherResponse>;
  toggleStatus: (id: number) => Promise<TeacherResponse>;
};

export type AttendanceAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    teacherId?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => Promise<AttendanceListResponse>;
  checkIn: (data: CheckInRequest) => Promise<AttendanceResponse>;
  checkOut: (data: CheckOutRequest) => Promise<AttendanceResponse>;
  getStatus: (teacherId: number) => Promise<{ success: boolean; data: CheckInOutStatus }>;
  getByTeacher: (teacherId: number, params?: { startDate?: string; endDate?: string }) => Promise<AttendanceListResponse>;
  createManual: (data: any) => Promise<AttendanceResponse>;
  update: (id: number, data: Partial<AttendanceRecord>) => Promise<AttendanceResponse>;
  updateAttendanceStatus: (teacherId: number, date: string, status: string, notes?: string) => Promise<AttendanceResponse>;
  delete: (id: number) => Promise<{ success: boolean; message: string }>;
};

