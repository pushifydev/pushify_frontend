'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation, useUpdateProfile, useChangePassword } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-i18n';
import { SettingsCard, SettingsField } from './SettingsCard';

export function ProfileTab() {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuthStore();
  // OAuth-only accounts (Google/GitHub) have no password yet — they SET one here
  const hasPassword = user?.hasPassword ?? true;
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Server/mutation errors are surfaced by the global MutationCache toast.
    await updateProfile.mutateAsync({
      name: name.trim(),
      avatarUrl: avatarUrl.trim() || null,
    });
    showSuccessToast('profileUpdatedTitle', 'profileUpdatedDesc');
  };

  const handleChangePassword = async () => {
    // Client-side validation
    if (newPassword !== confirmPassword) {
      showErrorToast('passwordMismatchTitle', 'passwordMismatchDesc');
      return;
    }
    if (newPassword.length < 8) {
      showErrorToast('passwordTooShortTitle', 'passwordTooShortDesc');
      return;
    }

    // Server/mutation errors are surfaced by the global MutationCache toast.
    await changePassword.mutateAsync({
      ...(hasPassword ? { currentPassword } : {}),
      newPassword,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSuccessToast('passwordChangedTitle', 'passwordChangedDesc');
    // First password just set — refresh the user so hasPassword flips everywhere
    if (!hasPassword) void checkAuth();
  };

  const isProfileChanged = name !== user?.name || avatarUrl !== (user?.avatarUrl || '');
  const canChangePassword = (!hasPassword || currentPassword) && newPassword && confirmPassword;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('profile', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('profile', 'description')}</p>
      </div>

      {/* Personal Information Card */}
      <SettingsCard
        title={t('profile', 'personalInfo')}
        description={t('profile', 'personalInfoDesc')}
        footer={
          <button
            onClick={handleSaveProfile}
            disabled={!isProfileChanged || updateProfile.isPending}
            className="btn btn-primary"
          >
            {updateProfile.isPending ? t('profile', 'saving') : t('profile', 'saveChanges')}
          </button>
        }
      >
        <div className="space-y-4 max-w-md">
          <SettingsField label={t('profile', 'name')} htmlFor="profile-name">
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile', 'namePlaceholder')}
              className="input w-full"
            />
          </SettingsField>

          <SettingsField label={t('profile', 'email')} htmlFor="profile-email" hint={t('profile', 'emailHint')}>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              disabled
              className="input w-full opacity-60 cursor-not-allowed"
            />
          </SettingsField>

          <SettingsField label={t('profile', 'avatarUrl')} htmlFor="profile-avatar" hint={t('profile', 'avatarHint')}>
            <input
              id="profile-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={t('profile', 'avatarUrlPlaceholder')}
              className="input w-full"
            />
          </SettingsField>
        </div>
      </SettingsCard>

      {/* Change Password Card */}
      <SettingsCard
        title={hasPassword ? t('profile', 'changePassword') : t('profile', 'setPassword')}
        description={hasPassword ? t('profile', 'changePasswordDesc') : t('profile', 'setPasswordDesc')}
        footer={
          <button
            onClick={handleChangePassword}
            disabled={!canChangePassword || changePassword.isPending}
            className="btn btn-primary"
          >
            {changePassword.isPending
              ? t('profile', 'updating')
              : hasPassword
                ? t('profile', 'changePassword')
                : t('profile', 'setPassword')}
          </button>
        }
      >
        <div className="space-y-4 max-w-md">
          {hasPassword && (
          <SettingsField label={t('profile', 'currentPassword')} htmlFor="profile-current-password">
            <div className="relative">
              <input
                id="profile-current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </SettingsField>
          )}

          <SettingsField
            label={t('profile', 'newPassword')}
            htmlFor="profile-new-password"
            hint={t('profile', 'passwordRequirements')}
          >
            <div className="relative">
              <input
                id="profile-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </SettingsField>

          <SettingsField label={t('profile', 'confirmNewPassword')} htmlFor="profile-confirm-password">
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input w-full"
              autoComplete="new-password"
            />
          </SettingsField>
        </div>
      </SettingsCard>
    </div>
  );
}
