"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AttendanceFilter,
  // AttendanceSummary,
  AttendanceRecord,
} from "@/types/attendance";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { ExportModal } from "@/components/attendance/ExportModal";
import { ManualEntryModal } from "@/components/attendance/ManualEntryModal";
import { useAttendance } from "@/hooks/useAttendance";
import { useTeachers } from "@/hooks/useTeachers";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Plus,
  RefreshCw,
  // Calendar,
  // Clock,
  // Users,
  // BarChart3,
  AlertCircle,
} from "lucide-react";

export default function AttendancePage() {
  const {
    attendanceRecords,
    isLoading,
    error,
    pagination,
    summary,
    fetchAttendance,
    createManualEntry,
    updateRecord,
    deleteRecord,
    refresh,
  } = useAttendance();

  const { teachers } = useTeachers();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const defaultFilter: AttendanceFilter = {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    sortBy: "date",
    sortOrder: "desc",
  };

  const [filter, setFilter] = useState<AttendanceFilter>(defaultFilter);

  useEffect(() => {
    fetchAttendance(filter);
  }, [filter]);

;

  // Function to normalize backend data to frontend format
  const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
    // Convert backend status to frontend format
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

    // Calculate working hours if both checkIn and checkOut exist
    const calculateWorkingHours = (
      checkIn: number | null,
      checkOut: number | null
    ): number | null => {
      if (!checkIn || !checkOut) return null;

      const startTime = new Date(checkIn);
      const endTime = new Date(checkOut);
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours

      return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
    };

    // Format timestamp to HH:MM (if timestamp exists)
    const formatTimestamp = (timestamp: number | null): string | null => {
      if (!timestamp) return null;

      const date = new Date(timestamp);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    // Format date to YYYY-MM-DD
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
      workingHours: calculateWorkingHours(record.checkIn, record.checkOut),
      status: normalizeStatus(record.status),
      location: record.location,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  // Normalize attendance records from backend
  const normalizedAttendanceRecords: AttendanceRecord[] = attendanceRecords.map(
    normalizeAttendanceRecord
  );

  // Function to get filtered attendance data with teacher completion
  const getFilteredAttendanceData = (): AttendanceRecord[] => {
    // Check if filter is for a single day (start and end date are the same)
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay) {
      // For single day view, show all teachers with their attendance status
      const filterDate = filter.startDate;
      const dayAttendanceRecords = normalizedAttendanceRecords.filter(
        (record) => record.date === filterDate
      );

      // Create map of attendance records by teacherId
      const attendanceMap = new Map<number, AttendanceRecord>();
      dayAttendanceRecords.forEach((record) => {
        attendanceMap.set(record.teacherId, record);
      });

      // Combine all teachers with their attendance status
      return teachers
        .filter((teacher) => teacher.id !== undefined)
        .map((teacher) => {
          const teacherId = teacher.id!;
          const attendanceRecord = attendanceMap.get(teacherId);

          if (attendanceRecord) {
            // Return existing attendance record
            return {
              ...attendanceRecord,
              teacherName: teacher.name,
              teacherNip: teacher.nip,
              teacher: {
                id: teacherId,
                name: teacher.name,
                nip: teacher.nip,
                email: teacher.email,
              },
            };
          } else {
            // Create "not recorded" entry for teachers without attendance
            return {
              id: undefined,
              teacherId: teacherId,
              teacherName: teacher.name,
              teacherNip: teacher.nip,
              teacher: {
                id: teacherId,
                name: teacher.name,
                nip: teacher.nip,
                email: teacher.email,
              },
              date: filterDate,
              checkIn: null,
              checkOut: null,
              workingHours: null,
              status: "TIDAK HADIR" as AttendanceRecord["status"],
              location: null,
              notes: "Belum melakukan absensi",
              createdAt: undefined,
              updatedAt: undefined,
            } as AttendanceRecord;
          }
        });
    } else {
      // For date range view, show only actual attendance records
      return normalizedAttendanceRecords;
    }
  };

  const displayData = getFilteredAttendanceData();

  // Get stats based on display data
  const getStatsFromData = (data: AttendanceRecord[]) => {
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay) {
      // For single day, calculate based on all teachers
      return {
        total: data.length,
        present: data.filter(
          (r) => r.status === "HADIR" || r.status === "TERLAMBAT"
        ).length,
        absent: data.filter(
          (r) =>
            r.status === "TIDAK HADIR" ||
            r.status === "SAKIT" ||
            r.status === "IZIN"
        ).length,
        notRecorded: data.filter((r) => r.notes === "Belum melakukan absensi")
          .length,
        attendanceRate:
          data.length > 0
            ? (data.filter(
                (r) => r.status === "HADIR" || r.status === "TERLAMBAT"
              ).length /
                data.length) *
              100
            : 0,
      };
    } else {
      // For date range, calculate based on actual records
      return {
        total: data.length,
        present: data.filter(
          (r) => r.status === "HADIR" || r.status === "TERLAMBAT"
        ).length,
        absent: data.filter(
          (r) =>
            r.status === "TIDAK HADIR" ||
            r.status === "SAKIT" ||
            r.status === "IZIN"
        ).length,
        notRecorded: 0, // No "not recorded" in date range view
        attendanceRate:
          data.length > 0
            ? (data.filter(
                (r) => r.status === "HADIR" || r.status === "TERLAMBAT"
              ).length /
                data.length) *
              100
            : 0,
      };
    }
  };

  const statsData = getStatsFromData(displayData);

  const handleFilterChange = (newFilter: AttendanceFilter) => {
    console.log("Filter changed:", newFilter);
    setFilter(newFilter);
  };

  const handleUpdateRecord = async (updatedRecord: any) => {
    if (updatedRecord.id) {
      await updateRecord(updatedRecord.id, updatedRecord);
    }
  };

  const handleSaveManualEntry = async (newRecord: any) => {
    await createManualEntry(newRecord);
    setIsManualEntryOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center md:flex-row flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Absensi Guru</h1>
          <p className="text-gray-600 mt-2">
            Kelola dan pantau kehadiran guru secara real-time
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            disabled={attendanceRecords.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsManualEntryOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <AttendanceFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        attendanceData={normalizedAttendanceRecords}
        teachers={teachers}
      />

      {/* Summary Statistics */}
      {summary && (
        <AttendanceStats
          summary={summary}
          totalRecords={normalizedAttendanceRecords.length}
        />
      )}

      {/* Attendance Table */}
      <AttendanceTable
        data={displayData}
        onRefresh={refresh}
        isLoading={isLoading}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={deleteRecord}
      />

      {/* Pagination */}
      {pagination && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Showing {displayData.length}{" "}
            {filter.startDate === filter.endDate ? "teachers" : "records"}
            {filter.startDate === filter.endDate
              ? ` (${filter.startDate})`
              : ` (${filter.startDate} - ${filter.endDate})`}
          </p>
        </div>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={normalizedAttendanceRecords}
        filter={filter}
      />

      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSave={handleSaveManualEntry}
        teachers={teachers}
        existingRecords={normalizedAttendanceRecords}
      />
    </div>
  );
}
