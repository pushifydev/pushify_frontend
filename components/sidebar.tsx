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
  Users,
  CreditCard,
  Server,
  Database,
  X,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { useTranslation, useBillingInfo } from '@/hooks';
import { LogoMark } from '@/components/logo';

const spring = 'cubic-bezier(0.25, 1.1, 0.4, 1)';

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, logout } = useAuthStore();
  const { t } = useTranslation();
  const { collapsed, mobileOpen, toggleCollapse, closeMobile } = useSidebarStore();
  const { data: billingInfo } = useBillingInfo();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const mainNavItems = [
    { href: '/dashboard',            icon: LayoutDashboard, label: t('navigation', 'overview') },
    { href: '/dashboard/projects',   icon: Folder,          label: t('navigation', 'projects') },
    { href: '/dashboard/servers',    icon: Server,          label: t('navigation', 'servers') },
    { href: '/dashboard/databases',  icon: Database,        label: t('databases', 'title') },
  ];

  const insightNavItems = [
    { href: '/dashboard/monitoring', icon: BarChart3,       label: t('navigation', 'monitoring') },
    { href: '/dashboard/activity',   icon: Activity,        label: t('navigation', 'activity') },
    { href: '/dashboard/team',       icon: Users,           label: t('navigation', 'team') },
    { href: '/dashboard/billing',    icon: CreditCard,      label: t('billing', 'title') },
  ];

  const bottomNavItems = [
    { href: '/dashboard/settings', icon: Settings,   label: t('common', 'settings') },
    { href: '/docs',               icon: HelpCircle, label: t('navigation', 'helpDocs') },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  /* ─── Nav Item ─── */
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: typeof Settings; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`group relative flex items-center gap-3 h-9 rounded-lg text-[13px] transition-all
          ${collapsed ? 'md:justify-center md:px-0 px-3' : 'px-2.5'}
        `}
        style={{
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          background: active ? 'var(--hover-overlay-lg)' : 'transparent',
          fontWeight: active ? 500 : 400,
          transitionTimingFunction: spring,
          transitionDuration: '400ms',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'var(--hover-overlay-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Active indicator */}
        <span
          className="absolute left-0 top-1/2 rounded-r-full transition-all"
          style={{
            width: active ? 3 : 0,
            height: active ? 16 : 0,
            transform: 'translateY(-50%)',
            background: 'linear-gradient(180deg, var(--accent-cyan), var(--accent-purple))',
            boxShadow: active ? '0 0 12px rgba(34,211,238,0.5)' : 'none',
            opacity: active ? 1 : 0,
            transitionTimingFunction: spring,
            transitionDuration: '400ms',
          }}
        />
        <Icon
          className="w-[17px] h-[17px] shrink-0 transition-colors"
          strokeWidth={active ? 2 : 1.7}
          style={{
            color: active ? 'var(--accent-cyan)' : undefined,
            transitionTimingFunction: spring,
            transitionDuration: '300ms',
          }}
        />
        {!collapsed && <span className="truncate">{label}</span>}
        {collapsed && <span className="md:hidden truncate">{label}</span>}
      </Link>
    );
  };

  /* ─── Section Label ─── */
  const SectionLabel = ({ label }: { label: string }) => {
    if (collapsed) return <div className="hidden md:block my-1.5 mx-3 h-px" style={{ background: 'var(--glass-divider)' }} />;
    return (
      <div className="px-3 pt-4 pb-1.5">
        <span
          className="select-none"
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  /* ─── Billing Card ─── */
  const BillingCard = () => {
    if (!billingInfo || collapsed) return null;
    const usage = billingInfo.usage.deploymentsThisMonth;
    const pct = usage.unlimited ? 18 : Math.min((usage.used / usage.limit) * 100, 100);
    const isHigh = !usage.unlimited && pct >= 80;

    return (
      <Link
        href="/dashboard/billing"
        className="group block rounded-xl p-3 mx-1 mb-1.5 transition-all"
        style={{
          background: 'var(--hover-overlay)',
          border: '1px solid var(--glass-border)',
          transitionTimingFunction: spring,
          transitionDuration: '300ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--glass-border-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {billingInfo.planName}
            </span>
          </div>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: isHigh ? 'var(--accent-amber)' : 'var(--accent-cyan)',
            background: isHigh ? 'rgba(251,191,36,0.08)' : 'rgba(34,211,238,0.08)',
            padding: '1px 6px',
            borderRadius: 4,
          }}>
            {usage.used}{!usage.unlimited && `/${usage.limit}`}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: isHigh
                ? 'linear-gradient(90deg, var(--accent-amber), var(--accent-red))'
                : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
              transitionTimingFunction: spring,
            }}
          />
        </div>
      </Link>
    );
  };

  /* ─── User Row ─── */
  const UserRow = () => (
    <div
      className={`group flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-default transition-all
        ${collapsed ? 'md:justify-center md:px-0' : ''}
      `}
      style={{ transitionTimingFunction: spring, transitionDuration: '300ms' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none"
        style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', color: '#020206' }}
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
            {organization?.name || 'Personal'}
          </p>
        </div>
      )}
      {collapsed && (
        <div className="flex-1 min-w-0 md:hidden">
          <p className="text-[13px] font-medium truncate">{user?.name}</p>
        </div>
      )}

      {!collapsed && (
        <button
          onClick={() => logout()}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          title={t('common', 'logout')}
          style={{ color: 'var(--text-muted)', transitionTimingFunction: spring }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--accent-red)';
            e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  /* ─── Sidebar Shell ─── */
  const sidebarContent = (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'md:w-17' : 'md:w-60'}
        w-67
      `}
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--glass-border)',
        transitionTimingFunction: spring,
        transitionDuration: '500ms',
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.35) 50%, transparent 100%)' }}
      />

      {/* ─── Logo ─── */}
      <div
        className={`h-14 flex items-center shrink-0 px-3.5 ${collapsed ? 'md:justify-center md:px-0' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <LogoMark size={30} className="shrink-0" />
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Pushify
            </span>
          )}
          {collapsed && (
            <span className="font-bold truncate md:hidden text-[15px]">Pushify</span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)', transitionTimingFunction: spring }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'var(--hover-overlay-md)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={closeMobile}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expand button (collapsed) */}
      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-[18px] w-6 h-6 rounded-full items-center justify-center z-10 transition-all"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border-strong)',
            color: 'var(--text-muted)',
            transitionTimingFunction: spring,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ─── New Project ─── */}
      <div className="px-2.5 pt-3 pb-0.5">
        <Link
          href="/dashboard/projects/new"
          className={`flex items-center gap-2 h-9 rounded-lg text-[13px] font-semibold transition-all
            ${collapsed ? 'md:justify-center md:px-0 px-3' : 'px-3'}
          `}
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(129,140,248,0.05))',
            border: '1px solid rgba(34,211,238,0.18)',
            color: 'var(--accent-cyan)',
            transitionTimingFunction: spring,
            transitionDuration: '300ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(129,140,248,0.08))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.18)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(129,140,248,0.05))';
          }}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t('navigation', 'newProject')}</span>}
          {collapsed && <span className="md:hidden">{t('navigation', 'newProject')}</span>}
        </Link>
      </div>

      {/* ─── Main Nav ─── */}
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

      {/* ─── Bottom ─── */}
      <div className="px-2 pb-2.5 space-y-0.5">
        <BillingCard />

        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <div className="my-1.5 mx-2" style={{ height: 1, background: 'var(--glass-divider)' }} />

        {/* Version */}
        {!collapsed && process.env.NEXT_PUBLIC_APP_VERSION && (
          <div className="px-3 pb-0.5">
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', opacity: 0.4 }}>
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
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}
      {sidebarContent}
    </>
  );
}
