'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Mail,
  MessageSquare,
  Webhook,
  XCircle,
} from 'lucide-react';
import { useAlertsOverview, useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import { formatTimeAgo } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { OrgHealthCheckRow, OrgNotificationLog } from '@/lib/api/services/alerts.service';

const channelIcons = {
  slack: MessageSquare,
  email: Mail,
  webhook: Webhook,
} as const;

function isUnhealthy(hc: OrgHealthCheckRow): boolean {
  return (
    hc.isActive &&
    (hc.lastStatus === 'unhealthy' || hc.lastStatus === 'timeout') &&
    hc.consecutiveFailures > 0
  );
}

export function HeaderAlertsMenu() {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = useAlertsOverview();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const summary = data?.summary;
  const issueCount =
    (summary?.failedDeliveries24h ?? 0) + (summary?.unhealthyProjects ?? 0);
  const failedLogs =
    data?.recentLogs.filter((log) => log.status !== 'sent').slice(0, 4) ?? [];
  const unhealthyApps = data?.healthChecks.filter(isUnhealthy).slice(0, 3) ?? [];
  const hasChannels = (summary?.totalChannels ?? 0) > 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          open
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-overlay-md)]',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('header', 'alertsMenu')}
      >
        {issueCount > 0 ? (
          <BellRing className="w-4 h-4" style={{ color: STATUS_COLORS.error }} />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {issueCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full flex items-center justify-center text-[10px] font-semibold tabular-nums text-[var(--on-accent)]"
            style={{ background: STATUS_COLORS.error }}
          >
            {issueCount > 9 ? '9+' : issueCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          role="dialog"
          aria-label={t('header', 'alertsMenu')}
        >
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {t('header', 'alertsMenu')}
              </p>
              {isFetching && !isLoading && (
                <p className="text-[11px] text-[var(--text-muted)]">…</p>
              )}
            </div>
            <Link
              href="/dashboard/alerts"
              onClick={() => setOpen(false)}
              className="text-xs font-medium dash-link flex items-center gap-0.5 shrink-0"
            >
              {t('header', 'alertsViewAll')}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
                {t('header', 'alertsLoading')}
              </p>
            ) : (
              <>
                {summary && issueCount === 0 && (
                  <div className="px-4 py-3 flex items-start gap-2.5 border-b border-[var(--border-subtle)]">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: STATUS_COLORS.success }}
                    />
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {t('header', 'alertsAllClear')}
                    </p>
                  </div>
                )}

                {summary && issueCount > 0 && (
                  <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-[var(--border-subtle)]">
                    {(summary.failedDeliveries24h ?? 0) > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                        style={{
                          background: `${STATUS_COLORS.error}18`,
                          color: STATUS_COLORS.error,
                        }}
                      >
                        <XCircle className="w-3 h-3" />
                        {formatMessage(t('header', 'alertsFailedDeliveries'), {
                          count: summary.failedDeliveries24h,
                        })}
                      </span>
                    )}
                    {(summary.unhealthyProjects ?? 0) > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                        style={{
                          background: `${STATUS_COLORS.warning}18`,
                          color: STATUS_COLORS.warning,
                        }}
                      >
                        <HeartPulse className="w-3 h-3" />
                        {formatMessage(t('header', 'alertsUnhealthyApps'), {
                          count: summary.unhealthyProjects,
                        })}
                      </span>
                    )}
                  </div>
                )}

                {!hasChannels && (
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      {t('header', 'alertsNoChannels')}
                    </p>
                    <Link
                      href="/dashboard/projects"
                      onClick={() => setOpen(false)}
                      className="text-xs font-medium dash-link"
                    >
                      {t('header', 'alertsSetupChannel')}
                    </Link>
                  </div>
                )}

                {unhealthyApps.length > 0 && (
                  <section className="px-2 py-2">
                    <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('alerts', 'statUnhealthy')}
                    </p>
                    {unhealthyApps.map((hc) => (
                      <Link
                        key={hc.projectId}
                        href={`/dashboard/projects/${hc.projectId}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--hover-overlay-md)] transition-colors min-w-0"
                      >
                        <HeartPulse
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: STATUS_COLORS.warning }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{hc.projectName}</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {hc.endpoint}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </section>
                )}

                {failedLogs.length > 0 && (
                  <section className="px-2 py-2 border-t border-[var(--border-subtle)]">
                    <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('header', 'alertsRecentFailures')}
                    </p>
                    {failedLogs.map((log) => (
                      <AlertLogRow key={log.id} log={log} onNavigate={() => setOpen(false)} t={t} />
                    ))}
                  </section>
                )}

                {hasChannels &&
                  issueCount === 0 &&
                  failedLogs.length === 0 &&
                  unhealthyApps.length === 0 && (
                    <p className="px-4 py-4 text-xs text-center text-[var(--text-muted)]">
                      {summary?.activeChannels ?? 0}/{summary?.totalChannels ?? 0}{' '}
                      {t('alerts', 'statChannels').toLowerCase()}
                    </p>
                  )}
              </>
            )}
          </div>

          <div className="px-3 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <Link
              href="/dashboard/alerts"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--hover-overlay-md)] transition-colors"
            >
              {t('header', 'alertsViewAll')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertLogRow({
  log,
  onNavigate,
  t,
}: {
  log: OrgNotificationLog;
  onNavigate: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const Icon = channelIcons[log.channelType as keyof typeof channelIcons] ?? MessageSquare;

  return (
    <Link
      href={`/dashboard/projects/${log.projectId}?tab=notifications`}
      onClick={onNavigate}
      className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--hover-overlay-md)] transition-colors min-w-0"
    >
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--text-muted)]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {log.projectName}
          <span className="text-[var(--text-muted)] font-normal"> · {log.channelName}</span>
        </p>
        <p className="text-[11px] text-[var(--text-muted)] truncate">
          {log.eventType}
          {log.errorMessage ? ` — ${log.errorMessage}` : ''}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          {formatTimeAgo(log.sentAt, t)}
        </p>
      </div>
      <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.error }} />
    </Link>
  );
}
