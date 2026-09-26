'use client';

import { useState } from 'react';
import { useTranslation, useAdminOverview } from '@/hooks';
import type { AdminOverview, AdminDeployFailureCategory, AdminDeployFailureSummary } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n';
import { getStatusColor } from '@/lib/constants';
import { AdminPanel, AdminError, EmptyRow } from './shared';

const CATEGORY_LABEL: Record<AdminDeployFailureCategory, keyof TranslationKeys['admin']> = {
  repository_access: 'catRepositoryAccess',
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
  // The two repos deploy independently; a frontend ahead of the API must not crash here.
  const failures: AdminOverview['failures'] | undefined = data?.failures;

  return (
    <div className="space-y-8 min-w-0">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 max-[400px]:grid-cols-1 lg:grid-cols-4 gap-3">
        <StatTile
          label={t('admin', 'statUsers')}
          value={data?.users.total}
          hint={data ? `${data.users.verified} ${t('admin', 'verified')} · ${data.users.withTwoFactor} ${t('admin', 'with2fa')}` : undefined}
          loading={isLoading}
        />
        <StatTile
          label={t('admin', 'statNewWeek')}
          value={data?.users.last7d}
          hint={data ? `${data.users.last30d} / 30d` : undefined}
          loading={isLoading}
        />
        <StatTile
          label={t('admin', 'statActiveWeek')}
          value={data?.active.activeUsers7d}
          hint={t('admin', 'statActiveHint')}
          loading={isLoading}
        />
        <StatTile
          label={t('admin', 'statPaying')}
          value={data?.resources.paidOrganizations}
          hint={data ? `${orgTotal} ${t('admin', 'organizations').toLowerCase()}` : undefined}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0">
        <div className="lg:col-span-2 space-y-8 min-w-0">
          {/* Funnel — a real sequence, so the order carries the meaning */}
          <AdminPanel title={t('admin', 'funnelTitle')} meta={t('admin', 'funnelHint')}>
            {isLoading ? (
              <BarSkeleton rows={8} />
            ) : (
              <ol>
                {funnel.map((step, idx) => {
                  const pct = registered > 0 ? Math.round((step.value / registered) * 100) : 0;
                  return (
                    <li key={step.key} className="dash-row py-3!">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] text-[var(--text-primary)] min-w-0 truncate">
                          <span className="terminal-text text-xs text-[var(--text-muted)] mr-2.5 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {t('admin', step.key)}
                        </span>
                        <span className="terminal-text text-[13px] tabular-nums shrink-0">
                          {step.value}
                          <span className="text-xs ml-2 text-[var(--text-muted)]">{pct}%</span>
                        </span>
                      </div>
                      <div className="dash-metric-track mt-2" role="presentation">
                        <div
                          className="dash-metric-fill"
                          style={{ width: `${pct}%`, minWidth: step.value > 0 ? 4 : 0 }}
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
            meta={failures ? `${failures.total} · ${t('admin', 'failuresHint')}` : undefined}
          >
            {isLoading || !data ? (
              <BarSkeleton rows={3} />
            ) : !failures || failures.categories.length === 0 ? (
              <EmptyRow>{t('admin', 'failuresEmpty')}</EmptyRow>
            ) : (
              <ol>
                {failures.categories.map((f) => {
                  const pct = Math.round((f.count / failures.total) * 100);
                  const ours = f.blame === 'pushify';
                  return (
                    <li key={f.category} className="dash-row py-3!">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] text-[var(--text-primary)] truncate">
                            {t('admin', CATEGORY_LABEL[f.category])}
                          </span>
                          <span className={`badge shrink-0 ${ours ? 'badge-warning' : 'badge-neutral'}`}>
                            {t('admin', BLAME_LABEL[f.blame])}
                          </span>
                        </span>
                        <span className="terminal-text text-[13px] tabular-nums shrink-0">
                          {f.count}
                          <span className="text-xs ml-2 text-[var(--text-muted)]">
                            {pct}% · {f.projects} {t('admin', f.projects === 1 ? 'failuresProjectOne' : 'failuresProjects')}
                          </span>
                        </span>
                      </div>
                      <div className="dash-metric-track mt-2" role="presentation">
                        <div className={`dash-metric-fill ${ours ? 'is-warning' : ''}`} style={{ width: `${pct}%`, minWidth: 4 }} />
                      </div>
                      {f.sample && (
                        <p className="terminal-text text-xs mt-2 truncate text-[var(--text-muted)]" title={f.sample}>
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
            <div className="dash-row grid grid-cols-1 md:grid-cols-2 gap-6 py-4!">
              {isLoading || !data ? (
                <>
                  <div className="dash-skeleton h-20 w-full rounded" aria-hidden />
                  <div className="dash-skeleton h-20 w-full rounded" aria-hidden />
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-8 min-w-0">
          <AdminPanel title={t('admin', 'deploysTitle')}>
            {isLoading || !data ? (
              <BarSkeleton rows={2} />
            ) : (
              <>
                <div className="dash-row grid grid-cols-3 gap-2">
                  <MiniStat label={t('admin', 'allTime')} value={data.deployments.total} />
                  <MiniStat label={t('admin', 'thisWeek')} value={data.deployments.last7d} />
                  <MiniStat
                    label={t('admin', 'failedThisWeek')}
                    value={data.deployments.failed7d}
                    tone={data.deployments.failed7d > 0 ? getStatusColor('failed') : undefined}
                  />
                </div>
                {data.deployments.byStatus.length > 0 && (
                  <ul className="dash-row py-1.5!">
                    {data.deployments.byStatus.map((s) => (
                      <li key={s.status} className="dash-kv">
                        <span className="inline-flex items-center gap-2.5 capitalize">
                          <span className="dash-status-dot" style={{ background: getStatusColor(s.status) }} aria-hidden />
                          {s.status}
                        </span>
                        <span className="tabular-nums">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'resourcesTitle')}>
            {isLoading || !data ? (
              <BarSkeleton rows={2} />
            ) : (
              <ul className="dash-row py-1.5!">
                <KeyValue label={t('admin', 'projects')} value={`${data.resources.activeProjects} / ${data.resources.projects}`} />
                <KeyValue label={t('admin', 'servers')} value={data.resources.servers} />
                <KeyValue label={t('admin', 'databases')} value={data.resources.databases} />
                <KeyValue label={t('admin', 'organizations')} value={data.resources.organizations} />
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'plansTitle')}>
            {isLoading || !data ? (
              <BarSkeleton rows={2} />
            ) : (
              <ul className="dash-row space-y-3 py-3.5!">
                {data.plans.map((p) => (
                  <li key={p.plan}>
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="capitalize text-[var(--text-secondary)]">{p.plan}</span>
                      <span className="terminal-text text-xs tabular-nums">{p.count}</span>
                    </div>
                    <div className="dash-metric-track mt-1.5" role="presentation">
                      <div
                        className={`dash-metric-fill ${p.plan === 'free' ? 'is-low' : ''}`}
                        style={{ width: `${orgTotal > 0 ? (p.count / orgTotal) * 100 : 0}%` }}
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
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value?: number;
  hint?: string;
  loading: boolean;
}) {
  return (
    <div className="dash-stat-card p-4 sm:p-5 min-w-0">
      <p className="dash-stat-label mt-0! mb-3">{label}</p>
      <div className="dash-stat-value">
        {loading ? <span className="dash-skeleton inline-block align-middle h-7 w-[3ch] rounded" aria-hidden /> : value ?? '—'}
      </div>
      {hint && !loading && (
        <p className="terminal-text text-xs mt-2 truncate text-[var(--text-muted)]" title={hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xl font-medium tabular-nums leading-tight tracking-tight" style={{ color: tone }}>{value}</p>
      <p className="dash-section-label mt-1 text-[10px]! leading-tight">{label}</p>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: number | string }) {
  return (
    <li className="dash-kv">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </li>
  );
}

function BarSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-busy>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="dash-row space-y-2" aria-hidden>
          <div className="flex justify-between gap-3">
            <div className="dash-skeleton h-3.5 w-32 rounded" />
            <div className="dash-skeleton h-3.5 w-12 rounded" />
          </div>
          <div className="dash-skeleton h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
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
        <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
        <span className="terminal-text text-xs tabular-nums text-[var(--text-muted)]">
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
                  background: d.count > 0 ? 'var(--text-primary)' : 'var(--border-default)',
                  opacity: dim ? 0.3 : d.count > 0 ? 0.85 : 1,
                  borderRadius: '2px 2px 0 0',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5 terminal-text text-[10px] text-[var(--text-muted)]">
        <span>{series[0]?.day.slice(5)}</span>
        <span>{series[series.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
