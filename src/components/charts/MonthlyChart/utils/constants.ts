// src/components/charts/MonthlyChart/utils/constants.ts
import { MetricConfig } from '../types';

export const metrics: MetricConfig[] = [
  { 
    key: 'presentDays', 
    label: 'Hari Hadir', 
    color: 'bg-green-500', 
    bgColor: 'bg-green-300' 
  },
  { 
    key: 'absentDays', 
    label: 'Hari Tidak Hadir', 
    color: 'bg-red-500',
    bgColor: 'bg-red-300' 
  },
  { 
    key: 'lateDays', 
    label: 'Hari Terlambat', 
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-300' 
  },
  { 
    key: 'attendanceRate', 
    label: 'Tingkat Kehadiran', 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-300',
    suffix: '%' 
  },
];

export const defaultMonthsIndo = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
