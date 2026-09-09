'use client';

import Link from 'next/link';
import { Boxes, Loader2 } from 'lucide-react';
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
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold">{t('servers', 'containersTitle')}</h3>
        </div>
        {data && containers.length > 0 && (
          <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {formatMessage(t('servers', 'containersTotals'), {
              cpu: String(data.totals.cpuPercent),
              mem: String(data.totals.memoryUsageMb),
              count: String(containers.length),
            })}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      )}

      {error && <p className="text-sm text-[var(--status-error)]">{t('servers', 'containersFailed')}</p>}

      {data && containers.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('servers', 'containersEmpty')}</p>
      )}

      {sorted.length > 0 && (
        <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {sorted.map((c) => (
            <li key={c.projectId} className="py-2.5 grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-1.5 items-center" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="min-w-0">
                <Link href={`/dashboard/projects/${c.projectId}`} className="text-sm font-medium hover:underline underline-offset-4 truncate block" style={{ color: 'var(--text-primary)' }}>
                  {c.projectName}
                </Link>
                <p className="text-[11px] truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {c.containerName}
                  {c.status !== 'running' && <span className="ml-1.5 capitalize">· {c.status}</span>}
                </p>
              </div>
              <ShareBar label="CPU" value={`${c.cpuPercent}%`} share={c.cpuShare} />
              <ShareBar label="RAM" value={`${c.memoryUsageMb} MB`} share={c.memoryShare} className="col-span-2 sm:col-span-1" />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('servers', 'containersHint')}</p>
    </div>
  );
}

function ShareBar({ label, value, share, className = '' }: { label: string; value: string; share: number; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center justify-between text-[11px] mb-1 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        <span>{label} · {value}</span>
        <span>{share}%</span>
      </div>
      <div className="dash-metric-track">
        <div className={`dash-metric-fill ${share > 60 ? 'is-warning' : 'is-low'}`} style={{ width: `${Math.min(share, 100)}%` }} />
      </div>
    </div>
  );
}
