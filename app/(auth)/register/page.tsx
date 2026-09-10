'use client';

import { getAccessToken } from '@/lib/api/client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import {
  AuthSubmitButton,
  SocialAuthButtons,
  AuthErrorAlert,
  AuthMobileBrand,
  AuthDivider,
  AuthPageHeader,
} from '@/components/auth';
import { buildAuthPath, consumeAuthRedirect, saveAuthRedirect } from '@/lib/auth-redirect';

function RegisterPageContent() {
  const router = useRouter();

  // Already signed in: the auth pages are not a destination — go straight to the dashboard.
  useEffect(() => {
    if (getAccessToken()) router.replace('/dashboard');
  }, [router]);
  const searchParams = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) saveAuthRedirect(redirect);
  }, [searchParams]);

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
        // Honor ?redirect= (saved to sessionStorage on mount) — e.g. domain
        // purchase flows land back where the user started, not on /dashboard.
        router.push(consumeAuthRedirect('/dashboard'));
      }
    }
  };

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />
      <AuthPageHeader
        title={t('auth', 'createAccount')}
        description={t('auth', 'startDeploying')}
      />
      {error && <AuthErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('auth', 'password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-12!"
              autoComplete="new-password"
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

          {password && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500 mb-2 uppercase tracking-wider">
                {t('auth', 'passwordRequirements')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <PasswordRequirement met={passwordValidation.minLength} text={t('auth', 'minCharacters')} />
                <PasswordRequirement met={passwordValidation.hasUppercase} text={t('auth', 'uppercase')} />
                <PasswordRequirement met={passwordValidation.hasLowercase} text={t('auth', 'lowercase')} />
                <PasswordRequirement met={passwordValidation.hasNumber} text={t('auth', 'number')} />
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          {t('auth', 'agreeToTerms')}{' '}
          <Link href="/terms" className="text-[var(--accent-cyan)] hover:opacity-80">
            {t('auth', 'termsOfService')}
          </Link>{' '}
          {t('common', 'and')}{' '}
          <Link href="/privacy" className="text-[var(--accent-cyan)] hover:opacity-80">
            {t('auth', 'privacyPolicy')}
          </Link>
        </p>

        <AuthSubmitButton isLoading={isLoading} disabled={!isPasswordValid}>
          {t('auth', 'createAccount')}
        </AuthSubmitButton>
      </form>

      <AuthDivider label={t('auth', 'orContinueWith')} />
      <SocialAuthButtons />

      <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
        {t('auth', 'alreadyHaveAccount')}{' '}
        <Link
          href={buildAuthPath('login', searchParams.get('redirect'))}
          className="text-[var(--accent-cyan)] font-medium hover:opacity-80 transition-opacity"
        >
          {t('auth', 'signIn')}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          met
            ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
            : 'bg-[var(--bg-tertiary)] text-neutral-400'
        }`}
      >
        {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span
        className={`text-xs ${
          met ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-500'
        }`}
      >
        {text}
      </span>
    </div>
  );
}
