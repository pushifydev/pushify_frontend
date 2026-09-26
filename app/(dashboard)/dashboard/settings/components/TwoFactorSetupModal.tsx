'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from './Modal';
import { useTranslation } from '@/hooks';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupData: {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  };
  onEnable: (code: string) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

export function TwoFactorSetupModal({
  isOpen,
  onClose,
  setupData,
  onEnable,
  isPending,
  error,
}: TwoFactorSetupModalProps) {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const handleClose = () => {
    setVerificationCode('');
    setCopiedBackupCodes(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (verificationCode.length < 6) return;
    await onEnable(verificationCode);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('security', 'setupTitle')}
      description={t('security', 'setupDesc')}
      maxWidth="lg"
    >
      {error && (
        <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
          {error}
        </AlertBox>
      )}

      {/* Step 1: QR Code */}
      <div className="mb-6 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] terminal-text text-xs">
            1
          </span>
          <h3 className="font-medium">{t('security', 'scanQrCode')}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4 ml-8">
          {t('security', 'scanQrCodeDesc')}
        </p>
        <div className="flex justify-center p-6 bg-white rounded-xl ml-8">
          <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
        </div>
      </div>

      {/* Step 2: Verification Code */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] terminal-text text-xs">
            2
          </span>
          <h3 className="font-medium">{t('security', 'enterCode')}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-3 ml-8">
          {t('security', 'enterCodeDesc')}
        </p>
        <div className="ml-8">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="input w-full text-center text-2xl tracking-[0.5em] font-mono"
            autoComplete="one-time-code"
          />
        </div>
      </div>

      {/* Step 3: Backup Codes */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] terminal-text text-xs">
            3
          </span>
          <h3 className="font-medium">{t('security', 'backupCodes')}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-3 ml-8">
          {t('security', 'backupCodesDesc')}
        </p>
        <div className="ml-8">
          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] mb-3">
            <div className="flex items-start gap-2 text-[var(--status-warning)] text-sm mb-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t('security', 'backupCodesWarning')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="text-sm font-mono bg-[var(--bg-secondary)] p-2 rounded-lg text-center border border-[var(--border-subtle)]"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>
          <button onClick={handleCopyBackupCodes} className="btn btn-secondary w-full">
            {copiedBackupCodes ? (
              <>
                <Check className="w-4 h-4 text-[var(--status-success)]" />
                {t('apiKeys', 'keyCopied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('security', 'copyBackupCodes')}
              </>
            )}
          </button>
        </div>
      </div>

      <ModalActions>
        <button onClick={handleClose} className="btn btn-ghost">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={verificationCode.length < 6 || isPending}
          className="btn btn-primary"
        >
          {isPending ? t('security', 'enabling') : t('security', 'confirmEnable')}
        </button>
      </ModalActions>
    </Modal>
  );
}
