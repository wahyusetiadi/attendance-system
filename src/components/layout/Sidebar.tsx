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
  LogOut,
  X
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import Logo from '../../../public/TK.png'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data Guru', href: '/teachers', icon: Users },
  { name: 'Data Absensi', href: '/attendance', icon: Calendar },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoading();

  const handleNavigation = async (href: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Jangan navigasi jika sudah di halaman yang sama
    if (pathname === href) {
      onClose(); // Close mobile sidebar
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Navigate to new page
      router.push(href);

      // Close mobile sidebar after navigation
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset loading state setelah navigasi selesai
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <>
      {/* ✅ Desktop Sidebar - Fixed position */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-slate-900 shadow-2xl z-30">
        <SidebarContent 
          navigation={navigation}
          pathname={pathname}
          isLoading={isLoading}
          handleNavigation={handleNavigation}
          showCloseButton={false}
          onClose={onClose}
        />
      </div>

      {/* ✅ Mobile Sidebar - Overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent 
          navigation={navigation}
          pathname={pathname}
          isLoading={isLoading}
          handleNavigation={handleNavigation}
          showCloseButton={true}
          onClose={onClose}
        />
      </div>
    </>
  );
}

interface SidebarContentProps {
  navigation: typeof navigation;
  pathname: string;
  isLoading: boolean;
  handleNavigation: (href: string, e: React.MouseEvent) => void;
  showCloseButton: boolean;
  onClose: () => void;
}

function SidebarContent({ 
  navigation, 
  pathname, 
  isLoading, 
  handleNavigation, 
  showCloseButton, 
  onClose 
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ✅ Header */}
      <div className="flex items-center justify-between h-16 bg-blue-600 shadow-lg px-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {/* <GraduationCap className="h-6 w-6 text-white" /> */}
            <Image width={40} height={40} alt='' src={Logo} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              E-Presensi
            </h1>
            <p className="text-xs text-blue-100">
              Sistem Manajemen
            </p>
          </div>
        </div>

        {/* ✅ Mobile Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* ✅ Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
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
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-sm"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ✅ Settings */}
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
          <span className="truncate">Pengaturan</span>
        </button>
      </div>
    </div>
  );
}
