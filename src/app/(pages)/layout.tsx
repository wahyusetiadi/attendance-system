'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { PageContent } from '@/components/layout/PageContent';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout if not authenticated (AuthContext will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <LoadingProvider>
      <div className="h-screen bg-gray-50 overflow-hidden">
        {/* ✅ Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ✅ Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* ✅ Main Content - Fixed margin for desktop sidebar */}
        <div className="lg:ml-64 flex flex-col h-full">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* ✅ Page Content */}
          <main className="flex-1 overflow-x-hidden">
            <div className="p-4 sm:p-6">
              <PageContent>
                {children}
              </PageContent>
            </div>
          </main>
        </div>
      </div>
    </LoadingProvider>
  );
}
