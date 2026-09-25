'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Optional mono `[ LABEL ]` above the title. */
  eyebrow?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  eyebrow,
  children,
  maxWidth = 'md',
}: ModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  // `dash-app` on the portal root: the dashboard tokens and .dash-modal* rules reach it
  // even though it renders outside the dashboard layout.
  return createPortal(
    <div className="dash-app dash-modal-root">
      <div className="dash-modal-overlay" onClick={onClose} aria-hidden />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`dash-modal ${maxWidthClasses[maxWidth]}`}
      >
        <div className="dash-modal-header">
          <div className="min-w-0">
            {eyebrow && <span className="dash-eyebrow">{eyebrow}</span>}
            <h2 id={titleId} className="dash-modal-title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="dash-modal-description">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dash-modal-close"
            aria-label={t('common', 'close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ModalActionsProps {
  children: React.ReactNode;
}

export function ModalActions({ children }: ModalActionsProps) {
  return <div className="dash-modal-footer">{children}</div>;
}

interface AlertBoxProps {
  variant: 'warning' | 'error' | 'success' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; border: string; color: string }> = {
  warning: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.22)', color: 'var(--status-warning)' },
  error:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: 'var(--status-error)' },
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.22)', color: 'var(--status-success)' },
  info:    { bg: 'var(--bg-tertiary)', border: 'var(--border-subtle)', color: 'var(--text-secondary)' },
};

export function AlertBox({ variant, children, icon }: AlertBoxProps) {
  const s = variantStyles[variant];
  return (
    <div
      className="px-4 py-3 rounded-[10px]"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <div className="flex items-start gap-2 text-sm leading-relaxed">
        {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
        <span>{children}</span>
      </div>
    </div>
  );
}
