'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { useThemeStore } from '@/stores/theme';

function DynamicToaster() {
  const { theme } = useThemeStore();
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolved(dark ? 'dark' : 'light');
    } else {
      setResolved(theme === 'light' ? 'light' : 'dark');
    }
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

export function Providers({ children }: { children: React.ReactNode }) {
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
          onError: (error: Error) => {
            toast.error('Operation failed', {
              description: error.message,
            });
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DynamicToaster />
    </QueryClientProvider>
  );
}
