'use client';

import { useState } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from './Modal';
import { useTranslation } from '@/hooks';

interface TwoFactorDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisable: (password: string) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

export function TwoFactorDisableModal({
  isOpen,
  onClose,
  onDisable,
  isPending,
  error,
}: TwoFactorDisableModalProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!password) return;
    await onDisable(password);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('security', 'disableTitle')}
      description={t('security', 'disableDesc')}
    >
      <div className="space-y-4">
        <AlertBox variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
          {t('security', 'disableWarning')}
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
      </div>

      <ModalActions>
        <button onClick={handleClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!password || isPending}
          className="btn bg-red-500 hover:bg-red-600 text-white"
        >
          {isPending ? t('security', 'disabling') : t('security', 'confirmDisable')}
        </button>
      </ModalActions>
    </Modal>
  );
}
