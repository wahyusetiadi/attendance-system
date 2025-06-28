// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import { 
  Home, 
  Users, 
  Settings,
  BarChart3,
  GraduationCap,
  Calendar,
  FileText,
  LogOut
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data Guru', href: '/teachers', icon: Users },
  { name: 'Data Absensi', href: '/attendance', icon: Users },
  // { name: 'Mata Pelajaran', href: '/subjects', icon: GraduationCap },
  // { name: 'Jadwal', href: '/schedule', icon: Calendar },
  // { name: 'Laporan', href: '/reports', icon: BarChart3 },
  // { name: 'Dokumen', href: '/documents', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoading();

  const handleNavigation = async (href: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Jangan navigasi jika sudah di halaman yang sama
    if (pathname === href) return;

    // Set loading state
    setIsLoading(true);

    try {
      // Simulasi delay untuk loading (opsional)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navigate to new page
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset loading state setelah navigasi selesai
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-center h-16 bg-blue-600 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              EduAdmin
            </h1>
            <p className="text-xs text-blue-100">
              Sistem Manajemen
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isNavigating = isLoading && pathname !== item.href;

          return (
            <button
              key={item.name}
              onClick={(e) => handleNavigation(item.href, e)}
              disabled={isLoading}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isNavigating ? (
                <LoadingSpinner size="sm" className="mr-3" />
              ) : (
                <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'
                }`} />
              )}
              {item.name}
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={(e) => handleNavigation('/settings', e)}
          disabled={isLoading}
          className={`
            w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-200 group
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isLoading && pathname !== '/settings' ? (
            <LoadingSpinner size="sm" className="mr-3" />
          ) : (
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
          )}
          Pengaturan
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 p-3 bg-slate-800 bg-opacity-50 rounded-xl">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-sm font-semibold text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Administrator
            </p>
            <p className="text-xs text-gray-400 truncate">
              admin@sekolah.edu
            </p>
          </div>
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
