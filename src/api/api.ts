import axios from "axios";
import { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from "@/types";
import {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  AttendanceResponse,
  AttendanceListResponse,
  AttendanceFilter,
  AttendanceSummary,
  CheckInOutStatus,
} from "@/types/attendance";

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
  // baseURL: `/api`,
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk menambahkan token authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types untuk authentication
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

// Response types untuk teachers
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

// API endpoints untuk authentication
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// API endpoints untuk teachers
export const teachersAPI = {
  // Get all teachers
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<TeachersResponse> => {
    const response = await api.get("/teachers/get-all", { params });
    return response.data;
  },

  // Create new teacher
  create: async (
    teacherData: CreateTeacherRequest
  ): Promise<TeacherResponse> => {
    const response = await api.post("/teachers/create", teacherData);
    return response.data;
  },

  // Update teacher
  update: async (
    id: number,
    teacherData: UpdateTeacherRequest
  ): Promise<TeacherResponse> => {
    const response = await api.put(`/teachers/${id}/update`, teacherData);
    return response.data;
  },

  // Delete teacher
  delete: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Get teacher by ID
  getById: async (id: number): Promise<TeacherResponse> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Toggle teacher status (activate/deactivate)
  toggleStatus: async (id: number): Promise<TeacherResponse> => {
    const response = await api.patch(`/teachers/${id}/toggle-status`);
    return response.data;
  },
};

// API endpoints untuk attendance
export const attendanceAPI = {
  // Get all attendance records
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    teacherId?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AttendanceListResponse> => {
    // ✅ Kirim parameter ke backend
    const response = await api.get("/attendance/", { params });
    // console.log('Request params:', params);
    // console.log('Response attendance:', response.data);

    return response.data;
  },

  // Check in
  checkIn: async (data: CheckInRequest): Promise<AttendanceResponse> => {
    const response = await api.post("/attendance/check-in", data);
    return response.data;
  },

  // Check out
  checkOut: async (data: CheckOutRequest): Promise<AttendanceResponse> => {
    const response = await api.post("/attendance/check-out", data);
    return response.data;
  },

  // Get check-in/out status for today
  getStatus: async (
    teacherId: number
  ): Promise<{ success: boolean; data: CheckInOutStatus }> => {
    const response = await api.get(`/attendance/status/${teacherId}`);
    return response.data;
  },

  // Get attendance by teacher and date range
  getByTeacher: async (
    teacherId: number,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AttendanceListResponse> => {
    const response = await api.get(`/attendance/teacher/${teacherId}`, {
      params,
    });
    return response.data;
  },

  // Manual attendance entry (admin only)
  // Update API interface dan function
  createManual: async (data: {
    teacherId: number;
    date: string;
    checkIn?: string; // ← Change from clockIn to checkIn
    checkOut?: string; // ← Change from clockOut to checkOut
    status: string;
    notes?: string;
    location?: string;
  }): Promise<AttendanceResponse> => {
    const response = await api.post("/attendance/manual", data);
    return response.data;
  },

  // Update attendance record
  update: async (
    id: number,
    data: Partial<AttendanceRecord>
  ): Promise<AttendanceResponse> => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  updateAttendanceStatus: async (
    teacherId: number,
    date: string,
    status: string,
    notes?: string
  ): Promise<AttendanceResponse> => {
    const response = await api.put("/attendance/status", {
      teacherId,
      date,
      status,
      notes
    });
    return response.data;
  },

  // Delete attendance record
  delete: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

export default api;

// Re-export types for convenience
export type { Teacher, CreateTeacherRequest, UpdateTeacherRequest };
export type {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  AttendanceFilter,
  AttendanceSummary,
  CheckInOutStatus,
};
