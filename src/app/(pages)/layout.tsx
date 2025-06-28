// src/app/(pages)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { PageContent } from '@/components/layout/PageContent';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <PageContent>
              {children}
            </PageContent>
          </main>
        </div>
      </div>
    </LoadingProvider>
  );
}
