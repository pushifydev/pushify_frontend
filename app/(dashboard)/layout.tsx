'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { CommandPalette } from '@/components/CommandPalette';
import { AiAssistantSheet } from '@/components/AiAssistantSheet';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { collapsed } = useSidebarStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="dash-app min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-cyan)] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <WebSocketProvider>
      <div className="dash-app min-h-screen bg-[var(--bg-primary)]">
        <CommandPalette />
        <AiAssistantSheet />
        <Sidebar />
        <div className={`transition-all duration-300 ${collapsed ? 'md:pl-17' : 'md:pl-60'}`}>
          <Header />
          {user && user.emailVerified === false && <EmailVerificationBanner />}
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
