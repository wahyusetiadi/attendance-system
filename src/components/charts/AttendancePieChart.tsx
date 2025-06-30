'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { attendanceAPI, AttendanceRecord } from '@/api/api';

interface AttendanceData {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  iconColor: string;
}

interface DailyAttendance {
  day: string;
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

interface WeeklyStats {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalAll: number;
  dailyBreakdown: DailyAttendance[];
  loading: boolean;
  error: string | null;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
  );
};

export function AttendancePieChart() {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isDailyBreakdownOpen, setIsDailyBreakdownOpen] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(true);

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPresent: 0,
    totalLate: 0,
    totalAbsent: 0,
    totalAll: 0,
    dailyBreakdown: [],
    loading: true,
    error: null
  });

  // Function to get start and end of current week (Monday to Sunday)
  const getCurrentWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Calculate Monday of current week
    const startOfWeek = new Date(today);
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days
    startOfWeek.setDate(today.getDate() + daysToMonday);

    // Calculate Sunday of current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      dates: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
      })
    };
  };

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

    const formatDate = (isoString: string): string => {
      return new Date(isoString).toISOString().split("T")[0];
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

  // Fetch weekly attendance data
  const fetchWeeklyAttendance = async () => {
    try {
      setWeeklyStats(prev => ({ ...prev, loading: true, error: null }));

      const { startDate, endDate, dates } = getCurrentWeekRange();

      // Fetch attendance data for the current week
      const attendanceResponse = await attendanceAPI.getAll();            

      if (!attendanceResponse.success) {
        throw new Error('Failed to fetch attendance data');
      }

      // Normalize attendance records
      const normalizedRecords = (attendanceResponse.data || []).map(normalizeAttendanceRecord);

      // Initialize daily breakdown
      const dailyBreakdown: DailyAttendance[] = dates.map((date, index) => {
        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const dateStr = date.toISOString().split('T')[0];

        // Filter records for this specific date
        const dayRecords = normalizedRecords.filter(record => record.date === dateStr);

        const present = dayRecords.filter(record => record.status === 'HADIR').length;
        const late = dayRecords.filter(record => record.status === 'TERLAMBAT').length;
        const absent = dayRecords.filter(record => 
          record.status === 'TIDAK HADIR' || 
          record.status === 'SAKIT' || 
          record.status === 'IZIN'
        ).length;

        return {
          day: dayNames[index],
          date: dateStr,
          present,
          late,
          absent,
          total: dayRecords.length
        };
      });      

      // Calculate weekly totals
      const totalPresent = dailyBreakdown.reduce((sum, day) => sum + day.present, 0);
      const totalLate = dailyBreakdown.reduce((sum, day) => sum + day.late, 0);
      const totalAbsent = dailyBreakdown.reduce((sum, day) => sum + day.absent, 0);
      const totalAll = totalPresent + totalLate + totalAbsent;

      setWeeklyStats({
        totalPresent,
        totalLate,
        totalAbsent,
        totalAll,
        dailyBreakdown,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
      setWeeklyStats(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data kehadiran mingguan'
      }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWeeklyAttendance();

    // Set up auto-refresh every 10 minutes
    const interval = setInterval(fetchWeeklyAttendance, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Prepare attendance data for pie chart
  const attendanceData: AttendanceData[] = [
    {
      label: 'Hadir',
      value: weeklyStats.totalPresent,
      color: '#10b981', // green-500
      bgColor: 'bg-green-500',
      iconColor: 'text-green-500'
    },
    {
      label: 'Terlambat',
      value: weeklyStats.totalLate,
      color: '#f59e0b', // yellow-500
      bgColor: 'bg-yellow-500',
      iconColor: 'text-yellow-500'
    },
    {
      label: 'Tidak Hadir',
      value: weeklyStats.totalAbsent,
      color: '#ef4444', // red-500
      bgColor: 'bg-red-500',
      iconColor: 'text-red-500'
    }
  ];

  // SVG Pie Chart calculation
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  const createPieSlice = (percentage: number, color: string, index: number) => {
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);

    const currentCumulative = cumulativePercentage;
    cumulativePercentage += percentage;

    const isHovered = hoveredSegment === index;
    const strokeWidth = isHovered ? 12 : 8;

    return (
      <circle
        key={index}
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-300 cursor-pointer"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transformOrigin: `${centerX}px ${centerY}px`,
        }}
        onMouseEnter={() => setHoveredSegment(index)}
        onMouseLeave={() => setHoveredSegment(null)}
      />
    );
  };

  // Calculate attendance rate
  const attendanceRate = weeklyStats.totalAll > 0 
    ? ((weeklyStats.totalPresent + weeklyStats.totalLate) / weeklyStats.totalAll * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Distribusi Kehadiran</h3>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            Minggu ini • Total: {weeklyStats.loading ? <LoadingSpinner size="sm" /> : weeklyStats.totalAll}
            {!weeklyStats.loading && (
              <button 
                onClick={fetchWeeklyAttendance}
                className="text-blue-600 hover:text-blue-700"
                title="Refresh data"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
        {weeklyStats.error && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Error</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {weeklyStats.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-500">Memuat data kehadiran...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {weeklyStats.error && !weeklyStats.loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600">{weeklyStats.error}</span>
            </div>
            <button 
              onClick={fetchWeeklyAttendance}
              className="text-sm text-red-600 underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Pie Chart - Only show if not loading and no error */}
      {!weeklyStats.loading && !weeklyStats.error && weeklyStats.totalAll > 0 && (
        <>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" className="transform -rotate-90">
                {attendanceData.map((data, index) => {
                  const percentage = (data.value / weeklyStats.totalAll) * 100;
                  return createPieSlice(percentage, data.color, index);
                })}
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {attendanceRate}%
                  </div>
                  <div className="text-xs text-gray-500">Kehadiran</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend & Stats */}
          <div className="space-y-3">
            {attendanceData.map((data, index) => {
              const percentage = weeklyStats.totalAll > 0 
                ? ((data.value / weeklyStats.totalAll) * 100).toFixed(1)
                : '0.0';
              const isHovered = hoveredSegment === index;

              return (
                <div 
                  key={data.label}
                  className={`flex items-center justify-between px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                    isHovered ? 'bg-gray-50 shadow-sm scale-105' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${data.bgColor}`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{data.label}</div>
                      <div className="text-xs text-gray-500">{percentage}% dari total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${data.iconColor}`}>
                      {data.value}
                    </div>
                    <div className="text-xs text-gray-500">record</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* No Data State */}
      {!weeklyStats.loading && !weeklyStats.error && weeklyStats.totalAll === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
          <p className="text-gray-500">Belum ada data kehadiran untuk minggu ini</p>
          <button 
            onClick={fetchWeeklyAttendance}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}
