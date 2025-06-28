'use client';

import { useState } from 'react';
import { TeacherList } from '@/components/TeacherList';
import { TeacherForm } from '@/features/teachers/components/TeacherForm';
import { ImportModal } from '@/features/teachers/components/ImportModal';
import { ExportModal } from '@/features/teachers/components/ExportModal';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Download, 
  Upload,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  BookOpen
} from 'lucide-react';

// Mock data - nanti ganti dengan API
const mockTeachers: Teacher[] = [
  {
    id: '1',
    nip: '198501152010011001',
    name: 'Dr. Ahmad Wijaya',
    email: 'ahmad.wijaya@sekolah.edu',
    phone: '081234567890',
    address: 'Jl. Pendidikan No. 123, Jakarta',
    subject: 'Matematika',
    grade: 'X, XI, XII',
    status: 'active',
    joinDate: '2020-01-15',
    avatar: undefined
  },
  {
    id: '2',
    nip: '198703122012012002',
    name: 'Siti Nurhaliza, S.Pd',
    email: 'siti.nurhaliza@sekolah.edu',
    phone: '081234567891',
    address: 'Jl. Guru Raya No. 45, Jakarta',
    subject: 'Bahasa Indonesia',
    grade: 'X, XI',
    status: 'active',
    joinDate: '2021-03-20',
    avatar: undefined
  },
  {
    id: '3',
    nip: '198902282015011003',
    name: 'Budi Santoso, M.Pd',
    email: 'budi.santoso@sekolah.edu',
    phone: '081234567892',
    address: 'Jl. Ilmu No. 67, Jakarta',
    subject: 'Fisika',
    grade: 'XI, XII',
    status: 'active',
    joinDate: '2019-08-10',
    avatar: undefined
  },
  {
    id: '4',
    nip: '199001052018012004',
    name: 'Maya Sari, S.Pd',
    email: 'maya.sari@sekolah.edu',
    phone: '081234567893',
    address: 'Jl. Kimia No. 89, Jakarta',
    subject: 'Kimia',
    grade: 'X, XI',
    status: 'inactive',
    joinDate: '2022-01-05',
    avatar: undefined
  },
  {
    id: '5',
    nip: '199205102019032005',
    name: 'Rina Wahyuni, S.Pd',
    email: 'rina.wahyuni@sekolah.edu',
    phone: '081234567894',
    address: 'Jl. Bahasa No. 12, Jakarta',
    subject: 'Bahasa Inggris',
    grade: 'X, XI, XII',
    status: 'active',
    joinDate: '2021-08-15',
    avatar: undefined
  }
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = () => {
    setEditingTeacher(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
    }
  };

  const handleSave = (teacher: Teacher) => {
    if (editingTeacher) {
      // Update existing teacher
      setTeachers(prev => prev.map(t => t.id === teacher.id ? teacher : t));
    } else {
      // Add new teacher
      const newTeacher = { ...teacher, id: Date.now().toString() };
      setTeachers(prev => [...prev, newTeacher]);
    }
    setIsFormOpen(false);
    setEditingTeacher(undefined);
  };

  const handleImportSuccess = (importedTeachers: Teacher[]) => {
    setTeachers(prev => [...prev, ...importedTeachers]);
    setIsImportModalOpen(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Statistics
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    inactive: teachers.filter(t => t.status === 'inactive').length,
    subjects: new Set(teachers.map(t => t.subject)).size
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Guru</h1>
          <p className="text-gray-600 mt-2">Kelola data guru dan informasi terkait</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Guru
          </Button>
        </div>
      </div>

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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mata Pelajaran</p>
              <p className="text-2xl font-bold text-purple-600">{stats.subjects}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Teacher List */}
      <TeacherList
        teachers={teachers}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
      {isFormOpen && (
        <TeacherForm
          teacher={editingTeacher}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTeacher(undefined);
          }}
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
