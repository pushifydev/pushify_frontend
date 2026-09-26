'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, ChevronRight, Plus } from 'lucide-react';
import { useAlertsOverview, useTranslation, useBillingInfo } from '@/hooks';
import { formatTimeAgo } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader, MetaLabel, Tabs, TabPanel, RowList } from '@/components/dashboard/PageKit';

type AlertsTab = 'channels' | 'health' | 'delivery';

export default function AlertsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useAlertsOverview();
  const { data: billing } = useBillingInfo();
  const [tab, setTab] = useState<AlertsTab>('channels');

  const healthPlanEnabled = billing?.features.healthChecks ?? false;

  const tabs: { id: AlertsTab; label: string; count?: number }[] = [
    { id: 'channels', label: t('alerts', 'tabChannels'), count: data?.channels.length },
    { id: 'health', label: t('alerts', 'tabHealth'), count: data?.healthChecks.length },
    { id: 'delivery', label: t('alerts', 'tabDelivery'), count: data?.recentLogs.length },
  ];

  if (isLoading) {
    return (
      <div className="dash-page max-w-5xl min-w-0 space-y-6 pb-10">
        <PageHeader title={t('alerts', 'title')} description={t('alerts', 'description')} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-sm rounded" />
        <Skeleton className="h-64 rounded-[14px]" />
      </div>
    );
  }

  const summary = data?.summary;
  const hasIssues =
    (summary?.failedDeliveries24h ?? 0) > 0 || (summary?.unhealthyProjects ?? 0) > 0;

  return (
    <div className="dash-page max-w-5xl min-w-0 space-y-6 pb-10 animate-slide-in overflow-x-hidden">
      <PageHeader
        title={t('alerts', 'title')}
        description={t('alerts', 'description')}
        badge={
          summary ? (
            <span className={`badge shrink-0 ${hasIssues ? 'badge-error' : 'badge-success'}`}>
              {hasIssues ? t('monitoring', 'unhealthy') : t('monitoring', 'healthy')}
            </span>
          ) : undefined
        }
        meta={
          summary
            ? [
                <MetaLabel key="ch">
                  {summary.activeChannels}/{summary.totalChannels} {t('alerts', 'statChannels')}
                </MetaLabel>,
                <MetaLabel key="pr">
                  {summary.projectsWithChannels} {t('alerts', 'statProjects')}
                </MetaLabel>,
              ]
            : undefined
        }
        actions={
          <Link href="/dashboard/projects" className="btn btn-primary justify-center">
            <Plus className="w-4 h-4" />
            {t('alerts', 'addChannelHint')}
          </Link>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: t('alerts', 'statChannels'), value: `${summary.activeChannels}/${summary.totalChannels}`, bad: false },
            { label: t('alerts', 'statProjects'), value: String(summary.projectsWithChannels), bad: false },
            { label: t('alerts', 'statFailed24h'), value: String(summary.failedDeliveries24h), bad: summary.failedDeliveries24h > 0 },
            { label: t('alerts', 'statUnhealthy'), value: String(summary.unhealthyProjects), bad: summary.unhealthyProjects > 0 },
          ].map((card) => (
            <div key={card.label} className="dash-stat-card p-4 min-w-0">
              <p
                className="dash-stat-value text-[1.5rem]!"
                style={card.bad ? { color: 'var(--status-error)' } : undefined}
              >
                {card.value}
              </p>
              <p className="dash-stat-label truncate">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {hasIssues && (
        <div className="dash-callout dash-callout-attention items-center" role="status">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--status-error)]" aria-hidden />
          <p className="text-[13px] text-[var(--text-secondary)]">{t('alerts', 'issuesBanner')}</p>
        </div>
      )}

      <Tabs items={tabs} active={tab} onChange={setTab} label={t('alerts', 'title')} idPrefix="alerts-tab" />

      <TabPanel idPrefix="alerts-tab" active={tab}>
        {tab === 'channels' &&
          (!data?.channels.length ? (
            <EmptyState
              label={t('navigation', 'alerts')}
              title={t('alerts', 'noChannelsTitle')}
              description={t('alerts', 'noChannelsDesc')}
              action={{ label: t('navigation', 'projects'), href: '/dashboard/projects' }}
            />
          ) : (
            <RowList label={t('alerts', 'channelsTitle')}>
              {data.channels.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/dashboard/projects/${ch.projectId}?tab=notifications`}
                  className="dash-row group flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
                >
                  <span className={`dash-status-dot ${ch.isActive ? 'is-success' : ''}`} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ch.name}</p>
                    <p className="terminal-text text-[11px] mt-0.5 text-[var(--text-muted)] truncate">
                      {ch.projectName} · {ch.events.length} {t('alerts', 'events')}
                    </p>
                  </div>
                  <span className="dash-section-label shrink-0 hidden sm:inline">
                    {t('notifications', ch.type as 'slack')}
                  </span>
                  <span className={`badge shrink-0 ${ch.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {ch.isActive ? t('notifications', 'active') : t('notifications', 'inactive')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0" aria-hidden />
                </Link>
              ))}
            </RowList>
          ))}

        {tab === 'health' && (
          <div className="space-y-4">
            {!healthPlanEnabled && (
              <div className="dash-callout dash-callout-attention flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-[var(--text-secondary)]">{t('alerts', 'healthPlanUpgrade')}</p>
                <Link href="/dashboard/billing/plans" className="btn btn-secondary btn-sm shrink-0">
                  {t('alerts', 'upgradePlan')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {!data?.healthChecks.length ? (
              <EmptyState
                label={t('navigation', 'alerts')}
                title={t('alerts', 'noProjectsTitle')}
                description={t('alerts', 'noProjectsDesc')}
                action={{ label: t('navigation', 'newProject'), href: '/dashboard/projects/new' }}
              />
            ) : (
              <RowList label={t('alerts', 'healthTitle')}>
                {data.healthChecks.map((hc) => {
                  const isUnhealthy =
                    hc.isActive &&
                    hc.lastStatus &&
                    (hc.lastStatus === 'unhealthy' || hc.lastStatus === 'timeout');
                  const isHealthy = hc.isActive && hc.lastStatus === 'healthy';
                  const dot = !hc.isActive ? '' : isUnhealthy ? 'is-error' : isHealthy ? 'is-success' : 'is-warning';

                  return (
                    <Link
                      key={hc.projectId}
                      href={`/dashboard/projects/${hc.projectId}?tab=settings`}
                      className="dash-row group flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
                    >
                      <span className={`dash-status-dot ${dot}`} aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{hc.projectName}</p>
                        <p className="terminal-text text-[11px] mt-0.5 text-[var(--text-muted)] truncate">
                          {hc.isActive
                            ? `${hc.endpoint} · ${hc.intervalSeconds}s`
                            : t('alerts', 'healthDisabled')}
                          {hc.lastCheckedAt && <> · {formatTimeAgo(hc.lastCheckedAt, t)}</>}
                        </p>
                      </div>
                      {hc.isActive && hc.lastStatus && (
                        <span
                          className={`badge shrink-0 ${
                            isHealthy ? 'badge-success' : isUnhealthy ? 'badge-error' : 'badge-warning'
                          }`}
                        >
                          {t(
                            'healthChecks',
                            hc.lastStatus === 'timeout' ? 'statusTimeout' : (hc.lastStatus as 'healthy')
                          )}
                        </span>
                      )}
                      {!hc.isActive && (
                        <span className="dash-section-label shrink-0">{t('alerts', 'notConfigured')}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0" aria-hidden />
                    </Link>
                  );
                })}
              </RowList>
            )}
          </div>
        )}

        {tab === 'delivery' &&
          (!data?.recentLogs.length ? (
            <EmptyState
              label={t('navigation', 'alerts')}
              title={t('alerts', 'noLogsTitle')}
              description={t('alerts', 'noLogsDesc')}
            />
          ) : (
            <RowList label={t('alerts', 'deliveryTitle')}>
              {data.recentLogs.map((log) => {
                const ok = log.status === 'sent';
                return (
                  <div key={log.id} className="dash-row flex items-center gap-3 min-w-0">
                    <span className={`dash-status-dot ${ok ? 'is-success' : 'is-error'}`} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {log.projectName} <span className="text-[var(--text-muted)]">—</span> {log.channelName}
                      </p>
                      <p className="terminal-text text-[11px] mt-0.5 truncate text-[var(--text-muted)]">
                        {log.eventType}
                        {log.errorMessage ? (
                          <span className="text-[var(--status-error)]"> · {log.errorMessage}</span>
                        ) : null}
                      </p>
                    </div>
                    <span className={`badge shrink-0 hidden sm:inline-flex ${ok ? 'badge-success' : 'badge-error'}`}>
                      {log.status}
                    </span>
                    <span className="terminal-text text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums">
                      {formatTimeAgo(log.sentAt, t)}
                    </span>
                  </div>
                );
              })}
            </RowList>
          ))}
      </TabPanel>
    </div>
  );
}
