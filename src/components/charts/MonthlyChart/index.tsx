// src/components/charts/MonthlyChart/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ViewMode, AttendanceFilters } from './types';
import { useAttendanceData } from './hooks/useAttendanceData';
import { useAttendanceCalculations } from './hooks/useAttendanceCalc';
import { ControlPanel } from './components/ControlPanel';
import { ChartView } from './components/ChartView';
import { TableView } from './components/TableView';
import { DailyView } from './components/DailyView';
import { TeacherSelector } from './components/TeacherSelector';
import { LoadingSpinner } from './components/LoadingSpinner';

export function MonthlyChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [isTeacherSelectorOpen, setIsTeacherSelectorOpen] = useState(false); // ✅ Collapse state
  const [filters, setFilters] = useState<AttendanceFilters>({
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth(),
    selectedTeacher: null,
    searchTerm: ''
  });

  const { allTeachers, allAttendanceRecords, loading, error } = useAttendanceData(filters.selectedYear);

  const { teachersData, filteredTeachers, filteredTeachersData } = useAttendanceCalculations(
    allTeachers,
    allAttendanceRecords,
    filters.selectedYear,
    filters.searchTerm
  );

  const handleFiltersChange = (newFilters: Partial<AttendanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewChange = (teacherId: number, mode: ViewMode) => {
    setFilters(prev => ({ ...prev, selectedTeacher: teacherId }));
    setViewMode(mode);
  };

  // Auto-open teacher selector when teacher is selected
  useEffect(() => {
    if (filters.selectedTeacher) {
      setIsTeacherSelectorOpen(true);
    }
  }, [filters.selectedTeacher]);

  const handleTeacherSelect = (teacherId: number) => {
    handleFiltersChange({ selectedTeacher: teacherId });
    // Optionally close the selector after selection
    // setIsTeacherSelectorOpen(false);
  };

  const handleBackToOverview = () => {
    handleFiltersChange({ selectedTeacher: null });
    setIsTeacherSelectorOpen(false); // Close selector when going back to overview
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Memuat data kehadiran guru..." />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-6 p-2 md:p-4">
      {/* Header */}
      <div className="text-center md:text-left mb-3 md:mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          Statistik Kehadiran Per Guru
        </h3>
        <p className="text-xs md:text-sm text-gray-600">
          Analisis kehadiran harian dan bulanan guru dengan detail lengkap
        </p>
      </div>

      {/* Controls */}
      <ControlPanel
        viewMode={viewMode}
        setViewMode={setViewMode}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        yearOptions={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-red-600 text-xs md:text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 text-xs md:text-sm underline hover:no-underline"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Teacher Selection */}
      {(viewMode === 'chart' || viewMode === 'daily') && !loading && filteredTeachers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header - Always visible with toggle */}
          <div 
            className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsTeacherSelectorOpen(!isTeacherSelectorOpen)}
          >
            <div className="flex items-center gap-2">
              <h4 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                {filters.selectedTeacher ? (
                  <>
                    📊 Detail Guru Terpilih
                    <span className="text-xs font-normal text-gray-500">
                      ({teachersData.find(t => t.teacherId === filters.selectedTeacher)?.teacherName})
                    </span>
                  </>
                ) : (
                  <>👥 Pilih Guru untuk Detail ({filteredTeachers.length} guru)</>
                )}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Back to Overview Button */}
              {filters.selectedTeacher && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent collapse toggle
                    handleBackToOverview();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1 mr-2"
                >
                  ← Overview
                </button>
              )}

              {/* Toggle Button */}
              <button
                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 transition-colors"
                title={isTeacherSelectorOpen ? 'Tutup' : 'Buka'}
              >
                {isTeacherSelectorOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isTeacherSelectorOpen 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-gray-100">
              <TeacherSelector
                teachers={filteredTeachers}
                teachersData={teachersData}
                selectedTeacher={filters.selectedTeacher}
                onTeacherSelect={handleTeacherSelect}
              />
            </div>
          </div>

          {/* Quick Stats when collapsed and teacher selected */}
          {!isTeacherSelectorOpen && filters.selectedTeacher && (
            <div className="px-3 md:px-4 pb-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Tingkat Kehadiran:</span>
                <span className={`font-medium ${
                  (teachersData.find(t => t.teacherId === filters.selectedTeacher)?.overallAttendanceRate ?? 0) >= 90 
                    ? 'text-green-600' 
                    : (teachersData.find(t => t.teacherId === filters.selectedTeacher)?.overallAttendanceRate ?? 0) >= 80
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {teachersData.find(t => t.teacherId === filters.selectedTeacher)?.overallAttendanceRate ?? 0}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Views */}
      {viewMode === 'chart' && (
        <ChartView
          teachersData={teachersData}
          selectedTeacher={filters.selectedTeacher}
          selectedYear={filters.selectedYear}
        />
      )}

      {viewMode === 'table' && (
        <TableView
          teachersData={filteredTeachersData}
          onViewChange={handleViewChange}
        />
      )}

      {viewMode === 'daily' && (
        <DailyView
          teachersData={teachersData}
          selectedTeacher={filters.selectedTeacher}
          selectedYear={filters.selectedYear}
          selectedMonth={filters.selectedMonth}
          onMonthChange={(month) => handleFiltersChange({ selectedMonth: month })}
        />
      )}

      {/* Data Update Info */}
      {!loading && teachersData.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Data kehadiran harian dan bulanan guru untuk tahun {filters.selectedYear}
          </div>
        </div>
      )}
    </div>
  );
}
