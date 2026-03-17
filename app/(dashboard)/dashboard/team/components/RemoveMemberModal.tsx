'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import { useTranslation } from '@/hooks';
import { useRemoveMember } from '@/hooks';

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
}

export function RemoveMemberModal({ isOpen, onClose, memberName, memberId }: RemoveMemberModalProps) {
  const { t } = useTranslation();
  const removeMember = useRemoveMember();
  const [error, setError] = useState('');

  const handleRemove = async () => {
    setError('');
    try {
      await removeMember.mutateAsync(memberId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('team', 'removeMember')}>
      <div className="space-y-4">
        <AlertBox variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
          {t('team', 'removeConfirm')}
        </AlertBox>

        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">{memberName}</span>
        </p>

        {error && (
          <p className="text-sm text-[var(--accent-red)]">{error}</p>
        )}
      </div>

      <ModalActions>
        <button onClick={onClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleRemove}
          disabled={removeMember.isPending}
          className="btn bg-[var(--accent-red)] text-white hover:bg-[var(--accent-red)]/80 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
        >
          {removeMember.isPending ? t('team', 'removing') : t('team', 'removeMember')}
        </button>
      </ModalActions>
    </Modal>
  );
}
