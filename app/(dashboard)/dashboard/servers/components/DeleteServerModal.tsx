'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { CommandLine } from '@/components/CommandLine';
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
  // Set when the server was deleted but Pushify could not take its SSH key off the machine.
  const [manual, setManual] = useState<{ command: string; uninstallScriptUrl: string } | null>(null);

  const handleDelete = async () => {
    try {
      const keyRemoval = await deleteServer.mutateAsync(server.id);
      if (keyRemoval && !keyRemoval.keyRemoved && keyRemoval.manualCommand) {
        setManual({ command: keyRemoval.manualCommand, uninstallScriptUrl: keyRemoval.uninstallScriptUrl });
        return;
      }
      onClose();
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  const finish = () => {
    setManual(null);
    onClose();
    onSuccess?.();
  };

  if (manual) {
    return (
      <Modal isOpen={isOpen} onClose={finish} title={t('servers', 'keyNotRemovedTitle')}>
        <div className="space-y-4">
          <AlertBox variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
            {t('servers', 'keyNotRemovedDesc')}
          </AlertBox>
          <CommandLine command={manual.command} />
          <p className="text-sm text-[var(--text-secondary)]">{t('servers', 'keyNotRemovedUninstall')}</p>
          <CommandLine command={`curl -fsSL ${manual.uninstallScriptUrl} | sudo bash -s -- --dry-run`} />
        </div>
        <ModalActions>
          <button type="button" onClick={finish} className="btn btn-primary">
            {t('common', 'close')}
          </button>
        </ModalActions>
      </Modal>
    );
  }

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
