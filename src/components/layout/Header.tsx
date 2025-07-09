// // // src/components/layout/Header.tsx
// // 'use client';

// // import { useAuth } from '@/contexts/AuthContext';
// // import { useNotificationContext } from '@/contexts/NotificationContext';
// // import { Button } from '@/components/ui/Button';
// // import { LogOut, User, Menu, Bell, Wifi, WifiOff } from 'lucide-react';

// // interface HeaderProps {
// //   onMenuClick: () => void;
// // }

// // export function Header({ onMenuClick }: HeaderProps) {
// //   const { user, logout } = useAuth();
// //   const { notifications, unreadCount, isPolling, error } = useNotificationContext();

// //   return (
// //     <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
// //       <div className="flex justify-between items-center">
// //         <div className="flex items-center space-x-4">
// //           {/* Mobile Menu Button */}
// //           <button
// //             onClick={onMenuClick}
// //             className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
// //           >
// //             <Menu className="h-6 w-6" />
// //           </button>

// //           {/* Page Title */}
// //           <div>
// //             <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
// //               PAUD KANZUL KHAIRAT
// //             </h1>
// //             <p className="text-sm text-gray-500 hidden sm:block">
// //               Sistem Manajemen Kehadiran
// //             </p>
// //           </div>
// //         </div>

// //         {/* User Section */}
// //         <div className="flex items-center space-x-2 sm:space-x-4">
// //           {/* Notification Status */}
// //           <div className="flex items-center space-x-2">
// //             {/* Connection Status */}
// //             <div className="flex items-center space-x-1">
// //               {isPolling ? (
// //                 <Wifi className="h-4 w-4 text-green-500" />
// //               ) : (
// //                 <WifiOff className="h-4 w-4 text-red-500" />
// //               )}
// //               <span className="text-xs text-gray-500 hidden sm:inline">
// //                 {isPolling ? 'Online' : 'Offline'}
// //               </span>
// //             </div>

// //             {/* Notification Bell */}
// //             <div className="relative">
// //               <Bell className="h-5 w-5 text-gray-500" />
// //               {unreadCount > 0 && (
// //                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
// //                   {unreadCount}
// //                 </span>
// //               )}
// //             </div>
// //           </div>

// //           {/* User Info */}
// //           <div className="hidden sm:flex items-center space-x-2">
// //             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
// //               <User className="h-4 w-4 text-blue-600" />
// //             </div>
// //             <div className="hidden md:block">
// //               <p className="text-sm font-medium text-gray-700 truncate max-w-32">
// //                 {user?.name || user?.email}
// //               </p>
// //               <p className="text-xs text-gray-500">
// //                 Administrator
// //               </p>
// //             </div>
// //           </div>

// //           {/* Logout Button */}
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             onClick={logout}
// //             className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
// //           >
// //             <LogOut className="h-4 w-4" />
// //             <span className="hidden sm:inline">Logout</span>
// //           </Button>
// //         </div>
// //       </div>

// //       {/* Connection Status Bar */}
// //       {error && (
// //         <div className="mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700">
// //           ⚠️ {error}
// //         </div>
// //       )}
// //     </header>
// //   );
// // }

// // src/components/layout/Header.tsx
// 'use client';

// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/Button';
// import { LogOut, User, Menu } from 'lucide-react';

// interface HeaderProps {
//   onMenuClick: () => void;
// }

// export function Header({ onMenuClick }: HeaderProps) {
//   const { user, logout } = useAuth();

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center space-x-4">
//           {/* Mobile Menu Button */}
//           <button
//             onClick={onMenuClick}
//             className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
//           >
//             <Menu className="h-6 w-6" />
//           </button>

//           {/* Page Title */}
//           <div>
//             <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
//               PAUD KANZUL KHAIRAT
//             </h1>
//             <p className="text-sm text-gray-500 hidden sm:block">
//               Sistem Manajemen Kehadiran
//             </p>
//           </div>
//         </div>

//         {/* User Section */}
//         <div className="flex items-center space-x-2 sm:space-x-4">
//           {/* User Info */}
//           <div className="hidden sm:flex items-center space-x-2">
//             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
//               <User className="h-4 w-4 text-blue-600" />
//             </div>
//             <div className="hidden md:block">
//               <p className="text-sm font-medium text-gray-700 truncate max-w-32">
//                 {user?.name || user?.email}
//               </p>
//               <p className="text-xs text-gray-500">
//                 Administrator
//               </p>
//             </div>
//           </div>

//           {/* Logout Button */}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={logout}
//             className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
//           >
//             <LogOut className="h-4 w-4" />
//             <span className="hidden sm:inline">Logout</span>
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }


// src/components/layout/Header.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LogOut, User, Menu } from 'lucide-react';
import { AttendanceNotificationBell } from '../notifications/AttendanceNotification';
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 lg:ml-64">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              PAUD KANZUL KHAIRAT
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Sistem Manajemen Kehadiran
            </p>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Attendance Notification Bell */}
          <AttendanceNotificationBell />

          {/* User Info */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700 truncate max-w-32">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
