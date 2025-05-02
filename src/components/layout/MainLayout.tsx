'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Bell, User, Mic } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <Mic className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-800">VoiceVault</span>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link href="/dashboard" className={`flex flex-col items-center p-2 ${pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/earnings" className={`flex flex-col items-center p-2 ${pathname === '/earnings' ? 'text-blue-500' : 'text-gray-500'}`}>
              <DollarSign className="w-6 h-6" />
              <span className="text-xs mt-1">Earnings</span>
            </Link>
            <Link href="/notifications" className={`flex flex-col items-center p-2 ${pathname === '/notifications' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Bell className="w-6 h-6" />
              <span className="text-xs mt-1">Alerts</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center p-2 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}>
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
} 