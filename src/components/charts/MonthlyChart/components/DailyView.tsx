// src/components/charts/MonthlyChart/components/DailyView.tsx
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TeacherAttendanceData } from '../types';
import { defaultMonthsIndo } from '../utils/constants';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';

interface DailyViewProps {
  teachersData: TeacherAttendanceData[];
  selectedTeacher: number | null;
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  teachersData,
  selectedTeacher,
  selectedYear,
  selectedMonth,
  onMonthChange
}) => {
  const selectedTeacherData = useMemo(() => {
    return teachersData.find(data => data.teacherId === selectedTeacher);
  }, [teachersData, selectedTeacher]);

  const currentMonthData = useMemo(() => {
    if (!selectedTeacherData) return null;
    return selectedTeacherData.monthlyData[selectedMonth];
  }, [selectedTeacherData, selectedMonth]);

  if (!selectedTeacherData || !currentMonthData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-gray-500">Pilih guru untuk melihat kehadiran harian</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-2">
        <h4 className="text-base md:text-lg font-semibold text-gray-900">
          Kehadiran Harian - {selectedTeacherData.teacherName}
        </h4>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
          <button
            onClick={() => onMonthChange(selectedMonth === 0 ? 11 : selectedMonth - 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          <span className="font-medium">{defaultMonthsIndo[selectedMonth]} {selectedYear}</span>
          <button
            onClick={() => onMonthChange(selectedMonth === 11 ? 0 : selectedMonth + 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-lg md:text-xl font-bold text-green-600">{currentMonthData.details.hadir}</div>
          <div className="text-xs text-gray-600">Hadir</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg md:text-xl font-bold text-yellow-600">{currentMonthData.details.terlambat}</div>
          <div className="text-xs text-gray-600">Terlambat</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-red-50 rounded-lg">
          <div className="text-lg md:text-xl font-bold text-red-600">{currentMonthData.details.tidakHadir}</div>
          <div className="text-xs text-gray-600">Tidak Hadir</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
          <div className="text-lg md:text-xl font-bold text-purple-600">{currentMonthData.details.sakit}</div>
          <div className="text-xs text-gray-600">Sakit</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-lg md:text-xl font-bold text-blue-600">{currentMonthData.details.izin}</div>
          <div className="text-xs text-gray-600">Izin</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Day headers */}
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day} className="text-center p-2 text-xs md:text-sm font-medium text-gray-500 bg-gray-50 rounded">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2 md:p-3"></div>
        ))}

        {/* Days of month */}
        {currentMonthData.dailyData.map((dayData) => (
          <div
            key={dayData.date}
            className={`p-1 md:p-2 rounded-lg border text-center cursor-pointer transition-all hover:shadow-sm ${
              getStatusColor(dayData.status, dayData.isWeekend)
            }`}
            title={`${dayData.day} - ${getStatusText(dayData.status, dayData.isWeekend)}${
              dayData.checkIn ? `\nMasuk: ${dayData.checkIn}` : ''
            }${dayData.checkOut ? `\nKeluar: ${dayData.checkOut}` : ''}${
              dayData.notes ? `\nCatatan: ${dayData.notes}` : ''
            }`}
          >
            <div className="text-xs md:text-sm font-medium">{dayData.day}</div>
            <div className="text-xs truncate mt-1">
              {dayData.isWeekend ? 'Libur' : (dayData.status || 'No Data')}
            </div>
            {dayData.checkIn && (
              <div className="text-xs text-gray-600 mt-1">
                {dayData.checkIn}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
        <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Keterangan:</h5>
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Hadir</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Terlambat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Tidak Hadir</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Sakit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Izin</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Libur</span>
          </div>
        </div>
      </div>
    </div>
  );
};
