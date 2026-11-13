'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrganization, useUpdateTwoFactorPolicy } from '@/hooks/useOrganization';
import { use2FAStatus } from '@/hooks/use2FA';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/stores/auth';
import { SettingsField, SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';

const TWO_FACTOR_SETUP_PATH = '/dashboard/settings?tab=security';

/**
 * Organization-wide "require 2FA for all members". Owners and admins get the switch;
 * members and viewers only see whether it is on.
 */
export function OrganizationSecuritySection({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuthStore();
  const { data: org } = useOrganization();
  const { data: twoFactorStatus } = use2FAStatus();
  const updatePolicy = useUpdateTwoFactorPolicy();
  const [error, setError] = useState('');

  const canManage = org?.role === 'owner' || org?.role === 'admin';
  const required = !!org?.requireTwoFactor;
  // The status query refreshes right after 2FA is enabled; /auth/me is the fallback while it loads.
  const ownTwoFactorEnabled = twoFactorStatus?.enabled ?? !!user?.twoFactorEnabled;

  const handleChange = async (next: boolean) => {
    setError('');

    if (next) {
      // Requiring 2FA without having it would lock the admin out too: set it up first.
      if (!ownTwoFactorEnabled) {
        const goToSetup = await confirm({
          variant: 'info',
          title: t('team', 'twoFactorOwnFirstTitle'),
          description: t('team', 'twoFactorOwnFirstDesc'),
          confirmText: t('team', 'twoFactorOwnFirstCta'),
          cancelText: t('common', 'cancel'),
        });
        if (goToSetup) router.push(TWO_FACTOR_SETUP_PATH);
        return;
      }

      const confirmed = await confirm({
        variant: 'warning',
        title: t('team', 'twoFactorConfirmTitle'),
        description: t('team', 'twoFactorConfirmDesc'),
        confirmText: t('team', 'twoFactorConfirmCta'),
        cancelText: t('common', 'cancel'),
      });
      if (!confirmed) return;
    }

    try {
      await updatePolicy.mutateAsync(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('team', 'twoFactorPolicyFailed'));
    }
  };

  return (
    <SettingsSection
      id={id}
      title={t('team', 'securityTitle')}
      description={t('team', 'securityDesc')}
      footer={
        error ? (
          <span className="text-[13px] text-[var(--status-error)]" role="alert">
            {error}
          </span>
        ) : undefined
      }
    >
      <SettingsField
        label={t('team', 'requireTwoFactor')}
        hint={canManage ? t('team', 'requireTwoFactorHint') : t('team', 'requireTwoFactorReadOnly')}
        htmlFor={canManage ? 'org-require-2fa' : undefined}
      >
        {canManage ? (
          <SettingsSwitch
            id="org-require-2fa"
            checked={required}
            onChange={handleChange}
            disabled={!org || updatePolicy.isPending}
            label={t('team', 'requireTwoFactor')}
          />
        ) : (
          <span className={`badge ${required ? 'badge-success' : 'badge-neutral'}`}>
            {required ? t('team', 'requireTwoFactorOn') : t('team', 'requireTwoFactorOff')}
          </span>
        )}
      </SettingsField>
    </SettingsSection>
  );
}
