"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  // BookOpen,
  TrendingUp,
  // Calendar,
  AlertCircle,
  CheckCircle,
  // BarChart3,
  // UserCheck,
  ClockArrowUp,
  ClockAlert,
  ClockArrowDown
} from 'lucide-react';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { AttendancePieChart } from '@/components/charts/AttendancePieChart';
import { teachersAPI, attendanceAPI, Teacher, AttendanceRecord } from '@/api/api';

// Interface for dashboard stats
interface DashboardStats {
  totalTeachers: number;
  todayPresent: number;
  todayLate: number;
  todayAbsent: number;
  notCheckedIn: number;
  attendanceRate: number;
  loading: boolean;
  error: string | null;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 w-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
  );
};

// const recentActivities = [
//   {
//     id: 1,
//     type: 'add',
//     message: 'Guru baru ditambahkan: Budi Santoso',
//     time: '2 jam yang lalu',
//     icon: CheckCircle,
//     color: 'text-green-500'
//   },
//   {
//     id: 2,
//     type: 'update',
//     message: 'Data guru diperbarui: Siti Rahayu',
//     time: '5 jam yang lalu',
//     icon: AlertCircle,
//     color: 'text-blue-500'
//   },
//   {
//     id: 3,
//     type: 'add',
//     message: 'Mata pelajaran baru: Fisika Lanjutan',
//     time: '1 hari yang lalu',
//     icon: CheckCircle,
//     color: 'text-green-500'
//   },
//   {
//     id: 4,
//     type: 'attendance',
//     message: 'Kehadiran guru hari ini: 94%',
//     time: '2 hari yang lalu',
//     icon: AlertCircle,
//     color: 'text-orange-500'
//   },
// ];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    todayPresent: 0,
    todayLate: 0,
    todayAbsent: 0,
    notCheckedIn: 0,
    attendanceRate: 0,
    loading: true,
    error: null
  });

  // Function to normalize backend data to frontend format
  const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
    const normalizeStatus = (status: string): AttendanceRecord["status"] => {
      switch (status?.toUpperCase()) {
        case "HADIR":
          return "HADIR";
        case "TERLAMBAT":
          return "TERLAMBAT";
        case "TIDAK_HADIR":
        case "ALPHA":
          return "TIDAK HADIR";
        case "SAKIT":
          return "SAKIT";
        case "IZIN":
          return "IZIN";
        default:
          return "TIDAK HADIR";
      }
    };

    // Format timestamp to HH:MM (if timestamp exists)
    const formatTimestamp = (timestamp: number | null): string | null => {
      if (!timestamp) return null;

      const date = new Date(timestamp);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toISOString().split("T")[0];
    };

    return {
      id: record.id || undefined,
      teacherId: record.teacherId,
      teacherName: record.teacher?.name || null,
      teacherNip: record.teacher?.nip || null,
      teacher: record.teacher
        ? {
            id: record.teacher.id,
            name: record.teacher.name,
            nip: record.teacher.nip || undefined,
            email: record.teacher.email || undefined,
          }
        : undefined,
      date: formatDate(record.date),
      checkIn: formatTimestamp(record.checkIn),
      checkOut: formatTimestamp(record.checkOut),
      workingHours: record.workingHours || null,
      status: normalizeStatus(record.status),
      location: record.location,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch all active teachers
      const teachersResponse = await teachersAPI.getAll({
        page: 1,
        limit: 1000,
        isActive: true
      });

      if (!teachersResponse.success) {
        throw new Error('Failed to fetch teachers data');
      }

      const totalTeachers = teachersResponse.data?.length || 0;
      const allTeachers = teachersResponse.data || [];

      // Fetch today's attendance records
      const attendanceResponse = await attendanceAPI.getAll({
        startDate: today,
        endDate: today,
        page: 1,
        limit: 1000
      });

      let todayPresent = 0;
      let todayLate = 0;
      let todayAbsent = 0;
      let notCheckedIn = 0;
      let attendanceRate = 0;

      if (attendanceResponse.success && attendanceResponse.data) {
        // Normalize attendance records
        const normalizedRecords = attendanceResponse.data.map(normalizeAttendanceRecord);

        // Create map of teachers who have attendance records today
        const attendanceMap = new Map<number, AttendanceRecord>();
        normalizedRecords.forEach((record) => {
          attendanceMap.set(record.teacherId, record);
        });

        // Calculate statistics
        todayPresent = normalizedRecords.filter(record => record.status === 'HADIR').length;
        todayLate = normalizedRecords.filter(record => record.status === 'TERLAMBAT').length;
        todayAbsent = normalizedRecords.filter(record => 
          record.status === 'TIDAK HADIR' || 
          record.status === 'SAKIT' || 
          record.status === 'IZIN'
        ).length;

        // Calculate teachers who haven't checked in (no attendance record today)
        notCheckedIn = allTeachers.filter(teacher => 
          teacher.id && !attendanceMap.has(teacher.id)
        ).length;

        // Calculate attendance rate (present + late) / total teachers
        const totalPresent = todayPresent + todayLate;
        attendanceRate = totalTeachers > 0 ? Math.round((totalPresent / totalTeachers) * 100) : 0;
      }

      setStats({
        totalTeachers,
        todayPresent,
        todayLate,
        todayAbsent,
        notCheckedIn,
        attendanceRate,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data dashboard'
      }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardStats();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Create stats array with real data
  const statsCards = [
    {
      title: 'Total Guru',
      value: stats.loading ? <LoadingSpinner /> : stats.totalTeachers.toString(),
      icon: Users,
      color: 'bg-blue-500',
      changeType: 'neutral' as const
    },
    {
      title: 'Hadir Hari Ini',
      value: stats.loading ? <LoadingSpinner /> : (stats.todayPresent + stats.todayLate).toString(),
      icon: ClockArrowUp,
      color: 'bg-green-500',
      changeType: 'positive' as const,
      subtitle: stats.loading ? '' : `${stats.attendanceRate}% kehadiran`
    },
    {
      title: 'Belum Absen',
      value: stats.loading ? <LoadingSpinner /> : stats.notCheckedIn.toString(),
      icon: ClockAlert,
      color: 'bg-orange-500',
      changeType: 'neutral' as const,
      subtitle: 'Guru belum check-in'
    },
    {
      title: 'Tidak Hadir',
      value: stats.loading ? <LoadingSpinner /> : stats.todayAbsent.toString(),
      icon: ClockArrowDown,
      color: 'bg-red-500',
      changeType: 'negative' as const,
      subtitle: 'Sakit, Izin, Alpha'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between md:items-center md:flex-row flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang kembali! Berikut adalah ringkasan sistem hari ini.
          </p>
          <hr className='my-2 md:hidden' />
          {stats.error && (
            <div className="mt-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{stats.error}</span>
              <button 
                onClick={fetchDashboardStats}
                className="text-sm text-red-600 underline hover:no-underline"
              >
                Coba lagi
              </button>
            </div>
          )}
        </div>
        <div className="md:text-right text-start">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {!stats.loading && (
            <button 
              onClick={fetchDashboardStats}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Refresh data
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <div className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  {stat.value}
                </div>
                {stat.subtitle && (
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500">
                      {stat.subtitle}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Status Summary */}
      {!stats.loading && !stats.error && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Kehadiran Hari Ini</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stats.todayPresent + stats.todayLate} dari {stats.totalTeachers} guru sudah hadir
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-gray-500">Tingkat kehadiran</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.attendanceRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Statistics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Statistik Bulanan 2024
            </h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                Trend positif
              </span>
            </div>
          </div>

          <MonthlyChart />
        </div>

        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <AttendancePieChart />

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Hari Ini</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tingkat kehadiran:</span>
                <span className="font-medium text-green-600">{stats.attendanceRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total terlambat:</span>
                <span className="font-medium text-yellow-600">{stats.todayLate} guru</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tidak hadir:</span>
                <span className="font-medium text-red-600">{stats.todayAbsent} guru</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Belum absen:</span>
                <span className="font-medium text-orange-600">{stats.notCheckedIn} guru</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
