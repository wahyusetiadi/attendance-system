// src/components/charts/MonthlyChart/components/ControlPanel.tsx
import { Search, Calendar, BarChart3, Grid } from 'lucide-react';
import { ViewMode, AttendanceFilters } from '../types';
import { defaultMonthsIndo } from '../utils/constants';

interface ControlPanelProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: AttendanceFilters;
  onFiltersChange: (filters: Partial<AttendanceFilters>) => void;
  yearOptions: number[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  setViewMode,
  filters,
  onFiltersChange,
  yearOptions
}) => {
  return (
    <div className="flex flex-col gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-lg border border-gray-200">
      {/* View Mode Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setViewMode('chart')}
          className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            viewMode === 'chart'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
          Grafik
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            viewMode === 'table'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Grid className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
          Tabel
        </button>
        <button
          onClick={() => setViewMode('daily')}
          className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            viewMode === 'daily'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
          Harian
        </button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        {/* Teacher Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
          <input
            type="text"
            placeholder="Cari guru..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Year Selector */}
        <select
          value={filters.selectedYear}
          onChange={(e) => onFiltersChange({ selectedYear: Number(e.target.value) })}
          className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Month Selector - Only show in daily view */}
        {viewMode === 'daily' && (
          <select
            value={filters.selectedMonth}
            onChange={(e) => onFiltersChange({ selectedMonth: Number(e.target.value) })}
            className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {defaultMonthsIndo.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
