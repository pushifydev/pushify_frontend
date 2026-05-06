'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertTriangle, Trash2, Info, Check } from 'lucide-react';
import { ReactNode } from 'react';

type Variant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const variantStyles: Record<Variant, { icon: ReactNode; iconBg: string; iconColor: string; confirmBg: string; confirmHoverBg: string }> = {
  danger: {
    icon: <Trash2 className="w-5 h-5" />,
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    confirmBg: '#dc2626',
    confirmHoverBg: '#b91c1c',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    confirmBg: '#d97706',
    confirmHoverBg: '#b45309',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    iconBg: 'rgba(99, 102, 241, 0.12)',
    iconColor: 'var(--accent-cyan)',
    confirmBg: 'var(--accent-cyan)',
    confirmHoverBg: 'var(--accent-cyan-dim)',
  },
  success: {
    icon: <Check className="w-5 h-5" />,
    iconBg: 'rgba(34, 197, 94, 0.12)',
    iconColor: '#22c55e',
    confirmBg: '#16a34a',
    confirmHoverBg: '#15803d',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const style = variantStyles[variant];

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 animate-in fade-in"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        />
        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 rounded-xl"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border-strong)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Header */}
          <div className="p-5 flex items-start gap-3">
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: style.iconBg, color: style.iconColor }}
            >
              {icon || style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialog.Title
                className="text-base font-semibold mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </AlertDialog.Title>
              {description && (
                <AlertDialog.Description
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {description}
                </AlertDialog.Description>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="px-5 py-3 flex items-center justify-end gap-2 rounded-b-xl"
            style={{
              background: 'var(--bg-tertiary)',
              borderTop: '1px solid var(--glass-border)',
            }}
          >
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--glass-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover-overlay-md)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                style={{ background: style.confirmBg }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = style.confirmHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = style.confirmBg;
                }}
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
