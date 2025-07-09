"use client";

import { useState } from "react";
import { AttendanceRecord, AttendancePagination } from "@/types/attendance";
import { Button } from "@/components/ui/Button";
import { AttendanceDetailModal } from "./AttendanceDetailModal";
import { AttendanceEditModal } from "./AttendanceEditModal";
import { AttendanceNotesModal } from "./AttendanceNotesModal";
import {
  Eye,
  Edit2,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  FileText,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
  Calendar,
  User,
  LogIn,
  LogOut,
  Timer,
  // Status,
  MoreVertical,
} from "lucide-react";

interface AttendanceTableProps {
  data: AttendanceRecord[];
  onRefresh: () => void;
  isLoading: boolean;
  onUpdateRecord?: (updatedRecord: AttendanceRecord) => void;
  onDeleteRecord?: (id: number) => Promise<boolean>;
  showDeleteAction?: boolean;
  pagination?: AttendancePagination | null;
  onPageChange?: (page: number) => void;
}

export function AttendanceTable({
  data,
  onRefresh,
  isLoading,
  onUpdateRecord,
  onDeleteRecord,
  showDeleteAction = false,
  pagination,
  onPageChange,
}: AttendanceTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [expandedActions, setExpandedActions] = useState<number | null>(null);

  // Helper function to check if record is "not recorded"
  const isNotRecorded = (record: AttendanceRecord) => {
    return (
      record.notes === "Belum melakukan absensi" &&
      !record.checkIn &&
      !record.checkOut
    );
  };

  const getStatusIcon = (
    status: AttendanceRecord["status"],
    record: AttendanceRecord
  ) => {
    if (isNotRecorded(record)) {
      return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
    }

    switch (status) {
      case "HADIR":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case "TERLAMBAT":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      case "TIDAK HADIR":
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
      case "SAKIT":
        return <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500" />;
      case "IZIN":
        return <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (
    status: AttendanceRecord["status"],
    record: AttendanceRecord
  ) => {
    if (isNotRecorded(record)) {
      return "Belum Absen";
    }

    switch (status) {
      case "HADIR":
        return "Hadir";
      case "TERLAMBAT":
        return "Terlambat";
      case "TIDAK HADIR":
        return "Tidak Hadir";
      case "SAKIT":
        return "Sakit";
      case "IZIN":
        return "Izin";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (
    status: AttendanceRecord["status"],
    record: AttendanceRecord
  ) => {
    if (isNotRecorded(record)) {
      return "bg-gray-100 text-gray-600 border-gray-200";
    }

    switch (status) {
      case "HADIR":
        return "bg-green-100 text-green-800 border-green-200";
      case "TERLAMBAT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "TIDAK HADIR":
        return "bg-red-100 text-red-800 border-red-200";
      case "SAKIT":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "IZIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateMobile = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatWorkingHours = (hours: number | null) => {
    if (!hours) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}j ${m}m`;
  };

  const generateUniqueKey = (record: AttendanceRecord, index: number) => {
    const idPart = record.id ? `id-${record.id}` : "";
    const teacherPart = `teacher-${record.teacherId}`;
    const datePart = `date-${record.date}`;
    const indexPart = `index-${index}`;

    return [idPart, teacherPart, datePart, indexPart].filter(Boolean).join("-");
  };

  // Helper function to generate page numbers
  const generatePageNumbers = (
    totalPages: number,
    currentPage: number
  ): number[] => {
    const pages: number[] = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 1) {
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Action Handlers
  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
    setExpandedActions(null);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
    setExpandedActions(null);
  };

  const handleViewNotes = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setNotesModalOpen(true);
    setExpandedActions(null);
  };

  const handleDelete = async (record: AttendanceRecord) => {
    if (!record.id || !onDeleteRecord) return;

    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus data absensi ${
        record.teacherName || "guru"
      } pada tanggal ${formatDate(record.date)}?`
    );

    if (!confirmed) return;

    setDeleteLoading(record.id);
    setExpandedActions(null);
    try {
      const success = await onDeleteRecord(record.id);
      if (success) {
        console.log("Record deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    if (onUpdateRecord) {
      onUpdateRecord(updatedRecord);
    }
    console.log("Updated record:", updatedRecord);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Table Status Absensi
          </h3>
        </div>
        <div className="p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500">
            Memuat data absensi...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Tidak ada data absensi
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-4">
          Tidak ada data absensi yang sesuai dengan filter yang dipilih.
        </p>
        <Button onClick={onRefresh} disabled={isLoading}>
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              <span className="hidden sm:inline">
                Table Status Absensi ({data.length} data)
              </span>
              <span className="sm:hidden">Absensi ({data.length})</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          <div className="divide-y divide-gray-200">
            {data.map((record, index) => (
              <div
                key={generateUniqueKey(record, index)}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-2 items-start mb-3 border-b pb-1">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {(record.teacherName || record.teacher?.name || "N")
                          .charAt(0)
                          ?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {record.teacherName ||
                          record.teacher?.name ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateMobile(record.date)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full justify-end flex items-center space-x-1">
                    {getStatusIcon(record.status, record)}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border text-nowrap ${getStatusColor(
                        record.status,
                        record
                      )}`}
                    >
                      {getStatusLabel(record.status, record)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <LogIn className="h-3 w-3" />
                    <span>Masuk: {formatTime(record.checkIn)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LogOut className="h-3 w-3" />
                    <span>Keluar: {formatTime(record.checkOut)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-3 w-3" />
                    <span>
                      Kerja: {formatWorkingHours(record.workingHours)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(record)}
                      className="p-1"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>

                    {!isNotRecorded(record) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="p-1"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}

                    {record.notes &&
                      record.notes !== "Belum melakukan absensi" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNotes(record)}
                          className="p-1"
                        >
                          <MessageSquare className="h-3 w-3 text-blue-500" />
                        </Button>
                      )}
                  </div>

                  {showDeleteAction &&
                    onDeleteRecord &&
                    record.id &&
                    !isNotRecorded(record) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        disabled={deleteLoading === record.id}
                        className="p-1"
                      >
                        {deleteLoading === record.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-red-500" />
                        )}
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Kerja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((record, index) => (
                <tr
                  key={generateUniqueKey(record, index)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {(record.teacherName || record.teacher?.name || "N")
                            .charAt(0)
                            ?.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.teacherName ||
                            record.teacher?.name ||
                            "Unknown"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDate(record.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(record.checkIn)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(record.checkOut)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatWorkingHours(record.workingHours)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status, record)}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          record.status,
                          record
                        )}`}
                      >
                        {getStatusLabel(record.status, record)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lihat Detail"
                        onClick={() => handleViewDetail(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!isNotRecorded(record) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}

                      {record.notes &&
                        record.notes !== "Belum melakukan absensi" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Lihat Catatan"
                            onClick={() => handleViewNotes(record)}
                          >
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}

                      {showDeleteAction &&
                        onDeleteRecord &&
                        record.id &&
                        !isNotRecorded(record) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Hapus"
                            onClick={() => handleDelete(record)}
                            disabled={deleteLoading === record.id}
                          >
                            {deleteLoading === record.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Mobile Optimized */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                <span className="hidden sm:inline">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </span>
                <span className="sm:hidden">
                  {pagination.page} dari {pagination.totalPages} halaman
                </span>
              </div>

              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={!pagination.hasPrev || isLoading}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex space-x-1">
                  {generatePageNumbers(
                    pagination.totalPages,
                    pagination.page
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      disabled={isLoading}
                      className="min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={!pagination.hasNext || isLoading}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AttendanceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        record={selectedRecord}
      />

      <AttendanceEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />

      <AttendanceNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        record={selectedRecord}
      />
    </>
  );
}
