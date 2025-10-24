'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PencilIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Pagination, Teacher } from '@/types/teacher';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onToggleStatus?: (id: number) => void;
  isLoading?: boolean;
  pagination?: Pagination | null;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  setCurrentPage?: (page: number) => void;
  fetchTeachers?: (params: { page: number; limit: number }) => void;
}

export function TeacherList({ 
  teachers, 
  onEdit, 
  onDelete, 
  onAdd,
  onToggleStatus,
  isLoading = false,
  pagination,
  onPageChange,
  pageSize = 10,
  setPageSize,
  setCurrentPage,
  fetchTeachers
}: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.nip && teacher.nip.includes(searchTerm)) ||
    (teacher.rfidUid && teacher.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTeacherStatus = (teacher: Teacher) => {
    if (typeof teacher.isActive === 'boolean') {
      return teacher.isActive ? 'active' : 'inactive';
    }
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

  const generatePageNumbers = (totalPages: number, currentPage: number, maxVisible: number = 3): number[] => {
    const pages: number[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= Math.ceil(maxVisible / 2)) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
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

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6">
      {/* ✅ Search untuk iPhone SE */}
      <div className="flex flex-col gap-3 xs:gap-4">
        <Input
          type="search"
          placeholder="Cari guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm xs:text-base"
        />
      </div>

      {/* ✅ Card View untuk iPhone SE (bukan table) */}
      <div className="space-y-2 xs:space-y-3">
        {isLoading && filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-lg p-6 xs:p-8 text-center text-gray-500">
            Loading teachers...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-lg p-6 xs:p-8 text-center text-gray-500">
            No teachers found.
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 xs:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="h-8 w-8 xs:h-10 xs:w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs xs:text-sm font-medium text-white">
                      {teacher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm xs:text-base font-medium text-gray-900 truncate">
                      {teacher.name}
                    </div>
                    <div className="mt-1">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${getStatusStyles(teacher)}
                      `}>
                        {getStatusDisplay(teacher)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer p-2"
                    onClick={() => onEdit(teacher)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {teacher.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer p-2"
                      onClick={() => onDelete(teacher.id!)}
                    >
                      <TrashIcon className="text-red-500 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Pagination dengan justify-between */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg p-3 xs:p-4 border border-gray-200">
          <div className="flex justify-between gap-3 xs:gap-4">
            {/* Info pagination */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs xs:text-sm text-gray-600 hidden md:inline">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} guru
              </p>

              {/* Page size selector */}
              <div className="flex items-center space-x-2">
                <label className="text-xs xs:text-sm text-gray-600">
                  Per halaman:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    if (setPageSize && setCurrentPage && fetchTeachers) {
                      setPageSize(newSize);
                      setCurrentPage(1);
                      fetchTeachers({ page: 1, limit: newSize });
                    }
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-xs xs:text-sm min-w-[50px]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="px-2 xs:px-3 text-xs xs:text-sm"
              >
                <ChevronLeftIcon className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
                <span className="hidden xs:inline">Previous</span>
              </Button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {generatePageNumbers(pagination.totalPages, pagination.page, 3).map(page => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(page)}
                    disabled={isLoading}
                    className="min-w-[32px] xs:min-w-[36px] text-xs xs:text-sm"
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
                className="px-2 xs:px-3 text-xs xs:text-sm"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRightIcon className="h-3 w-3 xs:h-4 xs:w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}