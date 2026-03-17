'use client';

import { useState } from 'react';
import { Smartphone, Shield, Check } from 'lucide-react';
import {
  useTranslation,
  use2FAStatus,
  useSetup2FA,
  useEnable2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
} from '@/hooks';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';
import { TwoFactorDisableModal } from './TwoFactorDisableModal';
import { RegenerateBackupCodesModal } from './RegenerateBackupCodesModal';

interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function SecurityTab() {
  const { t } = useTranslation();

  // 2FA hooks
  const { data: twoFactorStatus, isLoading: isLoading2FA } = use2FAStatus();
  const setup2FA = useSetup2FA();
  const enable2FA = useEnable2FA();
  const disable2FA = useDisable2FA();
  const regenerateBackupCodes = useRegenerateBackupCodes();

  // Modal states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setError(null);
    try {
      const result = await setup2FA.mutateAsync();
      setSetupData(result);
      setShowSetupModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    }
  };

  const handleEnable = async (code: string) => {
    if (!setupData) return;
    setError(null);
    try {
      await enable2FA.mutateAsync({
        code,
        backupCodes: setupData.backupCodes,
      });
      setShowSetupModal(false);
      setSetupData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
      throw err;
    }
  };

  const handleDisable = async (password: string) => {
    setError(null);
    try {
      await disable2FA.mutateAsync(password);
      setShowDisableModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      throw err;
    }
  };

  const handleRegenerate = async (password: string): Promise<string[]> => {
    setError(null);
    try {
      const result = await regenerateBackupCodes.mutateAsync(password);
      return result.backupCodes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes');
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('security', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('security', 'description')}</p>
      </div>

      {/* 2FA Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
              <Smartphone className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{t('security', 'twoFactor')}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-lg">
                    {t('security', 'twoFactorDesc')}
                  </p>
                  {isLoading2FA ? (
                    <div className="h-7 w-24 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
                  ) : twoFactorStatus?.enabled ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <Check className="w-4 h-4" />
                      {t('security', 'enabled')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      <Shield className="w-4 h-4" />
                      {t('security', 'disabled')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)]">
          {isLoading2FA ? (
            <div className="h-10 w-32 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          ) : twoFactorStatus?.enabled ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setShowRegenerateModal(true);
                }}
                className="btn btn-secondary"
              >
                {t('security', 'regenerateBackupCodes')}
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setShowDisableModal(true);
                }}
                className="btn btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/30"
              >
                {t('security', 'disable')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartSetup}
              disabled={setup2FA.isPending}
              className="btn btn-primary"
            >
              {setup2FA.isPending ? t('common', 'loading') : t('security', 'enable')}
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {setupData && (
        <TwoFactorSetupModal
          isOpen={showSetupModal}
          onClose={() => {
            setShowSetupModal(false);
            setSetupData(null);
            setError(null);
          }}
          setupData={setupData}
          onEnable={handleEnable}
          isPending={enable2FA.isPending}
          error={error}
        />
      )}

      <TwoFactorDisableModal
        isOpen={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setError(null);
        }}
        onDisable={handleDisable}
        isPending={disable2FA.isPending}
        error={error}
      />

      <RegenerateBackupCodesModal
        isOpen={showRegenerateModal}
        onClose={() => {
          setShowRegenerateModal(false);
          setError(null);
        }}
        onRegenerate={handleRegenerate}
        isPending={regenerateBackupCodes.isPending}
        error={error}
      />
    </div>
  );
}
