'use client';

import { Activity, Ban, Info, Loader2, RefreshCw, Timer } from 'lucide-react';
import type { StudioPerformance } from '@/lib/api';
import { panelStyle, type T } from './_shared';

interface PerformancePanelProps {
  data: StudioPerformance | undefined;
  loading: boolean;
  fetching: boolean;
  error: unknown;
  onRefresh: () => void;
  onOpenInConsole: (sql: string) => void;
  onCancel: (id: number) => void;
  cancelling: boolean;
  t: T;
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

function formatMs(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value < 1000) return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3"
      style={{ borderTop: '1px solid var(--glass-border)' }}
    >
      <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </p>
    </div>
  );
}

export function PerformancePanel({
  data,
  loading,
  fetching,
  error,
  onRefresh,
  onOpenInConsole,
  onCancel,
  cancelling,
  t,
}: PerformancePanelProps) {
  if (error) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--status-error)',
        }}
      >
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'studioPerformanceSubtitle')}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={fetching}
          className="btn btn-secondary text-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
          {t('databases', 'studioRefresh')}
        </button>
      </div>

      {/* Slow queries */}
      <div className="overflow-hidden" style={panelStyle}>
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <Timer className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium">{t('databases', 'studioSlowQueries')}</p>
        </div>

        {loading ? (
          <div className="px-4 py-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 rounded animate-pulse"
                style={{ background: 'var(--hover-overlay)' }}
              />
            ))}
          </div>
        ) : !data?.slowQueries.available ? (
          <Notice>{data?.slowQueries.hint ?? t('databases', 'studioSlowQueriesUnavailable')}</Notice>
        ) : data.slowQueries.items.length === 0 ? (
          <Notice>{t('databases', 'studioNoSlowQueries')}</Notice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {[
                    t('databases', 'studioQueryColumn'),
                    t('databases', 'studioCalls'),
                    t('databases', 'studioTotalTime'),
                    t('databases', 'studioMeanTime'),
                    t('databases', 'studioRowsLabel'),
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slowQueries.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => onOpenInConsole(item.query)}
                        className="block max-w-[520px] truncate text-xs text-left"
                        style={{ ...mono, color: 'var(--text-secondary)' }}
                        title={t('databases', 'studioOpenInConsole')}
                      >
                        {item.query}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.calls.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatMs(item.totalMs)}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {formatMs(item.meanMs)}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.rows.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Running right now */}
      <div className="overflow-hidden" style={panelStyle}>
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <Activity className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium">{t('databases', 'studioRunningQueries')}</p>
        </div>

        {loading ? (
          <div className="px-4 py-4">
            <div className="h-6 rounded animate-pulse" style={{ background: 'var(--hover-overlay)' }} />
          </div>
        ) : !data?.running.available ? (
          <Notice>{data?.running.hint ?? t('databases', 'studioRunningUnavailable')}</Notice>
        ) : data.running.items.length === 0 ? (
          <Notice>{t('databases', 'studioNoRunningQueries')}</Notice>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {data.running.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {item.user ?? '—'} · {item.state ?? '—'} · {formatMs(item.runningMs)}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className="block max-w-[460px] truncate text-xs"
                        style={{ ...mono, color: 'var(--text-secondary)' }}
                        title={item.query ?? ''}
                      >
                        {item.query ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right align-top">
                      <button
                        type="button"
                        onClick={() => onCancel(Number(item.id))}
                        disabled={cancelling || !Number.isFinite(Number(item.id))}
                        className="btn btn-ghost text-xs py-1"
                        style={{ color: 'var(--status-error)' }}
                        title={t('databases', 'studioCancelQuery')}
                      >
                        {cancelling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                        {t('databases', 'studioCancelQuery')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
