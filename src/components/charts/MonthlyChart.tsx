'use client';

import { useState, useEffect } from 'react';
import { teachersAPI, attendanceAPI, Teacher, AttendanceRecord } from '@/api/api';

interface ChartData {
  month: string;
  teachers: number;
  attendance: number;
  subjects: number;
}

type MetricKey = 'teachers' | 'attendance' | 'subjects';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  bgColor: string;
}

const metrics: MetricConfig[] = [
  { 
    key: 'teachers', 
    label: 'Jumlah Guru', 
    color: 'bg-blue-500', 
    bgColor: 'bg-blue-300' 
  },
  { 
    key: 'attendance', 
    label: 'Kehadiran (%)', 
    color: 'bg-green-500', 
    bgColor: 'bg-green-300' 
  },
  { 
    key: 'subjects', 
    label: 'Tidak Hadir', 
    color: 'bg-red-500', // ✅ Change to red for better UX
    bgColor: 'bg-red-300' 
  },
];

// Default months for display
const defaultMonthsIndo = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
    </div>
  );
};

export function MonthlyChart() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('teachers');
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Helper function to get start and end date of a month
  const getMonthDateRange = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
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

    // Extract time from ISO string (HH:MM format)
const extractTime = (isoString: string | null): string | null => {
  if (!isoString) return null;

  // Jika sudah berupa time string tanpa timezone
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(isoString)) {
    return isoString.substring(0, 5);
  }

  // Untuk ISO string (2025-06-30T09:21:00.000Z), ekstrak bagian waktu saja
  // tanpa konversi timezone
  if (isoString.includes('T')) {
    const timePart = isoString.split('T')[1]; // Ambil bagian setelah 'T'
    if (timePart) {
      const timeOnly = timePart.split('.')[0]; // Hilangkan milliseconds dan Z
      return timeOnly.substring(0, 5); // Return HH:MM saja
    }
  }

  return null;
};


    const formatDate = (isoString: string): string => {
      return new Date(isoString).toISOString().split("T")[0];
    };

    return {
      // checkIn: !!record.checkIn,
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
      checkIn: extractTime(record.checkIn),
      checkOut: extractTime(record.checkOut),
      workingHours: record.workingHours || null,
      status: normalizeStatus(record.status),
      location: record.location,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  // Fetch and process data from existing APIs
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all teachers first
        const teachersResponse = await teachersAPI.getAll({ 
          page: 1, 
          limit: 1000,
          isActive: true 
        });

        if (!teachersResponse.success) {
          throw new Error('Failed to fetch teachers data');
        }

        const totalTeachers = teachersResponse.data?.length || 0;
        const chartData: ChartData[] = [];

        for (let month = 0; month < 12; month++) {
          const { startDate, endDate } = getMonthDateRange(selectedYear, month);

          try {
            // Get attendance data for this month
            const attendanceResponse = await attendanceAPI.getAll({
              startDate,
              endDate,
              page: 1,
              limit: 10000
            });

            if (attendanceResponse.success && attendanceResponse.data) {
              const normalizedRecords = attendanceResponse.data.map(normalizeAttendanceRecord);

              // ✅ FIXED: Calculate metrics correctly

              // 1. Present records = HADIR + TERLAMBAT (actually present)
              const presentRecords = normalizedRecords.filter(record => 
                record.status === 'HADIR' || record.status === 'TERLAMBAT'
              );

              // 2. Absent records = TIDAK HADIR + SAKIT + IZIN (not present)
              const absentRecords = normalizedRecords.filter(record => 
                record.status === 'TIDAK HADIR' || 
                record.status === 'SAKIT' || 
                record.status === 'IZIN'
              );

              // 3. Calculate attendance percentage based on total records
              const attendancePercentage = normalizedRecords.length > 0 
                ? Math.round((presentRecords.length / normalizedRecords.length) * 100)
                : 0;

              // 4. Count of absent people (untuk "Tidak Hadir" metric)
              const absentCount = absentRecords.length;

              chartData.push({
                month: defaultMonthsIndo[month],
                teachers: totalTeachers,
                attendance: attendancePercentage,
                subjects: absentCount // ✅ Now correctly represents absent count
              });

              // ✅ DEBUG: Log untuk verifikasi
              // console.log(`Month ${month + 1} (${defaultMonthsIndo[month]}):`, {
              //   totalRecords: normalizedRecords.length,
              //   presentCount: presentRecords.length,
              //   absentCount: absentCount,
              //   attendancePercentage,
              //   records: normalizedRecords.map(r => ({ status: r.status, teacher: r.teacherName }))
              // });

            } else {
              // No data for this month
              chartData.push({
                month: defaultMonthsIndo[month],
                teachers: totalTeachers,
                attendance: 0,
                subjects: 0
              });
            }
          } catch (monthError) {
            console.error(`Error fetching data for month ${month + 1}:`, monthError);
            chartData.push({
              month: defaultMonthsIndo[month],
              teachers: totalTeachers,
              attendance: 0,
              subjects: 0
            });
          }
        }

        setMonthlyData(chartData);

      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Gagal memuat data chart. Periksa koneksi internet Anda.');

        const fallbackData: ChartData[] = defaultMonthsIndo.map((month) => ({
          month,
          teachers: 0,
          attendance: 0,
          subjects: 0,
        }));
        setMonthlyData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear]);

  // Helper function to get metric value safely
  const getMetricValue = (data: ChartData, metric: MetricKey): number => {
    return data[metric] || 0;
  };

  // Calculate chart metrics
  const maxValue = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(data => getMetricValue(data, activeMetric)), 1)
    : 100;
  const minValue = monthlyData.length > 0 
    ? Math.min(...monthlyData.map(data => getMetricValue(data, activeMetric)))
    : 0;
  const currentMonthIndex = new Date().getMonth();

  // Year selector options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 p-2 md:p-4">
        <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Memuat data chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 p-2 md:p-4">
      {/* Header with Metric Selector and Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              disabled={loading}
              className={`cursor-pointer px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeMetric === metric.key
                  ? `${metric.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="block sm:hidden">{metric.label.split(' ')[0]}</span>
              <span className="hidden sm:block">{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Year Selector */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          disabled={loading}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setSelectedYear(selectedYear)}
              className="text-red-600 text-sm underline hover:no-underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative bg-gray-50 rounded-lg p-2 md:p-4 overflow-hidden">
        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-32 md:h-48">
            <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
          </div>
        ) : (
          <>
            {/* Y-axis labels */}
            <div className="absolute left-1 md:left-2 top-2 md:top-4 h-32 md:h-48 flex flex-col justify-between text-xs text-gray-500 z-10">
              <span className="bg-gray-50 px-1">{maxValue}</span>
              <span className="bg-gray-50 px-1">{Math.round((maxValue + minValue) / 2)}</span>
              <span className="bg-gray-50 px-1">{minValue}</span>
            </div>

            {/* Chart container */}
            <div className="ml-6 md:ml-8">
              <div className="flex items-end gap-0.5 sm:gap-1 h-32 md:h-48 border-b border-gray-300 overflow-x-auto">
                {monthlyData.map((data, index) => {
                  const value = getMetricValue(data, activeMetric);
                  const height = maxValue > minValue 
                    ? Math.max(((value - minValue) / (maxValue - minValue)) * 100, 5)
                    : value > 0 ? 50 : 5;
                  const isCurrentMonth = index === currentMonthIndex && selectedYear === currentYear;
                  const selectedMetric = metrics.find(m => m.key === activeMetric);

                  return (
                    <div key={`${data.month}-${index}`} className="flex-1 min-w-6 sm:min-w-8 flex flex-col items-center group">
                      {/* Bar */}
                      <div className="relative w-full flex justify-center">
                        <div 
                          className={`w-4 sm:w-6 md:w-8 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer ${
                            isCurrentMonth 
                              ? selectedMetric?.color + ' shadow-lg' 
                              : selectedMetric?.bgColor
                          } relative`}
                          style={{ 
                            height: `${Math.max(height * 1.2, 6)}px`,
                            minHeight: '6px',
                            maxHeight: '180px'
                          }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 md:mb-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
                            {activeMetric === 'teachers' && `${value} guru`}
                            {activeMetric === 'attendance' && `${value}% kehadiran`}
                            {activeMetric === 'subjects' && `${value} tidak hadir`}
                          </div>
                        </div>
                      </div>

                      {/* Month label */}
                      <div className={`text-xs mt-1 md:mt-2 font-medium ${
                        isCurrentMonth ? 'text-gray-900 font-bold' : 'text-gray-500'
                      }`}>
                        <span className="block sm:hidden">{data.month.substring(0, 1)}</span>
                        <span className="hidden sm:block">{data.month}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis line */}
              <div className="w-full h-px bg-gray-300 mt-0"></div>
            </div>
          </>
        )}
      </div>

      {/* Current Stats */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-200">
          {metrics.map((metric) => {
            const currentData = monthlyData[currentMonthIndex] || monthlyData[0];
            const currentValue = getMetricValue(currentData, metric.key);
            const previousIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : monthlyData.length - 1;
            const previousData = monthlyData[previousIndex] || monthlyData[0];
            const previousValue = getMetricValue(previousData, metric.key);
            const change = currentValue - previousValue;
            const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : '0';

            return (
              <div key={metric.key} className="text-center sm:text-left flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 p-2 sm:p-0">
                <div className={`inline-flex items-center justify-center w-10 h-6 md:w-12 md:h-8 rounded-lg ${metric.color} sm:mb-2`}>
                  <span className="text-white text-xs md:text-sm font-bold">
                    {currentValue}{metric.key === 'attendance' ? '%' : ''}
                  </span>
                </div>
                <div className="flex-1 sm:flex-none">
                  <div className="text-xs md:text-sm text-gray-700 sm:text-gray-500 mb-1 font-medium sm:font-normal">
                    {metric.label}
                  </div>
                  <div className={`text-xs font-medium ${
                    // ✅ For "Tidak Hadir", red when increasing (bad), green when decreasing (good)
                    metric.key === 'subjects' 
                      ? (change >= 0 ? 'text-red-600' : 'text-green-600')
                      : (change >= 0 ? 'text-green-600' : 'text-red-600')
                  }`}>
                    {change >= 0 ? '+' : ''}{change} ({changePercent}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Summary */}
      {!loading && monthlyData.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          Data diperbarui berdasarkan catatan kehadiran {selectedYear}
        </div>
      )}
    </div>
  );
}
