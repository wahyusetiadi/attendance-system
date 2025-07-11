// components/export/ExportFormatSelector.tsx
import { FileText, CheckCircle } from 'lucide-react';

interface ExportFormatSelectorProps {
  exportFormat: 'excel' | 'pdf' | 'csv';
  onFormatChange: (format: 'excel' | 'pdf' | 'csv') => void;
}

export function ExportFormatSelector({ exportFormat, onFormatChange }: ExportFormatSelectorProps) {
  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Format universal untuk import/export'
    }
  ];

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Format Export
      </label>
      <div className="grid grid-cols-1 gap-3">
        {formatOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              exportFormat === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              value={option.value}
              checked={exportFormat === option.value}
              onChange={(e) => onFormatChange(e.target.value as any)}
              className="sr-only"
            />
            <option.icon className={`h-6 w-6 mr-3 ${
              exportFormat === option.value ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-500">{option.description}</div>
            </div>
            {exportFormat === option.value && (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
