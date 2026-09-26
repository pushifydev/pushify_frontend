'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation, useAdminActivity } from '@/hooks';
import { formatShortDate } from '@/lib/formatters';
import { AdminPanel, AdminError, Pager, EmptyRow, LoadingRows, relative } from '../shared';

const PAGE_SIZE = 50;

export default function AdminActivityPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminActivity(page, PAGE_SIZE);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const items = data?.items ?? [];

  return (
    <AdminPanel title={t('admin', 'activityTitle')} meta={isLoading ? '…' : data?.total}>
      {isLoading ? (
        <LoadingRows rows={8} />
      ) : items.length === 0 ? (
        <EmptyRow>{t('admin', 'activityEmpty')}</EmptyRow>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className="dash-row flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] break-words">{item.description}</p>
                <p className="terminal-text text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[var(--text-muted)] min-w-0">
                  {item.user ? (
                    <Link href={`/admin/users/${item.user.id}`} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-2 truncate">
                      {item.user.email}
                    </Link>
                  ) : (
                    <span>{t('admin', 'unknownUser')}</span>
                  )}
                  {item.organization && <span className="truncate">{item.organization.name}</span>}
                  {item.project && <span className="truncate">{item.project.name}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 sm:flex-col sm:items-end sm:gap-1.5">
                <span className="badge badge-neutral normal-case!">{item.action}</span>
                <time
                  dateTime={item.createdAt}
                  className="text-xs text-[var(--text-muted)] tabular-nums"
                  title={formatShortDate(item.createdAt)}
                >
                  {relative(item.createdAt, t)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
    </AdminPanel>
  );
}
