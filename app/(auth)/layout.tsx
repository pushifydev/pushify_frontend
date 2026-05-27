'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/logo';
import { Check } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <span className="text-sm text-neutral-500">{t('common', 'loading')}</span>
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
    <div className="auth-shell min-h-screen flex bg-white dark:bg-[#0a0a0a]">
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-neutral-900 dark:text-white hover:opacity-90 transition-opacity">
            <LogoMark size={28} />
            <span className="text-xl font-semibold tracking-tight">Pushify</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="space-y-8 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-white">
            {t('branding', 'deployAt')}
            <br />
            {t('branding', 'speedOfThought')}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('branding', 'description')}
          </p>

          <ul className="space-y-3 pt-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
                  <Check className="h-3 w-3 text-white dark:text-neutral-900" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-6 text-sm text-neutral-500">
          <Link href="/docs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            {t('branding', 'documentation')}
          </Link>
          <a
            href="https://github.com/pushifydev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {t('branding', 'github')}
          </a>
          <Link href="/about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            {t('legal', 'about')}
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="lg:hidden absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
