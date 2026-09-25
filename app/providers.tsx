'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { useThemeStore, type Theme } from '@/stores/theme';
import { ConfirmProvider } from '@/hooks/useConfirm';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { appT } from '@/lib/i18n/app-translate';
import { AfterHydration } from '@/components/AfterHydration';
import { LocaleProvider } from '@/components/LocaleProvider';
import { RouteProgress } from '@/components/RouteProgress';
import type { SupportedLocale } from '@/lib/i18n';

function resolveThemeMode(theme: Theme): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme === 'light' ? 'light' : 'dark';
}

function DynamicToaster() {
  const { theme } = useThemeStore();
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveThemeMode(theme));

  useEffect(() => {
    setResolved(resolveThemeMode(theme));
  }, [theme]);

  return (
    <Toaster
      position="bottom-right"
      theme={resolved}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        },
        classNames: {
          toast: 'font-sans',
          title: 'font-medium',
          description: 'text-[var(--text-secondary)]',
          success: 'border-[var(--status-success)]/30',
          error: 'border-[var(--status-error)]/30',
          info: 'border-[var(--accent-cyan)]/30',
        },
      }}
    />
  );
}

export function Providers({
  initialLocale,
  children,
}: {
  /** The language the server rendered this page in (see app/layout.tsx). */
  initialLocale: SupportedLocale;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const description = getApiErrorMessage(error);
            toast.error(appT('errors', 'somethingWentWrong'), {
              description,
            });
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider initialLocale={initialLocale}>
        <AfterHydration />
        <RouteProgress />
        {children}
        <DynamicToaster />
        <ConfirmProvider />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
