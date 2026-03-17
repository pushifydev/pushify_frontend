'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from './Modal';
import { useTranslation } from '@/hooks';

interface ApiKeySecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretKey: string;
}

export function ApiKeySecretModal({ isOpen, onClose, secretKey }: ApiKeySecretModalProps) {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('apiKeys', 'secretKey')}
      maxWidth="lg"
    >
      <div className="flex items-center gap-2 text-green-400 mb-4 -mt-2">
        <div className="p-2 rounded-full bg-green-500/20">
          <Check className="w-5 h-5" />
        </div>
        <span className="font-medium">API Key Created Successfully</span>
      </div>

      <AlertBox variant="warning">
        {t('apiKeys', 'secretKeyWarning')}
      </AlertBox>

      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] my-4">
        <div className="flex items-center justify-between gap-4">
          <code className="text-sm terminal-text break-all">{secretKey}</code>
          <button onClick={handleCopyKey} className="btn btn-secondary shrink-0">
            {copiedKey ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                {t('apiKeys', 'keyCopied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('apiKeys', 'copyKey')}
              </>
            )}
          </button>
        </div>
      </div>

      <ModalActions>
        <button onClick={onClose} className="btn btn-primary">
          {t('common', 'continue')}
        </button>
      </ModalActions>
    </Modal>
  );
}
