'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { GitBranch, ChevronLeft, ChevronRight, RefreshCw, User, Download } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { formatTimeAgo, formatShortDate } from '@/lib/formatters';
import { activityService } from '@/lib/api/services/activity.service';
import type { ActivityLog, ActivityAction } from '@/lib/api/types';
import { SkeletonActivityRow } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader, MetaLabel } from '@/components/dashboard/PageKit';

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

export default function ActivityPage() {
  const { t, locale } = useTranslation();
  const [logs, setLogs]                       = useState<ActivityLog[]>([]);
  const [total, setTotal]                     = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [page, setPage]                       = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 20;

  /** The whole filtered log as a file — what a compliance review asks for. */
  const downloadCsv = async () => {
    setIsExporting(true);
    const actions = selectedCategory
      ? (ACTION_CATEGORIES[selectedCategory as keyof typeof ACTION_CATEGORIES] as ActivityAction[])
      : undefined;
    const result = await activityService.exportLogs({ actions });
    setIsExporting(false);
    if (!result.data) return;
    const url = URL.createObjectURL(result.data.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.data.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

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
      { key: null as string | null, label: t('activityLog', 'filterAll') },
      { key: 'project' as const, label: t('activityLog', 'filterProjects') },
      { key: 'deployment' as const, label: t('activityLog', 'filterDeployments') },
      { key: 'envvar' as const, label: t('activityLog', 'filterEnvVars') },
      { key: 'domain' as const, label: t('activityLog', 'filterDomains') },
      { key: 'apikey' as const, label: t('activityLog', 'filterApiKeys') },
    ],
    [t],
  );

  const filterLabel = categories.find((c) => c.key === selectedCategory)?.label ?? '';

  return (
    <div className="dash-page max-w-5xl min-w-0 space-y-6 pb-10 animate-slide-in">
      <PageHeader
        title={t('navigation', 'activity')}
        description={t('activityLog', 'subtitle')}
        meta={[
          !isLoading ? <MetaLabel key="total">{total} {locale === 'tr' ? 'kayıt' : total === 1 ? 'event' : 'events'}</MetaLabel> : null,
          selectedCategory ? <MetaLabel key="filter">{filterLabel}</MetaLabel> : null,
        ]}
        actions={
          <>
            <button type="button" onClick={downloadCsv} disabled={isExporting} className="btn btn-secondary justify-center">
              <Download className="w-4 h-4" />
              {isExporting ? t('common', 'loading') : t('activityLog', 'exportCsv')}
            </button>
            <button type="button" onClick={fetchLogs} disabled={isLoading} className="btn btn-primary justify-center">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common', 'refresh')}
            </button>
          </>
        }
      />

      <section className="dash-rows" aria-busy={isLoading}>
        {/* Category filter */}
        <div className="dash-toolbar overflow-x-auto flex-nowrap">
          <div className="dash-segmented" role="group" aria-label={locale === 'tr' ? 'Kategori' : 'Category'}>
            {categories.map((cat) => (
              <button
                key={cat.key ?? 'all'}
                type="button"
                aria-pressed={selectedCategory === cat.key}
                onClick={() => { setSelectedCategory(cat.key); setPage(1); }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className={i === 0 ? '' : 'border-t border-[var(--border-subtle)]'}>
              <SkeletonActivityRow />
            </div>
          ))
        ) : logs.length === 0 ? (
          <EmptyState
            variant="bare"
            label={t('navigation', 'activity')}
            title={t('activityLog', 'emptyTitle')}
            description={t('activityLog', 'emptyDescription')}
          />
        ) : (
          <ol className="min-w-0">
            {logs.map((log, idx) => {
              const failed = log.action.includes('failed');
              return (
                <li
                  key={log.id}
                  className={`dash-row flex items-start gap-3 hover:bg-[var(--hover-overlay)] transition-colors ${
                    idx === 0 ? '' : 'border-t border-[var(--border-subtle)]'
                  }`}
                >
                  <span className={`dash-status-dot mt-[7px] ${failed ? 'is-error' : ''}`} aria-hidden />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] break-words">{log.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="terminal-text text-[11px] text-[var(--text-secondary)]">{log.action}</span>
                      {log.user && (
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          {log.user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={log.user.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full" />
                          ) : (
                            <User className="w-3 h-3" aria-hidden />
                          )}
                          <span className="truncate">{log.user.name || log.user.email}</span>
                        </span>
                      )}
                      {log.project && (
                        <Link
                          href={`/dashboard/projects/${log.project.id}`}
                          className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                        >
                          <GitBranch className="w-3 h-3" aria-hidden />
                          {log.project.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  <time
                    dateTime={log.createdAt}
                    title={formatShortDate(log.createdAt)}
                    className="terminal-text text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums mt-0.5"
                  >
                    {formatTimeAgo(log.createdAt, t)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-t border-[var(--border-subtle)]">
            <p className="terminal-text text-[11px] text-[var(--text-muted)]">
              {t('activityLog', 'paginationShowing')
                .replace('{start}', String((page - 1) * limit + 1))
                .replace('{end}', String(Math.min(page * limit, total)))
                .replace('{total}', String(total))}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={locale === 'tr' ? 'Önceki sayfa' : 'Previous page'}
                className="dash-icon-action disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="terminal-text text-xs px-2 text-[var(--text-secondary)] tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label={locale === 'tr' ? 'Sonraki sayfa' : 'Next page'}
                className="dash-icon-action disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
