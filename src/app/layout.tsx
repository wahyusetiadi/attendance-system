// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import './globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata = {
  title: 'Presensi PAUD Kanzul Khairat',
  description: 'Aplikasi manajemen guru untuk sekolah modern',
  icons: {
    icon: '/TK.png',
    shortcut: '/TK.png',
    appleTouchIcon: '/apple-touch-icon.png',
    maskIcon: '/safari-pinned-tab.svg',
    msTileImage: '/mstile-150x150.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LoadingProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
