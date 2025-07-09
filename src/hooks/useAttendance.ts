"use client";

import { useState, useEffect } from "react";
import { attendanceAPI } from "@/api/api";
import {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  AttendanceFilter,
  AttendanceSummary,
  CheckInOutStatus,
  AttendancePagination,
} from "@/types/attendance";

interface UseAttendanceReturn {
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  pagination: AttendancePagination | null;
  summary: AttendanceSummary | null;
  fetchAttendance: (filter?: AttendanceFilter) => Promise<void>;
  checkIn: (data: CheckInRequest) => Promise<AttendanceRecord | null>;
  checkOut: (data: CheckOutRequest) => Promise<AttendanceRecord | null>;
  getTeacherStatus: (teacherId: number) => Promise<CheckInOutStatus | null>;
  createManualEntry: (data: {
    teacherId: number;
    date: string;
    clockIn?: string;
    clockOut?: string;
    status: AttendanceRecord["status"];
    notes?: string;
    location?: string;
  }) => Promise<AttendanceRecord | null>;
  updateRecord: (
    id: number,
    data: Partial<AttendanceRecord>
  ) => Promise<AttendanceRecord | null>;
  deleteRecord: (id: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useAttendance = (
  initialFilter?: AttendanceFilter
): UseAttendanceReturn => {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<AttendancePagination | null>(
    null
  );
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [currentFilter, setCurrentFilter] = useState<AttendanceFilter>(
    initialFilter || {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      sortBy: "date",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    }
  );

  const calculateSummary = (records: AttendanceRecord[]): AttendanceSummary => {
    const total = records.length;
    const present = records.filter((r) => r.status === "HADIR").length;
    const late = records.filter((r) => r.status === "TERLAMBAT").length;
    const absent = records.filter((r) => r.status === "TIDAK HADIR").length;
    const sick = records.filter((r) => r.status === "SAKIT").length;
    const permission = records.filter((r) => r.status === "IZIN").length;

    const totalWorkingHours = records
      .filter((r) => r.workingHours !== null)
      .reduce((sum, r) => sum + (r.workingHours || 0), 0);

    const recordsWithWorkingHours = records.filter(
      (r) => r.workingHours !== null
    ).length;

    return {
      totalPresent: present + late,
      totalLate: late,
      totalAbsent: absent,
      totalSick: sick,
      totalPermission: permission,
      attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
      averageWorkingHours:
        recordsWithWorkingHours > 0
          ? totalWorkingHours / recordsWithWorkingHours
          : 0,
    };
  };

const fetchAttendance = async (filter?: AttendanceFilter) => {
  setIsLoading(true);
  setError(null);

  const queryFilter = filter || currentFilter;
  setCurrentFilter(queryFilter);

  try {
    const params = {
      page: queryFilter.page || 1,
      limit: queryFilter.limit || 10,
      startDate: queryFilter.startDate,
      endDate: queryFilter.endDate,
      teacherId: queryFilter.teacherId,
      status: queryFilter.status,
      sortBy: queryFilter.sortBy,
      sortOrder: queryFilter.sortOrder,
    };

    console.log("🔍 Attendance API params:", params);

    const response = await attendanceAPI.getAll(params);

    console.log("📥 Attendance API response:", response);

    if (response.success) {
      const records = response.data || [];
      setAttendanceRecords(records);
      setSummary(calculateSummary(records));

      if (response.pagination) {
        console.log("📊 Backend pagination RAW:", JSON.stringify(response.pagination, null, 2));

        // ✅ Type assertion to fix the interface mismatch
        const backendPagination = response.pagination as any;

        const paginationData: AttendancePagination = {
          page: Number(backendPagination.page) || 1,
          limit: Number(backendPagination.limit) || 10,
          total: Number(backendPagination.total) || 0, // ← Explicitly use 'total'
          totalPages: Number(backendPagination.totalPages) || 0,
          hasNext: Boolean(backendPagination.hasNext),
          hasPrev: Boolean(backendPagination.hasPrev),
          nextPage: backendPagination.nextPage ? Number(backendPagination.nextPage) : null,
          prevPage: backendPagination.prevPage ? Number(backendPagination.prevPage) : null,
        };

        console.log("📊 Frontend pagination MAPPED:", JSON.stringify(paginationData, null, 2));
        setPagination(paginationData);
      } else {
        console.log("⚠️ No pagination in response");
        setPagination(null);
      }
    } else {
      setError(response.message || "Failed to fetch attendance records");
    }
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch attendance records";
    setError(errorMessage);
    console.error("Error fetching attendance:", err);
  } finally {
    setIsLoading(false);
  }
};


  const checkIn = async (
    data: CheckInRequest
  ): Promise<AttendanceRecord | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.checkIn(data);

      if (response.success) {
        await fetchAttendance(currentFilter);
        return response.data;
      } else {
        setError(response.message || "Failed to check in");
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to check in";
      setError(errorMessage);
      console.error("Error checking in:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async (
    data: CheckOutRequest
  ): Promise<AttendanceRecord | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.checkOut(data);

      if (response.success) {
        await fetchAttendance(currentFilter);
        return response.data;
      } else {
        setError(response.message || "Failed to check out");
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to check out";
      setError(errorMessage);
      console.error("Error checking out:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeacherStatus = async (
    teacherId: number
  ): Promise<CheckInOutStatus | null> => {
    try {
      const response = await attendanceAPI.getStatus(teacherId);

      if (response.success) {
        return response.data;
      } else {
        setError("Failed to get teacher status");
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get teacher status";
      setError(errorMessage);
      console.error("Error getting teacher status:", err);
      return null;
    }
  };

  const createManualEntry = async (data: {
    teacherId: number;
    date: string;
    clockIn?: string;
    clockOut?: string;
    status: AttendanceRecord["status"];
    notes?: string;
    location?: string;
  }): Promise<AttendanceRecord | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.createManual(data);

      if (response.success) {
        await fetchAttendance(currentFilter);
        return response.data;
      } else {
        setError(response.message || "Failed to create manual entry");
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create manual entry";
      setError(errorMessage);
      console.error("Error creating manual entry:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecord = async (
    id: number,
    data: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const sanitizedData = {
        ...data,
        notes: data.notes === null ? undefined : data.notes,
      };

      if (
        sanitizedData.status &&
        sanitizedData.teacherId &&
        sanitizedData.date
      ) {
        const response = await attendanceAPI.updateAttendanceStatus(
          sanitizedData.teacherId,
          sanitizedData.date,
          sanitizedData.status,
          sanitizedData.notes
        );

        if (response.success) {
          await fetchAttendance(currentFilter);
          return response.data;
        }
      } else {
        const response = await attendanceAPI.update(id, sanitizedData);
        if (response.success) {
          await fetchAttendance(currentFilter);
          return response.data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating record:", error);
      setError("Gagal mengupdate data absensi");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await attendanceAPI.delete(id);

      if (response.success) {
        setAttendanceRecords((prev) =>
          prev.filter((record) => record.id !== id)
        );
        return true;
      } else {
        setError(response.message || "Failed to delete record");
        return false;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete record";
      setError(errorMessage);
      console.error("Error deleting record:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchAttendance(currentFilter);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return {
    attendanceRecords,
    isLoading,
    error,
    pagination,
    summary,
    fetchAttendance,
    checkIn,
    checkOut,
    getTeacherStatus,
    createManualEntry,
    updateRecord,
    deleteRecord,
    refresh,
  };
};
