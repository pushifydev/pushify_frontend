'use client';

import { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  Clock,
  LogOut,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useTranslation, useSessions, useTerminateSession, useTerminateOtherSessions } from '@/hooks';
import { formatShortDate } from '@/lib/formatters';
import { showSuccessToast } from '@/lib/toast-i18n';
import type { Session } from '@/lib/api/services/auth.service';
import { SettingsCard } from './SettingsCard';

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

function SessionCard({
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
  const { browser, os, isMobile } = parseDeviceInfo(session.userAgent);
  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/40">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <DeviceIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {browser} on {os}
            </span>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                {t('sessions', 'thisDevice')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--text-muted)] mt-1">
            {session.ipAddress && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {session.ipAddress}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getRelativeTime(session.createdAt)}
            </span>
            <span>
              {t('sessions', 'signedIn')}: {formatShortDate(session.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <button
          onClick={onTerminate}
          disabled={isTerminating}
          className="btn btn-secondary h-8 text-xs text-red-400 hover:text-red-300 hover:border-red-500/30 shrink-0 self-start sm:self-center"
        >
          {isTerminating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5" />
              {t('sessions', 'terminate')}
            </>
          )}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('sessions', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('sessions', 'description')}</p>
      </div>

      {/* Current Session */}
      {currentSession && (
        <SettingsCard title={t('sessions', 'currentSession')}>
          <SessionCard
            session={currentSession}
            onTerminate={() => {}}
            isTerminating={false}
            t={t}
          />
        </SettingsCard>
      )}

      {/* Other Sessions */}
      <SettingsCard
        title={t('sessions', 'otherSessions')}
        description={otherSessions.length === 0 ? t('sessions', 'noOtherSessionsDesc') : undefined}
        footer={
          otherSessions.length > 0 ? (
            <button
              onClick={() => setShowTerminateAllConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors shrink-0"
            >
              {t('sessions', 'terminateOthers')}
            </button>
          ) : undefined
        }
      >
        {otherSessions.length === 0 ? (
          <div className="py-6 text-center">
            <Monitor className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="font-medium">{t('sessions', 'noOtherSessions')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('sessions', 'noOtherSessionsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {otherSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onTerminate={() => handleTerminateSession(session.id)}
                isTerminating={terminatingId === session.id}
                t={t}
              />
            ))}
          </div>
        )}
      </SettingsCard>

      {/* Terminate All Confirmation */}
      {showTerminateAllConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowTerminateAllConfirm(false)}
          />
          <div
            className="relative z-10 w-full max-w-md mx-4 p-6 rounded-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">{t('sessions', 'terminateOthers')}</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              {t('sessions', 'terminateOthersConfirm')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTerminateAllConfirm(false)}
                className="btn btn-secondary"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleTerminateAllOthers}
                disabled={terminateOtherSessions.isPending}
                className="btn bg-red-500 hover:bg-red-600 text-white"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
