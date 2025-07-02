import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
// import { Inter } from 'next/font/google';
import { AuthGuard } from '@/components/auth/AuthGuard';

// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EduAdmin - Sistem Manajemen Guru',
  description: 'Aplikasi manajemen guru untuk sekolah modern',
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
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
