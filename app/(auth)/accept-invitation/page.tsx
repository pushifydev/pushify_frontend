'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Users, Shield, User, Eye } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { useAcceptInvitation, useSwitchOrganization } from '@/hooks';
import { getInvitationInfo } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { InvitationInfo } from '@/lib/api';
import { AuthMobileBrand } from '@/components/auth';

const roleIcons: Record<string, typeof Shield> = {
  admin: Shield,
  member: User,
  viewer: Eye,
};

function AcceptInvitationContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'success' | 'error'>('loading');
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const hasFetched = useRef(false);

  const acceptInvitation = useAcceptInvitation();
  const switchOrganization = useSwitchOrganization();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage(t('team', 'invitationInvalid'));
      return;
    }

    getInvitationInfo(token).then((result) => {
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error.message || t('team', 'invitationInvalid'));
      } else {
        setInvitation(result.data!);
        setStatus('ready');
      }
    });
  }, [token, t]);

  const handleAccept = async () => {
    if (!token) return;
    setStatus('accepting');
    try {
      const accepted = await acceptInvitation.mutateAsync(token);
      // Switch into the team workspace so the member immediately lands on its resources.
      // Best-effort: if it fails, membership is already added and they can switch from the sidebar.
      try {
        await switchOrganization.mutateAsync(accepted.organizationId);
      } catch {
        /* keep going — manual switch is available */
      }
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('team', 'invitationInvalid'));
    }
  };

  const handleLoginRedirect = (path: '/login' | '/register') => {
    if (token) {
      sessionStorage.setItem('pending_invitation_token', token);
    }
    router.push(path);
  };

  const RoleIcon = invitation ? (roleIcons[invitation.role] ?? User) : User;

  return (
    <div className="w-full animate-slide-in">
      <AuthMobileBrand />

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-secondary)] p-6 md:p-8">
        {status === 'loading' && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">{t('common', 'loading')}</p>
          </div>
        )}

        {status === 'ready' && invitation && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-cyan)]/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--accent-cyan)]" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-1">
                {t('team', 'acceptInvitationTitle')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-white">{invitation.invitedBy.name}</strong>
                {' '}invited you to join{' '}
                <strong className="text-neutral-900 dark:text-white">{invitation.organization.name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <div className="p-2 rounded-lg bg-[var(--accent-cyan)]/10">
                <RoleIcon className="w-4 h-4 text-[var(--accent-cyan)]" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{t('team', 'yourRole')}</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{invitation.role}</p>
              </div>
            </div>

            {user ? (
              <div className="space-y-3">
                {user.email === invitation.email ? (
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={acceptInvitation.isPending}
                    className="lp-cta w-full h-12"
                  >
                    {acceptInvitation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t('team', 'joinOrg')
                    )}
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-800 dark:text-amber-200">
                    {t('team', 'invitationEmailMismatch')
                      .replace('{invited}', invitation.email)
                      .replace('{current}', user.email)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center text-neutral-500">
                  {t('team', 'loginOrRegisterToJoin').replace(
                    '{org}',
                    invitation.organization.name
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => handleLoginRedirect('/login')}
                  className="lp-cta w-full h-12"
                >
                  {t('team', 'loginToAccept')}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginRedirect('/register')}
                  className="lp-cta-ghost w-full h-12 text-sm"
                >
                  {t('team', 'registerToAccept')}
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'accepting' && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">{t('team', 'joining')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-4 space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {t('team', 'invitationAccepted')}
              </h2>
              <p className="text-sm text-neutral-500">{t('team', 'redirectingToDashboard')}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4 space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {t('team', 'invitationExpired')}
              </h2>
              <p className="text-sm text-neutral-500">{errorMessage}</p>
            </div>
            <Link href="/login" className="lp-cta-ghost h-12 px-6 inline-flex text-sm">
              {t('auth', 'signIn')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
