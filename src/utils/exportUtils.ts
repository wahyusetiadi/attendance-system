// utils/exportUtils.ts
import { AttendanceRecord } from '@/types/attendance';

export const isPastDate = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < today;
};

export const processExportData = (
  rawData: AttendanceRecord[], 
  convertPastAbsent: boolean
): AttendanceRecord[] => {
  if (!convertPastAbsent) {
    return rawData;
  }

  return rawData.map(record => {
    if (
      record.notes === "Belum melakukan absensi" && 
      isPastDate(record.date) &&
      record.status === "TIDAK HADIR"
    ) {
      return {
        ...record,
        notes: "Tidak hadir (sistem otomatis)",
        status: "TIDAK HADIR" as AttendanceRecord["status"]
      };
    }
    return record;
  });
};

export const prepareExportData = (processedData: AttendanceRecord[]) => {
  return processedData.map(record => ({
    'Nama Guru': record.teacherName || '-',
    'NIP': record.teacherNip || '-',
    'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
    'Jam Masuk': record.checkIn || '-',
    'Jam Keluar': record.checkOut || '-',
    'Jam Kerja': record.workingHours ? `${record.workingHours.toFixed(2)} jam` : '-',
    'Status': getStatusLabel(record.status),
    'Lokasi': record.location || '-',
    'Catatan': record.notes || '-'
  }));
};

export const getStatusLabel = (status: AttendanceRecord['status']): string => {
  const labels: Record<AttendanceRecord['status'], string> = {
    HADIR: 'HADIR',
    TERLAMBAT: 'TERLAMBAT',
    'TIDAK HADIR': 'TIDAK HADIR',
    SAKIT: 'SAKIT',
    IZIN: 'IZIN'
  };
  return labels[status] || status;
};
