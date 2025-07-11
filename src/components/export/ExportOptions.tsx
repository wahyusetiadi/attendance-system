// components/export/ExportOptions.tsx
import { ExportOptions } from '@/hooks/useExportData';

interface ExportOptionsProps {
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
  stats: {
    total: number;
    belumAbsen: number;
    tidakHadirOtomatis: number;
    hadir: number;
  };
}

export function ExportOptionsComponent({ options, onOptionsChange, stats }: ExportOptionsProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 block">
        Opsi Export
      </label>

      {/* Convert Past Absent Option */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={options.convertPastAbsent}
            onChange={(e) => onOptionsChange({ ...options, convertPastAbsent: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">
              Ubah "Belum Absen" Hari Lalu Menjadi "Tidak Hadir"
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Secara otomatis mengubah status guru yang belum melakukan absensi pada hari-hari sebelumnya menjadi "Tidak Hadir"
            </p>
            {options.convertPastAbsent && (
              <div className="mt-2 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                <strong>Akan diproses:</strong> {stats.belumAbsen} record "Belum Absen" → "Tidak Hadir"
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Other options */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={options.includeFilters}
          onChange={(e) => onOptionsChange({ ...options, includeFilters: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">Sertakan Info Filter</span>
          <p className="text-xs text-gray-500">Tampilkan informasi filter yang digunakan</p>
        </div>
      </label>

      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={options.includeSummary}
          onChange={(e) => onOptionsChange({ ...options, includeSummary: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">Sertakan Ringkasan</span>
          <p className="text-xs text-gray-500">Tampilkan statistik dan ringkasan data</p>
        </div>
      </label>
    </div>
  );
}
