'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useTranslation, AdminRequestError } from '@/hooks';
import type { AdminAuthEventType, AdminAuthMethod, AdminSignupMethod } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/formatters';

type T = ReturnType<typeof useTranslation>['t'];

// ============ Layout pieces ============

/** A titled hairline-row card: mono section label + quiet mono meta above a `.dash-rows` card. */
export function AdminPanel({
  title,
  meta,
  action,
  children,
  className = '',
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2.5 min-w-0">
        <h2 className="dash-section-label shrink-0">{title}</h2>
        <div className="flex items-center gap-3 min-w-0">
          {meta !== undefined && meta !== null && (
            <span className="terminal-text text-xs text-[var(--text-muted)] truncate tabular-nums">{meta}</span>
          )}
          {action}
        </div>
      </div>
      <div className="dash-rows">{children}</div>
    </section>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="dash-row text-[13px] text-[var(--text-muted)]">{children}</p>;
}

/** Skeleton rows for a panel while its query loads. */
export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="dash-row flex items-center gap-3" aria-hidden>
          <span className="dash-skeleton w-1.5 h-1.5 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="dash-skeleton h-3.5 w-2/5 rounded" />
            <div className="dash-skeleton h-3 w-3/5 rounded" />
          </div>
        </div>
      ))}
    </div>
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
      className="rounded-full flex items-center justify-center font-medium shrink-0 select-none bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
      style={style}
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
    <div className="dash-row flex items-center justify-between gap-3 py-2.5!">
      <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums">
        {from}–{to} {t('admin', 'pageOf')} {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
          {t('admin', 'prev')}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page >= last} onClick={() => onPage(page + 1)}>
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
    <div className="dash-callout flex-col items-start gap-3 sm:flex-row sm:items-center" role="alert">
      <span className="dash-status-dot is-warning mt-2 sm:mt-0 shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {needsTwoFactor ? t('admin', 'twoFactorTitle') : t('admin', 'loadError')}
        </p>
        {needsTwoFactor && (
          <p className="text-[13px] mt-0.5 text-[var(--text-secondary)]">{t('admin', 'twoFactorDesc')}</p>
        )}
      </div>
      {needsTwoFactor ? (
        <Link href="/dashboard/settings?tab=security" className="btn btn-primary btn-sm shrink-0">
          {t('admin', 'twoFactorCta')}
        </Link>
      ) : (
        onRetry && (
          <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={onRetry}>
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
    case 'register': return 'var(--text-primary)';
    case 'login': return STATUS_COLORS.success;
    case 'two_factor_required': return STATUS_COLORS.warning;
    default: return STATUS_COLORS.error;
  }
}

/** The `.dash-status-dot` modifier for an auth event. */
export function authEventDot(event: AdminAuthEventType): string {
  switch (event) {
    case 'register': return 'is-active';
    case 'login': return 'is-success';
    case 'two_factor_required': return 'is-warning';
    default: return 'is-error';
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
  return !plan || plan === 'free' ? 'badge badge-neutral' : 'badge badge-success';
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
