'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}

interface EmptyStateProps {
  /** Mono `[ LABEL ]` above the title (e.g. the section name). */
  label?: string;
  /** Kept for older call sites; empty states no longer draw an icon. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** `card` sits on its own hairline card; `bare` is for use inside an existing panel. */
  variant?: 'card' | 'bare';
  className?: string;
}

/**
 * The product's one empty state: `[ LABEL ]`, a one-line title, a one-line explanation and
 * at most one pill action. Styled by .dash-empty* in globals.css.
 */
export function EmptyState({
  label,
  title,
  description,
  action,
  variant = 'card',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`dash-empty${variant === 'bare' ? ' is-bare' : ''} ${className}`}>
      {label && <span className="dash-eyebrow">{label}</span>}
      <h3 className="dash-empty-title">{title}</h3>
      {description && <p className="dash-empty-text">{description}</p>}
      {action && (
        <div className="dash-empty-action">
          {action.href ? (
            <Link href={action.href} className="btn btn-primary">
              {action.icon}
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className="btn btn-primary"
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
