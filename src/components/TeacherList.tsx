'use client';

import { useState } from 'react';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function TeacherList({ teachers, onEdit, onDelete, onAdd }: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.nip.includes(searchTerm) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* <Button onClick={onAdd}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Tambah Guru
        </Button> */}
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
            {filteredTeachers.map((teacher) => (
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
                        {teacher.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {teacher.nip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {teacher.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${teacher.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => onEdit(teacher)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => onDelete(teacher.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
