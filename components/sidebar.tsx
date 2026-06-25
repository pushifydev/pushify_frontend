'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Folder,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  BarChart3,
  Bell,
  Users,
  CreditCard,
  Server,
  Database,
  X,
  Zap,
  Store,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { useTranslation, useBillingInfo } from '@/hooks';
import { LogoMark } from '@/components/logo';
import { OrgSwitcher } from '@/components/OrgSwitcher';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const { collapsed, mobileOpen, toggleCollapse, closeMobile } = useSidebarStore();
  const { data: billingInfo } = useBillingInfo();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const mainNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('navigation', 'overview') },
    { href: '/dashboard/projects', icon: Folder, label: t('navigation', 'projects') },
    { href: '/dashboard/servers', icon: Server, label: t('navigation', 'servers') },
    { href: '/dashboard/databases', icon: Database, label: t('databases', 'title') },
    { href: '/dashboard/sites', icon: Sparkles, label: t('siteStudio', 'navTitle') },
    { href: '/dashboard/marketplace', icon: Store, label: t('marketplace', 'title') },
  ];

  const insightNavItems = [
    { href: '/dashboard/monitoring', icon: BarChart3, label: t('navigation', 'monitoring') },
    { href: '/dashboard/alerts', icon: Bell, label: t('navigation', 'alerts') },
    { href: '/dashboard/activity', icon: Activity, label: t('navigation', 'activity') },
    { href: '/dashboard/team', icon: Users, label: t('navigation', 'team') },
    { href: '/dashboard/billing', icon: CreditCard, label: t('billing', 'title') },
  ];

  const bottomNavItems = [
    { href: '/dashboard/settings', icon: Settings, label: t('common', 'settings') },
    { href: '/docs', icon: HelpCircle, label: t('navigation', 'helpDocs') },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: typeof Settings; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`dash-nav-item ${active ? 'is-active' : ''} ${
          collapsed ? 'md:justify-center md:px-0 md:min-w-0 px-3' : ''
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
        {!collapsed && <span className="truncate">{label}</span>}
        {collapsed && <span className="md:hidden truncate">{label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => {
    if (collapsed) return <div className="hidden md:block my-2 mx-2 h-px bg-[var(--border-subtle)]" />;
    return (
      <div className="px-2 pt-4 pb-1">
        <span className="dash-section-label px-1">{label}</span>
      </div>
    );
  };

  const BillingCard = () => {
    if (!billingInfo || collapsed) return null;
    const usage = billingInfo.usage.deploymentsThisMonth;
    const pct = usage.unlimited ? 18 : Math.min((usage.used / usage.limit) * 100, 100);
    const isHigh = !usage.unlimited && pct >= 80;

    return (
      <Link
        href="/dashboard/billing"
        className="block rounded-lg p-3 mx-1 mb-1.5 border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:border-[var(--border-default)] transition-colors"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <Zap className="w-3 h-3" />
            {billingInfo.planName}
          </div>
          <span
            className="text-[10px] font-medium tabular-nums"
            style={{ color: isHigh ? 'var(--accent-amber)' : 'var(--text-secondary)' }}
          >
            {usage.used}
            {!usage.unlimited && `/${usage.limit}`}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden bg-[var(--border-subtle)]">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[var(--text-primary)]"
            style={{
              width: `${pct}%`,
              opacity: isHigh ? 1 : 0.35,
            }}
          />
        </div>
      </Link>
    );
  };

  const UserRow = () => (
    <div
      className={`group flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-default transition-colors hover:bg-[var(--hover-overlay-md)]
        ${collapsed ? 'md:justify-center md:px-0' : ''}`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate leading-tight text-[var(--text-primary)]">
            {user?.name || 'User'}
          </p>
          <OrgSwitcher />
        </div>
      )}
      {collapsed && (
        <div className="flex-1 min-w-0 md:hidden">
          <p className="text-[13px] font-medium truncate">{user?.name}</p>
        </div>
      )}

      {!collapsed && (
        <button
          type="button"
          onClick={() => logout()}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[rgba(248,113,113,0.08)] transition-all"
          title={t('common', 'logout')}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  const sidebarContent = (
    <aside
      className={`fixed left-0 top-0 h-dvh flex flex-col z-50 transition-all duration-300 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)]
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'md:w-17' : 'md:w-60'}
        w-67`}
    >
      <div
        className={`h-14 flex items-center shrink-0 px-3.5 border-b border-[var(--border-subtle)] ${collapsed ? 'md:justify-center md:px-0' : 'justify-between'}`}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <LogoMark size={30} className="shrink-0" />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Pushify</span>
          )}
          {collapsed && <span className="font-semibold truncate md:hidden text-[15px]">Pushify</span>}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-overlay-md)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={closeMobile}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-[18px] w-6 h-6 rounded-full items-center justify-center z-10 bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="px-2.5 pt-3 pb-0.5">
        <Link
          href="/dashboard/projects/new"
          className={`dash-accent-fill flex items-center gap-2 h-9 rounded-md text-[13px] font-medium transition-opacity hover:opacity-90
            ${collapsed ? 'md:justify-center md:px-0 px-3' : 'px-3'}`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t('navigation', 'newProject')}</span>}
          {collapsed && <span className="md:hidden">{t('navigation', 'newProject')}</span>}
        </Link>
      </div>

      <nav className="flex-1 px-2 overflow-y-auto">
        <SectionLabel label={t('navigation', 'overview')} />
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <SectionLabel label={t('navigation', 'monitoring')} />
        <div className="space-y-0.5">
          {insightNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="px-2 pb-2.5 space-y-0.5">
        <BillingCard />
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
        <div className="my-1.5 mx-2 h-px bg-[var(--border-subtle)]" />
        {!collapsed && process.env.NEXT_PUBLIC_APP_VERSION && (
          <div className="px-3 pb-0.5">
            <span className="text-[10px] text-[var(--text-muted)] opacity-40">
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          </div>
        )}
        <UserRow />
      </div>
    </aside>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm overscroll-contain touch-none"
          onClick={closeMobile}
        />
      )}
      {sidebarContent}
    </>
  );
}
