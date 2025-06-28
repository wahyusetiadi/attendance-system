// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}></div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 text-sm">Memuat halaman...</p>
    </div>
  );
}
