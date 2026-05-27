'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { authService } from '@/lib/api/services/auth.service';
import {
  AuthSubmitButton,
  AuthErrorAlert,
  AuthMobileBrand,
  AuthPageHeader,
} from '@/components/auth';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await authService.forgotPassword(email);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSent(true);
    }

    setIsLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full animate-slide-in">
        <AuthMobileBrand />
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <AuthPageHeader
            title={t('auth', 'resetLinkSent')}
            description={t('auth', 'resetLinkSentDesc')}
          />
        </div>

        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="text-neutral-900 dark:text-white font-medium">{email}</span>
          </p>
        </div>

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

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />
      <AuthPageHeader
        title={t('auth', 'forgotPasswordTitle')}
        description={t('auth', 'forgotPasswordDesc')}
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
            autoFocus
          />
        </div>

        <AuthSubmitButton isLoading={isLoading}>{t('auth', 'sendResetLink')}</AuthSubmitButton>
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
