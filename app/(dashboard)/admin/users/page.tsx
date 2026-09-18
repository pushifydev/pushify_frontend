'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Users, ShieldCheck, MailCheck } from 'lucide-react';
import { useTranslation, useAdminUsers } from '@/hooks';
import type { AdminUserSort, AdminUserFilter } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { SkeletonActivityRow } from '@/components/Skeleton';
import {
  AdminPanel, AdminError, Avatar, Pager, EmptyRow,
  rowBorder, hoverRow, methodLabel, planBadgeClass, relative, shortDate,
} from '../shared';

const PAGE_SIZE = 50;

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<AdminUserSort>('newest');
  const [filter, setFilter] = useState<AdminUserFilter>('all');
  const [page, setPage] = useState(1);

  // Type-ahead without a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  const { data, isLoading, error, refetch } = useAdminUsers({ search: query, sort, filter, page, pageSize: PAGE_SIZE });

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  // Where people get stuck — each one is a list you can act on.
  const filters: { key: AdminUserFilter; label: string }[] = [
    { key: 'all', label: t('admin', 'filterAll') },
    { key: 'unverified', label: t('admin', 'filterUnverified') },
    { key: 'no_project', label: t('admin', 'filterNoProject') },
    { key: 'failing', label: t('admin', 'filterFailing') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin', 'searchPlaceholder')}
            className="input pl-9!"
            aria-label={t('admin', 'searchPlaceholder')}
          />
        </label>
        {/* .input is width:100%, so the width lives on a wrapper */}
        <div className="sm:w-44 shrink-0">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as AdminUserSort); setPage(1); }}
            className="input"
            aria-label={t('admin', 'sortNewest')}
          >
            <option value="newest">{t('admin', 'sortNewest')}</option>
            <option value="last_seen">{t('admin', 'sortLastSeen')}</option>
            <option value="most_active">{t('admin', 'sortMostActive')}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t('admin', 'navUsers')}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => { setFilter(f.key); setPage(1); }}
              aria-pressed={active}
              className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--dash-accent-bg)' : 'transparent',
                color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--dash-accent-border-strong)' : '1px solid var(--glass-border)',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <AdminPanel
        title={t('admin', 'navUsers')}
        icon={<Users className="w-4 h-4" />}
        meta={isLoading ? '…' : `${total} ${t('admin', 'usersTotal')}`}
      >
        {/* Column labels (wide screens) */}
        <div
          className="hidden lg:grid grid-cols-[1fr_5rem_15rem_6rem_7rem_1rem] gap-4 px-5 py-2 dash-section-label"
          style={{ borderBottom: '1px solid var(--glass-divider)' }}
        >
          <span>{t('admin', 'colUser')}</span>
          <span>{t('admin', 'colPlan')}</span>
          <span>{t('admin', 'colUsage')}</span>
          <span className="text-right">{t('admin', 'colLastSeen')}</span>
          <span className="text-right">{t('admin', 'colJoined')}</span>
          <span />
        </div>

        {isLoading ? (
          <div>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={rowBorder(i)}><SkeletonActivityRow /></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyRow>{t('admin', 'usersEmpty')}</EmptyRow>
        ) : (
          <ul>
            {users.map((u, idx) => (
              <li key={u.id} style={rowBorder(idx)}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="grid grid-cols-[1fr_auto_1rem] lg:grid-cols-[1fr_5rem_15rem_6rem_7rem_1rem] items-center gap-4 px-5 py-3 transition-colors"
                  {...hoverRow}
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium truncate">{u.name}</span>
                        {u.emailVerified && (
                          <MailCheck className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.success }} aria-label={t('admin', 'emailVerified')} />
                        )}
                        {u.twoFactorEnabled && (
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: STATUS_COLORS.success }} aria-label={t('admin', 'twoFactorOn')} />
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {u.email}
                        <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-public-sans), system-ui' }}>
                          {' '}· {methodLabel(t, u.signupMethod)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="hidden lg:block">
                    <span className={planBadgeClass(u.plan)}>{u.plan ?? 'free'}</span>
                  </div>

                  {/* Usage: projects · deploys · servers · dbs */}
                  <div className="hidden lg:block text-xs tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }} title={t('admin', 'colUsage')}>
                    {u.projects} · {u.deployments}
                    {u.failedDeployments > 0 && (
                      <span style={{ color: STATUS_COLORS.error }}> ({u.failedDeployments} {t('admin', 'failedShort')})</span>
                    )}
                    {' '}· {u.servers} · {u.databases}
                  </div>

                  {/* Last seen */}
                  <div className="hidden lg:block text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                    {relative(u.lastSeenAt, t)}
                  </div>

                  {/* Joined — the one date that also shows on small screens */}
                  <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                    {shortDate(u.createdAt)}
                  </div>

                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
      </AdminPanel>
    </div>
  );
}
