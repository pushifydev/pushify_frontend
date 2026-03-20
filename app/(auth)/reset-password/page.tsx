'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { authService } from '@/lib/api/services/auth.service';

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

  // No token — invalid link
  if (!token) {
    return (
      <div className="w-full animate-slide-in">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {t('auth', 'resetPasswordTitle')}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t('auth', 'invalidResetLink')}
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="btn btn-primary w-full h-12 text-base"
        >
          {t('auth', 'sendResetLink')}
        </Link>

        <Link
          href="/login"
          className="mt-6 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth', 'backToSignIn')}
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="w-full animate-slide-in">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {t('auth', 'passwordResetSuccess')}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t('auth', 'passwordResetSuccessDesc')}
          </p>
        </div>

        <Link
          href="/login"
          className="btn btn-primary w-full h-12 text-base group"
        >
          {t('auth', 'signIn')}
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
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
      {/* Mobile logo */}
      <div className="lg:hidden mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--bg-primary)]"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">Pushify</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {t('auth', 'resetPasswordTitle')}
        </h2>
        <p className="text-[var(--text-secondary)]">
          {t('auth', 'resetPasswordDesc')}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--status-error)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--status-error)]">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
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

        {/* Password requirements hint */}
        <p className="text-xs text-[var(--text-muted)]">
          {t('auth', 'minCharacters')}
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || password.length < 8}
          className="btn btn-primary w-full h-12 text-base group relative overflow-hidden"
        >
          <span className={isLoading ? 'opacity-0' : ''}>
            {t('auth', 'resetPasswordBtn')}
          </span>
          {!isLoading && (
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      </form>

      {/* Back to login */}
      <Link
        href="/login"
        className="mt-8 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
