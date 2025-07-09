// src/components/charts/MonthlyChart/components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Memuat data...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 md:space-y-6 p-2 md:p-4">
      <div className="bg-gray-50 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
        <p className="mt-4 text-sm md:text-base text-gray-600">{message}</p>
        <p className="mt-2 text-xs md:text-sm text-gray-500">Mengambil data harian dan bulanan</p>
      </div>
    </div>
  );
};
