'use client';

import { AttendanceSummary } from '@/types/attendance';
import { 
  UserCheck, 
  Clock, 
  UserX, 
  Activity, 
  TrendingUp,
  Heart
} from 'lucide-react';

interface AttendanceStatsProps {
  summary: AttendanceSummary;
  totalRecords: number;
}

export function AttendanceStats({ summary, totalRecords }: AttendanceStatsProps) {
  const stats = [
    {
      title: 'Total Hadir',
      value: summary.totalPresent,
      percentage: totalRecords > 0 ? (summary.totalPresent / totalRecords) * 100 : 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Terlambat',
      value: summary.totalLate,
      percentage: totalRecords > 0 ? (summary.totalLate / totalRecords) * 100 : 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Tidak Hadir',
      value: summary.totalAbsent,
      percentage: totalRecords > 0 ? (summary.totalAbsent / totalRecords) * 100 : 0,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Sakit',
      value: summary.totalSick,
      percentage: totalRecords > 0 ? (summary.totalSick / totalRecords) * 100 : 0,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Izin',
      value: summary.totalPermission,
      percentage: totalRecords > 0 ? (summary.totalPermission / totalRecords) * 100 : 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ringkasan Statistik</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            {summary.attendanceRate.toFixed(1)}% tingkat kehadiran
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <span className={`text-xs font-medium ${stat.color} bg-white px-2 py-1 rounded-full`}>
                {stat.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm ${stat.color} font-medium`}>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Rata-rata Jam Kerja</p>
              <p className="text-2xl font-bold text-blue-700">
                {summary.averageWorkingHours.toFixed(1)} jam
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Data</p>
              <p className="text-2xl font-bold text-green-700">{totalRecords}</p>
              <p className="text-xs text-green-600">record absensi</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
