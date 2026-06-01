'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';

interface DashboardAttentionSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DashboardAttentionSheet({
  open,
  onClose,
  children,
}: DashboardAttentionSheetProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[70] transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
          aria-hidden
        />
      )}
      {/* dash-app: portal is outside layout; dashboard tokens & .dash-* rules require this */}
      <div
        role="dialog"
        aria-modal={open}
        aria-labelledby="dash-attention-sheet-title"
        className={cn(
          'dash-app fixed top-0 right-0 bottom-0 z-[71] flex flex-col min-w-0',
          'bg-[var(--bg-primary)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        )}
        style={{
          width: 'min(420px, 100vw)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-5 h-14 shrink-0 border-b border-[var(--border-subtle)]"
        >
          <h2
            id="dash-attention-sheet-title"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            {t('dashboard', 'attentionZoneTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-overlay)] transition-colors"
            aria-label={t('common', 'close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-5 py-4">
          {open ? children : null}
        </div>
      </div>
    </>,
    document.body,
  );
}

/** Bordered block inside the attention sheet */
export function AttentionSheetSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'py-4 first:pt-0 last:pb-0 border-b border-[var(--border-subtle)] last:border-b-0 min-w-0',
        className,
      )}
    >
      {children}
    </section>
  );
}
