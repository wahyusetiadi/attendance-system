// src/components/charts/MonthlyChart/components/TeacherSelector.tsx
import { User } from 'lucide-react';
import { Teacher } from '@/api/api';
import { TeacherAttendanceData } from '../types';
import { getAttendanceRateBadgeColor } from '../utils/statusHelpers';

interface TeacherSelectorProps {
  teachers: Teacher[];
  teachersData: TeacherAttendanceData[];
  selectedTeacher: number | null;
  onTeacherSelect: (teacherId: number) => void;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  teachersData,
  selectedTeacher,
  onTeacherSelect
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <User className="w-3 h-3 md:w-4 md:h-4" />
        Pilih Guru ({teachers.length} guru)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-32 md:max-h-40 overflow-y-auto">
        {teachers.map((teacher) => {
          const teacherData = teachersData.find(data => data.teacherId === teacher.id);
          return (
            <button
              key={teacher.id}
              onClick={() => teacher.id && onTeacherSelect(teacher.id)}
              className={`p-2 md:p-3 text-left rounded-lg border transition-all ${
                selectedTeacher === teacher.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div className="text-xs md:text-sm font-medium truncate">{teacher.name}</div>
              {teacher.nip && (
                <div className="text-xs text-gray-500">NIP: {teacher.nip}</div>
              )}
              {teacherData && (
                <div className="text-xs mt-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    getAttendanceRateBadgeColor(teacherData.overallAttendanceRate)
                  }`}>
                    {teacherData.overallAttendanceRate}%
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
