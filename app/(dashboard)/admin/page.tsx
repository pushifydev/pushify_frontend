'use client';

import { useState } from 'react';
import { Users, UserPlus, Zap, CreditCard, Rocket, Boxes, Layers, TrendingUp, Bug } from 'lucide-react';
import { useTranslation, useAdminOverview } from '@/hooks';
import type { AdminDeployFailureCategory, AdminDeployFailureSummary } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n';
import { getStatusColor, STATUS_COLORS } from '@/lib/constants';
import { Skeleton } from '@/components/Skeleton';
import { AdminPanel, AdminError, EmptyRow, rowBorder } from './shared';

const CATEGORY_LABEL: Record<AdminDeployFailureCategory, keyof TranslationKeys['admin']> = {
  out_of_memory: 'catOutOfMemory',
  disk_space: 'catDiskSpace',
  platform_native: 'catPlatformNative',
  docker_build: 'catDockerBuild',
  application_build: 'catApplicationBuild',
  container_start: 'catContainerStart',
  server_capacity: 'catServerCapacity',
  project_config: 'catProjectConfig',
  unknown: 'catUnknown',
};

const BLAME_LABEL: Record<AdminDeployFailureSummary['blame'], keyof TranslationKeys['admin']> = {
  pushify: 'blamePushify',
  server: 'blameServer',
  project: 'blameProject',
};

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useAdminOverview();

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const funnel = data
    ? [
        { key: 'funnelRegistered' as const, value: data.funnel.registered },
        { key: 'funnelVerified' as const, value: data.funnel.verified },
        { key: 'funnelProject' as const, value: data.funnel.createdProject },
        { key: 'funnelDeployed' as const, value: data.funnel.deployed },
        { key: 'funnelLive' as const, value: data.funnel.deploySucceeded },
        { key: 'funnelServer' as const, value: data.funnel.connectedServer },
        { key: 'funnelDatabase' as const, value: data.funnel.createdDatabase },
        { key: 'funnelPaid' as const, value: data.funnel.paid },
      ]
    : [];
  const registered = data?.funnel.registered ?? 0;
  const orgTotal = data?.resources.organizations ?? 0;

  return (
    <div className="space-y-4">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 max-[400px]:grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatTile
          icon={<Users className="w-4 h-4" />}
          label={t('admin', 'statUsers')}
          value={data?.users.total}
          hint={data ? `${data.users.verified} ${t('admin', 'verified')} · ${data.users.withTwoFactor} ${t('admin', 'with2fa')}` : undefined}
          loading={isLoading}
        />
        <StatTile
          icon={<UserPlus className="w-4 h-4" />}
          label={t('admin', 'statNewWeek')}
          value={data?.users.last7d}
          hint={data ? `${data.users.last30d} / 30d` : undefined}
          loading={isLoading}
        />
        <StatTile
          icon={<Zap className="w-4 h-4" />}
          label={t('admin', 'statActiveWeek')}
          value={data?.active.activeUsers7d}
          hint={t('admin', 'statActiveHint')}
          loading={isLoading}
        />
        <StatTile
          icon={<CreditCard className="w-4 h-4" />}
          label={t('admin', 'statPaying')}
          value={data?.resources.paidOrganizations}
          hint={data ? `${orgTotal} ${t('admin', 'organizations').toLowerCase()}` : undefined}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
        {/* Funnel — a real sequence, so the order carries the meaning */}
        <AdminPanel
          title={t('admin', 'funnelTitle')}
          icon={<TrendingUp className="w-4 h-4" />}
          meta={t('admin', 'funnelHint')}
        >
          {isLoading ? (
            <div className="px-5 py-4 space-y-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-7 w-full rounded" />)}
            </div>
          ) : (
            <ol className="py-1">
              {funnel.map((step, idx) => {
                const pct = registered > 0 ? Math.round((step.value / registered) * 100) : 0;
                return (
                  <li key={step.key} className="px-5 py-2.5" style={rowBorder(idx)}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm">{t('admin', step.key)}</span>
                      <span className="text-sm tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
                        {step.value}
                        <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
                          {pct}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${pct}%`,
                          minWidth: step.value > 0 ? 4 : 0,
                          background: 'var(--accent-cyan)',
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminPanel>

        {/* Failure reasons — the "fix the product" panel. Blame on Pushify is highlighted. */}
        <AdminPanel
          title={t('admin', 'failuresTitle')}
          icon={<Bug className="w-4 h-4" />}
          meta={data ? `${data.failures.total} · ${t('admin', 'failuresHint')}` : undefined}
        >
          {isLoading || !data ? (
            <div className="px-5 py-4 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded" />)}
            </div>
          ) : data.failures.categories.length === 0 ? (
            <EmptyRow>{t('admin', 'failuresEmpty')}</EmptyRow>
          ) : (
            <ol className="py-1">
              {data.failures.categories.map((f, idx) => {
                const pct = Math.round((f.count / data.failures.total) * 100);
                const ours = f.blame === 'pushify';
                return (
                  <li key={f.category} className="px-5 py-2.5" style={rowBorder(idx)}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm flex items-center gap-2 min-w-0">
                        <span className="truncate">{t('admin', CATEGORY_LABEL[f.category])}</span>
                        <span
                          className="text-[10px] px-1.5 py-px rounded shrink-0 uppercase tracking-wide"
                          style={{
                            background: ours ? `${STATUS_COLORS.warning}1f` : 'var(--bg-tertiary)',
                            color: ours ? STATUS_COLORS.warning : 'var(--text-muted)',
                          }}
                        >
                          {t('admin', BLAME_LABEL[f.blame])}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                        {f.count}
                        <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
                          {pct}% · {f.projects} {t('admin', 'failuresProjects')}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, minWidth: 4, background: ours ? STATUS_COLORS.warning : 'var(--accent-cyan)' }}
                      />
                    </div>
                    {f.sample && (
                      <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} title={f.sample}>
                        {f.sample}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </AdminPanel>

        {/* 30-day strips — one series each, so the title is the legend */}
        <AdminPanel title={t('admin', 'last30Title')}>
          {isLoading || !data ? (
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>
          ) : (
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DayStrip
                label={t('admin', 'signups')}
                peakLabel={t('admin', 'peak')}
                series={data.byDay.map((d) => ({ day: d.day, count: d.signups }))}
              />
              <DayStrip
                label={t('admin', 'signins')}
                peakLabel={t('admin', 'peak')}
                series={data.byDay.map((d) => ({ day: d.day, count: d.logins }))}
              />
            </div>
          )}
        </AdminPanel>
        </div>

        <div className="space-y-4">
          <AdminPanel title={t('admin', 'deploysTitle')} icon={<Rocket className="w-4 h-4" />}>
            {isLoading || !data ? (
              <div className="px-5 py-4"><Skeleton className="h-16 w-full rounded" /></div>
            ) : (
              <>
                <div className="grid grid-cols-3 px-5 py-3" style={{ borderBottom: '1px solid var(--glass-divider)' }}>
                  <MiniStat label={t('admin', 'allTime')} value={data.deployments.total} />
                  <MiniStat label={t('admin', 'thisWeek')} value={data.deployments.last7d} />
                  <MiniStat
                    label={t('admin', 'failedThisWeek')}
                    value={data.deployments.failed7d}
                    tone={data.deployments.failed7d > 0 ? getStatusColor('failed') : undefined}
                  />
                </div>
                {data.deployments.byStatus.length > 0 && (
                  <ul className="px-5 py-2">
                    {data.deployments.byStatus.map((s) => (
                      <li key={s.status} className="flex items-center gap-2.5 py-1.5 text-sm">
                        <span className="dash-status-dot shrink-0" style={{ background: getStatusColor(s.status) }} />
                        <span className="flex-1 capitalize" style={{ color: 'var(--text-secondary)' }}>{s.status}</span>
                        <span className="tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'resourcesTitle')} icon={<Boxes className="w-4 h-4" />}>
            {isLoading || !data ? (
              <div className="px-5 py-4"><Skeleton className="h-24 w-full rounded" /></div>
            ) : (
              <ul className="px-5 py-2">
                <KeyValue label={t('admin', 'projects')} value={`${data.resources.activeProjects} / ${data.resources.projects}`} />
                <KeyValue label={t('admin', 'servers')} value={data.resources.servers} />
                <KeyValue label={t('admin', 'databases')} value={data.resources.databases} />
                <KeyValue label={t('admin', 'organizations')} value={data.resources.organizations} />
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'plansTitle')} icon={<Layers className="w-4 h-4" />}>
            {isLoading || !data ? (
              <div className="px-5 py-4"><Skeleton className="h-16 w-full rounded" /></div>
            ) : (
              <ul className="px-5 py-2">
                {data.plans.map((p) => (
                  <li key={p.plan} className="py-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{p.plan}</span>
                      <span className="tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{p.count}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${orgTotal > 0 ? (p.count / orgTotal) * 100 : 0}%`,
                          background: p.plan === 'free' ? 'var(--text-muted)' : 'var(--accent-cyan)',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}

// ============ Pieces ============

function StatTile({
  icon,
  label,
  value,
  hint,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  hint?: string;
  loading: boolean;
}) {
  return (
    <div className="dash-stat-card p-4 sm:p-5 min-w-0">
      <div className="dash-icon-box mb-3 sm:mb-4">{icon}</div>
      <div className="dash-stat-value stat-number">
        {loading ? <Skeleton className="inline-block align-middle h-7 w-[3ch] rounded" /> : value ?? '—'}
      </div>
      <p className="dash-stat-label">{label}</p>
      {hint && !loading && (
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }} title={hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-lg font-semibold tabular-nums leading-tight" style={{ color: tone }}>{value}</p>
      <p className="text-[11px] leading-tight pr-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: number | string }) {
  return (
    <li className="flex items-center justify-between py-1.5 text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
    </li>
  );
}

/** 30 thin bars, one per day; hovering a bar swaps the header for that day's value. */
function DayStrip({
  label,
  peakLabel,
  series,
}: {
  label: string;
  peakLabel: string;
  series: { day: string; count: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((d) => d.count));
  const total = series.reduce((sum, d) => sum + d.count, 0);
  const hovered = hover !== null ? series[hover] : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {hovered ? `${hovered.day} · ${hovered.count}` : `${total} · ${peakLabel} ${max}`}
        </span>
      </div>
      <div
        className="flex items-end gap-0.5 h-14"
        role="img"
        aria-label={`${label}: ${total}`}
        onMouseLeave={() => setHover(null)}
      >
        {series.map((d, i) => {
          const dim = hover !== null && hover !== i;
          return (
            <div
              key={d.day}
              className="flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setHover(i)}
              title={`${d.day}: ${d.count}`}
            >
              <div
                className="w-full transition-opacity"
                style={{
                  height: d.count > 0 ? `${Math.max((d.count / max) * 100, 8)}%` : 2,
                  background: d.count > 0 ? 'var(--accent-cyan)' : 'var(--border-default)',
                  opacity: dim ? 0.4 : 1,
                  borderRadius: '3px 3px 0 0',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>{series[0]?.day.slice(5)}</span>
        <span>{series[series.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
