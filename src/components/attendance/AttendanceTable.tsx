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
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }

    switch (status) {
      case "HADIR":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "TERLAMBAT":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "TIDAK HADIR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "SAKIT":
        return <Heart className="h-4 w-4 text-pink-500" />;
      case "IZIN":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
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
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleViewNotes = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setNotesModalOpen(true);
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Table Status Absensi
          </h3>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tidak ada data absensi
        </h3>
        <p className="text-gray-500 mb-4">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Table Status Absensi ({data.length} data)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                        {/* <div className="text-sm text-gray-500 font-mono">
                          {record.teacherNip || record.teacher?.nip || "-"}
                        </div> */}
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

        {/* Pagination - Show if we have pagination data and more than one page */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={!pagination.hasPrev || isLoading}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Previous
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
                      className="min-w-[40px]"
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
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Remove this after pagination works */}
        {/* {pagination && (
          <div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Debug: Page {pagination.page} of {pagination.totalPages} | Total:{" "}
              {pagination.total} | HasNext: {pagination.hasNext ? "Yes" : "No"}{" "}
              | HasPrev: {pagination.hasPrev ? "Yes" : "No"}
            </div>
          </div>
        )} */}
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
