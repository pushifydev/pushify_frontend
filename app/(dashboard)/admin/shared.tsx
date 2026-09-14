'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShieldAlert, RefreshCw } from 'lucide-react';
import { useTranslation, AdminRequestError } from '@/hooks';
import type { AdminAuthEventType, AdminAuthMethod, AdminSignupMethod } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/formatters';

type T = ReturnType<typeof useTranslation>['t'];

// ============ Layout pieces ============

export function AdminPanel({
  title,
  icon,
  meta,
  children,
  className = '',
}: {
  title: string;
  icon?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`dash-panel p-0 overflow-hidden ${className}`}>
      <div
        className="flex items-center justify-between gap-3 px-5 py-3"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2 shrink-0">
          {icon && (
            <span className="dash-section-icon" style={{ color: 'var(--text-secondary)' }}>
              {icon}
            </span>
          )}
          <h2 className="text-sm font-medium shrink-0">{title}</h2>
        </div>
        {meta !== undefined && (
          <div className="text-xs min-w-0 truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {meta}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/** Divider between stacked rows inside a panel — none above the first. */
export const rowBorder = (idx: number): CSSProperties => ({
  borderTop: idx === 0 ? 'none' : '1px solid var(--glass-divider)',
});

export const hoverRow = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)'),
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget as HTMLElement).style.background = 'transparent'),
};

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

export function Avatar({
  name,
  avatarUrl,
  size = 32,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const style: CSSProperties = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="rounded-full object-cover shrink-0 select-none" style={style} />
  ) : (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0 select-none"
      style={{ ...style, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const last = Math.ceil(total / pageSize);
  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-2.5"
      style={{ borderTop: '1px solid var(--glass-border)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {from}–{to} {t('admin', 'pageOf')} {total}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
          {t('admin', 'prev')}
        </button>
        <button type="button" className="btn btn-ghost" disabled={page >= last} onClick={() => onPage(page + 1)}>
          {t('admin', 'next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** 403 means "operator without 2FA" — every other failure is a plain retry. */
export function AdminError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const needsTwoFactor = error instanceof AdminRequestError && error.code === 'FORBIDDEN';

  return (
    <div className="dash-panel flex flex-col sm:flex-row sm:items-center gap-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${STATUS_COLORS.warning}18`, color: STATUS_COLORS.warning }}
      >
        <ShieldAlert className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {needsTwoFactor ? t('admin', 'twoFactorTitle') : t('admin', 'loadError')}
        </p>
        {needsTwoFactor && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('admin', 'twoFactorDesc')}
          </p>
        )}
      </div>
      {needsTwoFactor ? (
        <Link href="/dashboard/settings?tab=security" className="btn btn-primary shrink-0">
          {t('admin', 'twoFactorCta')}
        </Link>
      ) : (
        onRetry && (
          <button type="button" className="btn btn-secondary shrink-0" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            {t('admin', 'retry')}
          </button>
        )
      )}
    </div>
  );
}

// ============ Labels ============

export function authEventLabel(t: T, event: AdminAuthEventType): string {
  switch (event) {
    case 'register': return t('admin', 'evRegister');
    case 'login': return t('admin', 'evLogin');
    case 'login_failed': return t('admin', 'evLoginFailed');
    case 'two_factor_required': return t('admin', 'evTwoFactorRequired');
    case 'two_factor_failed': return t('admin', 'evTwoFactorFailed');
  }
}

export function authEventColor(event: AdminAuthEventType): string {
  switch (event) {
    case 'register': return STATUS_COLORS.cyan;
    case 'login': return STATUS_COLORS.success;
    case 'two_factor_required': return STATUS_COLORS.warning;
    default: return STATUS_COLORS.error;
  }
}

export function methodLabel(t: T, method: AdminAuthMethod | AdminSignupMethod): string {
  switch (method) {
    case 'github': return t('admin', 'methodGithub');
    case 'google': return t('admin', 'methodGoogle');
    case 'two_factor': return t('admin', 'methodTwoFactor');
    default: return t('admin', 'methodPassword');
  }
}

export function planBadgeClass(plan: string | null): string {
  return !plan || plan === 'free' ? 'badge badge-neutral' : 'badge badge-info';
}

/** "Chrome · macOS" from a raw user-agent — enough to recognise a device, no library. */
export function describeUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  if (/pushify-cli/i.test(ua)) return 'Pushify CLI';
  if (/okhttp|Expo|ReactNative/i.test(ua)) return 'Pushify app';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : null;
  const os = /iPhone|iPad/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Linux/.test(ua) ? 'Linux'
    : null;
  if (!browser && !os) return ua.length > 40 ? `${ua.slice(0, 40)}…` : ua;
  return [browser, os].filter(Boolean).join(' · ');
}

// ============ Time ============

export const timeOfDay = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export const dayKey = (iso: string) => new Date(iso).toDateString();

export const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const relative = (iso: string | null | undefined, t: T) =>
  iso ? formatTimeAgo(iso, t) : t('admin', 'never');
