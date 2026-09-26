'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

/**
 * The page anatomy of the project detail screen, for every dashboard page: a plain header (no
 * card, no icon tile) with an optional breadcrumb, title, status badge, one-line description, a
 * mono meta line and actions on the right; an underline tab strip; hairline row lists. Styles are
 * the `.dash-*` rules in app/globals.css (see the "Detail screens" block).
 */

export function PageHeader({
  back,
  crumb,
  title,
  badge,
  description,
  meta,
  actions,
  children,
}: {
  /** Breadcrumb parent: `{ href, label }`. */
  back?: { href: string; label: ReactNode };
  /** Current-page crumb text (defaults to the title when it is a string). */
  crumb?: ReactNode;
  title: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  /** Short facts under the title, rendered as a quiet line (mono labels, counts, dates). */
  meta?: ReactNode[];
  actions?: ReactNode;
  /** Anything that belongs to the header under the meta line (a URL bar, a notice). */
  children?: ReactNode;
}) {
  return (
    <>
      {back && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] min-w-0">
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 rounded hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {back.label}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="text-[var(--text-secondary)] truncate" aria-current="page">
            {crumb ?? title}
          </span>
        </nav>
      )}
      <header className="min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="truncate max-w-full">{title}</h1>
              {badge}
            </div>
            {/* A div, not a p: pages pass skeletons and links here, and a div inside a p breaks hydration. */}
            {description && (
              <div className="text-[var(--text-secondary)] mt-1.5 text-sm leading-relaxed break-words max-w-2xl">
                {description}
              </div>
            )}
            {meta && meta.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-[var(--text-muted)]">
                {meta.filter(Boolean).map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 min-w-0">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
          {actions && <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">{actions}</div>}
        </div>
        {children}
      </header>
    </>
  );
}

/** A mono uppercase fact for PageHeader's meta line (framework, region, plan). */
export function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

export function Tabs<T extends string>({
  items,
  active,
  onChange,
  label,
  idPrefix = 'tab',
}: {
  items: { id: T; label: ReactNode; count?: number }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
  idPrefix?: string;
}) {
  return (
    <div className="dash-tabs" role="tablist" aria-label={label}>
      {items.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${idPrefix}-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`${idPrefix}-panel`}
          onClick={() => onChange(tab.id)}
          className="dash-tab"
        >
          {tab.label}
          {typeof tab.count === 'number' && <span className="ml-1.5 opacity-60 tabular-nums">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ idPrefix = 'tab', active, children }: { idPrefix?: string; active: string; children: ReactNode }) {
  return (
    <div className="min-w-0" role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-${active}`}>
      {children}
    </div>
  );
}

/** A titled group of hairline rows (the lists on the project detail tabs). */
export function RowList({
  label,
  action,
  children,
}: {
  label?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      {(label || action) && (
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {label ? <h2 className="dash-section-label">{label}</h2> : <span />}
          {action}
        </div>
      )}
      <div className="dash-rows">{children}</div>
    </section>
  );
}
