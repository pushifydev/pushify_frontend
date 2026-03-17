'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useTranslation, useUpdateProfile, useChangePassword } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { AlertBox } from './Modal';

export function ProfileTab() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSaved(false);

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordChanged(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile', 'passwordMismatch'));
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setPasswordError(t('profile', 'passwordRequirements'));
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      setPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const isProfileChanged = name !== user?.name || avatarUrl !== (user?.avatarUrl || '');
  const canChangePassword = currentPassword && newPassword && confirmPassword;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('profile', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('profile', 'description')}</p>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
              <User className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{t('profile', 'personalInfo')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('profile', 'personalInfoDesc')}
              </p>

              {profileError && (
                <div className="mb-4">
                  <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
                    {profileError}
                  </AlertBox>
                </div>
              )}

              {profileSaved && (
                <div className="mb-4">
                  <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
                    {t('profile', 'saved')}
                  </AlertBox>
                </div>
              )}

              <div className="space-y-4 max-w-md">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('profile', 'namePlaceholder')}
                    className="input w-full"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'email')}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input w-full opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t('profile', 'emailHint')}
                  </p>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'avatarUrl')}
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={t('profile', 'avatarUrlPlaceholder')}
                    className="input w-full"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t('profile', 'avatarHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleSaveProfile}
            disabled={!isProfileChanged || updateProfile.isPending}
            className="btn btn-primary"
          >
            {updateProfile.isPending ? t('profile', 'saving') : t('profile', 'saveChanges')}
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Lock className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{t('profile', 'changePassword')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {t('profile', 'changePasswordDesc')}
              </p>

              {passwordError && (
                <div className="mb-4">
                  <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
                    {passwordError}
                  </AlertBox>
                </div>
              )}

              {passwordChanged && (
                <div className="mb-4">
                  <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
                    {t('profile', 'passwordChanged')}
                  </AlertBox>
                </div>
              )}

              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'currentPassword')}
                  </label>
                  <div className="relative">
                    <input
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
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'newPassword')}
                  </label>
                  <div className="relative">
                    <input
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
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t('profile', 'passwordRequirements')}
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('profile', 'confirmNewPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input w-full"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="px-6 py-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleChangePassword}
            disabled={!canChangePassword || changePassword.isPending}
            className="btn btn-primary"
          >
            {changePassword.isPending ? t('profile', 'updating') : t('profile', 'changePassword')}
          </button>
        </div>
      </div>
    </div>
  );
}
