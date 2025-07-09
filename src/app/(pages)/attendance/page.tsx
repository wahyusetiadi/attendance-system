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
import { Download, Plus, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
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

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Absensi Guru</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Kelola dan pantau kehadiran guru secara real-time
            </p>
          </div>
          
          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex space-x-3 mt-3 sm:mt-0">
            <Button variant="outline" onClick={refresh} disabled={isLoading} size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              disabled={attendanceRecords.length === 0}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsManualEntryOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {/* Mobile Action Menu */}
          <div className="sm:hidden mt-3">
            <div className="relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm font-medium">Actions</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      refresh();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-3 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setIsExportModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={attendanceRecords.length === 0}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-3" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setIsManualEntryOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    Manual Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close mobile menu on outside click */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-5 sm:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
              <p className="text-sm sm:text-base text-red-700">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="shrink-0 mt-2 sm:mt-0"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Filters - 🔥 Use allTeachers for filter dropdown */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <AttendanceFilters
          filter={filter}
          onFilterChange={handleFilterChange}
          attendanceData={normalizedAttendanceRecords}
          teachers={allTeachers.length > 0 ? allTeachers : teachers} // Use allTeachers if available
        />
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <AttendanceStats
            summary={summary}
            totalRecords={displayData.length}
          />
        </div>
      )}

      {/* 🔧 MODIFIED: Pagination Info with effective pagination */}
      {effectivePagination && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {((effectivePagination.page - 1) * effectivePagination.limit) + 1} to{" "}
              {Math.min(effectivePagination.page * effectivePagination.limit, effectivePagination.total)}{" "}
              of {effectivePagination.total} records
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm text-gray-600 shrink-0">Items per page:</label>
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
                className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm min-w-0"
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
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <AttendanceTable
            data={paginatedData}
            onRefresh={refresh}
            isLoading={isLoading || teachersLoading}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={deleteRecord}
            pagination={effectivePagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

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