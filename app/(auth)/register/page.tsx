'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, AlertCircle, Check, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { getGithubLoginUrl, getGoogleLoginUrl } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleGithubLogin = async () => {
    const result = await getGithubLoginUrl();
    if (result.error || !result.data) return;

    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('github_oauth_state', state);
    sessionStorage.setItem('github_oauth_intent', 'login');

    const url = new URL(result.data.url);
    url.searchParams.set('state', state);
    window.location.href = url.toString();
  };

  const handleGoogleLogin = async () => {
    const result = await getGoogleLoginUrl();
    if (result.error || !result.data) return;

    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('google_oauth_state', state);

    const url = new URL(result.data.url);
    url.searchParams.set('state', state);
    window.location.href = url.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isPasswordValid) return;

    const success = await register(email, password, name);
    if (success) {
      const pendingToken = sessionStorage.getItem('pending_invitation_token');
      if (pendingToken) {
        sessionStorage.removeItem('pending_invitation_token');
        router.push(`/accept-invitation?token=${pendingToken}`);
      } else {
        router.push('/dashboard');
      }
    }
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
        <h2 className="text-3xl font-bold tracking-tight mb-2">{t('auth', 'createAccount')}</h2>
        <p className="text-[var(--text-secondary)]">
          {t('auth', 'startDeploying')}
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
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            {t('auth', 'name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            minLength={2}
            maxLength={100}
            className="input"
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            {t('auth', 'email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="input"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            {t('auth', 'password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-12"
              autoComplete="new-password"
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

          {/* Password requirements */}
          {password && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                {t('auth', 'passwordRequirements')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <PasswordRequirement
                  met={passwordValidation.minLength}
                  text={t('auth', 'minCharacters')}
                />
                <PasswordRequirement
                  met={passwordValidation.hasUppercase}
                  text={t('auth', 'uppercase')}
                />
                <PasswordRequirement
                  met={passwordValidation.hasLowercase}
                  text={t('auth', 'lowercase')}
                />
                <PasswordRequirement
                  met={passwordValidation.hasNumber}
                  text={t('auth', 'number')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <p className="text-sm text-[var(--text-muted)]">
          {t('auth', 'agreeToTerms')}{' '}
          <Link href="/terms" className="text-[var(--accent-cyan)] hover:underline">
            {t('auth', 'termsOfService')}
          </Link>{' '}
          {t('common', 'and')}{' '}
          <Link href="/privacy" className="text-[var(--accent-cyan)] hover:underline">
            {t('auth', 'privacyPolicy')}
          </Link>
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !isPasswordValid}
          className="btn btn-primary w-full h-12 text-base group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={isLoading ? 'opacity-0' : ''}>
            {t('auth', 'createAccount')}
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

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-subtle)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--bg-primary)] text-[var(--text-muted)]">
            {t('auth', 'orContinueWith')}
          </span>
        </div>
      </div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGithubLogin}
          className="btn btn-secondary h-12"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              fill="currentColor"
            />
          </svg>
          <span>GitHub</span>
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-secondary h-12"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      {/* Sign in link */}
      <p className="mt-8 text-center text-[var(--text-secondary)]">
        {t('auth', 'alreadyHaveAccount')}{' '}
        <Link
          href="/login"
          className="text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors font-medium"
        >
          {t('auth', 'signIn')}
        </Link>
      </p>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          met
            ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
        }`}
      >
        {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span
        className={`text-xs terminal-text ${
          met ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {text}
      </span>
    </div>
  );
}
