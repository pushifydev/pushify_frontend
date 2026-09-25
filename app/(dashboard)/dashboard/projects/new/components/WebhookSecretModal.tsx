'use client';

import { ClipboardCopy, Loader2, Rocket } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Modal, ModalActions } from '@/components/Modal';

interface WebhookSecretDialog {
  projectId: string;
  secret: string;
  webhookUrl: string;
}

interface WebhookSecretModalProps {
  webhookSecretDialog: WebhookSecretDialog | null;
  isCreating: boolean;
  closeWebhookDialogAndDeploy: () => void;
  copyWebhookUrl: () => void;
  copyWebhookSecret: () => void;
}

export function WebhookSecretModal({
  webhookSecretDialog,
  isCreating,
  closeWebhookDialogAndDeploy,
  copyWebhookUrl,
  copyWebhookSecret,
}: WebhookSecretModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={!!webhookSecretDialog}
      onClose={closeWebhookDialogAndDeploy}
      title={t('newProject', 'webhookSetupOnceTitle')}
      description={t('newProject', 'webhookSetupOnceDesc')}
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div>
          <p className="dash-section-label mb-1.5">
            {t('newProject', 'webhookUrlLabel')}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-2">{t('newProject', 'webhookUrlOnceHint')}</p>
          <div
            className="rounded-[10px] p-3 font-mono text-xs sm:text-sm break-all border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          >
            {webhookSecretDialog?.webhookUrl}
          </div>
          <button
            type="button"
            onClick={copyWebhookUrl}
            className="btn btn-secondary mt-2"
          >
            <ClipboardCopy className="w-4 h-4" />
            {t('newProject', 'webhookUrlCopy')}
          </button>
        </div>

        <div>
          <p className="dash-section-label mb-1.5">
            {t('newProject', 'webhookSecretLabel')}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-2">{t('newProject', 'webhookSecretOnceHint')}</p>
          <div
            className="rounded-[10px] p-3 font-mono text-xs sm:text-sm break-all border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
          >
            {webhookSecretDialog?.secret}
          </div>
          <button
            type="button"
            onClick={copyWebhookSecret}
            className="btn btn-secondary mt-2"
          >
            <ClipboardCopy className="w-4 h-4" />
            {t('newProject', 'webhookSecretCopy')}
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">{t('newProject', 'webhookSetupFootnote')}</p>

        <ModalActions>
          <button
            type="button"
            onClick={closeWebhookDialogAndDeploy}
            disabled={isCreating}
            className="btn btn-primary"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {t('newProject', 'webhookSecretContinue')}
          </button>
        </ModalActions>
      </div>
    </Modal>
  );
}
