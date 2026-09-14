'use client';

import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';

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

  const tabs = [
    { href: '/admin', label: t('admin', 'navOverview'), icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: t('admin', 'navUsers'), icon: Users },
    { href: '/admin/activity', label: t('admin', 'navActivity'), icon: Activity },
    { href: '/admin/signins', label: t('admin', 'navSignins'), icon: KeyRound },
  ];

  return (
    <div className="dash-page space-y-5 animate-slide-in">
      <div>
        <p className="dash-eyebrow mb-1">{t('admin', 'eyebrow')}</p>
        <h1 className="text-xl font-semibold tracking-tight">{t('admin', 'title')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {t('admin', 'subtitle')}
        </p>
      </div>

      <nav className="flex items-center gap-1.5 overflow-x-auto pb-1" aria-label={t('admin', 'title')}>
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--dash-accent-bg)' : 'var(--bg-secondary)',
                color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--dash-accent-border-strong)' : '1px solid var(--glass-border)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
