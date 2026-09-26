'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks';
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/api/services/auth.service';
import { showSuccessToast } from '@/lib/toast-i18n';
import { SettingsField, SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';

const prefsKey = ['notificationPrefs'] as const;

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

  const rows: { key: keyof NotificationPrefs; title: 'deploymentAlerts' | 'securityAlerts' | 'weeklyDigest' | 'onboardingEmails'; desc: 'deploymentAlertsDesc' | 'securityAlertsDesc' | 'weeklyDigestDesc' | 'onboardingEmailsDesc' }[] = [
    { key: 'deploymentAlerts', title: 'deploymentAlerts', desc: 'deploymentAlertsDesc' },
    { key: 'securityAlerts', title: 'securityAlerts', desc: 'securityAlertsDesc' },
    { key: 'weeklyDigest', title: 'weeklyDigest', desc: 'weeklyDigestDesc' },
    { key: 'onboardingEmails', title: 'onboardingEmails', desc: 'onboardingEmailsDesc' },
  ];

  return (
    <SettingsSection
      id="notifications-email"
      title={t('notificationPrefs', 'emailNotifications')}
      description={t('notificationPrefs', 'emailNotificationsDesc')}
    >
      {isLoading || !prefs
        ? rows.map((row) => (
            <SettingsField key={row.key} label={t('notificationPrefs', row.title)} hint={t('notificationPrefs', row.desc)}>
              <div className="dash-skeleton h-5 w-9 rounded-full md:mt-2" aria-hidden />
            </SettingsField>
          ))
        : rows.map((row) => (
            <SettingsField
              key={row.key}
              label={t('notificationPrefs', row.title)}
              hint={t('notificationPrefs', row.desc)}
              htmlFor={`notif-${row.key}`}
            >
              <div className="md:pt-2">
                <SettingsSwitch
                  id={`notif-${row.key}`}
                  label={t('notificationPrefs', row.title)}
                  checked={Boolean(prefs[row.key])}
                  onChange={(value) => handleChange(row.key, value)}
                />
              </div>
            </SettingsField>
          ))}
    </SettingsSection>
  );
}
