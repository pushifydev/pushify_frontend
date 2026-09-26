'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation, useUpdateProfile, useChangePassword } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-i18n';
import { SettingsSection, SettingsField } from '@/components/dashboard/SettingsParts';

export function ProfileTab() {
  const { t, locale } = useTranslation();
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
  const showLabel = locale === 'tr' ? 'Şifreyi göster' : 'Show password';
  const hideLabel = locale === 'tr' ? 'Şifreyi gizle' : 'Hide password';
  const canChangePassword = (!hasPassword || currentPassword) && newPassword && confirmPassword;

  const reveal = (shown: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? hideLabel : showLabel}
      aria-pressed={shown}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 dash-icon-action"
    >
      {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <>
      <SettingsSection
        id="profile-info"
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
        <SettingsField label={t('profile', 'name')} htmlFor="profile-name">
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile', 'namePlaceholder')}
            className="input w-full"
            autoComplete="name"
          />
        </SettingsField>

        <SettingsField label={t('profile', 'email')} htmlFor="profile-email" hint={t('profile', 'emailHint')}>
          <input
            id="profile-email"
            type="email"
            value={user?.email || ''}
            disabled
            className="input w-full terminal-text opacity-60 cursor-not-allowed"
          />
        </SettingsField>

        <SettingsField label={t('profile', 'avatarUrl')} htmlFor="profile-avatar" hint={t('profile', 'avatarHint')}>
          <input
            id="profile-avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder={t('profile', 'avatarUrlPlaceholder')}
            className="input w-full terminal-text"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        id="profile-password"
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
        {hasPassword && (
          <SettingsField label={t('profile', 'currentPassword')} htmlFor="profile-current-password">
            <div className="relative">
              <input
                id="profile-current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pr-11!"
                autoComplete="current-password"
              />
              {reveal(showCurrentPassword, () => setShowCurrentPassword(!showCurrentPassword))}
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
              className="input w-full pr-11!"
              autoComplete="new-password"
            />
            {reveal(showNewPassword, () => setShowNewPassword(!showNewPassword))}
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
      </SettingsSection>
    </>
  );
}
