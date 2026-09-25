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

// Colour only where it carries meaning: the status icon and a destructive action.
const variantStyles: Record<Variant, { icon: ReactNode; iconColor: string; confirmClass: string }> = {
  danger: {
    icon: <Trash2 className="w-4 h-4" />,
    iconColor: 'var(--status-error)',
    confirmClass: 'btn btn-danger',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    iconColor: 'var(--accent-amber-dim)',
    confirmClass: 'btn btn-warning',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    iconColor: 'var(--text-secondary)',
    confirmClass: 'btn btn-primary',
  },
  success: {
    icon: <Check className="w-4 h-4" />,
    iconColor: 'var(--status-success)',
    confirmClass: 'btn btn-primary',
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
        {/* dash-app: the portal renders outside the dashboard layout. */}
        <div className="dash-app">
          <AlertDialog.Overlay className="dash-modal-overlay z-[70]" />
          <AlertDialog.Content
            className="dash-modal is-centered z-[70] max-w-md"
          >
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]"
                style={{ color: style.iconColor }}
                aria-hidden
              >
                {icon || style.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <AlertDialog.Title className="dash-modal-title">{title}</AlertDialog.Title>
                {description && (
                  <AlertDialog.Description className="dash-modal-description">
                    {description}
                  </AlertDialog.Description>
                )}
              </div>
            </div>

            <div className="dash-modal-footer">
              <AlertDialog.Cancel asChild>
                <button type="button" disabled={loading} className="btn btn-secondary">
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
                  className={style.confirmClass}
                >
                  {loading && (
                    <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  )}
                  {confirmText}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
