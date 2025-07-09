"use client";

import { useState, useEffect } from "react";
import { AttendanceFilter, AttendanceRecord, AttendancePagination } from "@/types/attendance";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { ExportModal } from "@/components/attendance/ExportModal";
import { ManualEntryModal } from "@/components/attendance/ManualEntryModal";
import { useAttendance } from "@/hooks/useAttendance";
import { useTeachers } from "@/hooks/useTeachers";
import { Button } from "@/components/ui/Button";
import { Download, Plus, RefreshCw, AlertCircle } from "lucide-react";
// 🔥 NEW: Import teachersAPI untuk fetch semua guru
import { teachersAPI } from "@/api/api";
import { Teacher } from "@/types/teacher";

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

  // 🔥 NEW: State untuk menyimpan semua guru
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const defaultFilter: AttendanceFilter = {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  };

  const [filter, setFilter] = useState<AttendanceFilter>(defaultFilter);

  // 🔥 NEW: Function untuk memuat semua guru
  const fetchAllTeachers = async () => {
    setTeachersLoading(true);
    try {
      console.log('🔍 Fetching ALL teachers for attendance page...');

      // Fetch dengan limit tinggi untuk mendapatkan semua guru
      const response = await teachersAPI.getAll({ 
        limit: 1000, // High limit to get all teachers
        page: 1,
        isActive: true // Only active teachers
      });

      if (response.success) {
        console.log(`✅ Fetched ${response.data.length} teachers for attendance`);
        setAllTeachers(response.data);
      } else {
        console.error('❌ Failed to fetch all teachers:', response.message);
      }
    } catch (err: any) {
      console.error('❌ Error fetching all teachers:', err);
    } finally {
      setTeachersLoading(false);
    }
  };

  // 🔧 MODIFIED: Update handlePageChange untuk custom pagination
  const handlePageChange = (page: number) => {
    const newFilter = { ...filter, page };
    setFilter(newFilter);

    // Only fetch from API if not single day view
    const isSingleDay = filter.startDate === filter.endDate;
    if (!isSingleDay) {
      fetchAttendance(newFilter);
    }
  };

  const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
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

    const calculateWorkingHours = (
      checkIn: number | null,
      checkOut: number | null
    ): number | null => {
      if (!checkIn || !checkOut) return null;

      const startTime = new Date(checkIn);
      const endTime = new Date(checkOut);
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      return Math.round(diffHours * 100) / 100;
    };

    const formatTimestamp = (timestamp: number | null): string | null => {
      if (!timestamp) return null;

      const date = new Date(timestamp);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
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
      workingHours: calculateWorkingHours(record.checkIn, record.checkOut),
      status: normalizeStatus(record.status),
      location: record.location,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  const normalizedAttendanceRecords: AttendanceRecord[] = attendanceRecords.map(
    normalizeAttendanceRecord
  );

  // 🔥 MODIFIED: Use allTeachers instead of teachers
  const getFilteredAttendanceData = (): AttendanceRecord[] => {
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay) {
      const filterDate = filter.startDate;
      const dayAttendanceRecords = normalizedAttendanceRecords.filter(
        (record) => record.date === filterDate
      );

      const attendanceMap = new Map<number, AttendanceRecord>();
      dayAttendanceRecords.forEach((record) => {
        attendanceMap.set(record.teacherId, record);
      });

      console.log('🔍 DEBUG Single Day View:');
      console.log('- All teachers count:', allTeachers.length);
      console.log('- Day attendance records count:', dayAttendanceRecords.length);

      // 🔥 Use allTeachers instead of teachers
      return allTeachers
        .filter((teacher) => teacher.id !== undefined)
        .map((teacher) => {
          const teacherId = teacher.id!;
          const attendanceRecord = attendanceMap.get(teacherId);

          if (attendanceRecord) {
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
            // 🎯 Create placeholder record for teachers without attendance
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
      return normalizedAttendanceRecords;
    }
  };

  // 🔧 MODIFIED: Custom pagination calculation menggunakan allTeachers
  const customPagination = (): AttendancePagination | null => {
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay) {
      const totalTeachers = allTeachers.length; // 🔥 Use allTeachers
      const currentPage = filter.page || 1;
      const itemsPerPage = filter.limit || 10;
      const totalPages = Math.ceil(totalTeachers / itemsPerPage);

      // console.log('🔍 Custom Pagination:');
      // console.log('- Total teachers:', totalTeachers);
      // console.log('- Current page:', currentPage);
      // console.log('- Items per page:', itemsPerPage);
      // console.log('- Total pages:', totalPages);

      return {
        page: currentPage,
        limit: itemsPerPage,
        total: totalTeachers,
        totalPages: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
      };
    }

    return pagination; // Use original pagination for date ranges
  };

  // 🔧 NEW: Get effective pagination
  const effectivePagination = customPagination();
  const displayData = getFilteredAttendanceData();

  // 🎯 NEW: Apply pagination manually for single day view
  const getPaginatedData = (): AttendanceRecord[] => {
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay && effectivePagination) {
      const startIndex = (effectivePagination.page - 1) * effectivePagination.limit;
      const endIndex = startIndex + effectivePagination.limit;

      // console.log('🔍 Pagination slice:');
      // console.log('- Start index:', startIndex);
      // console.log('- End index:', endIndex);
      // console.log('- Sliced data count:', displayData.slice(startIndex, endIndex).length);

      return displayData.slice(startIndex, endIndex);
    }

    return displayData;
  };

  const paginatedData = getPaginatedData();

  const getStatsFromData = (data: AttendanceRecord[]) => {
    const isSingleDay = filter.startDate === filter.endDate;

    if (isSingleDay) {
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
        notRecorded: 0,
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

  // 🔧 MODIFIED: Use full displayData for stats calculation
  const statsData = getStatsFromData(displayData);

  const handleFilterChange = (newFilter: AttendanceFilter) => {
    console.log("Filter changed:", newFilter);
    setFilter(newFilter);
    fetchAttendance(newFilter);
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

  // 🔥 NEW: useEffect untuk fetch semua guru saat component mount
  useEffect(() => {
    fetchAllTeachers();
  }, []);

  useEffect(() => {
    fetchAttendance(filter);
  }, []);

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

      {/* 🔥 NEW: Debug info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-xs text-yellow-800">
            <strong>Debug Info:</strong> 
            Teachers loaded: {teachers.length} | 
            All teachers: {allTeachers.length} | 
            Display data: {displayData.length} | 
            Paginated data: {paginatedData.length} |
            Teachers loading: {teachersLoading ? 'Yes' : 'No'}
          </div>
        </div>
      )} */}

      {/* Filters - 🔥 Use allTeachers for filter dropdown */}
      <AttendanceFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        attendanceData={normalizedAttendanceRecords}
        teachers={allTeachers.length > 0 ? allTeachers : teachers} // Use allTeachers if available
      />

      {/* Summary Statistics */}
      {summary && (
        <AttendanceStats
          summary={summary}
          totalRecords={displayData.length}
        />
      )}

      {/* 🔧 MODIFIED: Pagination Info with effective pagination */}
      {effectivePagination && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {((effectivePagination.page - 1) * effectivePagination.limit) + 1} to{" "}
              {Math.min(effectivePagination.page * effectivePagination.limit, effectivePagination.total)}{" "}
              of {effectivePagination.total} records
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={filter.limit || 10}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  const newFilter = { ...filter, limit: newLimit, page: 1 };
                  setFilter(newFilter);

                  // Only fetch from API if not single day view
                  const isSingleDay = filter.startDate === filter.endDate;
                  if (!isSingleDay) {
                    fetchAttendance(newFilter);
                  }
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 MODIFIED: Attendance Table with paginated data and effective pagination */}
      <AttendanceTable
        data={paginatedData}
        onRefresh={refresh}
        isLoading={isLoading || teachersLoading}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={deleteRecord}
        pagination={effectivePagination}
        onPageChange={handlePageChange}
      />

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
        teachers={allTeachers.length > 0 ? allTeachers : teachers} // Use allTeachers if available
        existingRecords={normalizedAttendanceRecords}
      />
    </div>
  );
}
