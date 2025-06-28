'use client';

import { useState } from 'react';

interface ChartData {
  month: string;
  teachers: number;
  attendance: number;
  subjects: number;
}

type MetricKey = 'teachers' | 'attendance' | 'subjects';

const monthlyData: ChartData[] = [
  { month: 'Jan', teachers: 38, attendance: 92, subjects: 10 },
  { month: 'Feb', teachers: 41, attendance: 88, subjects: 11 },
  { month: 'Mar', teachers: 43, attendance: 95, subjects: 12 },
  { month: 'Apr', teachers: 45, attendance: 89, subjects: 12 },
  { month: 'Mei', teachers: 44, attendance: 93, subjects: 12 },
  { month: 'Jun', teachers: 46, attendance: 91, subjects: 13 },
  { month: 'Jul', teachers: 45, attendance: 87, subjects: 12 },
  { month: 'Agu', teachers: 47, attendance: 94, subjects: 13 },
  { month: 'Sep', teachers: 45, attendance: 96, subjects: 12 },
  { month: 'Okt', teachers: 44, attendance: 90, subjects: 12 },
  { month: 'Nov', teachers: 45, attendance: 94, subjects: 12 },
  { month: 'Des', teachers: 46, attendance: 92, subjects: 13 },
];

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
    label: 'Keterlambatan', 
    color: 'bg-purple-500', 
    bgColor: 'bg-purple-300' 
  },
];

export function MonthlyChart() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('teachers');

  // Helper function to get metric value safely
  const getMetricValue = (data: ChartData, metric: MetricKey): number => {
    return data[metric];
  };

  const maxValue = Math.max(...monthlyData.map(data => getMetricValue(data, activeMetric)));
  const minValue = Math.min(...monthlyData.map(data => getMetricValue(data, activeMetric)));
  const currentMonthIndex = new Date().getMonth();

  console.log('Debug Chart:', { activeMetric, maxValue, minValue, currentMonthIndex });

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setActiveMetric(metric.key)}
            className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeMetric === metric.key
                ? `${metric.color} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative bg-gray-50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>

        {/* Chart container */}
        <div className="ml-8">
          <div className="flex items-end space-x-1 h-48 border-b border-gray-300">
            {monthlyData.map((data, index) => {
              const value = getMetricValue(data, activeMetric);
              const height = Math.max(((value - minValue) / (maxValue - minValue)) * 100, 5); // Minimum 5% height
              const isCurrentMonth = index === currentMonthIndex;
              const selectedMetric = metrics.find(m => m.key === activeMetric);

              return (
                <div key={data.month} className="flex-1 flex flex-col items-center group">
                  {/* Bar */}
                  <div className="relative w-full flex justify-center">
                    <div 
                      className={`w-8 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer ${
                        isCurrentMonth 
                          ? selectedMetric?.color + ' shadow-lg' 
                          : selectedMetric?.bgColor
                      } relative`}
                      style={{ 
                        height: `${height * 1.8}px`, // Convert to fixed pixels
                        minHeight: '8px' 
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                        {value}{activeMetric === 'attendance' ? '%' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Month label */}
                  <div className={`text-xs mt-2 font-medium ${
                    isCurrentMonth ? 'text-gray-900 font-bold' : 'text-gray-500'
                  }`}>
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis line */}
          <div className="w-full h-px bg-gray-300 mt-0"></div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        {metrics.map((metric) => {
          const currentValue = getMetricValue(monthlyData[currentMonthIndex], metric.key);
          const previousData = monthlyData[currentMonthIndex - 1] || monthlyData[11];
          const previousValue = getMetricValue(previousData, metric.key);
          const change = currentValue - previousValue;
          const changePercent = ((change / previousValue) * 100).toFixed(1);

          return (
            <div key={metric.key} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg ${metric.color} mb-2`}>
                <span className="text-white text-sm font-bold">
                  {currentValue}{metric.key === 'attendance' ? '%' : ''}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
              <div className={`text-xs font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change} ({changePercent}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
