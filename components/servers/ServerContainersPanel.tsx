'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useServerContainers } from '@/hooks/useServers';
import { formatMessage } from '@/lib/i18n/format-message';
import type { Server } from '@/lib/api';

/**
 * "Who is using this server" — every Pushify-managed container on the box with
 * its share of the total CPU and memory Pushify is consuming. Feeds the
 * per-app cost view later; today it answers "why is this server slow?".
 */
export function ServerContainersPanel({ server }: { server: Server }) {
  const { t } = useTranslation();
  const canRead = server.setupStatus === 'completed' && server.status === 'running';
  const { data, isLoading, error } = useServerContainers(server.id, canRead);

  if (!canRead) return null;

  const containers = data?.containers ?? [];
  const sorted = [...containers].sort((a, b) => b.memoryUsageMb - a.memoryUsageMb);

  return (
    <section className="min-w-0" aria-labelledby={`server-containers-${server.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2.5">
        <h2 id={`server-containers-${server.id}`} className="dash-section-label">
          {t('servers', 'containersTitle')}
        </h2>
        {data && containers.length > 0 && (
          <p className="terminal-text text-xs text-[var(--text-muted)] tabular-nums">
            {formatMessage(t('servers', 'containersTotals'), {
              cpu: String(data.totals.cpuPercent),
              mem: String(data.totals.memoryUsageMb),
              count: String(containers.length),
            })}
          </p>
        )}
      </div>
      <div className="dash-rows">
      {isLoading && (
        <div className="dash-row flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
        </div>
      )}

      {error && (
        <div className="dash-row flex items-center gap-2.5 text-[13px] text-[var(--text-secondary)]" role="alert">
          <span className="dash-status-dot is-error" aria-hidden="true" />
          {t('servers', 'containersFailed')}
        </div>
      )}

      {data && containers.length === 0 && (
        <div className="dash-row text-[13px] text-[var(--text-muted)]">{t('servers', 'containersEmpty')}</div>
      )}

      {sorted.length > 0 && (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {sorted.map((c) => (
            <li key={c.projectId} className="dash-row grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-1.5 items-center">
              <div className="min-w-0">
                <Link href={`/dashboard/projects/${c.projectId}`} className="text-sm font-medium text-[var(--text-primary)] hover:underline underline-offset-2 truncate block rounded-sm">
                  {c.projectName}
                </Link>
                <p className="terminal-text text-[11px] truncate text-[var(--text-muted)] mt-0.5">
                  {c.containerName}
                  {c.status !== 'running' && <span className="ml-1.5 text-[var(--status-warning)]">· {c.status}</span>}
                </p>
              </div>
              <ShareBar label="CPU" value={`${c.cpuPercent}%`} share={c.cpuShare} />
              <ShareBar label="RAM" value={`${c.memoryUsageMb} MB`} share={c.memoryShare} className="col-span-2 sm:col-span-1" />
            </li>
          ))}
        </ul>
      )}

      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">{t('servers', 'containersHint')}</p>
    </section>
  );
}

function ShareBar({ label, value, share, className = '' }: { label: string; value: string; share: number; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="terminal-text flex items-center justify-between text-[11px] mb-1 tabular-nums text-[var(--text-muted)]">
        <span>{label} · {value}</span>
        <span>{share}%</span>
      </div>
      <div className="dash-metric-track">
        <div className={`dash-metric-fill ${share > 60 ? 'is-warning' : 'is-low'}`} style={{ width: `${Math.min(share, 100)}%` }} />
      </div>
    </div>
  );
}
