// src/components/charts/MonthlyChart/components/ChartView.tsx
import { useState, useMemo } from 'react';
import { Users, TrendingUp, BarChart3, RotateCcw } from 'lucide-react';
import { TeacherAttendanceData, MetricKey, MonthlyAttendanceData, ChartViewProps, OverallMonthlyData } from '../types';
import { metrics, defaultMonthsIndo } from '../utils/constants';
import { getAttendanceRateColor, getAttendanceRateBadgeColor } from '../utils/statusHelpers';

export const ChartView: React.FC<ChartViewProps> = ({
  teachersData,
  selectedTeacher,
  selectedYear
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('presentDays');
  const [isMobileHorizontal, setIsMobileHorizontal] = useState(false); // Mobile scroll mode

  // Calculate overall statistics for all teachers
  const overallData = useMemo((): OverallMonthlyData[] => {
    if (!teachersData.length) return [];

    return defaultMonthsIndo.map((month, monthIndex) => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      let totalAttendanceRate = 0;
      let validTeachers = 0;

      const details = {
        hadir: 0,
        terlambat: 0,
        tidakHadir: 0,
        sakit: 0,
        izin: 0
      };

      const teacherRates: Array<{ name: string; rate: number }> = [];

      teachersData.forEach(teacher => {
        const monthData = teacher.monthlyData[monthIndex];
        if (monthData) {
          totalPresent += monthData.presentDays;
          totalAbsent += monthData.absentDays;
          totalLate += monthData.lateDays;
          totalAttendanceRate += monthData.attendanceRate;
          validTeachers++;

          details.hadir += monthData.details.hadir;
          details.terlambat += monthData.details.terlambat;
          details.tidakHadir += monthData.details.tidakHadir;
          details.sakit += monthData.details.sakit;
          details.izin += monthData.details.izin;

          teacherRates.push({
            name: teacher.teacherName,
            rate: monthData.attendanceRate
          });
        }
      });

      const topPerformers = teacherRates
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3);

      const averageAttendanceRate = validTeachers > 0 
        ? Math.round(totalAttendanceRate / validTeachers) 
        : 0;

      return {
        month,
        monthIndex,
        totalTeachers: validTeachers,
        presentDays: totalPresent,
        absentDays: totalAbsent,
        lateDays: totalLate,
        attendanceRate: averageAttendanceRate,
        averageAttendanceRate,
        details,
        topPerformers
      };
    });
  }, [teachersData]);

  // Get selected teacher data
  const selectedTeacherData = useMemo(() => {
    return teachersData.find(data => data.teacherId === selectedTeacher);
  }, [teachersData, selectedTeacher]);

  // Determine which data to use and calculate max value
  const isOverallView = !selectedTeacherData;
  const chartData = isOverallView ? overallData : selectedTeacherData?.monthlyData || [];

  const getMetricValue = (monthData: any, metric: MetricKey): number => {
    return monthData[metric] || 0;
  };

  const maxValue = chartData.length > 0 ? Math.max(
    ...chartData.map((data: any) => getMetricValue(data, activeMetric)), 
    1
  ) : 100;

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (isOverallView) {
      const totalPresent = overallData.reduce((sum, month) => sum + month.presentDays, 0);
      const totalLate = overallData.reduce((sum, month) => sum + month.lateDays, 0);
      const totalAbsent = overallData.reduce((sum, month) => sum + month.absentDays, 0);
      const averageRate = overallData.length > 0 
        ? Math.round(overallData.reduce((sum, month) => sum + month.averageAttendanceRate, 0) / overallData.length)
        : 0;

      return {
        totalPresent,
        totalLate,
        totalAbsent,
        averageRate,
        totalTeachers: teachersData.length
      };
    } else if (selectedTeacherData) {
      return {
        totalPresent: selectedTeacherData.totalPresent,
        totalLate: selectedTeacherData.totalLate,
        totalAbsent: selectedTeacherData.totalAbsent,
        averageRate: selectedTeacherData.overallAttendanceRate,
        totalTeachers: 1
      };
    }
    return null;
  }, [isOverallView, overallData, selectedTeacherData, teachersData.length]);

  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Metric Selector - Mobile Optimized */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeMetric === metric.key
                  ? `${metric.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">{metric.label}</span>
              <span className="sm:hidden">
                {metric.label.replace('Hari ', '').replace('Tingkat ', '')}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile View Toggle */}
        <div className="flex justify-center sm:hidden">
          <button
            onClick={() => setIsMobileHorizontal(!isMobileHorizontal)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {isMobileHorizontal ? 'Mode Vertikal' : 'Mode Horizontal'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            {isOverallView ? (
              <>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  <span className="hidden sm:inline">Statistik Keseluruhan ({teachersData.length} Guru)</span>
                  <span className="sm:hidden">Overview ({teachersData.length} Guru)</span>
                </h4>
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {selectedTeacherData?.teacherName}
                </h4>
              </>
            )}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {isOverallView ? (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Gabungan Semua Guru {selectedYear}</span>
                <span className="sm:hidden">Gabungan {selectedYear}</span>
              </span>
            ) : (
              selectedTeacherData?.teacherNip && (
                <span className="truncate">NIP: {selectedTeacherData.teacherNip}</span>
              )
            )}
          </div>
        </div>

        {/* Chart Area - Responsive */}
        <div className="relative bg-gray-50 rounded-lg p-2 sm:p-4">
          {/* Y-axis labels */}
          <div className="absolute left-1 sm:left-2 top-2 sm:top-4 h-40 sm:h-48 md:h-56 flex flex-col justify-between text-xs text-gray-500 z-10">
            <span className="bg-gray-50 px-0.5 sm:px-1">{maxValue}</span>
            <span className="bg-gray-50 px-0.5 sm:px-1">{Math.round(maxValue / 2)}</span>
            <span className="bg-gray-50 px-0.5 sm:px-1">0</span>
          </div>

          {/* Chart container - Mobile Responsive */}
          <div className="ml-4 sm:ml-8">
            <div 
              className={`flex items-end h-40 sm:h-48 md:h-56 border-b border-gray-300 ${
                isMobileHorizontal 
                  ? 'overflow-x-auto gap-2 pb-2' 
                  : 'gap-0.5 sm:gap-1'
              }`}
              style={isMobileHorizontal ? { minWidth: '600px' } : {}}
            >
              {chartData.map((monthData, index) => {
                const value = getMetricValue(monthData, activeMetric);
                const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
                const isCurrentMonth = index === currentMonthIndex && selectedYear === currentYear;
                const selectedMetric = metrics.find(m => m.key === activeMetric);

                return (
                  <div 
                    key={`${monthData.month}-${index}`} 
                    className={`flex flex-col items-center group ${
                      isMobileHorizontal ? 'flex-shrink-0 w-12' : 'flex-1'
                    }`}
                  >
                    {/* Bar */}
                    <div className="relative w-full flex justify-center">
                      <div 
                        className={`${
                          isMobileHorizontal ? 'w-8' : 'w-3 sm:w-6 lg:w-8'
                        } rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer ${
                          isCurrentMonth 
                            ? selectedMetric?.color + ' shadow-lg' 
                            : selectedMetric?.bgColor
                        } relative`}
                        style={{ 
                          height: `${Math.max(height * (isMobileHorizontal ? 1.8 : 1.4), 4)}px`,
                          minHeight: '4px',
                          maxHeight: isMobileHorizontal ? '200px' : '160px'
                        }}
                      >
                        {/* Mobile-Optimized Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none max-w-xs">
                          <div className="text-center">
                            <div className="font-medium">{monthData.month} {selectedYear}</div>
                            {isOverallView ? (
                              <div className="text-gray-300 text-xs mt-1">
                                <div>Guru: {(monthData as OverallMonthlyData).totalTeachers}</div>
                                <div>Hadir: {monthData.details.hadir}</div>
                                <div>Terlambat: {monthData.details.terlambat}</div>
                                <div>Tidak Hadir: {monthData.details.tidakHadir}</div>
                                <div className="border-t border-gray-600 mt-1 pt-1">
                                  Rata-rata: {monthData.attendanceRate}%
                                </div>
                                {/* Top performer for mobile */}
                                {(monthData as OverallMonthlyData).topPerformers.length > 0 && (
                                  <div className="border-t border-gray-600 mt-1 pt-1">
                                    <div className="font-medium">Top:</div>
                                    <div className="text-xs">
                                      {(monthData as OverallMonthlyData).topPerformers[0].name}: {(monthData as OverallMonthlyData).topPerformers[0].rate}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-300 text-xs mt-1">
                                <div>Hadir: {monthData.details.hadir}</div>
                                <div>Terlambat: {monthData.details.terlambat}</div>
                                <div>Tidak Hadir: {monthData.details.tidakHadir}</div>
                                <div className="border-t border-gray-600 mt-1 pt-1">
                                  Kehadiran: {monthData.attendanceRate}%
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Value label on bar for mobile */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
                          {value}
                        </div>
                      </div>
                    </div>

                    {/* Month label - Responsive */}
                    <div className={`text-xs mt-1 sm:mt-2 font-medium text-center ${
                      isCurrentMonth ? 'text-gray-900 font-bold' : 'text-gray-500'
                    } ${isMobileHorizontal ? 'whitespace-nowrap' : 'truncate'}`}>
                      <span className="hidden sm:inline">{monthData.month}</span>
                      <span className="sm:hidden">{monthData.month.slice(0, 3)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile scroll hint */}
          {isMobileHorizontal && (
            <div className="text-xs text-gray-500 text-center mt-2 sm:hidden">
              ← Geser untuk melihat semua bulan →
            </div>
          )}
        </div>

        {/* Summary Statistics - Mobile Grid */}
        {overallStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="text-center p-2 sm:p-0">
              <div className="text-base sm:text-2xl font-bold text-green-600">{overallStats.totalPresent}</div>
              <div className="text-xs text-gray-500 leading-tight">
                {isOverallView ? 'Total Kehadiran' : 'Total Hadir'}
              </div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-base sm:text-2xl font-bold text-yellow-600">{overallStats.totalLate}</div>
              <div className="text-xs text-gray-500 leading-tight">
                Total Terlambat
              </div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-base sm:text-2xl font-bold text-red-600">{overallStats.totalAbsent}</div>
              <div className="text-xs text-gray-500 leading-tight">
                {isOverallView ? 'Total Ketidakhadiran' : 'Total Tidak Hadir'}
              </div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className={`text-base sm:text-2xl font-bold ${
                getAttendanceRateColor(overallStats.averageRate)
              }`}>
                {overallStats.averageRate}%
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                {isOverallView ? 'Rata-rata Kehadiran' : 'Tingkat Kehadiran'}
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Insights */}
        {isOverallView && overallData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Combined insights for mobile */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <span>💡</span>
                  <span className="hidden sm:inline">Insight & Performa</span>
                  <span className="sm:hidden">Ringkasan</span>
                </h5>
                <div className="space-y-2 text-xs">
                  {/* Trend */}
                  <div className="text-blue-800">
                    {(() => {
                      const currentMonth = overallData[currentMonthIndex];
                      const prevMonth = currentMonthIndex > 0 ? overallData[currentMonthIndex - 1] : overallData[11];
                      const trend = currentMonth.averageAttendanceRate - prevMonth.averageAttendanceRate;

                      if (trend > 0) {
                        return `📈 Naik ${trend.toFixed(1)}% dari bulan lalu`;
                      } else if (trend < 0) {
                        return `📉 Turun ${Math.abs(trend).toFixed(1)}% dari bulan lalu`;
                      } else {
                        return `➡️ Stabil dari bulan lalu`;
                      }
                    })()}
                  </div>
                  {/* Best month */}
                  <div className="text-green-800">
                    🏆 Terbaik: {(() => {
                      const bestMonth = overallData.reduce((best, current) => 
                        current.averageAttendanceRate > best.averageAttendanceRate ? current : best
                      );
                      return `${bestMonth.month} (${bestMonth.averageAttendanceRate}%)`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
