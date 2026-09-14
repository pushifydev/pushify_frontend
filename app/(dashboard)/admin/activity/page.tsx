'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Building2, GitBranch } from 'lucide-react';
import { useTranslation, useAdminActivity } from '@/hooks';
import { SkeletonActivityRow } from '@/components/Skeleton';
import { formatShortDate } from '@/lib/formatters';
import { AdminPanel, AdminError, Pager, EmptyRow, rowBorder, relative } from '../shared';

const PAGE_SIZE = 50;

export default function AdminActivityPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminActivity(page, PAGE_SIZE);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const items = data?.items ?? [];

  return (
    <AdminPanel
      title={t('admin', 'activityTitle')}
      icon={<Activity className="w-4 h-4" />}
      meta={isLoading ? '…' : data?.total}
    >
      {isLoading ? (
        <div>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={rowBorder(i)}><SkeletonActivityRow /></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyRow>{t('admin', 'activityEmpty')}</EmptyRow>
      ) : (
        <ul>
          {items.map((item, idx) => (
            <li key={item.id} className="flex items-start gap-4 px-5 py-3" style={rowBorder(idx)}>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.description}</p>
                <p className="text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.user ? (
                    <Link href={`/admin/users/${item.user.id}`} className="dash-link" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.user.email}
                    </Link>
                  ) : (
                    <span>{t('admin', 'unknownUser')}</span>
                  )}
                  {item.organization && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {item.organization.name}
                    </span>
                  )}
                  {item.project && (
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {item.project.name}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }} title={formatShortDate(item.createdAt)}>
                  {relative(item.createdAt, t)}
                </p>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {item.action}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
    </AdminPanel>
  );
}
