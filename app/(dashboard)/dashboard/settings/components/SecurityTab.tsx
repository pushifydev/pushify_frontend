'use client';

import { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  useTranslation,
  use2FAStatus,
  useSetup2FA,
  useEnable2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
} from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';
import { TwoFactorDisableModal } from './TwoFactorDisableModal';
import { RegenerateBackupCodesModal } from './RegenerateBackupCodesModal';
import { SettingsSection } from '@/components/dashboard/SettingsParts';

interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function SecurityTab() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  // Default true so older backends (no hasPassword field) keep the password flow
  const hasPassword = user?.hasPassword ?? true;

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

  const handleDisable = async (credentials: { password?: string; twoFactorCode?: string }) => {
    setError(null);
    try {
      await disable2FA.mutateAsync(credentials);
      setShowDisableModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      throw err;
    }
  };

  const handleRegenerate = async (credentials: {
    password?: string;
    twoFactorCode?: string;
  }): Promise<string[]> => {
    setError(null);
    try {
      const result = await regenerateBackupCodes.mutateAsync(credentials);
      return result.backupCodes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes');
      throw err;
    }
  };

  const enabled2FA = !!twoFactorStatus?.enabled;

  return (
    <>
      <SettingsSection
        id="security-2fa"
        title={t('security', 'twoFactor')}
        description={t('security', 'twoFactorDesc')}
        action={
          isLoading2FA ? undefined : (
            <span className={`badge ${enabled2FA ? 'badge-success' : 'badge-neutral'}`}>
              {enabled2FA ? t('security', 'enabled') : t('security', 'disabled')}
            </span>
          )
        }
        padded
        footer={
          isLoading2FA ? (
            <div className="dash-skeleton h-9 w-32 rounded-full" aria-hidden />
          ) : enabled2FA ? (
            <>
              <button
                onClick={() => {
                  setError(null);
                  setShowRegenerateModal(true);
                }}
                className="btn btn-secondary"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('security', 'regenerateBackupCodes')}
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setShowDisableModal(true);
                }}
                className="btn btn-secondary text-[var(--status-error)]"
              >
                {t('security', 'disable')}
              </button>
              <p className="text-xs text-[var(--text-muted)] min-w-0 sm:ml-auto">{t('security', 'backupCodesHint')}</p>
            </>
          ) : (
            <button onClick={handleStartSetup} disabled={setup2FA.isPending} className="btn btn-primary">
              {setup2FA.isPending ? t('common', 'loading') : t('security', 'enable')}
            </button>
          )
        }
      >
        {isLoading2FA ? (
          <div className="dash-skeleton h-10 w-full max-w-sm rounded-lg" aria-hidden />
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className={`dash-status-dot mt-[7px] ${enabled2FA ? 'is-success' : ''}`} aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {enabled2FA ? t('security', 'statusOnTitle') : t('security', 'statusOffTitle')}
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                  {enabled2FA ? t('security', 'statusOnDesc') : t('security', 'statusOffDesc')}
                </p>
              </div>
            </div>

            {/* When off: what enabling gets you */}
            {!enabled2FA && (
              <ul className="space-y-1.5 pl-4">
                {[
                  t('security', 'benefitApps'),
                  t('security', 'benefitBackup'),
                  t('security', 'benefitEverywhere'),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SettingsSection>

      {/* Sign-in methods */}
      <SettingsSection id="security-signin" title={t('security', 'signInTitle')} description={t('security', 'signInDesc')}>
        <div className="dash-settings-rows">
          <div className="dash-row flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`dash-status-dot ${hasPassword ? 'is-success' : ''}`} aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('security', 'methodPassword')}</p>
                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                  {hasPassword ? t('security', 'methodPasswordSet') : t('security', 'methodPasswordUnset')}
                </p>
              </div>
            </div>
            {hasPassword ? (
              <span className="badge badge-success shrink-0">{t('security', 'active')}</span>
            ) : (
              <Link href="/dashboard/settings?tab=profile" className="btn btn-secondary btn-sm shrink-0">
                {t('security', 'methodSetAction')}
              </Link>
            )}
          </div>

          {!hasPassword && (
            <div className="dash-row flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="dash-status-dot is-success" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t('security', 'methodSocial')}</p>
                  <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{t('security', 'methodSocialDesc')}</p>
                </div>
              </div>
              <span className="badge badge-success shrink-0">{t('security', 'active')}</span>
            </div>
          )}
        </div>
      </SettingsSection>

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
        hasPassword={hasPassword}
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
        hasPassword={hasPassword}
      />
    </>
  );
}
