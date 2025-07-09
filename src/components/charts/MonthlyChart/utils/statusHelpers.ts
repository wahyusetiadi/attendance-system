// src/components/charts/MonthlyChart/utils/statusHelpers.ts
import { AttendanceRecord } from '@/api/api';

/**
 * Get CSS color classes for attendance status in calendar view
 * @param status - Attendance status
 * @param isWeekend - Whether the day is weekend
 * @returns CSS classes for styling
 */
export const getStatusColor = (status: AttendanceRecord['status'] | null, isWeekend: boolean): string => {
  if (isWeekend) {
    return 'bg-gray-100 text-gray-400 border-gray-200';
  }

  switch (status) {
    case 'HADIR':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'TERLAMBAT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'TIDAK HADIR':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'SAKIT':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'IZIN':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
};

/**
 * Get readable text for attendance status
 * @param status - Attendance status
 * @param isWeekend - Whether the day is weekend
 * @returns Human readable status text
 */
export const getStatusText = (status: AttendanceRecord['status'] | null, isWeekend: boolean): string => {
  if (isWeekend) {
    return 'Libur';
  }

  switch (status) {
    case 'HADIR':
      return 'Hadir';
    case 'TERLAMBAT':
      return 'Terlambat';
    case 'TIDAK HADIR':
      return 'Tidak Hadir';
    case 'SAKIT':
      return 'Sakit';
    case 'IZIN':
      return 'Izin';
    default:
      return 'Tidak Ada Data';
  }
};

/**
 * Get color class for attendance rate text
 * @param rate - Attendance rate percentage
 * @returns CSS color class
 */
export const getAttendanceRateColor = (rate: number): string => {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 80) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get badge color classes for attendance rate
 * @param rate - Attendance rate percentage
 * @returns CSS classes for badge styling
 */
export const getAttendanceRateBadgeColor = (rate: number): string => {
  if (rate >= 90) return 'bg-green-100 text-green-800';
  if (rate >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

/**
 * Get status icon (emoji or symbol) for quick visual identification
 * @param status - Attendance status
 * @param isWeekend - Whether the day is weekend
 * @returns Icon character
 */
export const getStatusIcon = (status: AttendanceRecord['status'] | null, isWeekend: boolean): string => {
  if (isWeekend) return '🏖️';

  switch (status) {
    case 'HADIR':
      return '✅';
    case 'TERLAMBAT':
      return '⏰';
    case 'TIDAK HADIR':
      return '❌';
    case 'SAKIT':
      return '🤒';
    case 'IZIN':
      return '📝';
    default:
      return '❓';
  }
};

/**
 * Get background color class for status cards/summaries
 * @param status - Attendance status type
 * @returns CSS background color class
 */
export const getStatusBackgroundColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'hadir':
      return 'bg-green-50';
    case 'terlambat':
      return 'bg-yellow-50';
    case 'tidak hadir':
    case 'tidakhadir':
      return 'bg-red-50';
    case 'sakit':
      return 'bg-purple-50';
    case 'izin':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
};

/**
 * Get text color class for status cards/summaries
 * @param status - Attendance status type
 * @returns CSS text color class
 */
export const getStatusTextColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'hadir':
      return 'text-green-600';
    case 'terlambat':
      return 'text-yellow-600';
    case 'tidak hadir':
    case 'tidakhadir':
      return 'text-red-600';
    case 'sakit':
      return 'text-purple-600';
    case 'izin':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Get priority level for status (for sorting/ranking)
 * @param status - Attendance status
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (status: AttendanceRecord['status'] | null): number => {
  switch (status) {
    case 'TIDAK HADIR':
      return 1; // Highest priority (most concerning)
    case 'TERLAMBAT':
      return 2;
    case 'SAKIT':
      return 3;
    case 'IZIN':
      return 4;
    case 'HADIR':
      return 5; // Lowest priority (good status)
    default:
      return 6; // No data
  }
};

/**
 * Format attendance percentage with appropriate styling
 * @param rate - Attendance rate
 * @param includeIcon - Whether to include status icon
 * @returns Formatted object with text and styling
 */
export const formatAttendanceRate = (rate: number, includeIcon: boolean = false) => {
  const getIcon = () => {
    if (rate >= 90) return '🟢';
    if (rate >= 80) return '🟡';
    return '🔴';
  };

  return {
    text: `${rate}%`,
    colorClass: getAttendanceRateColor(rate),
    badgeClass: getAttendanceRateBadgeColor(rate),
    icon: includeIcon ? getIcon() : null,
    level: rate >= 90 ? 'excellent' : rate >= 80 ? 'good' : 'needs-improvement'
  };
};

/**
 * Get tooltip content for attendance status
 * @param status - Attendance status
 * @param checkIn - Check in time
 * @param checkOut - Check out time
 * @param notes - Additional notes
 * @returns Formatted tooltip content
 */
export const getStatusTooltip = (
  status: AttendanceRecord['status'] | null,
  checkIn: string | null,
  checkOut: string | null,
  notes: string | null
): string => {
  const statusText = getStatusText(status, false);
  let tooltip = `Status: ${statusText}`;

  if (checkIn) {
    tooltip += `\nMasuk: ${checkIn}`;
  }

  if (checkOut) {
    tooltip += `\nKeluar: ${checkOut}`;
  }

  if (notes) {
    tooltip += `\nCatatan: ${notes}`;
  }

  return tooltip;
};

/**
 * Status constants for reference
 */
export const STATUS_CONSTANTS = {
  PRESENT: 'HADIR',
  LATE: 'TERLAMBAT',
  ABSENT: 'TIDAK HADIR',
  SICK: 'SAKIT',
  PERMISSION: 'IZIN'
} as const;

/**
 * Attendance rate thresholds
 */
export const ATTENDANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  NEEDS_IMPROVEMENT: 0
} as const;
