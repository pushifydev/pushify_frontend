'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
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
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('servers', 'deleteServer')}>
      <div className="space-y-4">
        <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
          {t('servers', 'deleteConfirm')}
        </AlertBox>

        <div className="dash-rows">
          <div className="dash-row">
          <p className="text-sm font-medium text-[var(--text-primary)]">{server.name}</p>
          <p className="terminal-text text-xs mt-0.5 text-[var(--text-muted)]">
            {server.provider} • {server.region}
            {server.ipv4 && ` • ${server.ipv4}`}
          </p>
          </div>
        </div>
      </div>

      <ModalActions>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteServer.isPending}
          className="btn btn-danger"
        >
          {deleteServer.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            t('common', 'delete')
          )}
        </button>
      </ModalActions>
    </Modal>
  );
}
