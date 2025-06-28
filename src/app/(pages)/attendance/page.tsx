"use client";

import { useState, useEffect } from "react";
import {
  AttendanceRecord,
  AttendanceFilter,
  AttendanceSummary,
} from "@/types/attendance";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { ExportModal } from "@/components/attendance/ExportModal";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import { ManualEntryModal } from "@/components/attendance/ManualEntryModal";

// Mock data
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    teacherId: "1",
    teacherName: "Dr. Ahmad Wijaya",
    teacherNip: "198501152010011001",
    date: "2025-06-18",
    clockIn: "07:30:00",
    clockOut: "15:45:00",
    status: "present",
    notes: null,
    location: "Gedung A",
    photo: null,
    workingHours: 8.25,
  },
  {
    id: "2",
    teacherId: "2",
    teacherName: "Siti Nurhaliza, S.Pd",
    teacherNip: "198703122012012002",
    date: "2025-06-18",
    clockIn: "08:15:00",
    clockOut: "16:00:00",
    status: "late",
    notes: "Terlambat karena macet",
    location: "Gedung B",
    photo: null,
    workingHours: 7.75,
  },
  {
    id: "3",
    teacherId: "3",
    teacherName: "Budi Santoso, M.Pd",
    teacherNip: "198902282015011003",
    date: "2025-06-18",
    clockIn: null,
    clockOut: null,
    status: "sick",
    notes: "Sakit demam",
    location: null,
    photo: null,
    workingHours: null,
  },
  {
    id: "4",
    teacherId: "4",
    teacherName: "Maya Sari, S.Pd",
    teacherNip: "199001052018012004",
    date: "2025-06-18",
    clockIn: "07:45:00",
    clockOut: "15:30:00",
    status: "present",
    notes: null,
    location: "Gedung A",
    photo: null,
    workingHours: 7.75,
  },
  {
    id: "5",
    teacherId: "1",
    teacherName: "Dr. Ahmad Wijaya",
    teacherNip: "198501152010011001",
    date: "2025-06-17",
    clockIn: "07:25:00",
    clockOut: "15:50:00",
    status: "present",
    notes: null,
    location: "Gedung A",
    photo: null,
    workingHours: 8.42,
  },
  {
    id: "6",
    teacherId: "5",
    teacherName: "Rina Wahyuni, S.Pd",
    teacherNip: "199205102019032005",
    date: "2025-06-17",
    clockIn: null,
    clockOut: null,
    status: "permission",
    notes: "Izin urusan keluarga",
    location: null,
    photo: null,
    workingHours: null,
  },
];

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] =
    useState<AttendanceRecord[]>(mockAttendanceData);
  const [filteredData, setFilteredData] =
    useState<AttendanceRecord[]>(mockAttendanceData);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const defaultFilter: AttendanceFilter = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 hari lalu
    endDate: new Date().toISOString().split("T")[0], // hari ini
    sortBy: "date",
    sortOrder: "desc",
  };

  const [filter, setFilter] = useState<AttendanceFilter>(defaultFilter);

  // Calculate summary statistics
  const calculateSummary = (data: AttendanceRecord[]): AttendanceSummary => {
    const total = data.length;
    const present = data.filter((record) => record.status === "present").length;
    const late = data.filter((record) => record.status === "late").length;
    const absent = data.filter((record) => record.status === "absent").length;
    const sick = data.filter((record) => record.status === "sick").length;
    const permission = data.filter(
      (record) => record.status === "permission"
    ).length;

    const totalWorkingHours = data
      .filter((record) => record.workingHours !== null)
      .reduce((sum, record) => sum + (record.workingHours || 0), 0);

    const recordsWithWorkingHours = data.filter(
      (record) => record.workingHours !== null
    ).length;

    return {
      totalPresent: present + late, // Present includes late
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

  // Apply filters
  useEffect(() => {
    let filtered = [...attendanceData];

    // Date filter
    filtered = filtered.filter((record) => {
      const recordDate = new Date(record.date);
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Teacher filter
    if (filter.teacherId) {
      filtered = filtered.filter(
        (record) => record.teacherId === filter.teacherId
      );
    }

    // Status filter
    if (filter.status) {
      filtered = filtered.filter((record) => record.status === filter.status);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filter.sortBy) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "name":
          aValue = a.teacherName;
          bValue = b.teacherName;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (filter.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setSummary(calculateSummary(filtered));
  }, [attendanceData, filter]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleUpdateRecord = (updatedRecord: AttendanceRecord) => {
    setAttendanceData((prev) =>
      prev.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
  };

  const handleSaveManualEntry = (newRecord: AttendanceRecord) => {
    setAttendanceData((prev) => [newRecord, ...prev]);
    console.log("New Manual Entry added:", newRecord);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Absensi Guru</h1>
          <p className="text-gray-600 mt-2">
            Kelola dan pantau kehadiran guru secara real-time
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsManualEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  attendanceData.filter(
                    (r) => r.date === new Date().toISOString().split("T")[0]
                  ).length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hadir Hari Ini</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  attendanceData.filter(
                    (r) =>
                      r.date === new Date().toISOString().split("T")[0] &&
                      (r.status === "present" || r.status === "late")
                  ).length
                }
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tidak Hadir</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  attendanceData.filter(
                    (r) =>
                      r.date === new Date().toISOString().split("T")[0] &&
                      (r.status === "absent" ||
                        r.status === "sick" ||
                        r.status === "permission")
                  ).length
                }
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary ? `${summary.attendanceRate.toFixed(1)}%` : "0%"}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <AttendanceFilters
        filter={filter}
        onFilterChange={setFilter}
        attendanceData={attendanceData}
      />

      {/* Summary Statistics */}
      {summary && (
        <AttendanceStats summary={summary} totalRecords={filteredData.length} />
      )}

      {/* Attendance Table */}
      <AttendanceTable
        data={filteredData}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onUpdateRecord={handleUpdateRecord}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredData}
        filter={filter}
      />

      <ManualEntryModal
        isOpen={isManualEntry}
        onClose={() => setIsManualEntry(false)}
        onSave={handleSaveManualEntry}
        existingRecords={attendanceData}
      />
    </div>
  );
}
