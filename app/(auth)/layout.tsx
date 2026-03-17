'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
          <span className="terminal-text text-[var(--text-secondary)]">{t('common', 'loading')}</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const features = [
    t('branding', 'zeroConfig'),
    t('branding', 'autoHttps'),
    t('branding', 'realTimeLogs'),
    t('branding', 'teamCollab'),
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--accent-cyan)] rounded-full blur-[128px] opacity-10" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--accent-purple)] rounded-full blur-[128px] opacity-10" />

      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[var(--bg-primary)]"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">Pushify</span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        <div className="space-y-8">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            {t('branding', 'deployAt')}
            <br />
            <span className="gradient-text">{t('branding', 'speedOfThought')}</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-md leading-relaxed">
            {t('branding', 'description')}
          </p>

          {/* Feature list */}
          <div className="space-y-4 pt-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-[var(--text-secondary)]"
              >
                <div className="w-5 h-5 rounded bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-[var(--accent-cyan)]"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="terminal-text text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">
            {t('branding', 'documentation')}
          </a>
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">
            {t('branding', 'github')}
          </a>
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">
            {t('branding', 'status')}
          </a>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Language Switcher */}
          <div className="lg:hidden absolute top-4 right-4">
            <LanguageSwitcher />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
