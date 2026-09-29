'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { confirmDeletion } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

/**
 * Opened from the email sent to an account with neither a password nor 2FA when it asks to
 * delete an organization or itself. The token is in the fragment, so it never reaches a server
 * log; it works once, for an hour.
 */
const copy = {
  en: {
    working: 'Confirming…',
    orgTitle: 'Organization scheduled for deletion',
    orgBody: (date: string) => `It will be permanently deleted on ${date}. Until then you can restore it in Settings → Delete.`,
    accountTitle: 'Account scheduled for deletion',
    accountBody: (date: string) => `It will be permanently deleted on ${date}. Sign in before then to restore it.`,
    failed: 'Could not confirm the deletion',
    missing: 'This link is incomplete. Open it again from the email.',
    dashboard: 'Open dashboard',
    home: 'Back to Pushify',
  },
  tr: {
    working: 'Onaylanıyor…',
    orgTitle: 'Organizasyon silinmek üzere planlandı',
    orgBody: (date: string) => `${date} tarihinde kalıcı olarak silinecek. O zamana kadar Ayarlar → Silme’den geri alabilirsiniz.`,
    accountTitle: 'Hesap silinmek üzere planlandı',
    accountBody: (date: string) => `${date} tarihinde kalıcı olarak silinecek. Geri almak için o tarihten önce giriş yapın.`,
    failed: 'Silme onaylanamadı',
    missing: 'Bu bağlantı eksik. E-postadaki bağlantıyı yeniden açın.',
    dashboard: 'Panele git',
    home: 'Pushify’a dön',
  },
};

type State =
  | { kind: 'working' }
  | { kind: 'done'; what: 'organization' | 'account'; scheduledFor: string }
  | { kind: 'error'; message: string };

export default function ConfirmDeletionPage() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const logout = useAuthStore((s) => s.logout);
  const [state, setState] = useState<State>({ kind: 'working' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
    window.history.replaceState(null, '', window.location.pathname);
    const run = async () => {
      if (!token) return setState({ kind: 'error', message: c.missing });
      const r = await confirmDeletion(token);
      if (r.error || !r.data) return setState({ kind: 'error', message: r.error?.message ?? c.failed });
      // A deleted account has no sessions left: drop this browser's too.
      if (r.data.kind === 'account') await logout().catch(() => undefined);
      setState({ kind: 'done', what: r.data.kind, scheduledFor: r.data.scheduledFor });
    };
    void run();
  }, [c.failed, c.missing, logout]);

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-4 text-center">
        {state.kind === 'working' && (
          <p className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            {c.working}
          </p>
        )}
        {state.kind === 'done' && (
          <>
            <h1 className="text-xl font-medium text-[var(--text-primary)]">
              {state.what === 'organization' ? c.orgTitle : c.accountTitle}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {state.what === 'organization' ? c.orgBody(date(state.scheduledFor)) : c.accountBody(date(state.scheduledFor))}
            </p>
            <Link href={state.what === 'organization' ? '/dashboard' : '/'} className="btn btn-secondary inline-flex">
              {state.what === 'organization' ? c.dashboard : c.home}
            </Link>
          </>
        )}
        {state.kind === 'error' && (
          <>
            <h1 className="text-xl font-medium text-[var(--text-primary)]">{c.failed}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{state.message}</p>
            <Link href="/" className="btn btn-secondary inline-flex">
              {c.home}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
