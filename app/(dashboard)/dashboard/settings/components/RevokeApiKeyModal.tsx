'use client';

import { Modal, ModalActions } from './Modal';
import { useTranslation } from '@/hooks';

interface RevokeApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevoke: () => Promise<void>;
  isPending: boolean;
}

export function RevokeApiKeyModal({
  isOpen,
  onClose,
  onRevoke,
  isPending,
}: RevokeApiKeyModalProps) {
  const { t } = useTranslation();

  const handleRevoke = async () => {
    await onRevoke();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('apiKeys', 'revoke')}>
      <p className="text-[var(--text-secondary)]">{t('apiKeys', 'revokeConfirm')}</p>

      <ModalActions>
        <button onClick={onClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleRevoke}
          disabled={isPending}
          className="btn bg-red-500 hover:bg-red-600 text-white"
        >
          {isPending ? t('apiKeys', 'revoking') : t('apiKeys', 'revoke')}
        </button>
      </ModalActions>
    </Modal>
  );
}
