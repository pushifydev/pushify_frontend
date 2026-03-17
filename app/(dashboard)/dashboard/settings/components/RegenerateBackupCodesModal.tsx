'use client';

import { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, Check, Copy } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from './Modal';
import { useTranslation } from '@/hooks';

interface RegenerateBackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (password: string) => Promise<string[]>;
  isPending: boolean;
  error: string | null;
}

export function RegenerateBackupCodesModal({
  isOpen,
  onClose,
  onRegenerate,
  isPending,
  error,
}: RegenerateBackupCodesModalProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setNewBackupCodes(null);
    setCopiedBackupCodes(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!password) return;
    const codes = await onRegenerate(password);
    if (codes) {
      setNewBackupCodes(codes);
      setPassword('');
    }
  };

  const handleCopyBackupCodes = () => {
    if (!newBackupCodes) return;
    navigator.clipboard.writeText(newBackupCodes.join('\n'));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('security', 'regenerateTitle')}
      description={t('security', 'regenerateDesc')}
    >
      {!newBackupCodes ? (
        <div className="space-y-4">
          <AlertBox variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
            {t('security', 'regenerateWarning')}
          </AlertBox>

          {error && (
            <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
              {error}
            </AlertBox>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('security', 'enterPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <ModalActions>
            <button onClick={handleClose} className="btn btn-secondary">
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!password || isPending}
              className="btn btn-primary"
            >
              {isPending ? t('security', 'regenerating') : t('security', 'confirmRegenerate')}
            </button>
          </ModalActions>
        </div>
      ) : (
        <div className="space-y-4">
          <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
            {t('security', 'regeneratedSuccess')}
          </AlertBox>

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {t('security', 'backupCodesDesc')}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {newBackupCodes.map((code, index) => (
                <code
                  key={index}
                  className="text-sm font-mono bg-[var(--bg-secondary)] p-2 rounded-lg text-center border border-[var(--border-subtle)]"
                >
                  {code}
                </code>
              ))}
            </div>
            <button onClick={handleCopyBackupCodes} className="btn btn-secondary w-full">
              {copiedBackupCodes ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
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

          <ModalActions>
            <button onClick={handleClose} className="btn btn-primary">
              {t('common', 'continue')}
            </button>
          </ModalActions>
        </div>
      )}
    </Modal>
  );
}
