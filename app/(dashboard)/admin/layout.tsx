'use client';

import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { MetaLabel, PageHeader } from '@/components/dashboard/PageKit';

/**
 * Operator-only area. The real gate is the API (ADMIN_EMAILS + 2FA → everyone else 404);
 * this layout mirrors it so a non-operator who types the URL sees the same 404 page as any
 * unknown route, and never a flash of admin chrome.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const pathname = usePathname();

  // DashboardShell only renders children once auth resolved; user is null for one tick at most.
  if (!user) return null;
  if (!user.isPlatformAdmin) notFound();

  // A user's page is a detail screen: it brings its own header with a breadcrumb back.
  const isDetail = /^\/admin\/users\/[^/]+/.test(pathname);

  const tabs = [
    { href: '/admin', label: t('admin', 'navOverview'), exact: true },
    { href: '/admin/users', label: t('admin', 'navUsers') },
    { href: '/admin/activity', label: t('admin', 'navActivity') },
    { href: '/admin/signins', label: t('admin', 'navSignins') },
  ];

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-hidden">
      {!isDetail && (
        <>
          <PageHeader
            title={t('admin', 'title')}
            description={t('admin', 'subtitle')}
            meta={[<MetaLabel key="scope">{t('admin', 'eyebrow')}</MetaLabel>, <span key="who" className="terminal-text text-xs truncate">{user.email}</span>]}
          />

          <nav className="dash-tabs" aria-label={t('admin', 'title')}>
            {tabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`dash-tab${active ? ' is-active' : ''}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
