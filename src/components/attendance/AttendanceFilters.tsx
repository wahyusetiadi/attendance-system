'use client';

import { useState } from 'react';
import { AttendanceFilter, AttendanceRecord } from '@/types/attendance';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface AttendanceFiltersProps {
  filter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  attendanceData: AttendanceRecord[];
  teachers: Teacher[];
}

export function AttendanceFilters({ filter, onFilterChange, attendanceData, teachers }: AttendanceFiltersProps) {
  // ✅ State for collapsible filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = [
    { value: 'HADIR', label: 'Hadir' },
    { value: 'TERLAMBAT', label: 'Terlambat' },
    { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
    { value: 'SAKIT', label: 'Sakit' },
    { value: 'IZIN', label: 'Izin' },
  ];

  const handleReset = () => {
    const defaultFilter: AttendanceFilter = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    onFilterChange(defaultFilter);
  };

  const handleQuickFilter = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onFilterChange({
      ...filter,
      startDate,
      endDate
    });
  };

  // Check if any filters are active (not default)
  const hasActiveFilters = () => {
    return (
      filter.teacherId ||
      filter.status ||
      filter.startDate !== new Date().toISOString().split('T')[0] ||
      filter.endDate !== new Date().toISOString().split('T')[0]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ✅ Collapsible Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Data</h3>

            {/* ✅ Active filter indicator */}
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* ✅ Quick Reset Button (always visible) */}
            {hasActiveFilters() && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            {/* ✅ Expand/Collapse Icon */}
            {isFilterOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* ✅ Filter Summary (when collapsed) */}
        {!isFilterOpen && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-2">
              <span><strong>Periode:</strong> {filter.startDate} hingga {filter.endDate}</span>
              {filter.teacherId && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                  Guru: {teachers.find(t => t.id === filter.teacherId)?.name}
                </span>
              )}
              {filter.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                  Status: {statusOptions.find(s => s.value === filter.status)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Collapsible Content */}
      {isFilterOpen && (
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Quick Date Filters */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Filter Cepat
              </label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickFilter(0)}
                  className={filter.startDate === filter.endDate && filter.startDate === new Date().toISOString().split('T')[0] ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                >
                  Hari Ini
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickFilter(7)}
                >
                  7 Hari Terakhir
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickFilter(30)}
                >
                  30 Hari Terakhir
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    onFilterChange({
                      ...filter,
                      startDate: startOfMonth.toISOString().split('T')[0],
                      endDate: now.toISOString().split('T')[0]
                    });
                  }}
                >
                  Bulan Ini
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Rentang Tanggal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Mulai"
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value })}
                />
                <Input
                  label="Tanggal Akhir"
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Teacher and Status Filters */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Filter Lanjutan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Guru
                  </label>
                  <select
                    value={filter.teacherId || ''}
                    onChange={(e) => onFilterChange({ 
                      ...filter, 
                      teacherId: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Guru</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <select
                    value={filter.status || ''}
                    onChange={(e) => onFilterChange({ 
                      ...filter, 
                      status: e.target.value || undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Pengurutan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={filter.sortBy}
                    onChange={(e) => onFilterChange({ 
                      ...filter, 
                      sortBy: e.target.value as AttendanceFilter['sortBy']
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Tanggal</option>
                    <option value="name">Nama Guru</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Urutan
                  </label>
                  <select
                    value={filter.sortOrder}
                    onChange={(e) => onFilterChange({ 
                      ...filter, 
                      sortOrder: e.target.value as AttendanceFilter['sortOrder']
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Terbaru</option>
                    <option value="asc">Terlama</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Semua Filter
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500"
              >
                Tutup Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
