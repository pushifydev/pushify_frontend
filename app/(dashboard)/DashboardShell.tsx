'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { getAccessToken } from '@/lib/api';
import { buildAuthPath } from '@/lib/auth-redirect';
import { dashboardGate } from '@/lib/auth-gate';
import { useTranslation } from '@/hooks';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { OrganizationDeletionBanner } from '@/components/OrganizationDeletionBanner';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { AiAssistantSheet } from '@/components/AiAssistantSheet';

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuthStore();
  const { collapsed } = useSidebarStore();
  const { t } = useTranslation();
  const gate = dashboardGate({ isLoading, isAuthenticated, hasToken: getAccessToken() !== null });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Only when there is no session left. With the tokens still stored (network error / 5xx /
    // 429) /login would send the user straight back here, looping on /auth/me.
    if (gate === 'login') {
      // Send the attempted URL along so login returns the user here, not /dashboard
      const attempted = `${window.location.pathname}${window.location.search}`;
      router.push(buildAuthPath('login', attempted === '/dashboard' ? null : attempted));
    }
  }, [gate, router]);

  if (gate === 'loading') {
    return (
      <div className="dash-app min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--text-primary)] animate-spin" />
      </div>
    );
  }

  if (gate === 'unreachable') {
    return (
      <div className="dash-app min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {t('errors', 'networkUnavailable')}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {/* Escape hatch: logout clears the tokens even when the server is down */}
            <button onClick={() => logout()} className="btn btn-secondary h-10 px-4 text-sm">
              {t('common', 'logout')}
            </button>
            <button onClick={() => checkAuth()} className="btn btn-primary h-10 px-4 gap-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              {t('errors', 'tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gate === 'login') {
    return null;
  }

  return (
    <WebSocketProvider>
      <div className="dash-app min-h-screen bg-[var(--bg-primary)]">
        <CommandPalette />
        <KeyboardShortcuts />
        <AiAssistantSheet />
        <Sidebar />
        <div className={`transition-all duration-300 ${collapsed ? 'md:pl-17' : 'md:pl-60'}`}>
          <Header />
          {user && user.emailVerified === false && <EmailVerificationBanner />}
          {user && <OrganizationDeletionBanner />}
          <main className="dash-main min-w-0">
            {children}
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
