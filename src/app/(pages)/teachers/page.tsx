"use client";

import { useState } from "react";
import { TeacherForm } from "@/features/teachers/components/TeacherForm";
import { ImportModal } from "@/features/teachers/components/ImportModal";
import { ExportModal } from "@/features/teachers/components/ExportModal";
import { TeacherList } from "@/features/teachers/components/TeacherList";
import { useTeachers } from "@/hooks/useTeachers";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";
import { CreateTeacherRequest, Teacher } from "@/types/teacher";

// ✅ StatCard yang dioptimasi untuk iPhone SE
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) => (
  <div className="bg-white p-3 xs:p-4 sm:p-6 rounded-lg xs:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
        {isLoading ? (
          <div className="h-5 xs:h-6 sm:h-8 w-12 xs:w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p
            className={`text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${color}`}
          >
            {value.toLocaleString()}
          </p>
        )}
      </div>
      <div className="ml-2 xs:ml-4 flex-shrink-0">
        <div
          className={`p-1.5 xs:p-2 sm:p-3 rounded-md xs:rounded-lg ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon
            className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ${color.replace(
              "-600",
              "-500"
            )}`}
          />
        </div>
      </div>
    </div>
  </div>
);

// ✅ Skeleton Card untuk iPhone SE
const SkeletonCard = () => (
  <div className="bg-white p-3 xs:p-4 sm:p-6 rounded-lg xs:rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 xs:h-4 bg-gray-200 rounded w-16 xs:w-20 animate-pulse"></div>
        <div className="h-5 xs:h-6 sm:h-8 bg-gray-200 rounded w-12 xs:w-16 mt-2 animate-pulse"></div>
      </div>
      <div className="ml-2 xs:ml-4">
        <div className="h-4 w-4 xs:h-6 xs:w-6 sm:h-8 sm:w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function TeachersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    teachers,
    allTeachers, // ✅ Dapatkan semua data
    isLoading,
    error,
    pagination,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    toggleTeacherStatus,
    refresh,
    fetchTeachers,
  } = useTeachers({ page: currentPage, limit: pageSize });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTeachers({ page, limit: pageSize });
  };

  const handleAdd = () => {
    setEditingTeacher(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus guru ini?")) {
      const success = await deleteTeacher(id);
      if (success) {
        console.log("Teacher deleted successfully");
        fetchTeachers({ page: currentPage, limit: pageSize });
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    const updatedTeacher = await toggleTeacherStatus(id);
    if (updatedTeacher) {
      console.log("Teacher status updated successfully");
    }
  };

  const handleSave = async (teacherData: CreateTeacherRequest) => {
    setIsSubmitting(true);

    try {
      let success = false;

      if (editingTeacher?.id) {
        const updatedTeacher = await updateTeacher(
          editingTeacher.id,
          teacherData
        );
        success = !!updatedTeacher;
      } else {
        const newTeacher = await createTeacher(teacherData);
        success = !!newTeacher;
      }

      if (success) {
        setIsFormOpen(false);
        setEditingTeacher(undefined);
        fetchTeachers({ page: currentPage, limit: pageSize });
      }
    } catch (error) {
      console.error("Error saving teacher:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSuccess = (importedTeachers: Teacher[]) => {
    refresh();
    setIsImportModalOpen(false);
  };

  // ✅ Statistik berdasarkan total dari pagination dan hitung dari semua data
  const stats = {
    total: pagination?.total || 0, // ✅ Ambil dari pagination.total
    active: allTeachers.filter((t) => t.isActive === true).length, // ✅ Hitung dari semua data
    inactive: allTeachers.filter((t) => t.isActive === false).length, // ✅ Hitung dari semua data
    subjects: new Set(allTeachers.map((t) => t.subject).filter(Boolean)).size,
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      <div className="space-y-3 xs:space-y-4 sm:space-y-6">
        {/* ✅ Header untuk iPhone SE */}
        <div className="flex flex-col gap-3 xs:gap-4">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
              Manajemen Guru
            </h1>
            <p className="text-sm xs:text-base text-gray-600 mt-1 xs:mt-2">
              Kelola data guru dan informasi terkait
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 xs:gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                fetchTeachers({ page: currentPage, limit: pageSize })
              }
              disabled={isLoading}
              className="w-full md:w-fit justify-center text-sm xs:text-base"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              disabled={isLoading || teachers.length === 0}
              className="w-full md:w-fit justify-center text-sm xs:text-base"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAdd}>Tambah guru</Button>
          </div>
        </div>

        {/* ✅ Error Message untuk iPhone SE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 xs:p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 xs:h-5 xs:w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm xs:text-base leading-tight">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fetchTeachers({ page: currentPage, limit: pageSize })
                }
                className="w-full"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* ✅ Statistics Cards dengan data yang benar */}
        {isLoading && allTeachers.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:gap-6">
            <StatCard
              title="Total Guru"
              value={stats.total}
              icon={Users}
              color="text-blue-600"
              isLoading={isLoading}
            />

            <StatCard
              title="Guru Aktif"
              value={stats.active}
              icon={UserCheck}
              color="text-green-600"
              isLoading={isLoading}
            />

            <StatCard
              title="Tidak Aktif"
              value={stats.inactive}
              icon={UserX}
              color="text-red-600"
              isLoading={isLoading}
            />
          </div>
        )}

        {/* ✅ Loading State */}
        {isLoading && teachers.length === 0 ? (
          <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 p-6 xs:p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-5 w-5 xs:h-6 xs:w-6 animate-spin text-blue-500 mr-2" />
              <p className="text-gray-600 text-sm xs:text-base">
                Loading teachers...
              </p>
            </div>
          </div>
        ) : (
          <TeacherList
            teachers={teachers}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
            fetchTeachers={fetchTeachers}
          />
        )}

        {/* Modals */}
        {isFormOpen && (
          <TeacherForm
            teacher={editingTeacher}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTeacher(undefined);
            }}
            isLoading={isSubmitting}
          />
        )}

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={handleImportSuccess}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          teachers={teachers}
        />
      </div>
    </div>
  );
}
