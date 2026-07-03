'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  HeartPulse,
  Mail,
  MessageSquare,
  Webhook,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Activity, MessageCircle} from 'lucide-react';
import { useAlertsOverview, useTranslation, useBillingInfo } from '@/hooks';
import { STATUS_COLORS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';

type AlertsTab = 'channels' | 'health' | 'delivery';

const channelIcons: Record<string, typeof MessageSquare> = {
  slack: MessageSquare,
  email: Mail,
  webhook: Webhook,
  discord: MessageCircle,
};

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{
        background: ok ? STATUS_COLORS.success : STATUS_COLORS.error,
        boxShadow: `0 0 5px ${ok ? `${STATUS_COLORS.success}80` : `${STATUS_COLORS.error}80`}`,
      }}
    />
  );
}

export default function AlertsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useAlertsOverview();
  const { data: billing } = useBillingInfo();
  const [tab, setTab] = useState<AlertsTab>('channels');

  const healthPlanEnabled = billing?.features.healthChecks ?? false;

  const tabs: { id: AlertsTab; label: string }[] = [
    { id: 'channels', label: t('alerts', 'tabChannels') },
    { id: 'health', label: t('alerts', 'tabHealth') },
    { id: 'delivery', label: t('alerts', 'tabDelivery') },
  ];

  if (isLoading) {
    return (
      <div className="dash-page max-w-5xl space-y-6 pb-10">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const summary = data?.summary;
  const hasIssues =
    (summary?.failedDeliveries24h ?? 0) > 0 || (summary?.unhealthyProjects ?? 0) > 0;

  return (
    <div className="dash-page max-w-5xl pb-10 stagger-children min-w-0 overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
          {t('alerts', 'title')}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('alerts', 'description')}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: t('alerts', 'statChannels'),
              value: `${summary.activeChannels}/${summary.totalChannels}`,
              accent: STATUS_COLORS.cyan,
            },
            {
              label: t('alerts', 'statProjects'),
              value: String(summary.projectsWithChannels),
              accent: STATUS_COLORS.purple,
            },
            {
              label: t('alerts', 'statFailed24h'),
              value: String(summary.failedDeliveries24h),
              accent:
                summary.failedDeliveries24h > 0 ? STATUS_COLORS.error : STATUS_COLORS.neutral,
            },
            {
              label: t('alerts', 'statUnhealthy'),
              value: String(summary.unhealthyProjects),
              accent:
                summary.unhealthyProjects > 0 ? STATUS_COLORS.error : STATUS_COLORS.success,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <p
                className="stat-number"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: card.accent,
                  letterSpacing: '-0.03em',
                }}
              >
                {card.value}
              </p>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 6,
                }}
              >
                {card.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {hasIssues && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            background: `${STATUS_COLORS.error}10`,
            border: `1px solid ${STATUS_COLORS.error}30`,
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: STATUS_COLORS.error }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('alerts', 'issuesBanner')}
          </p>
        </div>
      )}

      <div
        className="flex gap-1 p-1 rounded-lg mb-5 w-fit"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{
              background: tab === item.id ? 'var(--bg-tertiary)' : 'transparent',
              color: tab === item.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: tab === item.id ? 500 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'channels' && (
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <h2 className="text-sm font-semibold">{t('alerts', 'channelsTitle')}</h2>
            <Link href="/dashboard/projects" className="btn btn-secondary text-xs py-1.5 justify-center w-full sm:w-auto shrink-0">
              <Plus className="w-3.5 h-3.5" />
              {t('alerts', 'addChannelHint')}
            </Link>
          </div>

          {!data?.channels.length ? (
            <EmptyBlock
              icon={BellRing}
              title={t('alerts', 'noChannelsTitle')}
              description={t('alerts', 'noChannelsDesc')}
              href="/dashboard/projects"
              cta={t('navigation', 'projects')}
            />
          ) : (
            <div className="space-y-2">
              {data.channels.map((ch) => {
                const Icon = channelIcons[ch.type] ?? Bell;
                return (
                  <Link
                    key={ch.id}
                    href={`/dashboard/projects/${ch.projectId}?tab=notifications`}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${STATUS_COLORS.cyan}14`, color: STATUS_COLORS.cyan }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ch.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {ch.projectName} · {t('notifications', ch.type as 'slack')} ·{' '}
                        {ch.events.length} {t('alerts', 'events')}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: ch.isActive ? `${STATUS_COLORS.success}18` : 'var(--bg-tertiary)',
                        color: ch.isActive ? STATUS_COLORS.success : 'var(--text-muted)',
                      }}
                    >
                      {ch.isActive ? t('notifications', 'active') : t('notifications', 'inactive')}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === 'health' && (
        <section>
          {!healthPlanEnabled && (
            <div
              className="rounded-xl px-4 py-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: `${STATUS_COLORS.orange}10`,
                border: `1px solid ${STATUS_COLORS.orange}35`,
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('alerts', 'healthPlanUpgrade')}
              </p>
              <Link href="/dashboard/billing/plans" className="text-xs shrink-0" style={{ color: 'var(--accent-cyan)' }}>
                {t('alerts', 'upgradePlan')}
                <ArrowUpRight className="w-3 h-3 inline ml-0.5" />
              </Link>
            </div>
          )}

          <h2 className="text-sm font-semibold mb-3">{t('alerts', 'healthTitle')}</h2>

          {!data?.healthChecks.length ? (
            <EmptyBlock
              icon={HeartPulse}
              title={t('alerts', 'noProjectsTitle')}
              description={t('alerts', 'noProjectsDesc')}
              href="/dashboard/projects/new"
              cta={t('navigation', 'newProject')}
            />
          ) : (
            <div className="space-y-2">
              {data.healthChecks.map((hc) => {
                const isUnhealthy =
                  hc.isActive &&
                  hc.lastStatus &&
                  (hc.lastStatus === 'unhealthy' || hc.lastStatus === 'timeout');
                const isHealthy = hc.isActive && hc.lastStatus === 'healthy';

                return (
                  <Link
                    key={hc.projectId}
                    href={`/dashboard/projects/${hc.projectId}?tab=settings`}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${isUnhealthy ? `${STATUS_COLORS.error}40` : 'var(--glass-border)'}`,
                    }}
                  >
                    <HeartPulse
                      className="w-4 h-4 shrink-0"
                      style={{
                        color: !hc.isActive
                          ? 'var(--text-muted)'
                          : isUnhealthy
                            ? STATUS_COLORS.error
                            : isHealthy
                              ? STATUS_COLORS.success
                              : '#f59e0b',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{hc.projectName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {hc.isActive
                          ? `${hc.endpoint} · ${hc.intervalSeconds}s`
                          : t('alerts', 'healthDisabled')}
                        {hc.lastCheckedAt && (
                          <> · {formatTimeAgo(hc.lastCheckedAt, t)}</>
                        )}
                      </p>
                    </div>
                    {hc.isActive && hc.lastStatus && (
                      <span
                        className={`badge text-xs shrink-0 ${
                          isHealthy ? 'badge-success' : isUnhealthy ? 'badge-error' : 'badge-warning'
                        }`}
                      >
                        {t(
                          'healthChecks',
                          hc.lastStatus === 'timeout'
                            ? 'statusTimeout'
                            : (hc.lastStatus as 'healthy')
                        )}
                      </span>
                    )}
                    {!hc.isActive && (
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {t('alerts', 'notConfigured')}
                      </span>
                    )}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === 'delivery' && (
        <section>
          <h2 className="text-sm font-semibold mb-3">{t('alerts', 'deliveryTitle')}</h2>

          {!data?.recentLogs.length ? (
            <EmptyBlock
              icon={Activity}
              title={t('alerts', 'noLogsTitle')}
              description={t('alerts', 'noLogsDesc')}
            />
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--glass-border)' }}
            >
              {data.recentLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center gap-x-3 px-4 py-3 min-w-0"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderTop: idx > 0 ? '1px solid var(--glass-border)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <StatusDot ok={log.status === 'sent'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {log.projectName} — {log.channelName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {log.eventType}
                        {log.errorMessage ? ` · ${log.errorMessage}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {log.status === 'sent' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.success }} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.error }} />
                    )}
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeAgo(log.sentAt, t)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <Icon className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <p className="font-semibold mb-1">{title}</p>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {href && cta && (
        <Link href={href} className="btn btn-primary">
          {cta}
        </Link>
      )}
    </div>
  );
}
