'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { authService } from '@/lib/api/services/auth.service';

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
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center">
            <Mail className="w-6 h-6 text-[var(--bg-primary)]" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Pushify</span>
        </div>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {t('auth', 'resetLinkSent')}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t('auth', 'resetLinkSentDesc')}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)] font-medium">{email}</span>
          </p>
        </div>

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
          {t('auth', 'forgotPasswordTitle')}
        </h2>
        <p className="text-[var(--text-secondary)]">
          {t('auth', 'forgotPasswordDesc')}
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
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full h-12 text-base group relative overflow-hidden"
        >
          <span className={isLoading ? 'opacity-0' : ''}>
            {t('auth', 'sendResetLink')}
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
