'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { restoreAccount } from '@/lib/api';
import { clearPendingDeletion, type PendingDeletion } from '@/lib/pending-deletion';
import { AuthPageHeader } from './AuthPageHeader';
import { AuthSubmitButton } from './AuthSubmitButton';
import { AuthErrorAlert } from './AuthErrorAlert';
import { AuthMobileBrand } from './AuthMobileBrand';

const copy = {
  en: {
    title: 'This account is scheduled for deletion',
    body: (date: string) =>
      date
        ? `It will be permanently deleted on ${date}. Restore it to keep using Pushify.`
        : 'It will be permanently deleted soon. Restore it to keep using Pushify.',
    note: 'Restoring also restores the organizations that were scheduled with it, on the Free plan.',
    restore: 'Restore account',
    back: 'Back to sign in',
    doneTitle: 'Account restored',
    doneBody: 'Sign in again to continue. Connect your own servers again and restart your subscription if you had one.',
    signIn: 'Sign in',
  },
  tr: {
    title: 'Bu hesap silinmek üzere planlandı',
    body: (date: string) =>
      date
        ? `${date} tarihinde kalıcı olarak silinecek. Pushify’ı kullanmaya devam etmek için geri alın.`
        : 'Yakında kalıcı olarak silinecek. Pushify’ı kullanmaya devam etmek için geri alın.',
    note: 'Geri almak, hesapla birlikte planlanan organizasyonları da Ücretsiz planda geri getirir.',
    restore: 'Hesabı geri al',
    back: 'Girişe dön',
    doneTitle: 'Hesap geri alındı',
    doneBody: 'Devam etmek için yeniden giriş yapın. Kendi sunucularınızı yeniden bağlayın ve varsa aboneliğinizi yeniden başlatın.',
    signIn: 'Giriş yap',
  },
};

/** Shown instead of the sign-in form when the account is waiting to be deleted. */
export function PendingAccountRestore({ pending, onDone }: { pending: PendingDeletion; onDone: () => void }) {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [state, setState] = useState<'idle' | 'restoring' | 'restored'>('idle');
  const [error, setError] = useState<string | null>(null);

  const date = pending.scheduledFor
    ? new Date(pending.scheduledFor).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const finish = () => {
    clearPendingDeletion();
    onDone();
  };

  const restore = async () => {
    setError(null);
    setState('restoring');
    const result = await restoreAccount(pending.restoreToken);
    if (result.error) {
      setError(result.error.message);
      setState('idle');
      return;
    }
    clearPendingDeletion();
    setState('restored');
  };

  if (state === 'restored') {
    return (
      <div className="w-full animate-slide-in">
        <AuthMobileBrand />
        <div className="mb-6 flex items-center gap-2 text-[var(--status-success)]">
          <CheckCircle2 className="w-5 h-5" aria-hidden />
        </div>
        <AuthPageHeader title={c.doneTitle} description={c.doneBody} />
        <AuthSubmitButton type="button" onClick={onDone}>
          {c.signIn}
        </AuthSubmitButton>
      </div>
    );
  }

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />
      <AuthPageHeader title={c.title} description={c.body(date)} />
      {error && <AuthErrorAlert message={error} />}
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">{c.note}</p>
      <AuthSubmitButton type="button" isLoading={state === 'restoring'} onClick={restore}>
        {c.restore}
      </AuthSubmitButton>
      <button
        type="button"
        onClick={finish}
        className="mt-6 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {c.back}
      </button>
    </div>
  );
}
