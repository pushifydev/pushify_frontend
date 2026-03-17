'use client';

import { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  Clock,
  LogOut,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useTranslation, useSessions, useTerminateSession, useTerminateOtherSessions } from '@/hooks';
import { formatShortDate } from '@/lib/formatters';
import { AlertBox } from './Modal';
import type { Session } from '@/lib/api/services/auth.service';

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
    <div
      className={`p-4 rounded-xl border ${
        session.isCurrent
          ? 'border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5'
          : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              session.isCurrent
                ? 'bg-[var(--accent-cyan)]/20'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <DeviceIcon
              className={`w-5 h-5 ${
                session.isCurrent ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'
              }`}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {browser} on {os}
              </span>
              {session.isCurrent && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]">
                  {t('sessions', 'thisDevice')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              {session.ipAddress && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{session.ipAddress}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {t('sessions', 'lastActive')}: {getRelativeTime(session.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {t('sessions', 'signedIn')}: {formatShortDate(session.createdAt)}
            </div>
          </div>
        </div>

        {!session.isCurrent && (
          <button
            onClick={onTerminate}
            disabled={isTerminating}
            className="btn btn-secondary text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {isTerminating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                {t('sessions', 'terminate')}
              </>
            )}
          </button>
        )}
      </div>
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setSuccessMessage(t('sessions', 'terminated'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateAllOthers = async () => {
    try {
      await terminateOtherSessions.mutateAsync();
      setShowTerminateAllConfirm(false);
      setSuccessMessage(t('sessions', 'allOthersTerminated'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('sessions', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('sessions', 'description')}</p>
      </div>

      {successMessage && (
        <AlertBox variant="success" icon={<Check className="w-4 h-4" />}>
          {successMessage}
        </AlertBox>
      )}

      {/* Current Session */}
      {currentSession && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {t('sessions', 'currentSession')}
          </h3>
          <SessionCard
            session={currentSession}
            onTerminate={() => {}}
            isTerminating={false}
            t={t}
          />
        </div>
      )}

      {/* Other Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {t('sessions', 'otherSessions')}
          </h3>
          {otherSessions.length > 0 && (
            <button
              onClick={() => setShowTerminateAllConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              {t('sessions', 'terminateOthers')}
            </button>
          )}
        </div>

        {otherSessions.length === 0 ? (
          <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center">
            <Monitor className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="font-medium">{t('sessions', 'noOtherSessions')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('sessions', 'noOtherSessionsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
      </div>

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
