'use client';

import { AttendanceFilter, AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface AttendanceFiltersProps {
  filter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  attendanceData: AttendanceRecord[];
}

export function AttendanceFilters({ filter, onFilterChange, attendanceData }: AttendanceFiltersProps) {
  const teachers = Array.from(
    new Set(attendanceData.map(record => `${record.teacherId}|${record.teacherName}`))
  ).map(item => {
    const [id, name] = item.split('|');
    return { id, name };
  });

  const statusOptions = [
    { value: 'present', label: 'Hadir' },
    { value: 'late', label: 'Terlambat' },
    { value: 'absent', label: 'Tidak Hadir' },
    { value: 'sick', label: 'Sakit' },
    { value: 'permission', label: 'Izin' },
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Data</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/* Quick Date Filters */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Filter Cepat
          </label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickFilter(1)}
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

        {/* Teacher and Status Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Guru
            </label>
            <select
              value={filter.teacherId || ''}
              onChange={(e) => onFilterChange({ 
                ...filter, 
                teacherId: e.target.value || undefined 
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
                status: e.target.value as AttendanceRecord['status'] || undefined 
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

        {/* Sort Options */}
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
    </div>
  );
}
