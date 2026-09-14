'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { useTranslation, useAdminAuthEvents } from '@/hooks';
import { SkeletonActivityRow } from '@/components/Skeleton';
import { formatShortDate } from '@/lib/formatters';
import {
  AdminPanel, AdminError, Pager, EmptyRow,
  rowBorder, authEventLabel, authEventColor, methodLabel, describeUserAgent, relative,
} from '../shared';

const PAGE_SIZE = 50;

export default function AdminSigninsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminAuthEvents(page, PAGE_SIZE);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const items = data?.items ?? [];

  return (
    <AdminPanel
      title={t('admin', 'signinsTitle')}
      icon={<KeyRound className="w-4 h-4" />}
      meta={isLoading ? '…' : data?.total}
    >
      {isLoading ? (
        <div>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={rowBorder(i)}><SkeletonActivityRow /></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyRow>{t('admin', 'signinsEmpty')}</EmptyRow>
      ) : (
        <ul>
          {items.map((item, idx) => {
            const color = authEventColor(item.event);
            const device = describeUserAgent(item.userAgent);
            return (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3" style={rowBorder(idx)}>
                <span className="dash-status-dot mt-1.5 shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {authEventLabel(t, item.event)}
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                      {t('admin', 'via')} {methodLabel(t, item.method)}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5 flex flex-wrap gap-x-2" style={{ color: 'var(--text-muted)' }}>
                    {item.user ? (
                      <Link href={`/admin/users/${item.user.id}`} className="dash-link" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.user.email}
                      </Link>
                    ) : (
                      <span>{t('admin', 'unknownUser')}</span>
                    )}
                    {item.ipAddress && <span style={{ fontFamily: 'var(--font-mono)' }}>· {item.ipAddress}</span>}
                    {device && <span>· {device}</span>}
                  </p>
                </div>
                <p className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }} title={formatShortDate(item.createdAt)}>
                  {relative(item.createdAt, t)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
    </AdminPanel>
  );
}
