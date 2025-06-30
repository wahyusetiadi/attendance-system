'use client';

import { useState } from 'react';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onToggleStatus?: (id: number) => void;
  isLoading?: boolean;
}

export function TeacherList({ 
  teachers, 
  onEdit, 
  onDelete, 
  onAdd,
  onToggleStatus,
  isLoading = false
}: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.nip && teacher.nip.includes(searchTerm)) ||
    (teacher.subject && teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to get status for display
  const getTeacherStatus = (teacher: Teacher) => {
    // If using new isActive field
    if (typeof teacher.isActive === 'boolean') {
      return teacher.isActive ? 'active' : 'inactive';
    }
    // Fallback to legacy status field
    return teacher.status || 'inactive';
  };

  const getStatusDisplay = (teacher: Teacher) => {
    const status = getTeacherStatus(teacher);
    return status === 'active' ? 'Aktif' : 'Tidak Aktif';
  };

  const getStatusStyles = (teacher: Teacher) => {
    const status = getTeacherStatus(teacher);
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-black">
          <Input
            type="search"
            placeholder="Cari guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guru
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mata Pelajaran
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
            {isLoading && filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading teachers...
                </td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No teachers found.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {teacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher.email || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.nip || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.subject || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex px-2 py-1 text-xs font-semibold rounded-full
                      ${getStatusStyles(teacher)}
                    `}>
                      {getStatusDisplay(teacher)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onToggleStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer mr-2"
                        onClick={() => teacher.id && onToggleStatus(teacher.id)}
                      >
                        {getTeacherStatus(teacher) === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onEdit(teacher)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => teacher.id && onDelete(teacher.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
