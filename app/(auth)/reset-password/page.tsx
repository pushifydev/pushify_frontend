'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, ArrowLeft, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { authService } from '@/lib/api/services/auth.service';
import {
  AuthSubmitButton,
  AuthErrorAlert,
  AuthMobileBrand,
  AuthPageHeader,
  AuthPrimaryLink,
} from '@/components/auth';

function ResetPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="w-full animate-slide-in">
        <AuthMobileBrand />
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <AuthPageHeader
            title={t('auth', 'resetPasswordTitle')}
            description={t('auth', 'invalidResetLink')}
          />
        </div>

        <AuthPrimaryLink href="/forgot-password" showArrow={false}>
          {t('auth', 'sendResetLink')}
        </AuthPrimaryLink>

        <Link
          href="/login"
          className="mt-6 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth', 'backToSignIn')}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full animate-slide-in">
        <AuthMobileBrand />
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <AuthPageHeader
            title={t('auth', 'passwordResetSuccess')}
            description={t('auth', 'passwordResetSuccessDesc')}
          />
        </div>

        <AuthPrimaryLink href="/login">{t('auth', 'signIn')}</AuthPrimaryLink>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('profile', 'passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('profile', 'passwordRequirements'));
      return;
    }

    setIsLoading(true);

    const result = await authService.resetPassword(token, password);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />
      <AuthPageHeader
        title={t('auth', 'resetPasswordTitle')}
        description={t('auth', 'resetPasswordDesc')}
      />
      {error && <AuthErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('auth', 'newPasswordLabel')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="input pr-12!"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('auth', 'confirmPasswordLabel')}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="input"
            autoComplete="new-password"
          />
        </div>

        <p className="text-xs text-neutral-500">{t('auth', 'minCharacters')}</p>

        <AuthSubmitButton isLoading={isLoading} disabled={password.length < 8}>
          {t('auth', 'resetPasswordBtn')}
        </AuthSubmitButton>
      </form>

      <Link
        href="/login"
        className="mt-8 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('auth', 'backToSignIn')}
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
