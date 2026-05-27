'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { verifyEmail, sendVerificationEmail } from '@/lib/api';
import { AuthMobileBrand, AuthPageHeader } from '@/components/auth';

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
      <AuthMobileBrand />

      {status === 'loading' && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">{t('auth', 'verifyingEmail')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <AuthPageHeader
            title={t('auth', 'emailVerifiedTitle')}
            description={message || t('auth', 'emailVerifiedDesc')}
          />
          <Link href="/dashboard" className="lp-cta h-12 px-8 inline-flex">
            {t('auth', 'goToDashboard')}
          </Link>
        </div>
      )}

      {(status === 'error' || status === 'no-token') && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <AuthPageHeader
            title={t('auth', 'emailVerificationFailed')}
            description={
              status === 'no-token' ? t('auth', 'emailVerificationNoToken') : message
            }
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="lp-cta-ghost h-12 w-full sm:w-auto px-6 text-sm">
              {t('auth', 'backToLogin')}
            </Link>
            {!resendSent && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="lp-cta h-12 w-full sm:w-auto px-6"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('auth', 'resendVerification')
                )}
              </button>
            )}
            {resendSent && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {t('auth', 'verificationResent')}
              </p>
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
