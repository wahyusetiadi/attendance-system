'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { initMockDevtools } from '@/mock/devtoolsClient';

const publicRoutes = ['/login', '/register', '/forgot-password'];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    initMockDevtools();
  }, []);

  const isPublicRoute = publicRoutes.includes(pathname);

  // Show loading only for very brief moment
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, don't render anything if not authenticated
  // AuthContext will handle the redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
