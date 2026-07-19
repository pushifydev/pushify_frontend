'use client';

import { useState } from 'react';
import { Check, KeyRound, Mail, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react';
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
import { SettingsCard } from './SettingsCard';

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('security', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('security', 'description')}</p>
      </div>

      {/* 2FA Card */}
      <SettingsCard
        title={t('security', 'twoFactor')}
        description={t('security', 'twoFactorDesc')}
        footerHint={twoFactorStatus?.enabled ? t('security', 'backupCodesHint') : undefined}
        footer={
          isLoading2FA ? (
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
                <RefreshCw className="w-3.5 h-3.5" />
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
          )
        }
      >
        {isLoading2FA ? (
          <div className="h-14 w-full max-w-sm bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-5">
            {/* Status row — icon plate + state */}
            <div className="flex items-start gap-3.5">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={
                  twoFactorStatus?.enabled
                    ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }
                    : { background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }
                }
              >
                {twoFactorStatus?.enabled ? (
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <ShieldOff className="w-5 h-5 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {twoFactorStatus?.enabled
                    ? t('security', 'statusOnTitle')
                    : t('security', 'statusOffTitle')}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {twoFactorStatus?.enabled
                    ? t('security', 'statusOnDesc')
                    : t('security', 'statusOffDesc')}
                </p>
              </div>
            </div>

            {/* When off: what enabling gets you */}
            {!twoFactorStatus?.enabled && (
              <ul className="space-y-2 pl-[3.4rem]">
                {[
                  t('security', 'benefitApps'),
                  t('security', 'benefitBackup'),
                  t('security', 'benefitEverywhere'),
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--text-secondary)]"
                  >
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-muted)]" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SettingsCard>

      {/* Sign-in method card */}
      <SettingsCard title={t('security', 'signInTitle')} description={t('security', 'signInDesc')}>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/40">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <KeyRound className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('security', 'methodPassword')}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {hasPassword
                  ? t('security', 'methodPasswordSet')
                  : t('security', 'methodPasswordUnset')}
              </p>
            </div>
            {hasPassword ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
                <Check className="w-3 h-3" />
                {t('security', 'active')}
              </span>
            ) : (
              <Link
                href="/dashboard/settings?tab=profile"
                className="btn btn-secondary h-8 text-xs shrink-0"
              >
                {t('security', 'methodSetAction')}
              </Link>
            )}
          </div>

          {!hasPassword && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/40">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t('security', 'methodSocial')}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t('security', 'methodSocialDesc')}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
                <Check className="w-3 h-3" />
                {t('security', 'active')}
              </span>
            </div>
          )}
        </div>
      </SettingsCard>

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
    </div>
  );
}
