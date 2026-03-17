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
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';
import { useTranslation, useBillingInfo } from '@/hooks';
import { LogoMark } from '@/components/logo';

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
    { href: '/dashboard/monitoring', icon: BarChart3,       label: t('navigation', 'monitoring') },
    { href: '/dashboard/team',       icon: Users,           label: t('navigation', 'team') },
    { href: '/dashboard/activity',   icon: Activity,        label: t('navigation', 'activity') },
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

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: typeof Settings;
    label: string;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`relative flex items-center gap-3 h-9 rounded-lg transition-all duration-150 text-sm
          ${collapsed ? 'md:justify-center md:px-2 px-3' : 'px-3'}
        `}
        style={{
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          background: active ? 'var(--hover-overlay-lg)' : 'transparent',
          fontWeight: active ? 500 : 400,
        }}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }
        }}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full"
            style={{
              background: 'linear-gradient(180deg, #22d3ee, #818cf8)',
              boxShadow: '0 0 10px rgba(34,211,238,0.55)',
            }}
          />
        )}
        <Icon
          className="w-4.25 h-4.25 shrink-0"
          strokeWidth={active ? 2 : 1.75}
          style={{ color: active ? 'var(--accent-cyan)' : undefined }}
        />
        {!collapsed && <span>{label}</span>}
        {collapsed && <span className="md:hidden">{label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'md:w-17' : 'md:w-60'}
        w-67
      `}
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Top shimmer accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 50%, transparent 100%)' }}
      />

      {/* ─── Logo ─────────────────────────── */}
      <div
        className={`h-14 flex items-center shrink-0 px-4 ${collapsed ? 'md:justify-center md:px-0' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <LogoMark size={32} className="shrink-0" />
          {!collapsed && (
            <span style={{ fontSize: 15, letterSpacing: '-0.035em', color: 'var(--text-primary)', fontWeight: 700 }}>
              Pushify
            </span>
          )}
          {collapsed && (
            <span className="font-bold truncate md:hidden" style={{ fontSize: 15 }}>Pushify</span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center transition-colors shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
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

      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-4.5 w-6 h-6 rounded-full items-center justify-center z-10"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border-strong)',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ─── New Project ──────────────────── */}
      <div className="px-3 pt-3 pb-1">
        <Link
          href="/dashboard/projects/new"
          className={`flex items-center gap-2 h-9 rounded-lg text-sm font-semibold transition-all
            ${collapsed ? 'md:justify-center md:px-0 px-3' : 'px-3'}
          `}
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(129,140,248,0.07))',
            border: '1px solid rgba(34,211,238,0.2)',
            color: 'var(--accent-cyan)',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.35)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.2)')}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t('navigation', 'newProject')}</span>}
          {collapsed && <span className="md:hidden">{t('navigation', 'newProject')}</span>}
        </Link>
      </div>

      {/* ─── Section label ─────────────────── */}
      {!collapsed && (
        <div className="px-5 pt-4 pb-1">
          <span
            style={{
              fontSize: 9.5,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Navigation
          </span>
        </div>
      )}

      {/* ─── Main Nav ─────────────────────── */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-0.5">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* ─── Bottom ───────────────────────── */}
      <div className="px-2 pb-3 space-y-0.5">
        {!collapsed && billingInfo && (
          <Link
            href="/dashboard/billing"
            className="block rounded-xl p-3 mb-2 transition-all"
            style={{
              background: 'var(--hover-overlay)',
              border: '1px solid var(--glass-border)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border-md)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)')}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {billingInfo.planName}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(34,211,238,0.08)',
                  color: 'var(--accent-cyan)',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {billingInfo.usage.deploymentsThisMonth.used} deploys
              </span>
            </div>
            <div className="h-0.75 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    billingInfo.usage.deploymentsThisMonth.unlimited
                      ? 18
                      : (billingInfo.usage.deploymentsThisMonth.used /
                          billingInfo.usage.deploymentsThisMonth.limit) * 100,
                    100
                  )}%`,
                  background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
                }}
              />
            </div>
          </Link>
        )}

        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <div className="my-2" style={{ height: 1, background: 'var(--glass-divider)' }} />

        {/* Version */}
        {!collapsed && (
          <div className="px-3 pb-1">
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                opacity: 0.5,
              }}
            >
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          </div>
        )}

        {/* User row */}
        <div
          className={`flex items-center gap-3 px-2 py-1.5 rounded-xl cursor-pointer group transition-colors
            ${collapsed ? 'md:justify-center md:px-0' : ''}
          `}
          style={{ background: 'transparent' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay-md)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #818cf8)', color: '#020206' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-snug" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {organization?.name || 'Personal'}
              </p>
            </div>
          )}
          {collapsed && (
            <div className="flex-1 min-w-0 md:hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => logout()}
              className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              title={t('common', 'logout')}
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-red)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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
