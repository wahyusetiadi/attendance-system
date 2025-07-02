'use client';

import { useState } from 'react';
import { TeacherForm } from '@/features/teachers/components/TeacherForm';
import { ImportModal } from '@/features/teachers/components/ImportModal';
import { ExportModal } from '@/features/teachers/components/ExportModal';
import { TeacherList } from '@/features/teachers/components/TeacherList';
import { Teacher, CreateTeacherRequest } from '@/types';
import { useTeachers } from '@/hooks/useTeachers';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Download, 
  // Upload,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  // BookOpen,
  AlertCircle
} from 'lucide-react';

export default function TeachersPage() {
  const {
    teachers,
    isLoading,
    error,
    pagination,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    toggleTeacherStatus,
    refresh,
    // fetchTeachers
  } = useTeachers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setEditingTeacher(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      const success = await deleteTeacher(id);
      if (success) {
        console.log('Teacher deleted successfully');
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    const updatedTeacher = await toggleTeacherStatus(id);
    if (updatedTeacher) {
      console.log('Teacher status updated successfully');
    }
  };

  const handleSave = async (teacherData: CreateTeacherRequest) => {
    setIsSubmitting(true);

    try {
      let success = false;

      if (editingTeacher?.id) {
        // Update existing teacher
        const updatedTeacher = await updateTeacher(editingTeacher.id, teacherData);
        success = !!updatedTeacher;
      } else {
        // Create new teacher
        const newTeacher = await createTeacher(teacherData);
        success = !!newTeacher;
      }

      if (success) {
        setIsFormOpen(false);
        setEditingTeacher(undefined);
        // Optionally show success message
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      // Optionally show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSuccess = (importedTeachers: Teacher[]) => {
    refresh();
    setIsImportModalOpen(false);
  };

  // Statistics berdasarkan struktur baru
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive || t.status === 'active').length,
    inactive: teachers.filter(t => !t.isActive || t.status === 'inactive').length,
    subjects: new Set(teachers.map(t => t.subject).filter(Boolean)).size
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between md:items-center md:flex-row flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Guru</h1>
          <p className="text-gray-600 mt-2">Kelola data guru dan informasi terkait</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {/* <Button 
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button> */}
          <Button 
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            disabled={isLoading || teachers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Guru
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Guru</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Guru Aktif</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tidak Aktif</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mata Pelajaran</p>
              <p className="text-2xl font-bold text-purple-600">{stats.subjects}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div> */}
      </div>

      {/* Pagination Info */}
      {pagination && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {teachers.length} of {pagination.totalItems} teachers 
            (Page {pagination.page} of {pagination.totalPages})
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && teachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <p className="text-gray-600">Loading teachers...</p>
          </div>
        </div>
      ) : (
        /* Teacher List */
        <TeacherList
          teachers={teachers}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
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
  );
}
