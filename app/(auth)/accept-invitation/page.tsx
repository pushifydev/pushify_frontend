'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Users, Shield, User, Eye } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { useAcceptInvitation } from '@/hooks';
import { getInvitationInfo } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { InvitationInfo } from '@/lib/api';

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
      const result = await acceptInvitation.mutateAsync(token);
      setStatus('success');
      // Redirect to dashboard after 2s
      setTimeout(() => router.push('/dashboard'), 2000);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)] flex items-center justify-center">
            <span className="text-[var(--bg-primary)] font-black text-lg">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Pushify</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8">
          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">{t('common', 'loading')}</p>
            </div>
          )}

          {/* Ready to accept */}
          {status === 'ready' && invitation && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[var(--accent-cyan)]" />
                </div>
                <h1 className="text-2xl font-bold mb-1">{t('team', 'acceptInvitationTitle')}</h1>
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">{invitation.invitedBy.name}</strong>
                  {' '}invited you to join{' '}
                  <strong className="text-[var(--text-primary)]">{invitation.organization.name}</strong>
                </p>
              </div>

              {/* Role info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="p-2 rounded-lg bg-[var(--accent-cyan)]/10">
                  <RoleIcon className="w-4 h-4 text-[var(--accent-cyan)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Your role</p>
                  <p className="font-medium capitalize">{invitation.role}</p>
                </div>
              </div>

              {user ? (
                /* Logged in — show accept button */
                <div className="space-y-3">
                  {user.email === invitation.email ? (
                    <button
                      onClick={handleAccept}
                      disabled={acceptInvitation.isPending}
                      className="btn btn-primary w-full"
                    >
                      {t('team', 'joinOrg')}
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
                      This invitation was sent to <strong>{invitation.email}</strong> but you are logged in as <strong>{user.email}</strong>.
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in */
                <div className="space-y-3">
                  <p className="text-sm text-center text-[var(--text-muted)]">
                    Log in or create an account to join <strong className="text-[var(--text-secondary)]">{invitation.organization.name}</strong>
                  </p>
                  <button
                    onClick={() => handleLoginRedirect('/login')}
                    className="btn btn-primary w-full"
                  >
                    {t('team', 'loginToAccept')}
                  </button>
                  <button
                    onClick={() => handleLoginRedirect('/register')}
                    className="btn btn-secondary w-full"
                  >
                    {t('team', 'registerToAccept')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accepting */}
          {status === 'accepting' && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">{t('team', 'joining')}</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold mb-1">{t('team', 'invitationAccepted')}</h2>
                <p className="text-sm text-[var(--text-muted)]">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center py-4 space-y-4">
              <XCircle className="w-12 h-12 text-[var(--accent-red)] mx-auto" />
              <div>
                <h2 className="text-lg font-semibold mb-1">{t('team', 'invitationExpired')}</h2>
                <p className="text-sm text-[var(--text-muted)]">{errorMessage}</p>
              </div>
              <Link href="/login" className="btn btn-secondary inline-block">
                {t('auth', 'signIn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)]" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
