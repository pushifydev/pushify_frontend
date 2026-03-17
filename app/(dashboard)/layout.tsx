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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-lg bg-[var(--accent-cyan)] animate-ping opacity-20" />
            <div className="relative w-12 h-12 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[var(--bg-primary)] animate-pulse"
              >
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
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
