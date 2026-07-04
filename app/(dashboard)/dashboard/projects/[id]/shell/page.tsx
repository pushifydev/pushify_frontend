'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ServerTerminalView = dynamic(
  () =>
    import('@/components/servers/ServerTerminalView').then((m) => m.ServerTerminalView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
      </div>
    ),
  },
);

type TerminalStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export default function ProjectShellPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<TerminalStatus>('connecting');

  const statusLabel: Record<TerminalStatus, string> = {
    connecting: 'Connecting…',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error',
  };

  const statusColor: Record<TerminalStatus, string> = {
    connecting: '#fbbf24',
    connected: '#28c840',
    disconnected: 'rgba(255,255,255,0.4)',
    error: '#f87171',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              App Shell
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Exit
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#0a0a0f',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{
            background: '#111118',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span
            className="text-xs ml-2"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}
          >
            app container — interactive shell
          </span>
          <span
            className="text-xs ml-auto"
            style={{ color: statusColor[status], fontFamily: 'var(--font-mono)' }}
          >
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
