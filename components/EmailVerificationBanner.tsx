'use client';

import { useState } from 'react';
import { MailWarning, X, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { sendVerificationEmail } from '@/lib/api';

export function EmailVerificationBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    setLoading(true);
    await sendVerificationEmail();
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="mx-4 md:mx-6 mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
      <MailWarning className="w-4 h-4 text-yellow-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-yellow-300 font-medium">
          {t('auth', 'emailNotVerifiedBanner')}
        </span>
        <span className="text-sm text-yellow-400/70 ml-1 hidden sm:inline">
          {t('auth', 'emailNotVerifiedBannerDesc')}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {sent ? (
          <span className="text-xs text-green-400">{t('auth', 'verificationResent')}</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-xs font-medium text-yellow-300 hover:text-yellow-100 transition-colors flex items-center gap-1"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {t('auth', 'resendVerification')}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-400/50 hover:text-yellow-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
