'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useTranslation, useSessions, useTerminateSession, useTerminateOtherSessions } from '@/hooks';
import { formatShortDate } from '@/lib/formatters';
import { showSuccessToast } from '@/lib/toast-i18n';
import type { Session } from '@/lib/api/services/auth.service';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
import { Modal, ModalActions } from '@/components/Modal';

// Extended session with computed isCurrent field
interface SessionWithCurrent extends Session {
  isCurrent: boolean;
}

function parseDeviceInfo(userAgent: string | null): { browser: string; os: string; isMobile: boolean } {
  if (!userAgent) {
    return { browser: 'Unknown Browser', os: 'Unknown OS', isMobile: false };
  }

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  // Parse browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Parse OS
  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return { browser, os, isMobile };
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(dateString);
}

function SessionRow({
  session,
  onTerminate,
  isTerminating,
  t,
}: {
  session: SessionWithCurrent;
  onTerminate: () => void;
  isTerminating: boolean;
  t: <C extends keyof import('@/lib/i18n/locales/en').TranslationKeys>(category: C, key: keyof import('@/lib/i18n/locales/en').TranslationKeys[C]) => string;
}) {
  const { browser, os } = parseDeviceInfo(session.userAgent);

  return (
    <div className="dash-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span className={`dash-status-dot mt-[7px] ${session.isCurrent ? 'is-success' : ''}`} aria-hidden />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {browser} on {os}
            </span>
            {session.isCurrent && <span className="badge badge-success">{t('sessions', 'thisDevice')}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 terminal-text text-xs text-[var(--text-muted)]">
            {session.ipAddress && <span>{session.ipAddress}</span>}
            <span title={formatShortDate(session.createdAt)}>
              {t('sessions', 'signedIn')} {getRelativeTime(session.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <button
          onClick={onTerminate}
          disabled={isTerminating}
          className="btn btn-secondary btn-sm shrink-0 self-start sm:self-center"
        >
          {isTerminating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          {t('sessions', 'terminate')}
        </button>
      )}
    </div>
  );
}

export function SessionsTab() {
  const { t } = useTranslation();
  const { data: sessions, isLoading } = useSessions();
  const terminateSession = useTerminateSession();
  const terminateOtherSessions = useTerminateOtherSessions();

  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [showTerminateAllConfirm, setShowTerminateAllConfirm] = useState(false);

  // The first session in the list is typically the current one (most recent)
  // We mark it as current and the rest as other sessions
  const sessionsWithCurrent: SessionWithCurrent[] = sessions?.map((s, index) => ({
    ...s,
    isCurrent: index === 0, // First session is current (backend sorts by createdAt desc)
  })) || [];

  const currentSession = sessionsWithCurrent.find((s) => s.isCurrent);
  const otherSessions = sessionsWithCurrent.filter((s) => !s.isCurrent);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingId(sessionId);
    try {
      await terminateSession.mutateAsync(sessionId);
      showSuccessToast('sessionRevokedTitle', 'sessionRevokedDesc');
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateAllOthers = async () => {
    // Server/mutation errors are surfaced by the global MutationCache toast.
    await terminateOtherSessions.mutateAsync();
    setShowTerminateAllConfirm(false);
    showSuccessToast('allSessionsRevokedTitle', 'allSessionsRevokedDesc');
  };

  return (
    <>
      <SettingsSection
        id="sessions"
        title={t('sessions', 'title')}
        description={t('sessions', 'description')}
        action={
          !isLoading ? (
            <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums">{sessionsWithCurrent.length}</span>
          ) : undefined
        }
        footer={
          otherSessions.length > 0 ? (
            <button
              onClick={() => setShowTerminateAllConfirm(true)}
              className="btn btn-secondary text-[var(--status-error)]"
            >
              <LogOut className="w-4 h-4" />
              {t('sessions', 'terminateOthers')}
            </button>
          ) : undefined
        }
      >
        <div className="dash-settings-rows" aria-busy={isLoading || undefined}>
          {isLoading ? (
            [0, 1].map((i) => (
              <div key={i} className="dash-row flex items-center gap-3" aria-hidden>
                <span className="dash-skeleton w-1.5 h-1.5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="dash-skeleton h-3.5 w-40 rounded" />
                  <div className="dash-skeleton h-3 w-56 rounded" />
                </div>
              </div>
            ))
          ) : (
            <>
              {currentSession && (
                <SessionRow session={currentSession} onTerminate={() => {}} isTerminating={false} t={t} />
              )}
              {otherSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onTerminate={() => handleTerminateSession(session.id)}
                  isTerminating={terminatingId === session.id}
                  t={t}
                />
              ))}
              {otherSessions.length === 0 && (
                <div className="dash-row">
                  <p className="text-[13px] text-[var(--text-secondary)]">{t('sessions', 'noOtherSessions')}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('sessions', 'noOtherSessionsDesc')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </SettingsSection>

      <Modal
        isOpen={showTerminateAllConfirm}
        onClose={() => setShowTerminateAllConfirm(false)}
        title={t('sessions', 'terminateOthers')}
        description={t('sessions', 'terminateOthersConfirm')}
      >
        <ModalActions>
          <button onClick={() => setShowTerminateAllConfirm(false)} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button
            onClick={handleTerminateAllOthers}
            disabled={terminateOtherSessions.isPending}
            className="btn btn-danger"
          >
            {terminateOtherSessions.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('sessions', 'terminating')}
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                {t('sessions', 'terminate')}
              </>
            )}
          </button>
        </ModalActions>
      </Modal>
    </>
  );
}
