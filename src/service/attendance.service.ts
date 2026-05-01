// src/service/attendance.service.ts
import { AttendanceData } from '@/types/attendance';
import { getApiMode } from '@/lib/apiMode';
import { getLatestAttendanceData, mockAttendanceAPI } from '@/mock/api';

class AttendanceService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    return fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  async getLatestAttendance(limit: number = 50): Promise<AttendanceData[]> {
    if (getApiMode() === 'mock') {
      return getLatestAttendanceData(limit);
    }

    try {
      const response = await this.fetchWithAuth(`/api/attendance/latest?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Asumsikan API mengembalikan array of attendance records
      if (Array.isArray(data)) {
        return data.map(record => ({
          id: record.id,
          employeeName: record.employee_name || record.employeeName,
          type: record.type as 'check-in' | 'check-out',
          timestamp: new Date(record.timestamp || record.created_at),
          location: record.location || 'Unknown Location'
        }));
      }

      // Jika API mengembalikan wrapped response
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(record => ({
          id: record.id,
          employeeName: record.employee_name || record.employeeName,
          type: record.type as 'check-in' | 'check-out',
          timestamp: new Date(record.timestamp || record.created_at),
          location: record.location || 'Unknown Location'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching latest attendance:', error);
      return [];
    }
  }

  async getTodayAttendance(): Promise<AttendanceData[]> {
    if (getApiMode() === 'mock') {
      const today = new Date().toISOString().split('T')[0];
      const response = await mockAttendanceAPI.getAll({ page: 1, limit: 200, startDate: today, endDate: today });
      const records = response.data || [];
      return records
        .filter(r => r.checkIn || r.checkOut)
        .map(r => ({
          id: String(r.id),
          employeeName: r.teacherName || r.teacher?.name || 'Unknown',
          type: (r.checkOut ? 'check-out' : 'check-in') as 'check-in' | 'check-out',
          timestamp: new Date(r.checkOut || r.checkIn || new Date().toISOString()),
          location: r.location || 'Sekolah',
        }));
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const response = await this.fetchWithAuth(
        `/api/attendance?start_date=${startOfDay.toISOString()}&end_date=${endOfDay.toISOString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map(record => ({
          id: record.id,
          employeeName: record.employee_name || record.employeeName,
          type: record.type as 'check-in' | 'check-out',
          timestamp: new Date(record.timestamp || record.created_at),
          location: record.location || 'Unknown Location'
        }));
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data.map(record => ({
          id: record.id,
          employeeName: record.employee_name || record.employeeName,
          type: record.type as 'check-in' | 'check-out',
          timestamp: new Date(record.timestamp || record.created_at),
          location: record.location || 'Unknown Location'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();
