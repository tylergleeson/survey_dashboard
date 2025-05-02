'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth/');

  return (
    <AuthProvider>
      {isAuthPage ? (
        children
      ) : (
        <ProtectedRoute>
          <MainLayout>{children}</MainLayout>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
} 