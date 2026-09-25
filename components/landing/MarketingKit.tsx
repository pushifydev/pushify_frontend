'use client';

/**
 * The homepage's building blocks, for every other marketing page: a section under a hairline with a
 * `[ LABEL ]` eyebrow and a large light heading, grids whose cells are divided by hairlines, a
 * numbered sequence (only for things that really happen in order), and the FAQ list.
 * Styles live in app/marketing.css (.hp-section, .hp-rule-grid, .hp-cell, .hp-steps, .hp-faq).
 */

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Eyebrow } from './home/Eyebrow';

export { Eyebrow };

export function MSection({
  id,
  eyebrow,
  title,
  lead,
  align = 'left',
  split = false,
  width = 'default',
  children,
  className = '',
}: {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  /** center: headline block centred; left: aligned to the grid below it. */
  align?: 'left' | 'center';
  /** Left-aligned title with the lead beside it on wide screens (the homepage feature section). */
  split?: boolean;
  width?: 'narrow' | 'default';
  children?: ReactNode;
  className?: string;
}) {
  const hasHeader = Boolean(eyebrow || title || lead);
  const wrap = width === 'narrow' ? 'lp-container max-w-4xl' : 'lp-container';

  return (
    <section id={id} className={`hp-section ${className}`}>
      <div className={wrap}>
        {hasHeader &&
          (split ? (
            <header>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-8">
                {title && <h2 className="hp-h2 max-w-[44rem]">{title}</h2>}
                {lead && <p className="hp-lead max-w-[30rem]">{lead}</p>}
              </div>
            </header>
          ) : (
            <header className={align === 'center' ? 'hp-center' : 'max-w-3xl'}>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && <h2 className={`hp-h2 ${eyebrow ? 'mt-6' : ''}`}>{title}</h2>}
              {lead && <p className="hp-lead mt-5">{lead}</p>}
            </header>
          ))}
        {children && <div className={hasHeader ? 'mt-14' : ''}>{children}</div>}
      </div>
    </section>
  );
}

const COLS = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function RuleGrid({ cols = 3, children, className = '' }: { cols?: 2 | 3 | 4; children: ReactNode; className?: string }) {
  return <div className={`hp-rule-grid ${COLS[cols]} ${className}`}>{children}</div>;
}

export function RuleCell({
  icon: Icon,
  title,
  children,
  href,
  linkLabel,
  external = false,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <div className="hp-cell">
      {Icon && <Icon className="hp-cell-icon" strokeWidth={1.5} aria-hidden="true" />}
      <h3 className="hp-cell-title">{title}</h3>
      {children && <div className="hp-cell-body">{children}</div>}
      {href && linkLabel && (
        <p className="hp-cell-link">
          {external || href.startsWith('mailto:') ? (
            <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
              {linkLabel}
              <Arrow className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ) : (
            <Link href={href}>
              {linkLabel}
              <Arrow className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

/** Steps that really happen in this order — the index carries that information. */
export function Steps({ items }: { items: { title: ReactNode; body?: ReactNode }[] }) {
  const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <ol className={`hp-steps grid grid-cols-1 ${cols}`}>
      {items.map((item, i) => (
        <li key={i}>
          <span className="hp-step-index">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="hp-cell-title mt-6">{item.title}</h3>
          {item.body && <div className="hp-cell-body">{item.body}</div>}
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items }: { items: { q: ReactNode; a: ReactNode }[] }) {
  return (
    <div className="hp-faq">
      {items.map((f, i) => (
        <details key={i}>
          <summary>{f.q}</summary>
          <div>{f.a}</div>
        </details>
      ))}
    </div>
  );
}

/** A terminal-like block for commands and config on marketing pages. */
export function CodePanel({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="hp-code">
      {title && <div className="hp-code-title">{title}</div>}
      <pre>{children}</pre>
    </div>
  );
}
