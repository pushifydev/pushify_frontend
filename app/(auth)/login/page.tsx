'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
import { buildAuthPath, consumeAuthRedirect, saveAuthRedirect, sanitizeRedirectPath } from '@/lib/auth-redirect';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login,
    verifyLogin2fa,
    isLoading,
    error,
    clearError,
    requiresTwoFactor,
    clearTwoFactor,
  } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) saveAuthRedirect(redirect);
  }, [searchParams]);

  const getPostLoginRedirect = () => {
    const fromQuery = sanitizeRedirectPath(searchParams.get('redirect'));
    if (fromQuery) return fromQuery;
    const stored = consumeAuthRedirect('');
    if (stored) return stored;
    const pendingToken = sessionStorage.getItem('pending_invitation_token');
    if (pendingToken) {
      sessionStorage.removeItem('pending_invitation_token');
      return `/accept-invitation?token=${pendingToken}`;
    }
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await login(email, password);
    if (result === true) {
      router.push(getPostLoginRedirect());
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await verifyLogin2fa(twoFactorCode);
    if (success) {
      router.push(getPostLoginRedirect());
    }
  };

  const handleBackToLogin = () => {
    clearTwoFactor();
    clearError();
    setTwoFactorCode('');
  };

  if (requiresTwoFactor) {
    return (
      <div className="w-full animate-slide-in">
        <AuthMobileBrand />
        <AuthPageHeader
          title={t('auth', 'twoFactorTitle')}
          description={t('auth', 'twoFactorDescription')}
        />
        {error && <AuthErrorAlert message={error} />}

        <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {t('auth', 'verificationCode')}
            </label>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
              placeholder="000000"
              required
              maxLength={8}
              className="input text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {t('auth', 'twoFactorHint')}
            </p>
          </div>

          <AuthSubmitButton
            isLoading={isLoading}
            disabled={twoFactorCode.length < 6}
          >
            {t('auth', 'verify')}
          </AuthSubmitButton>
        </form>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="mt-6 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth', 'backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />
      <AuthPageHeader
        title={t('auth', 'welcomeBack')}
        description={t('auth', 'signInToContinue')}
      />
      {error && <AuthErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {t('auth', 'password')}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--accent-cyan)] hover:opacity-80 transition-opacity"
            >
              {t('auth', 'forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-12!"
              autoComplete="current-password"
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

        <AuthSubmitButton isLoading={isLoading}>{t('auth', 'signIn')}</AuthSubmitButton>
      </form>

      <AuthDivider label={t('auth', 'orContinueWith')} />
      <SocialAuthButtons />

      <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
        {t('auth', 'dontHaveAccount')}{' '}
        <Link
          href={buildAuthPath('register', searchParams.get('redirect'))}
          className="text-[var(--accent-cyan)] font-medium hover:opacity-80 transition-opacity"
        >
          {t('auth', 'signUp')}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
