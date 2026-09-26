'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { useTranslation, useAdminUsers } from '@/hooks';
import type { AdminUserSort, AdminUserFilter } from '@/lib/api';
import {
  AdminPanel, AdminError, Avatar, Pager, EmptyRow, LoadingRows,
  methodLabel, planBadgeClass, relative, shortDate,
} from '../shared';

const COLS = 'lg:grid-cols-[minmax(0,1fr)_5rem_13rem_6rem_7rem_1rem]';

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
    <AdminPanel title={t('admin', 'navUsers')} meta={isLoading ? '…' : `${total} ${t('admin', 'usersTotal')}`}>
      {/* Toolbar: where people get stuck, search, order */}
      <div className="dash-toolbar">
        <div className="dash-segmented max-w-full overflow-x-auto" role="group" aria-label={t('admin', 'navUsers')}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => { setFilter(f.key); setPage(1); }}
              aria-pressed={filter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto min-w-0">
          <label className="relative flex-1 sm:w-64 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin', 'searchPlaceholder')}
              className="input h-9 py-0! pl-9! text-[13px]!"
              aria-label={t('admin', 'searchPlaceholder')}
            />
          </label>
          {/* .select is width:100%, so the width lives on a wrapper */}
          <div className="w-40 shrink-0">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as AdminUserSort); setPage(1); }}
              className="select h-9 py-0! text-[13px]!"
              aria-label={t('admin', 'sortNewest')}
            >
              <option value="newest">{t('admin', 'sortNewest')}</option>
              <option value="last_seen">{t('admin', 'sortLastSeen')}</option>
              <option value="most_active">{t('admin', 'sortMostActive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Column labels (wide screens) */}
      <div className={`dash-rows-head hidden lg:grid ${COLS} gap-4`} aria-hidden>
        <span>{t('admin', 'colUser')}</span>
        <span>{t('admin', 'colPlan')}</span>
        <span>{t('admin', 'colUsage')}</span>
        <span className="text-right">{t('admin', 'colLastSeen')}</span>
        <span className="text-right">{t('admin', 'colJoined')}</span>
        <span />
      </div>

      {isLoading ? (
        <LoadingRows rows={8} />
      ) : users.length === 0 ? (
        <EmptyRow>{t('admin', 'usersEmpty')}</EmptyRow>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id} className="dash-row p-0!">
              <Link
                href={`/admin/users/${u.id}`}
                className={`dash-row grid grid-cols-[minmax(0,1fr)_auto_1rem] ${COLS} items-center gap-4`}
              >
                {/* Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">{u.name}</span>
                      {!u.emailVerified && (
                        <span className="badge badge-warning shrink-0 hidden sm:inline-flex">{t('admin', 'emailUnverified')}</span>
                      )}
                      {u.twoFactorEnabled && (
                        <span className="badge badge-neutral shrink-0 hidden sm:inline-flex" title={t('admin', 'twoFactorOn')}>2FA</span>
                      )}
                    </div>
                    <p className="terminal-text text-xs truncate text-[var(--text-muted)] mt-0.5">
                      {u.email}
                      <span className="hidden sm:inline"> · {methodLabel(t, u.signupMethod)}</span>
                    </p>
                  </div>
                </div>

                {/* Plan */}
                <div className="hidden lg:block">
                  <span className={planBadgeClass(u.plan)}>{u.plan ?? 'free'}</span>
                </div>

                {/* Usage: projects · deploys · servers · dbs */}
                <div className="hidden lg:block terminal-text text-xs tabular-nums text-[var(--text-secondary)]" title={t('admin', 'colUsage')}>
                  {u.projects} · {u.deployments}
                  {u.failedDeployments > 0 && (
                    <span className="text-[var(--status-error)]"> ({u.failedDeployments} {t('admin', 'failedShort')})</span>
                  )}
                  {' '}· {u.servers} · {u.databases}
                </div>

                {/* Last seen */}
                <div className="hidden lg:block text-xs text-right text-[var(--text-muted)]">
                  {relative(u.lastSeenAt, t)}
                </div>

                {/* Joined — the one date that also shows on small screens */}
                <div className="terminal-text text-xs text-right text-[var(--text-muted)] tabular-nums">
                  {shortDate(u.createdAt)}
                </div>

                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
    </AdminPanel>
  );
}
