'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks';
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/api/services/auth.service';
import { showSuccessToast } from '@/lib/toast-i18n';
import { SettingsCard, SettingsRow } from './SettingsCard';

const prefsKey = ['notificationPrefs'] as const;

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 ${
        enabled ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-tertiary)]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function NotificationsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: prefsKey,
    queryFn: async () => {
      const result = await getNotificationPrefs();
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
  });

  const mutation = useMutation({
    mutationFn: async (input: Partial<NotificationPrefs>) => {
      const result = await updateNotificationPrefs(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(prefsKey, data);
      showSuccessToast('notificationPrefsSavedTitle', 'notificationPrefsSavedDesc');
    },
  });

  const handleChange = (key: keyof NotificationPrefs, value: boolean) => {
    // Optimistic flip so the toggle feels instant; server response reconciles
    queryClient.setQueryData(prefsKey, (prev: NotificationPrefs | undefined) =>
      prev ? { ...prev, [key]: value } : prev
    );
    mutation.mutate({ [key]: value });
  };

  if (isLoading || !prefs) {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        <div>
          <h2 className="text-xl font-semibold mb-1">{t('notificationPrefs', 'title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('notificationPrefs', 'description')}</p>
        </div>
        <div className="h-64 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('notificationPrefs', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('notificationPrefs', 'description')}</p>
      </div>

      {/* Email Notifications */}
      <SettingsCard
        title={t('notificationPrefs', 'emailNotifications')}
        description={t('notificationPrefs', 'emailNotificationsDesc')}
      >
        <div className="divide-y divide-[var(--border-subtle)]">
          <SettingsRow
            title={t('notificationPrefs', 'deploymentAlerts')}
            description={t('notificationPrefs', 'deploymentAlertsDesc')}
            control={
              <Toggle
                enabled={prefs.deploymentAlerts}
                onChange={(value) => handleChange('deploymentAlerts', value)}
              />
            }
          />
          <SettingsRow
            title={t('notificationPrefs', 'securityAlerts')}
            description={t('notificationPrefs', 'securityAlertsDesc')}
            control={
              <Toggle
                enabled={prefs.securityAlerts}
                onChange={(value) => handleChange('securityAlerts', value)}
              />
            }
          />
          <SettingsRow
            title={t('notificationPrefs', 'weeklyDigest')}
            description={t('notificationPrefs', 'weeklyDigestDesc')}
            control={
              <Toggle
                enabled={prefs.weeklyDigest}
                onChange={(value) => handleChange('weeklyDigest', value)}
              />
            }
          />
          <SettingsRow
            title={t('notificationPrefs', 'productUpdates')}
            description={t('notificationPrefs', 'productUpdatesDesc')}
            control={
              <Toggle
                enabled={prefs.productUpdates}
                onChange={(value) => handleChange('productUpdates', value)}
              />
            }
          />
          <SettingsRow
            title={t('notificationPrefs', 'onboardingEmails')}
            description={t('notificationPrefs', 'onboardingEmailsDesc')}
            control={
              <Toggle
                enabled={prefs.onboardingEmails}
                onChange={(value) => handleChange('onboardingEmails', value)}
              />
            }
          />
        </div>
      </SettingsCard>
    </div>
  );
}
