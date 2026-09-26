'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation, useAdminAuthEvents } from '@/hooks';
import { formatShortDate } from '@/lib/formatters';
import {
  AdminPanel, AdminError, Pager, EmptyRow, LoadingRows,
  authEventLabel, authEventDot, methodLabel, describeUserAgent, relative,
} from '../shared';

const PAGE_SIZE = 50;

export default function AdminSigninsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminAuthEvents(page, PAGE_SIZE);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const items = data?.items ?? [];

  return (
    <AdminPanel title={t('admin', 'signinsTitle')} meta={isLoading ? '…' : data?.total}>
      {isLoading ? (
        <LoadingRows rows={8} />
      ) : items.length === 0 ? (
        <EmptyRow>{t('admin', 'signinsEmpty')}</EmptyRow>
      ) : (
        <ul>
          {items.map((item) => {
            const device = describeUserAgent(item.userAgent);
            return (
              <li key={item.id} className="dash-row flex items-start gap-3">
                <span className={`dash-status-dot mt-[7px] ${authEventDot(item.event)}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    <span className="font-medium">{authEventLabel(t, item.event)}</span>
                    <span className="text-[13px] ml-2 text-[var(--text-muted)]">
                      {t('admin', 'via')} {methodLabel(t, item.method)}
                    </span>
                  </p>
                  <p className="terminal-text text-xs mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[var(--text-muted)] min-w-0">
                    {item.user ? (
                      <Link href={`/admin/users/${item.user.id}`} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-2 truncate">
                        {item.user.email}
                      </Link>
                    ) : (
                      <span>{t('admin', 'unknownUser')}</span>
                    )}
                    {item.ipAddress && <span>{item.ipAddress}</span>}
                    {device && <span>{device}</span>}
                  </p>
                </div>
                <time
                  dateTime={item.createdAt}
                  className="text-xs shrink-0 text-[var(--text-muted)] tabular-nums"
                  title={formatShortDate(item.createdAt)}
                >
                  {relative(item.createdAt, t)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
    </AdminPanel>
  );
}
