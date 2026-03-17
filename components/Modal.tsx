'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
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
  children,
  maxWidth = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative rounded-2xl w-full ${maxWidthClasses[maxWidth]} p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200`}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <X className="w-5 h-5" />
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
  return (
    <div
      className="flex justify-end gap-3 pt-4 mt-6"
      style={{ borderTop: '1px solid var(--glass-border-md)' }}
    >
      {children}
    </div>
  );
}

interface AlertBoxProps {
  variant: 'warning' | 'error' | 'success' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; border: string; color: string }> = {
  warning: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', color: '#eab308' },
  error:   { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
  success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  info:    { bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.2)', color: '#22d3ee' },
};

export function AlertBox({ variant, children, icon }: AlertBoxProps) {
  const s = variantStyles[variant];
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <div className="flex items-start gap-2 text-sm">
        {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
        <span>{children}</span>
      </div>
    </div>
  );
}
