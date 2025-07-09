// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { teachersAPI, attendanceAPI, Teacher, AttendanceRecord } from '@/api/api';
// import { Search, User, Calendar, ChevronLeft, ChevronRight, Grid, BarChart3 } from 'lucide-react';

// interface DailyAttendanceData {
//   date: string;
//   day: number;
//   dayName: string;
//   isWeekend: boolean;
//   hasRecord: boolean;
//   status: AttendanceRecord['status'] | null;
//   checkIn: string | null;
//   checkOut: string | null;
//   workingHours: number | null;
//   notes: string | null;
// }

// interface MonthlyAttendanceData {
//   month: string;
//   monthIndex: number;
//   presentDays: number;
//   absentDays: number;
//   lateDays: number;
//   workingDays: number;
//   attendanceRate: number;
//   dailyData: DailyAttendanceData[];
//   details: {
//     hadir: number;
//     terlambat: number;
//     tidakHadir: number;
//     sakit: number;
//     izin: number;
//   };
// }

// interface TeacherAttendanceData {
//   teacherId: number;
//   teacherName: string;
//   teacherNip?: string;
//   monthlyData: MonthlyAttendanceData[];
//   totalPresent: number;
//   totalAbsent: number;
//   totalLate: number;
//   overallAttendanceRate: number;
// }

// type ViewMode = 'chart' | 'table' | 'daily';
// type MetricKey = 'presentDays' | 'absentDays' | 'attendanceRate' | 'lateDays';

// interface MetricConfig {
//   key: MetricKey;
//   label: string;
//   color: string;
//   bgColor: string;
//   suffix?: string;
// }

// const metrics: MetricConfig[] = [
//   { 
//     key: 'presentDays', 
//     label: 'Hari Hadir', 
//     color: 'bg-green-500', 
//     bgColor: 'bg-green-300' 
//   },
//   { 
//     key: 'absentDays', 
//     label: 'Hari Tidak Hadir', 
//     color: 'bg-red-500',
//     bgColor: 'bg-red-300' 
//   },
//   { 
//     key: 'lateDays', 
//     label: 'Hari Terlambat', 
//     color: 'bg-yellow-500',
//     bgColor: 'bg-yellow-300' 
//   },
//   { 
//     key: 'attendanceRate', 
//     label: 'Tingkat Kehadiran', 
//     color: 'bg-blue-500',
//     bgColor: 'bg-blue-300',
//     suffix: '%' 
//   },
// ];

// const defaultMonthsIndo = [
//   'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
//   'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
// ];

// const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// interface LoadingSpinnerProps {
//   size?: 'sm' | 'md' | 'lg';
// }

// const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
//   const sizeClasses = {
//     sm: 'w-4 h-4',
//     md: 'w-8 h-8',
//     lg: 'w-12 h-12'
//   };

//   return (
//     <div className="flex justify-center items-center">
//       <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
//     </div>
//   );
// };

// export function MonthlyChart() {
//   const [viewMode, setViewMode] = useState<ViewMode>('chart');
//   const [activeMetric, setActiveMetric] = useState<MetricKey>('presentDays');
//   const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
//   const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
//   const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [searchTerm, setSearchTerm] = useState('');

//   // Normalize attendance record function
//   const normalizeAttendanceRecord = (record: any): AttendanceRecord => {
//     const normalizeStatus = (status: string): AttendanceRecord["status"] => {
//       switch (status?.toUpperCase()) {
//         case "HADIR":
//           return "HADIR";
//         case "TERLAMBAT":
//           return "TERLAMBAT";
//         case "TIDAK_HADIR":
//         case "ALPHA":
//           return "TIDAK HADIR";
//         case "SAKIT":
//           return "SAKIT";
//         case "IZIN":
//           return "IZIN";
//         default:
//           return "TIDAK HADIR";
//       }
//     };

//     const formatTimestamp = (timestamp: number | null): string | null => {
//       if (!timestamp) return null;
//       const date = new Date(timestamp);
//       return date.toLocaleTimeString('id-ID', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false
//       });
//     };

//     const formatDate = (isoString: string): string => {
//       return new Date(isoString).toISOString().split("T")[0];
//     };

//     return {
//       id: record.id || undefined,
//       teacherId: record.teacherId,
//       teacherName: record.teacher?.name || null,
//       teacherNip: record.teacher?.nip || null,
//       teacher: record.teacher
//         ? {
//             id: record.teacher.id,
//             name: record.teacher.name,
//             nip: record.teacher.nip || undefined,
//             email: record.teacher.email || undefined,
//           }
//         : undefined,
//       date: formatDate(record.date),
//       checkIn: formatTimestamp(record.checkIn),
//       checkOut: formatTimestamp(record.checkOut),
//       workingHours: record.workingHours || null,
//       status: normalizeStatus(record.status),
//       location: record.location,
//       notes: record.notes,
//       createdAt: record.createdAt,
//       updatedAt: record.updatedAt,
//     };
//   };

//   // Get working days in month
//   const getWorkingDaysInMonth = (year: number, month: number) => {
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     let workingDays = 0;

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       const dayOfWeek = date.getDay();

//       if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//         workingDays++;
//       }
//     }

//     return workingDays;
//   };

//   // Get daily attendance data for a month
//   const getDailyAttendanceData = (year: number, month: number, teacherRecords: AttendanceRecord[]): DailyAttendanceData[] => {
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const dailyData: DailyAttendanceData[] = [];

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       const dayOfWeek = date.getDay();
//       const dateString = date.toISOString().split('T')[0];

//       const record = teacherRecords.find(r => r.date === dateString);

//       dailyData.push({
//         date: dateString,
//         day,
//         dayName: dayNames[dayOfWeek],
//         isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
//         hasRecord: !!record,
//         status: record?.status || null,
//         checkIn: record?.checkIn || null,
//         checkOut: record?.checkOut || null,
//         workingHours: record?.workingHours || null,
//         notes: record?.notes || null
//       });
//     }

//     return dailyData;
//   };

//   // Single optimized fetch for all data
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Parallel fetch for better performance
//         const [teachersResponse, attendanceResponse] = await Promise.all([
//           teachersAPI.getAll({ 
//             page: 1, 
//             limit: 1000,
//             isActive: true 
//           }),
//           attendanceAPI.getAll({
//             startDate: `${selectedYear}-01-01`,
//             endDate: `${selectedYear}-12-31`,
//             page: 1,
//             limit: 10000
//           })
//         ]);

//         if (!teachersResponse.success || !teachersResponse.data) {
//           throw new Error('Failed to fetch teachers data');
//         }

//         const teachers = teachersResponse.data;
//         setAllTeachers(teachers);

//         let attendanceRecords: AttendanceRecord[] = [];
//         if (attendanceResponse.success && attendanceResponse.data) {
//           attendanceRecords = attendanceResponse.data.map(normalizeAttendanceRecord);
//         }
//         setAllAttendanceRecords(attendanceRecords);

//         // Set first teacher as selected by default
//         if (!selectedTeacher && teachers.length > 0 && teachers[0].id) {
//           setSelectedTeacher(teachers[0].id);
//         }

//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Gagal memuat data kehadiran guru. Periksa koneksi internet Anda.');
//         setAllTeachers([]);
//         setAllAttendanceRecords([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, [selectedYear]);

//   // Memoized calculation of teachers data to avoid recalculation
//   const teachersData = useMemo((): TeacherAttendanceData[] => {
//     if (!allTeachers.length) {
//       return allTeachers.map(teacher => ({
//         teacherId: teacher.id!,
//         teacherName: teacher.name,
//         teacherNip: teacher.nip,
//         monthlyData: defaultMonthsIndo.map((month, index) => ({
//           month,
//           monthIndex: index,
//           presentDays: 0,
//           absentDays: 0,
//           lateDays: 0,
//           workingDays: getWorkingDaysInMonth(selectedYear, index),
//           attendanceRate: 0,
//           dailyData: getDailyAttendanceData(selectedYear, index, []),
//           details: {
//             hadir: 0,
//             terlambat: 0,
//             tidakHadir: 0,
//             sakit: 0,
//             izin: 0
//           }
//         })),
//         totalPresent: 0,
//         totalAbsent: 0,
//         totalLate: 0,
//         overallAttendanceRate: 0
//       }));
//     }

//     return allTeachers.map(teacher => {
//       if (!teacher.id) {
//         return {
//           teacherId: 0,
//           teacherName: teacher.name,
//           teacherNip: teacher.nip,
//           monthlyData: [],
//           totalPresent: 0,
//           totalAbsent: 0,
//           totalLate: 0,
//           overallAttendanceRate: 0
//         };
//       }

//       // Filter records for this teacher
//       const teacherRecords = allAttendanceRecords.filter(record => record.teacherId === teacher.id);

//       const monthlyData: MonthlyAttendanceData[] = [];
//       let totalPresent = 0;
//       let totalAbsent = 0;
//       let totalLate = 0;
//       let totalWorkingDays = 0;

//       // Process each month
//       for (let month = 0; month < 12; month++) {
//         const workingDays = getWorkingDaysInMonth(selectedYear, month);

//         // Filter records for this month
//         const monthRecords = teacherRecords.filter(record => {
//           const recordDate = new Date(record.date);
//           return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === month;
//         });

//         // Get daily data for this month
//         const dailyData = getDailyAttendanceData(selectedYear, month, monthRecords);

//         let presentDays = 0;
//         let absentDays = 0;
//         let lateDays = 0;
//         const details = {
//           hadir: 0,
//           terlambat: 0,
//           tidakHadir: 0,
//           sakit: 0,
//           izin: 0
//         };

//         monthRecords.forEach(record => {
//           switch (record.status) {
//             case 'HADIR':
//               presentDays++;
//               details.hadir++;
//               break;
//             case 'TERLAMBAT':
//               lateDays++;
//               details.terlambat++;
//               break;
//             case 'TIDAK HADIR':
//               absentDays++;
//               details.tidakHadir++;
//               break;
//             case 'SAKIT':
//               absentDays++;
//               details.sakit++;
//               break;
//             case 'IZIN':
//               absentDays++;
//               details.izin++;
//               break;
//           }
//         });

//         const attendanceRate = workingDays > 0 
//           ? Math.round(((presentDays + lateDays) / workingDays) * 100)
//           : 0;

//         monthlyData.push({
//           month: defaultMonthsIndo[month],
//           monthIndex: month,
//           presentDays,
//           absentDays,
//           lateDays,
//           workingDays,
//           attendanceRate,
//           dailyData,
//           details
//         });

//         totalPresent += presentDays;
//         totalAbsent += absentDays;
//         totalLate += lateDays;
//         totalWorkingDays += workingDays;
//       }

//       const overallAttendanceRate = totalWorkingDays > 0 
//         ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100)
//         : 0;

//       return {
//         teacherId: teacher.id,
//         teacherName: teacher.name,
//         teacherNip: teacher.nip,
//         monthlyData,
//         totalPresent,
//         totalAbsent,
//         totalLate,
//         overallAttendanceRate
//       };
//     });
//   }, [allTeachers, allAttendanceRecords, selectedYear]);

//   // Memoized filtered teachers
//   const filteredTeachers = useMemo(() => {
//     return allTeachers.filter(teacher =>
//       teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (teacher.nip && teacher.nip.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   }, [allTeachers, searchTerm]);

//   // Memoized filtered teachers data for table
//   const filteredTeachersData = useMemo(() => {
//     return teachersData.filter(data => 
//       data.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (data.teacherNip && data.teacherNip.toLowerCase().includes(searchTerm.toLowerCase()))
//     ).sort((a, b) => b.overallAttendanceRate - a.overallAttendanceRate);
//   }, [teachersData, searchTerm]);

//   // Get selected teacher data
//   const selectedTeacherData = useMemo(() => {
//     return teachersData.find(data => data.teacherId === selectedTeacher);
//   }, [teachersData, selectedTeacher]);

//   // Get current month data for selected teacher
//   const currentMonthData = useMemo(() => {
//     if (!selectedTeacherData) return null;
//     return selectedTeacherData.monthlyData[selectedMonth];
//   }, [selectedTeacherData, selectedMonth]);

//   // Helper function to get metric value safely
//   const getMetricValue = (monthData: MonthlyAttendanceData, metric: MetricKey): number => {
//     return monthData[metric] || 0;
//   };

//   // Calculate chart metrics for selected teacher
//   const maxValue = selectedTeacherData ? Math.max(
//     ...selectedTeacherData.monthlyData.map(data => getMetricValue(data, activeMetric)), 
//     1
//   ) : 100;

//   const currentMonthIndex = new Date().getMonth();
//   const currentYear = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

//   // Get status color class
//   const getStatusColor = (status: AttendanceRecord['status'] | null, isWeekend: boolean) => {
//     if (isWeekend) return 'bg-gray-100 text-gray-400';

//     switch (status) {
//       case 'HADIR':
//         return 'bg-green-100 text-green-800 border-green-300';
//       case 'TERLAMBAT':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//       case 'TIDAK HADIR':
//         return 'bg-red-100 text-red-800 border-red-300';
//       case 'SAKIT':
//         return 'bg-purple-100 text-purple-800 border-purple-300';
//       case 'IZIN':
//         return 'bg-blue-100 text-blue-800 border-blue-300';
//       default:
//         return 'bg-gray-100 text-gray-600 border-gray-300';
//     }
//   };

//   // Get status text
//   const getStatusText = (status: AttendanceRecord['status'] | null, isWeekend: boolean) => {
//     if (isWeekend) return 'Libur';
//     return status || 'Tidak Ada Data';
//   };

//   if (loading) {
//     return (
//       <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-6 p-2 md:p-4">
//         <div className="bg-gray-50 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
//           <LoadingSpinner size="lg" />
//           <p className="mt-4 text-sm md:text-base text-gray-600">Memuat data kehadiran guru...</p>
//           <p className="mt-2 text-xs md:text-sm text-gray-500">Mengambil data harian dan bulanan</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-6 p-2 md:p-4">
//       {/* Header */}
//       <div className="text-center md:text-left mb-3 md:mb-4">
//         <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
//           Statistik Kehadiran Per Guru
//         </h3>
//         <p className="text-xs md:text-sm text-gray-600">
//           Analisis kehadiran harian dan bulanan guru dengan detail lengkap
//         </p>
//       </div>

//       {/* Controls */}
//       <div className="flex flex-col gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-lg border border-gray-200">
//         {/* View Mode Toggle */}
//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             onClick={() => setViewMode('chart')}
//             className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
//               viewMode === 'chart'
//                 ? 'bg-blue-500 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <BarChart3 className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
//             Grafik
//           </button>
//           <button
//             onClick={() => setViewMode('table')}
//             className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
//               viewMode === 'table'
//                 ? 'bg-blue-500 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Grid className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
//             Tabel
//           </button>
//           <button
//             onClick={() => setViewMode('daily')}
//             className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
//               viewMode === 'daily'
//                 ? 'bg-blue-500 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <Calendar className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
//             Harian
//           </button>
//         </div>

//         {/* Search and Controls */}
//         <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
//           {/* Teacher Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
//             <input
//               type="text"
//               placeholder="Cari guru..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Year Selector */}
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(Number(e.target.value))}
//             className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             {yearOptions.map(year => (
//               <option key={year} value={year}>{year}</option>
//             ))}
//           </select>

//           {/* Month Selector - Only show in daily view */}
//           {viewMode === 'daily' && (
//             <select
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               {defaultMonthsIndo.map((month, index) => (
//                 <option key={index} value={index}>{month}</option>
//               ))}
//             </select>
//           )}
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//             <p className="text-red-600 text-xs md:text-sm">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="text-red-600 text-xs md:text-sm underline hover:no-underline"
//             >
//               Refresh Halaman
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Teacher Selection - Only show in chart and daily mode */}
//       {(viewMode === 'chart' || viewMode === 'daily') && !loading && filteredTeachers.length > 0 && (
//         <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
//           <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
//             <User className="w-3 h-3 md:w-4 md:h-4" />
//             Pilih Guru ({filteredTeachers.length} guru)
//           </h4>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-32 md:max-h-40 overflow-y-auto">
//             {filteredTeachers.map((teacher) => {
//               const teacherData = teachersData.find(data => data.teacherId === teacher.id);
//               return (
//                 <button
//                   key={teacher.id}
//                   onClick={() => setSelectedTeacher(teacher.id!)}
//                   className={`p-2 md:p-3 text-left rounded-lg border transition-all ${
//                     selectedTeacher === teacher.id
//                       ? 'border-blue-500 bg-blue-50 text-blue-900'
//                       : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
//                   }`}
//                 >
//                   <div className="text-xs md:text-sm font-medium truncate">{teacher.name}</div>
//                   {teacher.nip && (
//                     <div className="text-xs text-gray-500">NIP: {teacher.nip}</div>
//                   )}
//                   {teacherData && (
//                     <div className="text-xs mt-1">
//                       <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
//                         teacherData.overallAttendanceRate >= 90 
//                           ? 'bg-green-100 text-green-800'
//                           : teacherData.overallAttendanceRate >= 80
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {teacherData.overallAttendanceRate}%
//                       </span>
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Chart View */}
//       {viewMode === 'chart' && selectedTeacherData && (
//         <>
//           {/* Metric Selector */}
//           <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
//             {metrics.map((metric) => (
//               <button
//                 key={metric.key}
//                 onClick={() => setActiveMetric(metric.key)}
//                 className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
//                   activeMetric === metric.key
//                     ? `${metric.color} text-white shadow-md`
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 {metric.label}
//               </button>
//             ))}
//           </div>

//           {/* Chart */}
//           <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-2">
//               <h4 className="text-base md:text-lg font-semibold text-gray-900">
//                 {selectedTeacherData.teacherName}
//               </h4>
//               <div className="text-xs md:text-sm text-gray-500">
//                 {selectedTeacherData.teacherNip && `NIP: ${selectedTeacherData.teacherNip}`}
//               </div>
//             </div>

//             <div className="relative bg-gray-50 rounded-lg p-2 md:p-4">
//               {/* Y-axis labels */}
//               <div className="absolute left-1 md:left-2 top-2 md:top-4 h-32 md:h-48 flex flex-col justify-between text-xs text-gray-500 z-10">
//                 <span className="bg-gray-50 px-1">{maxValue}</span>
//                 <span className="bg-gray-50 px-1">{Math.round(maxValue / 2)}</span>
//                 <span className="bg-gray-50 px-1">0</span>
//               </div>

//               {/* Chart container */}
//               <div className="ml-6 md:ml-8">
//                 <div className="flex items-end gap-1 h-32 md:h-48 border-b border-gray-300">
//                   {selectedTeacherData.monthlyData.map((monthData, index) => {
//                     const value = getMetricValue(monthData, activeMetric);
//                     const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
//                     const isCurrentMonth = index === currentMonthIndex && selectedYear === currentYear;
//                     const selectedMetric = metrics.find(m => m.key === activeMetric);

//                     return (
//                       <div key={`${monthData.month}-${index}`} className="flex-1 flex flex-col items-center group">
//                         {/* Bar */}
//                         <div className="relative w-full flex justify-center">
//                           <div 
//                             className={`w-4 md:w-6 lg:w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer ${
//                               isCurrentMonth 
//                                 ? selectedMetric?.color + ' shadow-lg' 
//                                 : selectedMetric?.bgColor
//                             } relative`}
//                             style={{ 
//                               height: `${Math.max(height * 1.2, 4)}px`,
//                               minHeight: '4px',
//                               maxHeight: height > 0 ? '120px' : '4px'
//                             }}
//                           >
//                             {/* Tooltip */}
//                             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 md:px-3 py-1 md:py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
//                               <div className="text-center">
//                                 <div className="font-medium">{monthData.month} {selectedYear}</div>
//                                 <div className="text-gray-300 text-xs mt-1">
//                                   <div>Hadir: {monthData.details.hadir}</div>
//                                   <div>Terlambat: {monthData.details.terlambat}</div>
//                                   <div>Tidak Hadir: {monthData.details.tidakHadir}</div>
//                                   <div>Sakit: {monthData.details.sakit}</div>
//                                   <div>Izin: {monthData.details.izin}</div>
//                                   <div className="border-t border-gray-600 mt-1 pt-1">
//                                     Tingkat Kehadiran: {monthData.attendanceRate}%
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Month label */}
//                         <div className={`text-xs mt-1 md:mt-2 font-medium ${
//                           isCurrentMonth ? 'text-gray-900 font-bold' : 'text-gray-500'
//                         }`}>
//                           {monthData.month}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Summary Statistics */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
//               <div className="text-center">
//                 <div className="text-lg md:text-2xl font-bold text-green-600">{selectedTeacherData.totalPresent}</div>
//                 <div className="text-xs text-gray-500">Total Hadir</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-lg md:text-2xl font-bold text-yellow-600">{selectedTeacherData.totalLate}</div>
//                 <div className="text-xs text-gray-500">Total Terlambat</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-lg md:text-2xl font-bold text-red-600">{selectedTeacherData.totalAbsent}</div>
//                 <div className="text-xs text-gray-500">Total Tidak Hadir</div>
//               </div>
//               <div className="text-center">
//                 <div className={`text-lg md:text-2xl font-bold ${
//                   selectedTeacherData.overallAttendanceRate >= 90 ? 'text-green-600' :
//                   selectedTeacherData.overallAttendanceRate >= 80 ? 'text-yellow-600' : 'text-red-600'
//                 }`}>
//                   {selectedTeacherData.overallAttendanceRate}%
//                 </div>
//                 <div className="text-xs text-gray-500">Tingkat Kehadiran</div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Daily View */}
//       {viewMode === 'daily' && selectedTeacherData && currentMonthData && (
//         <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-2">
//             <h4 className="text-base md:text-lg font-semibold text-gray-900">
//               Kehadiran Harian - {selectedTeacherData.teacherName}
//             </h4>
//             <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
//               <button
//                 onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
//               </button>
//               <span className="font-medium">{defaultMonthsIndo[selectedMonth]} {selectedYear}</span>
//               <button
//                 onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Month Summary */}
//           <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
//             <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
//               <div className="text-lg md:text-xl font-bold text-green-600">{currentMonthData.details.hadir}</div>
//               <div className="text-xs text-gray-600">Hadir</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
//               <div className="text-lg md:text-xl font-bold text-yellow-600">{currentMonthData.details.terlambat}</div>
//               <div className="text-xs text-gray-600">Terlambat</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-red-50 rounded-lg">
//               <div className="text-lg md:text-xl font-bold text-red-600">{currentMonthData.details.tidakHadir}</div>
//               <div className="text-xs text-gray-600">Tidak Hadir</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
//               <div className="text-lg md:text-xl font-bold text-purple-600">{currentMonthData.details.sakit}</div>
//               <div className="text-xs text-gray-600">Sakit</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
//               <div className="text-lg md:text-xl font-bold text-blue-600">{currentMonthData.details.izin}</div>
//               <div className="text-xs text-gray-600">Izin</div>
//             </div>
//           </div>

//           {/* Calendar Grid */}
//           <div className="grid grid-cols-7 gap-1 md:gap-2">
//             {/* Day headers */}
//             {dayNames.map(day => (
//               <div key={day} className="text-center p-2 text-xs md:text-sm font-medium text-gray-500 bg-gray-50 rounded">
//                 {day}
//               </div>
//             ))}

//             {/* Empty cells for days before month starts */}
//             {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, index) => (
//               <div key={`empty-${index}`} className="p-2 md:p-3"></div>
//             ))}

//             {/* Days of month */}
//             {currentMonthData.dailyData.map((dayData) => (
//               <div
//                 key={dayData.date}
//                 className={`p-1 md:p-2 rounded-lg border text-center cursor-pointer transition-all hover:shadow-sm ${
//                   getStatusColor(dayData.status, dayData.isWeekend)
//                 }`}
//                 title={`${dayData.day} - ${getStatusText(dayData.status, dayData.isWeekend)}${
//                   dayData.checkIn ? `\nMasuk: ${dayData.checkIn}` : ''
//                 }${dayData.checkOut ? `\nKeluar: ${dayData.checkOut}` : ''}${
//                   dayData.notes ? `\nCatatan: ${dayData.notes}` : ''
//                 }`}
//               >
//                 <div className="text-xs md:text-sm font-medium">{dayData.day}</div>
//                 <div className="text-xs truncate mt-1">
//                   {dayData.isWeekend ? 'Libur' : (dayData.status || 'No Data')}
//                 </div>
//                 {dayData.checkIn && (
//                   <div className="text-xs text-gray-600 mt-1">
//                     {dayData.checkIn}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Legend */}
//           <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
//             <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Keterangan:</h5>
//             <div className="flex flex-wrap gap-2 md:gap-4 text-xs">
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
//                 <span>Hadir</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
//                 <span>Terlambat</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
//                 <span>Tidak Hadir</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
//                 <span>Sakit</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
//                 <span>Izin</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
//                 <span>Libur</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Table View */}
//       {viewMode === 'table' && (
//         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//           <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
//             <h4 className="text-sm md:text-base font-semibold text-gray-900">
//               Ringkasan Kehadiran Semua Guru ({filteredTeachersData.length} guru)
//             </h4>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs md:text-sm">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-900">Guru</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">NIP</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Hadir</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Terlambat</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Total Tidak Hadir</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Tingkat Kehadiran</th>
//                   <th className="px-2 md:px-4 py-2 md:py-3 text-center font-medium text-gray-900">Aksi</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredTeachersData.map((data) => (
//                   <tr key={data.teacherId} className="hover:bg-gray-50">
//                     <td className="px-2 md:px-4 py-2 md:py-3">
//                       <div className="font-medium text-gray-900">{data.teacherName}</div>
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-600">
//                       {data.teacherNip || '-'}
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center">
//                       <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         {data.totalPresent}
//                       </span>
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center">
//                       <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                         {data.totalLate}
//                       </span>
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center">
//                       <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         {data.totalAbsent}
//                       </span>
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center">
//                       <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${
//                         data.overallAttendanceRate >= 90 
//                           ? 'bg-green-100 text-green-800'
//                           : data.overallAttendanceRate >= 80
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {data.overallAttendanceRate}%
//                       </span>
//                     </td>
//                     <td className="px-2 md:px-4 py-2 md:py-3 text-center">
//                       <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
//                         <button
//                           onClick={() => {
//                             setSelectedTeacher(data.teacherId);
//                             setViewMode('chart');
//                           }}
//                           className="text-blue-600 hover:text-blue-700 text-xs underline"
//                         >
//                           Grafik
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSelectedTeacher(data.teacherId);
//                             setViewMode('daily');
//                           }}
//                           className="text-green-600 hover:text-green-700 text-xs underline"
//                         >
//                           Harian
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Data Update Info */}
//       {!loading && teachersData.length > 0 && (
//         <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
//           <div className="flex items-center justify-center gap-1">
//             <Calendar className="w-3 h-3" />
//             Data kehadiran harian dan bulanan guru untuk tahun {selectedYear}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
