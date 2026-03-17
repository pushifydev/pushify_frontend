'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Shield, Calendar, Sparkles, Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { AlertBox } from './Modal';

interface NotificationPreferences {
  deploymentAlerts: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
}

const STORAGE_KEY = 'pushify_notification_prefs';

const defaultPreferences: NotificationPreferences = {
  deploymentAlerts: true,
  securityAlerts: true,
  weeklyDigest: false,
  productUpdates: false,
};

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
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

interface NotificationItemProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function NotificationItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  enabled,
  onChange,
}: NotificationItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

export function NotificationsTab() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        // Use defaults if parsing fails
      }
    }
    setLoaded(true);
  }, []);

  const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('notificationPrefs', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('notificationPrefs', 'description')}</p>
      </div>

      {saved && (
        <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
          {t('notificationPrefs', 'saved')}
        </AlertBox>
      )}

      {/* Email Notifications Section */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {t('notificationPrefs', 'emailNotifications')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('notificationPrefs', 'emailNotificationsDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Items */}
      <div className="space-y-3">
        <NotificationItem
          icon={Bell}
          iconColor="text-[var(--accent-cyan)]"
          iconBg="bg-[var(--accent-cyan)]/20"
          title={t('notificationPrefs', 'deploymentAlerts')}
          description={t('notificationPrefs', 'deploymentAlertsDesc')}
          enabled={preferences.deploymentAlerts}
          onChange={(value) => handleChange('deploymentAlerts', value)}
        />

        <NotificationItem
          icon={Shield}
          iconColor="text-red-400"
          iconBg="bg-red-500/20"
          title={t('notificationPrefs', 'securityAlerts')}
          description={t('notificationPrefs', 'securityAlertsDesc')}
          enabled={preferences.securityAlerts}
          onChange={(value) => handleChange('securityAlerts', value)}
        />

        <NotificationItem
          icon={Calendar}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/20"
          title={t('notificationPrefs', 'weeklyDigest')}
          description={t('notificationPrefs', 'weeklyDigestDesc')}
          enabled={preferences.weeklyDigest}
          onChange={(value) => handleChange('weeklyDigest', value)}
        />

        <NotificationItem
          icon={Sparkles}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/20"
          title={t('notificationPrefs', 'productUpdates')}
          description={t('notificationPrefs', 'productUpdatesDesc')}
          enabled={preferences.productUpdates}
          onChange={(value) => handleChange('productUpdates', value)}
        />
      </div>
    </div>
  );
}
