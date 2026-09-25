'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { LogoMark } from '@/components/logo';
import { AuthThemeToggle } from '@/components/auth';
import { Check } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { t } = useTranslation();

  // The invite page lives under (auth) but must render for logged-in users too — they need
  // to accept the invite. Without this exception the guard below would bounce them to the
  // dashboard before they can act, so clicking an invite link appears to "do nothing".
  const isInvitationFlow = pathname?.startsWith('/accept-invitation') ?? false;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isInvitationFlow) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router, isInvitationFlow]);

  if (isLoading) {
    return (
      <div className="hp min-h-screen flex items-center justify-center" style={{ background: 'var(--hp-bg)' }}>
        <span className="hp-mono text-[12px] uppercase tracking-[0.1em]" style={{ color: 'var(--hp-muted)' }}>
          {t('common', 'loading')}
        </span>
      </div>
    );
  }

  if (isAuthenticated && !isInvitationFlow) {
    return null;
  }

  const features = [
    t('branding', 'zeroConfig'),
    t('branding', 'autoHttps'),
    t('branding', 'realTimeLogs'),
    t('branding', 'teamCollab'),
  ];

  return (
    <div className="auth-shell hp min-h-screen flex overflow-x-clip" style={{ background: 'var(--hp-bg)' }}>
      {/* The same light as the homepage hero, so signing in feels like walking through its door. */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative isolate overflow-hidden border-r"
        style={{ borderColor: 'var(--hp-line)' }}
      >
        {/* Dimmer than on the homepage: here the light sits behind a paragraph of text. */}
        <div className="absolute inset-0 -z-10 opacity-45 pointer-events-none" aria-hidden="true">
          <div className="hp-beam" />
          <div className="hp-pool" />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" style={{ color: 'var(--hp-ink)' }}>
            <LogoMark size={28} tone="page" />
            <span className="text-xl font-semibold tracking-tight">Pushify</span>
          </Link>
          <div className="flex items-center gap-1">
            <AuthThemeToggle />
          </div>
        </div>

        <div className="max-w-md">
          <p className="hp-eyebrow" aria-hidden="false">
            <span aria-hidden="true">[&nbsp;</span>
            {t('branding', 'eyebrow')}
            <span aria-hidden="true">&nbsp;]</span>
          </p>
          <h1 className="mt-7 text-[2.75rem] leading-[1.1] font-medium" style={{ color: 'var(--hp-ink)' }}>
            {t('branding', 'deployAt')}
            <br />
            <span style={{ color: 'var(--hp-muted)' }}>{t('branding', 'speedOfThought')}</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed" style={{ color: 'var(--hp-body)' }}>
            {t('branding', 'description')}
          </p>

          <ul className="mt-10 border-t" style={{ borderColor: 'var(--hp-line)' }}>
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-center gap-3 py-3 border-b text-[14px]"
                style={{ borderColor: 'var(--hp-line)', color: 'var(--hp-body)' }}
              >
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--hp-ink)' }} strokeWidth={2.5} aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-6 hp-mono text-[12px] uppercase tracking-[0.1em]" style={{ color: 'var(--hp-muted)' }}>
          <Link href="/docs" className="hover:text-[var(--hp-ink)] transition-colors">
            {t('branding', 'documentation')}
          </Link>
          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--hp-ink)] transition-colors"
          >
            {t('branding', 'github')}
          </a>
          <Link href="/about" className="hover:text-[var(--hp-ink)] transition-colors">
            {t('legal', 'about')}
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative">
        <div className="lg:hidden absolute top-4 right-4 flex items-center gap-1">
          <AuthThemeToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
