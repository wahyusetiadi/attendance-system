// src/components/charts/MonthlyChart/components/TableView.tsx
import { TeacherAttendanceData, ViewMode } from '../types';
import { getAttendanceRateBadgeColor } from '../utils/statusHelpers';

interface TableViewProps {
  teachersData: TeacherAttendanceData[];
  onViewChange: (teacherId: number, mode: ViewMode) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  teachersData,
  onViewChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm md:text-base font-semibold text-gray-900">
          Ringkasan Kehadiran Semua Guru ({teachersData.length} guru)
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-900">Guru</th>
              {/* <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">NIP</th> */}
              <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Hadir</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Terlambat</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Tidak Hadir</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Tingkat Kehadiran</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachersData.map((data) => (
              <tr key={data.teacherId} className="hover:bg-gray-50">
                <td className="px-2 md:px-4 py-2 md:py-3">
                  <div className="font-medium text-gray-900">{data.teacherName}</div>
                </td>
                {/* <td className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-600">
                  {data.teacherNip || '-'}
                </td> */}
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {data.totalPresent}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {data.totalLate}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {data.totalAbsent}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${
                    getAttendanceRateBadgeColor(data.overallAttendanceRate)
                  }`}>
                    {data.overallAttendanceRate}%
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                    <button
                      onClick={() => onViewChange(data.teacherId, 'chart')}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      Grafik
                    </button>
                    <button
                      onClick={() => onViewChange(data.teacherId, 'daily')}
                      className="text-green-600 hover:text-green-700 text-xs underline"
                    >
                      Harian
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
