'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useTranslation, useDeleteServer } from '@/hooks';
import type { Server } from '@/lib/api';

interface DeleteServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onSuccess?: () => void;
}

export function DeleteServerModal({ isOpen, onClose, server, onSuccess }: DeleteServerModalProps) {
  const { t } = useTranslation();
  const deleteServer = useDeleteServer();

  const handleDelete = async () => {
    try {
      await deleteServer.mutateAsync(server.id);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--status-error)]/10">
              <AlertTriangle className="w-5 h-5 text-[var(--status-error)]" />
            </div>
            <h2 className="text-lg font-semibold">{t('servers', 'deleteServer')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[var(--text-secondary)] mb-4">
            {t('servers', 'deleteConfirm')}
          </p>

          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <p className="font-medium">{server.name}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {server.provider} • {server.region}
              {server.ipv4 && ` • ${server.ipv4}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            {t('common', 'cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteServer.isPending}
            className="btn bg-[var(--status-error)] hover:bg-[var(--status-error)]/90 text-white"
          >
            {deleteServer.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              t('common', 'delete')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
