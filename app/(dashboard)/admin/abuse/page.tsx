'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation, useAdminAbuseFlags, useAdminAbuseClauses, useAdminAbuseActions } from '@/hooks';
import type { AbuseClause, AbuseFlagStatus, AdminAbuseFlag } from '@/lib/api';
import { formatShortDate } from '@/lib/formatters';
import { formatMessage } from '@/lib/i18n/format-message';
import { AdminPanel, AdminError, Pager, EmptyRow, LoadingRows, relative } from '../shared';

const PAGE_SIZE = 50;
const STATUSES: AbuseFlagStatus[] = ['open', 'actioned', 'dismissed'];
const DURATIONS: (number | null)[] = [null, 7, 30, 90];

type Mode = { flagId: string; kind: 'suspend' | 'unsuspend' | 'dismiss' } | null;

export default function AdminAbusePage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AbuseFlagStatus | 'all'>('open');
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<Mode>(null);
  const { data, isLoading, error, refetch } = useAdminAbuseFlags(status, page, PAGE_SIZE);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;
  const items = data?.items ?? [];

  const filterLabel = (s: AbuseFlagStatus | 'all') =>
    s === 'open'
      ? t('admin', 'abuseFilterOpen')
      : s === 'actioned'
        ? t('admin', 'abuseFilterActioned')
        : s === 'dismissed'
          ? t('admin', 'abuseFilterDismissed')
          : t('admin', 'abuseFilterAll');

  return (
    <AdminPanel
      title={t('admin', 'abuseTitle')}
      meta={isLoading ? '…' : data?.total}
      action={
        <div className="flex items-center gap-1" role="tablist">
          {([...STATUSES, 'all'] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
                setMode(null);
              }}
              className={`btn btn-ghost btn-sm ${status === s ? 'text-[var(--text-primary)] bg-[var(--hover-overlay-md)]' : 'text-[var(--text-muted)]'}`}
            >
              {filterLabel(s)}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <LoadingRows rows={6} />
      ) : items.length === 0 ? (
        <EmptyRow>{t('admin', 'abuseEmpty')}</EmptyRow>
      ) : (
        <ul>
          {items.map((flag) => (
            <FlagRow
              key={flag.id}
              flag={flag}
              mode={mode?.flagId === flag.id ? mode.kind : null}
              onMode={(kind) => setMode(kind ? { flagId: flag.id, kind } : null)}
            />
          ))}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
    </AdminPanel>
  );
}

function FlagRow({
  flag,
  mode,
  onMode,
}: {
  flag: AdminAbuseFlag;
  mode: 'suspend' | 'unsuspend' | 'dismiss' | null;
  onMode: (kind: 'suspend' | 'unsuspend' | 'dismiss' | null) => void;
}) {
  const { t } = useTranslation();
  const sourceLabel =
    flag.source === 'deploy_scan'
      ? t('admin', 'abuseSourceDeploy')
      : flag.source === 'runtime'
        ? t('admin', 'abuseSourceRuntime')
        : t('admin', 'abuseSourceReport');
  const suspended = !!flag.project?.suspendedAt;

  return (
    <li className="dash-row flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)] break-words">
            {flag.project ? (
              <>
                <span className="font-medium">{flag.project.name}</span>{' '}
                <span className="terminal-text text-xs text-[var(--text-muted)]">{flag.project.slug}</span>
              </>
            ) : (
              <span className="text-[var(--text-muted)]">{t('admin', 'abuseUnmatched')}</span>
            )}
          </p>
          <p className="terminal-text text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[var(--text-muted)] min-w-0">
            {flag.organization && <span className="truncate">{flag.organization.name}</span>}
            {flag.reportedUrl && <span className="truncate">{flag.reportedUrl}</span>}
            {flag.reporterEmail && (
              <span className="truncate">
                {t('admin', 'abuseReportedBy')} {flag.reporterEmail}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end sm:gap-1.5">
          <div className="flex items-center gap-1.5">
            {suspended && <span className="badge badge-error">{t('admin', 'abuseSuspended')}</span>}
            <span className="badge badge-neutral normal-case!">{sourceLabel}</span>
            {flag.source !== 'report' && (
              <span className={`badge ${flag.score >= 100 ? 'badge-error' : 'badge-warning'} tabular-nums`}>
                {t('admin', 'abuseScore')} {flag.score}
              </span>
            )}
          </div>
          <time dateTime={flag.updatedAt} className="text-xs text-[var(--text-muted)] tabular-nums" title={formatShortDate(flag.updatedAt)}>
            {relative(flag.updatedAt, t)}
          </time>
        </div>
      </div>

      <ul className="space-y-1">
        {flag.reasons.map((r) => (
          <li key={r.ruleId} className="flex items-start gap-2 text-xs min-w-0">
            <span
              className={`badge shrink-0 ${r.strength === 'strong' ? 'badge-error' : r.strength === 'medium' ? 'badge-warning' : 'badge-neutral'}`}
            >
              {r.strength}
            </span>
            <span className="text-[var(--text-secondary)] break-words min-w-0">
              {r.message}
              {r.file && (
                <span className="terminal-text text-[var(--text-muted)]">
                  {' '}
                  — {r.file}
                  {r.line ? `:${r.line}` : ''}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {flag.reportText && (
        <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap break-words border-l-2 border-[var(--border-default)] pl-3">
          {flag.reportText}
        </p>
      )}

      {mode === 'suspend' && flag.project ? (
        <SuspendForm flag={flag} onDone={() => onMode(null)} />
      ) : mode === 'unsuspend' && flag.project ? (
        <NoteForm kind="unsuspend" flag={flag} onDone={() => onMode(null)} />
      ) : mode === 'dismiss' ? (
        <NoteForm kind="dismiss" flag={flag} onDone={() => onMode(null)} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {flag.project && !suspended && flag.project.status !== 'deleted' && (
            <button className="btn btn-danger btn-sm" onClick={() => onMode('suspend')}>
              {t('admin', 'abuseSuspend')}
            </button>
          )}
          {flag.project && suspended && (
            <button className="btn btn-secondary btn-sm" onClick={() => onMode('unsuspend')}>
              {t('admin', 'abuseUnsuspend')}
            </button>
          )}
          {flag.status === 'open' && (
            <button className="btn btn-ghost btn-sm" onClick={() => onMode('dismiss')}>
              {t('admin', 'abuseDismiss')}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function SuspendForm({ flag, onDone }: { flag: AdminAbuseFlag; onDone: () => void }) {
  const { t } = useTranslation();
  const { data: clauses } = useAdminAbuseClauses();
  const { suspend } = useAdminAbuseActions();
  const [reason, setReason] = useState('');
  const [clause, setClause] = useState<AbuseClause>(flag.source === 'report' ? 'other' : 'proxy-vpn');
  const [days, setDays] = useState<number | null>(null);
  const tooShort = reason.trim().length < 10;

  const submit = () => {
    if (tooShort || !flag.project) return;
    suspend.mutate(
      { projectId: flag.project.id, input: { reason: reason.trim(), clause, days, flagId: flag.id } },
      {
        onSuccess: (res) => {
          toast.success(t('admin', 'abuseSuspendedToast'));
          if (!res.containersStopped) toast.warning(t('admin', 'abuseContainersWarn'));
          onDone();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
      }
    );
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{t('admin', 'abuseSuspendHint')}</p>
      <label className="block space-y-1">
        <span className="text-xs text-[var(--text-secondary)]">{t('admin', 'abuseReasonLabel')}</span>
        <textarea
          className="input w-full min-h-[72px]"
          value={reason}
          maxLength={2000}
          placeholder={t('admin', 'abuseReasonPlaceholder')}
          onChange={(e) => setReason(e.target.value)}
        />
        {reason.length > 0 && tooShort && <span className="text-xs text-[var(--status-warning)]">{t('admin', 'abuseReasonTooShort')}</span>}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">{t('admin', 'abuseClauseLabel')}</span>
          <select className="input w-full" value={clause} onChange={(e) => setClause(e.target.value as AbuseClause)}>
            {Object.entries(clauses ?? {}).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">{t('admin', 'abuseDurationLabel')}</span>
          <select className="input w-full" value={days ?? ''} onChange={(e) => setDays(e.target.value ? Number(e.target.value) : null)}>
            {DURATIONS.map((d) => (
              <option key={d ?? 'appeal'} value={d ?? ''}>
                {d === null ? t('admin', 'abuseUntilAppeal') : formatMessage(t('admin', 'abuseDays'), { days: d })}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-danger btn-sm" disabled={tooShort || suspend.isPending} onClick={submit}>
          {t('admin', 'abuseConfirmSuspend')}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDone}>
          {t('admin', 'abuseCancel')}
        </button>
      </div>
    </div>
  );
}

function NoteForm({ kind, flag, onDone }: { kind: 'unsuspend' | 'dismiss'; flag: AdminAbuseFlag; onDone: () => void }) {
  const { t } = useTranslation();
  const { unsuspend, dismiss } = useAdminAbuseActions();
  const [note, setNote] = useState('');
  const pending = unsuspend.isPending || dismiss.isPending;

  const submit = () => {
    const value = note.trim() || null;
    const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : String(e));
    if (kind === 'unsuspend' && flag.project) {
      unsuspend.mutate(
        { projectId: flag.project.id, note: value },
        {
          onSuccess: (res) => {
            toast.success(t('admin', 'abuseUnsuspendedToast'));
            if (!res.containersStarted) toast.warning(t('admin', 'abuseContainersWarn'));
            onDone();
          },
          onError,
        }
      );
    } else {
      dismiss.mutate(
        { flagId: flag.id, note: value },
        {
          onSuccess: () => {
            toast.success(t('admin', 'abuseDismissedToast'));
            onDone();
          },
          onError,
        }
      );
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-3">
      <label className="block space-y-1">
        <span className="text-xs text-[var(--text-secondary)]">{t('admin', 'abuseNoteLabel')}</span>
        <textarea className="input w-full min-h-[56px]" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={`btn btn-sm ${kind === 'unsuspend' ? 'btn-primary' : 'btn-secondary'}`} disabled={pending} onClick={submit}>
          {kind === 'unsuspend' ? t('admin', 'abuseConfirmUnsuspend') : t('admin', 'abuseConfirmDismiss')}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDone}>
          {t('admin', 'abuseCancel')}
        </button>
      </div>
    </div>
  );
}
