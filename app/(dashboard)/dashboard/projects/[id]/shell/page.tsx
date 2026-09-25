'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks';

/** Strings with no locale key yet. */
const COPY = {
  en: { error: 'Error', session: 'app container — interactive shell' },
  tr: { error: 'Hata', session: 'uygulama konteyneri — etkileşimli kabuk' },
} as const;

function TerminalLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]" role="status">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8a8a86' }} aria-label={t('common', 'loading')} />
    </div>
  );
}

const ServerTerminalView = dynamic(
  () =>
    import('@/components/servers/ServerTerminalView').then((m) => m.ServerTerminalView),
  {
    ssr: false,
    loading: () => <TerminalLoading />,
  },
);

type TerminalStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export default function ProjectShellPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<TerminalStatus>('connecting');
  const { t, locale } = useTranslation();
  const copy = COPY[locale === 'tr' ? 'tr' : 'en'];

  const statusLabel: Record<TerminalStatus, string> = {
    connecting: t('logs', 'connecting'),
    connected: t('logs', 'connected'),
    disconnected: t('logs', 'disconnected'),
    error: copy.error,
  };

  // Status is the only colour in the terminal chrome.
  const statusColor: Record<TerminalStatus, string> = {
    connecting: '#fbbf24',
    connected: 'var(--term-prompt)',
    disconnected: 'var(--term-dim)',
    error: '#f87171',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="dash-icon-row gap-1.5 text-sm rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t('common', 'back')}
          </Link>
          <h1 className="text-lg font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {t('projects', 'shellTitle')}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="btn btn-secondary btn-sm"
        >
          {t('common', 'exit')}
        </button>
      </div>

      <div className="dash-terminal">
        <div className="dash-terminal-bar">
          <span className="truncate">{copy.session}</span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 uppercase shrink-0"
            style={{ color: statusColor[status], letterSpacing: '0.1em' }}
            role="status"
            aria-live="polite"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'currentColor' }}
              aria-hidden="true"
            />
            {statusLabel[status]}
          </span>
        </div>

        <div style={{ height: 'calc(100vh - 250px)', minHeight: 400 }}>
          <ServerTerminalView projectId={projectId} onStatusChange={setStatus} />
        </div>
      </div>
    </div>
  );
}
