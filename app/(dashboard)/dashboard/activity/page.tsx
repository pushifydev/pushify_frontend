'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  GitBranch,
  Rocket,
  Settings,
  Key,
  Globe,
  Users,
  Bell,
  Heart,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { formatTimeAgo, formatShortDate } from '@/lib/formatters';
import { activityService, type ActivityLogsResponse } from '@/lib/api/services/activity.service';
import type { ActivityLog, ActivityAction } from '@/lib/api/types';
import { STATUS_COLORS } from '@/lib/constants';
import { SkeletonActivityRow } from '@/components/Skeleton';

const ACTION_CATEGORIES = {
  project:      ['project.created', 'project.updated', 'project.deleted', 'project.paused', 'project.resumed'],
  deployment:   ['deployment.created', 'deployment.cancelled', 'deployment.redeployed', 'deployment.rolledback', 'deployment.succeeded', 'deployment.failed'],
  envvar:       ['envvar.created', 'envvar.updated', 'envvar.deleted'],
  domain:       ['domain.added', 'domain.removed', 'domain.verified', 'domain.set_primary'],
  apikey:       ['apikey.created', 'apikey.revoked'],
  member:       ['member.invited', 'member.removed', 'member.role_changed'],
  settings:     ['settings.updated', 'webhook.regenerated'],
  notification: ['notification.channel_created', 'notification.channel_updated', 'notification.channel_deleted'],
  healthcheck:  ['healthcheck.enabled', 'healthcheck.disabled', 'healthcheck.updated'],
};

const getActionIcon = (action: string) => {
  if (action.startsWith('project.'))     return <GitBranch className="w-3.5 h-3.5" />;
  if (action.startsWith('deployment.'))  return <Rocket    className="w-3.5 h-3.5" />;
  if (action.startsWith('envvar.'))      return <Settings  className="w-3.5 h-3.5" />;
  if (action.startsWith('domain.'))      return <Globe     className="w-3.5 h-3.5" />;
  if (action.startsWith('apikey.'))      return <Key       className="w-3.5 h-3.5" />;
  if (action.startsWith('member.'))      return <Users     className="w-3.5 h-3.5" />;
  if (action.startsWith('notification.')) return <Bell     className="w-3.5 h-3.5" />;
  if (action.startsWith('healthcheck.')) return <Heart     className="w-3.5 h-3.5" />;
  if (action.startsWith('settings.') || action.startsWith('webhook.')) return <Settings className="w-3.5 h-3.5" />;
  return <Activity className="w-3.5 h-3.5" />;
};

const getActionAccent = (action: string): string => {
  if (action.includes('created') || action.includes('added') || action.includes('enabled') || action.includes('succeeded') || action.includes('verified')) {
    return STATUS_COLORS.success;
  }
  if (action.includes('deleted') || action.includes('removed') || action.includes('revoked') || action.includes('failed') || action.includes('disabled')) {
    return STATUS_COLORS.error;
  }
  if (action.includes('updated') || action.includes('changed') || action.includes('redeployed') || action.includes('rolledback') || action.includes('cancelled')) {
    return STATUS_COLORS.warning;
  }
  return STATUS_COLORS.neutral;
};

export default function ActivityPage() {
  const { t } = useTranslation();
  const [logs, setLogs]                       = useState<ActivityLog[]>([]);
  const [total, setTotal]                     = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [page, setPage]                       = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const actions = selectedCategory
        ? (ACTION_CATEGORIES[selectedCategory as keyof typeof ACTION_CATEGORIES] as ActivityAction[])
        : undefined;

      const response = await activityService.getLogs({
        limit,
        offset: (page - 1) * limit,
        actions,
      });

      if (response.data) {
        setLogs(response.data.logs);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const categories = useMemo(
    () => [
      { key: null as string | null, label: t('activityLog', 'filterAll'), icon: <Activity className="w-3.5 h-3.5" /> },
      { key: 'project' as const, label: t('activityLog', 'filterProjects'), icon: <GitBranch className="w-3.5 h-3.5" /> },
      { key: 'deployment' as const, label: t('activityLog', 'filterDeployments'), icon: <Rocket className="w-3.5 h-3.5" /> },
      { key: 'envvar' as const, label: t('activityLog', 'filterEnvVars'), icon: <Settings className="w-3.5 h-3.5" /> },
      { key: 'domain' as const, label: t('activityLog', 'filterDomains'), icon: <Globe className="w-3.5 h-3.5" /> },
      { key: 'apikey' as const, label: t('activityLog', 'filterApiKeys'), icon: <Key className="w-3.5 h-3.5" /> },
    ],
    [t],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('navigation', 'activity')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('activityLog', 'subtitle')}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="btn btn-primary shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('common', 'refresh')}
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <button
              key={cat.key ?? 'all'}
              onClick={() => { setSelectedCategory(cat.key); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--dash-accent-bg)'            : 'var(--bg-secondary)',
                color:      active ? 'var(--accent-cyan)'              : 'var(--text-secondary)',
                border:     active ? '1px solid var(--dash-accent-border-strong)' : '1px solid var(--glass-border)',
              }}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Log list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        {isLoading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--glass-divider)',
                }}
              >
                <SkeletonActivityRow />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-14 text-center">
            <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {t('activityLog', 'emptyTitle')}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('activityLog', 'emptyDescription')}
            </p>
          </div>
        ) : (
          <div>
            {logs.map((log, idx) => {
              const accent = getActionAccent(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--glass-divider)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {log.user && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {log.user.avatarUrl ? (
                            <img src={log.user.avatarUrl} alt={log.user.name || log.user.email} className="w-3.5 h-3.5 rounded-full" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {log.user.name || log.user.email}
                        </span>
                      )}
                      {log.project && (
                        <Link
                          href={`/dashboard/projects/${log.project.id}`}
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                        >
                          <GitBranch className="w-3 h-3" />
                          {log.project.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Time + action */}
                  <div className="text-right shrink-0">
                    <p
                      className="text-xs mb-1"
                      style={{ color: 'var(--text-muted)' }}
                      title={formatShortDate(log.createdAt)}
                    >
                      {formatTimeAgo(log.createdAt)}
                    </p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {log.action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-3"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('activityLog', 'paginationShowing')
                .replace('{start}', String((page - 1) * limit + 1))
                .replace('{end}', String(Math.min(page * limit, total)))
                .replace('{total}', String(total))}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
                onMouseEnter={e => !page || page > 1 ? (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' : null}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs px-3" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
                onMouseEnter={e => page < totalPages ? (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' : null}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
