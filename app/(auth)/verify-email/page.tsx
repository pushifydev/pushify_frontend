'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { verifyEmail, sendVerificationEmail } from '@/lib/api';

function VerifyEmailContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.error) {
        setStatus('error');
        setMessage(result.error.message);
      } else {
        setStatus('success');
        setMessage(result.data?.message || '');
      }
    });
  }, [searchParams]);

  const handleResend = async () => {
    setResendLoading(true);
    const result = await sendVerificationEmail();
    setResendLoading(false);
    if (!result.error) {
      setResendSent(true);
    }
  };

  return (
    <div className="w-full animate-slide-in">
      {/* Mobile logo */}
      <div className="lg:hidden mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center">
          <Mail className="w-6 h-6 text-[var(--bg-primary)]" />
        </div>
        <span className="text-2xl font-bold tracking-tight">Pushify</span>
      </div>

      {status === 'loading' && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">{t('auth', 'verifyingEmail')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t('auth', 'emailVerifiedTitle')}</h2>
          <p className="text-[var(--text-secondary)] mb-8">{message || t('auth', 'emailVerifiedDesc')}</p>
          <Link href="/dashboard" className="btn btn-primary h-11 px-6">
            {t('auth', 'goToDashboard')}
          </Link>
        </div>
      )}

      {(status === 'error' || status === 'no-token') && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t('auth', 'emailVerificationFailed')}</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            {status === 'no-token' ? t('auth', 'emailVerificationNoToken') : message}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="btn btn-secondary h-11 px-5">
              {t('auth', 'backToLogin')}
            </Link>
            {!resendSent && (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="btn btn-primary h-11 px-5"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('auth', 'resendVerification')
                )}
              </button>
            )}
            {resendSent && (
              <p className="text-sm text-green-400">{t('auth', 'verificationResent')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
