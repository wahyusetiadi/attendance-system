'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, TrendingUp } from 'lucide-react';

interface AttendanceData {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  iconColor: string;
}

// Data mingguan yang diagregasi
const weeklyAttendance = [
  { day: 'Sen', present: 42, late: 2, absent: 1 },
  { day: 'Sel', present: 41, late: 3, absent: 1 },
  { day: 'Rab', present: 43, late: 1, absent: 1 },
  { day: 'Kam', present: 40, late: 4, absent: 1 },
  { day: 'Jum', present: 44, late: 1, absent: 0 },
  { day: 'Sab', present: 39, late: 2, absent: 4 },
];

export function AttendancePieChart() {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isDailyBreakdownOpen, setIsDailyBreakdownOpen] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(true);

  // Kalkulasi total data
  const totalPresent = weeklyAttendance.reduce((sum, day) => sum + day.present, 0);
  const totalLate = weeklyAttendance.reduce((sum, day) => sum + day.late, 0);
  const totalAbsent = weeklyAttendance.reduce((sum, day) => sum + day.absent, 0);
  const totalAll = totalPresent + totalLate + totalAbsent;

  const attendanceData: AttendanceData[] = [
    {
      label: 'Hadir',
      value: totalPresent,
      color: '#10b981', // green-500
      bgColor: 'bg-green-500',
      iconColor: 'text-green-500'
    },
    {
      label: 'Terlambat',
      value: totalLate,
      color: '#f59e0b', // yellow-500
      bgColor: 'bg-yellow-500',
      iconColor: 'text-yellow-500'
    },
    {
      label: 'Tidak Hadir',
      value: totalAbsent,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Distribusi Kehadiran</h3>
        <div className="text-xs text-gray-500">
          Minggu ini • Total: {totalAll}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {attendanceData.map((data, index) => {
              const percentage = (data.value / totalAll) * 100;
              return createPieSlice(percentage, data.color, index);
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {((totalPresent / totalAll) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Kehadiran</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="space-y-3">
        {attendanceData.map((data, index) => {
          const percentage = ((data.value / totalAll) * 100).toFixed(1);
          const isHovered = hoveredSegment === index;

          return (
            <div 
              key={data.label}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
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
                <div className="text-xs text-gray-500">orang</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Daily Breakdown */}
      <div className="border border-gray-200 rounded-lg hidden">
        <button
          onClick={() => setIsDailyBreakdownOpen(!isDailyBreakdownOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Breakdown Harian</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {weeklyAttendance.length} hari
            </span>
          </div>
          {isDailyBreakdownOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isDailyBreakdownOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-3 mt-4">
              {weeklyAttendance.map((day) => {
                const dayTotal = day.present + day.late + day.absent;
                const dayAttendanceRate = ((day.present / dayTotal) * 100).toFixed(0);

                return (
                  <div key={day.day} className="group hover:scale-105 transition-transform duration-200">
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                      <div className="text-xs font-medium text-gray-600 mb-2">{day.day}</div>
                      <div className="text-lg font-bold text-gray-900 mb-1">{dayAttendanceRate}%</div>
                      <div className="text-xs text-gray-500 mb-2">{day.present}/{dayTotal}</div>

                      {/* Mini bar indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${dayAttendanceRate}%` }}
                        ></div>
                      </div>

                      {/* Detail on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-green-600">Hadir:</span>
                            <span className="font-medium">{day.present}</span>
                          </div>
                          {day.late > 0 && (
                            <div className="flex justify-between">
                              <span className="text-yellow-600">Terlambat:</span>
                              <span className="font-medium">{day.late}</span>
                            </div>
                          )}
                          {day.absent > 0 && (
                            <div className="flex justify-between">
                              <span className="text-red-600">Tidak hadir:</span>
                              <span className="font-medium">{day.absent}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Weekly Summary */}
      <div className="border border-gray-200 rounded-lg hidden">
        <button
          onClick={() => setIsWeeklySummaryOpen(!isWeeklySummaryOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Ringkasan Mingguan</span>
            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
              Analisis
            </span>
          </div>
          {isWeeklySummaryOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isWeeklySummaryOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-4 space-y-4">
              {/* Key Metrics */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Rata-rata Harian</div>
                    <div className="text-xl font-bold text-blue-600">
                      {(totalPresent / weeklyAttendance.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">guru hadir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Hari Terbaik</div>
                    <div className="text-xl font-bold text-green-600">
                      {(() => {
                        const bestDay = weeklyAttendance.reduce((best, current) => 
                          current.present > best.present ? current : best
                        );
                        return bestDay.day;
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.max(...weeklyAttendance.map(d => d.present))} guru
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Total Kehadiran</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{totalPresent}</div>
                    <div className="text-xs text-gray-500">
                      {((totalPresent / totalAll) * 100).toFixed(1)}% dari total
                    </div>
                  </div>
                </div>

                {totalLate > 0 && (
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Total Keterlambatan</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">{totalLate}</div>
                      <div className="text-xs text-gray-500">
                        {((totalLate / totalAll) * 100).toFixed(1)}% dari total
                      </div>
                    </div>
                  </div>
                )}

                {totalAbsent > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Total Ketidakhadiran</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{totalAbsent}</div>
                      <div className="text-xs text-gray-500">
                        {((totalAbsent / totalAll) * 100).toFixed(1)}% dari total
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trend Analysis */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Analisis Trend</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  {(() => {
                    const firstHalf = weeklyAttendance.slice(0, 3);
                    const secondHalf = weeklyAttendance.slice(3);
                    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.present, 0) / firstHalf.length;
                    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.present, 0) / secondHalf.length;
                    const trend = secondHalfAvg > firstHalfAvg ? 'meningkat' : secondHalfAvg < firstHalfAvg ? 'menurun' : 'stabil';
                    const trendColor = trend === 'meningkat' ? 'text-green-600' : trend === 'menurun' ? 'text-red-600' : 'text-gray-600';

                    return (
                      <>
                        <div>• Kehadiran paruh pertama minggu: <span className="font-medium">{firstHalfAvg.toFixed(1)} guru/hari</span></div>
                        <div>• Kehadiran paruh kedua minggu: <span className="font-medium">{secondHalfAvg.toFixed(1)} guru/hari</span></div>
                        <div>• Trend kehadiran: <span className={`font-medium ${trendColor}`}>{trend}</span></div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
