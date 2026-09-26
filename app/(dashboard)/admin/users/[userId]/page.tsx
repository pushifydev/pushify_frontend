'use client';

import { useParams } from 'next/navigation';
import { useTranslation, useAdminUser } from '@/hooks';
import type { AdminTimelineEntry } from '@/lib/api';
import { getStatusColor } from '@/lib/constants';
import { MetaLabel, PageHeader } from '@/components/dashboard/PageKit';
import {
  AdminPanel, AdminError, EmptyRow, LoadingRows,
  authEventLabel, authEventDot, methodLabel, planBadgeClass, describeUserAgent,
  timeOfDay, dayKey, dayLabel, shortDate, relative,
} from '../../shared';

export default function AdminUserPage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error, refetch } = useAdminUser(userId);

  const back = { href: '/admin/users', label: t('admin', 'navUsers') };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader back={back} crumb="…" title={t('admin', 'title')} />
        <AdminError error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const lastSeen = data
    ? [
        ...data.authEvents.filter((e) => e.event === 'login' || e.event === 'register').map((e) => e.createdAt),
        ...data.activity.map((a) => a.createdAt),
        ...data.sessions.map((s) => s.createdAt),
      ].sort().at(-1) ?? null
    : null;

  return (
    <div className="space-y-8 min-w-0">
      {/* Who */}
      <div className="space-y-4">
        {isLoading || !data ? (
          <>
            <div className="dash-skeleton h-4 w-40 rounded" aria-hidden />
            <div className="flex items-center gap-4" aria-busy>
              <div className="flex-1 space-y-2">
                <div className="dash-skeleton h-7 w-56 rounded" aria-hidden />
                <div className="dash-skeleton h-3.5 w-72 rounded" aria-hidden />
              </div>
            </div>
          </>
        ) : (
          <PageHeader
            back={back}
            title={data.user.name}
            badge={
              <span className={`badge ${data.user.emailVerified ? 'badge-success' : 'badge-warning'}`}>
                {data.user.emailVerified ? t('admin', 'emailVerified') : t('admin', 'emailUnverified')}
              </span>
            }
            description={<span className="terminal-text text-[13px]">{data.user.email}</span>}
            meta={[
              <MetaLabel key="method">{methodLabel(t, data.user.signupMethod)}</MetaLabel>,
              <MetaLabel key="2fa">{data.user.twoFactorEnabled ? t('admin', 'twoFactorOn') : t('admin', 'twoFactorOff')}</MetaLabel>,
              <MetaLabel key="pw">{data.user.hasPassword ? t('admin', 'passwordSet') : t('admin', 'oauthOnly')}</MetaLabel>,
              <span key="joined">{t('admin', 'joined')} {shortDate(data.user.createdAt)}</span>,
              <span key="seen">{t('admin', 'lastSeen')} {relative(lastSeen, t)}</span>,
            ]}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-w-0">
        {/* What they own */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          <AdminPanel title={t('admin', 'orgsTitle')} meta={data?.organizations.length}>
            {!data ? <LoadingRows /> : data.organizations.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.organizations.map((o) => (
                  <li key={o.id} className="dash-row">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">{o.name}</span>
                      <span className={`${planBadgeClass(o.plan)} shrink-0`}>{o.plan}</span>
                    </div>
                    <p className="terminal-text text-xs mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[var(--text-muted)]">
                      <span className="text-[var(--text-secondary)]">{o.role}</span>
                      <span>{o.memberCount} {t('admin', 'members')}</span>
                      <span>{o.projectCount} {t('admin', 'projects').toLowerCase()}</span>
                      {o.infraWalletBalanceCents !== 0 && (
                        <span>{t('admin', 'wallet')} ${(o.infraWalletBalanceCents / 100).toFixed(2)}</span>
                      )}
                      {o.billingStatus !== 'active' && (
                        <span className="text-[var(--status-error)]">{o.billingStatus}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'projectsTitle')} meta={data?.projects.length}>
            {!data ? <LoadingRows /> : data.projects.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.projects.map((p) => (
                  <li key={p.id} className="dash-row flex items-start gap-3">
                    <span className="dash-status-dot mt-[7px]" style={{ background: getStatusColor(p.lastDeploymentStatus ?? p.status) }} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</span>
                        <span className="terminal-text text-xs shrink-0 text-[var(--text-muted)]">{shortDate(p.createdAt)}</span>
                      </div>
                      <p className="terminal-text text-xs mt-1 truncate text-[var(--text-muted)]">
                        {p.deploymentCount} {t('admin', 'deploys')}
                        {p.lastDeploymentAt
                          ? ` · ${t('admin', 'lastDeploy')} ${p.lastDeploymentStatus} ${relative(p.lastDeploymentAt, t)}`
                          : ` · ${t('admin', 'noDeploysYet')}`}
                        {p.gitProvider && ` · ${p.gitProvider}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'serversTitle')} meta={data?.servers.length}>
            {!data ? <LoadingRows /> : data.servers.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.servers.map((s) => (
                  <li key={s.id} className="dash-row flex items-start gap-3">
                    <span className="dash-status-dot mt-[7px]" style={{ background: getStatusColor(s.status) }} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{s.name}</span>
                        <span className="terminal-text text-xs shrink-0 text-[var(--text-muted)]">{shortDate(s.createdAt)}</span>
                      </div>
                      <p className="terminal-text text-xs mt-1 truncate text-[var(--text-muted)]">
                        {s.provider} · {s.isManaged ? t('admin', 'managed') : t('admin', 'byos')} · {s.region} · {s.size}
                        {s.ipv4 && ` · ${s.ipv4}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'databasesTitle')} meta={data?.databases.length}>
            {!data ? <LoadingRows /> : data.databases.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.databases.map((d) => (
                  <li key={d.id} className="dash-row flex items-center gap-3">
                    <span className="dash-status-dot" style={{ background: getStatusColor(d.status) }} aria-hidden />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {d.name}
                        <span className="dash-section-label ml-2">{d.type}</span>
                      </span>
                      <span className="terminal-text text-xs shrink-0 text-[var(--text-muted)]">{shortDate(d.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'sessionsTitle')} meta={data?.sessions.length}>
            {!data ? <LoadingRows /> : data.sessions.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.sessions.map((s) => (
                  <li key={s.id} className="dash-row">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--text-primary)] truncate">{describeUserAgent(s.userAgent) ?? '—'}</span>
                      <span className="text-xs shrink-0 text-[var(--text-muted)]">{relative(s.createdAt, t)}</span>
                    </div>
                    <p className="terminal-text text-xs mt-1 text-[var(--text-muted)]">
                      {s.ipAddress ?? '—'} · {t('admin', 'expires')} {shortDate(s.expiresAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>

        {/* What they did — one thread, newest first */}
        <AdminPanel title={t('admin', 'timelineTitle')} meta={data?.timeline.length} className="lg:col-span-3">
          {!data ? <LoadingRows rows={6} /> : data.timeline.length === 0 ? (
            <EmptyRow>{t('admin', 'timelineEmpty')}</EmptyRow>
          ) : (
            <Timeline entries={data.timeline} />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}

// ============ Pieces ============

function Timeline({ entries }: { entries: AdminTimelineEntry[] }) {
  const { t } = useTranslation();

  const groups: { key: string; label: string; entries: AdminTimelineEntry[] }[] = [];
  for (const entry of entries) {
    const key = dayKey(entry.at);
    const group = groups[groups.length - 1];
    if (group && group.key === key) group.entries.push(entry);
    else groups.push({ key, label: dayLabel(entry.at), entries: [entry] });
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.key} className="dash-row pt-0! pb-2!" aria-label={group.label}>
          <h3 className="dash-section-label sticky top-0 z-[1] -mx-4 sm:-mx-5 px-4 sm:px-5 pt-3 pb-2 bg-[var(--bg-secondary)]">
            {group.label}
          </h3>
          <ol className="relative ml-[3px] border-l border-[var(--border-subtle)]">
            {group.entries.map((entry, i) => {
              const v = describe(entry, t);
              return (
                <li key={`${entry.kind}-${entry.at}-${i}`} className="relative pl-5 py-2">
                  <span
                    className={`dash-status-dot absolute -left-[3.5px] top-[15px] ${v.dot ?? ''}`}
                    style={v.color ? { background: v.color } : undefined}
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] text-[var(--text-primary)] break-words">
                        {v.title}
                        {v.status && (
                          <span className={`badge ml-2 align-middle ${statusBadge(v.status)}`}>{v.status}</span>
                        )}
                      </p>
                      {v.detail && (
                        <p className="terminal-text text-xs mt-1 truncate text-[var(--text-muted)]">{v.detail}</p>
                      )}
                      {v.error && (
                        <p className="terminal-text text-xs mt-1.5 break-words text-[var(--status-error)]">{v.error}</p>
                      )}
                    </div>
                    <time dateTime={entry.at} className="terminal-text text-xs shrink-0 tabular-nums text-[var(--text-muted)]">
                      {timeOfDay(entry.at)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function statusBadge(status: string): string {
  if (/fail|error|cancel/i.test(status)) return 'badge-error';
  if (/success|ready|live|running|active|completed/i.test(status)) return 'badge-success';
  if (/build|deploy|pending|queued|progress/i.test(status)) return 'badge-warning';
  return 'badge-neutral';
}

type T = ReturnType<typeof useTranslation>['t'];

function describe(entry: AdminTimelineEntry, t: T): {
  /** `.dash-status-dot` modifier; otherwise `color` (status hex) or the muted default. */
  dot?: string;
  color?: string;
  title: string;
  detail?: string;
  status?: string;
  error?: string | null;
} {
  switch (entry.kind) {
    case 'auth':
      return {
        dot: authEventDot(entry.event),
        title: authEventLabel(t, entry.event),
        detail: [
          `${t('admin', 'via')} ${methodLabel(t, entry.method)}`,
          entry.ipAddress,
          describeUserAgent(entry.userAgent),
        ].filter(Boolean).join(' · '),
      };
    case 'activity':
      return {
        title: entry.description,
        detail: [entry.action, entry.projectName].filter(Boolean).join(' · '),
      };
    case 'project':
      return {
        dot: 'is-active',
        title: `${t('admin', 'tlProject')} · ${entry.name}`,
        detail: entry.gitProvider ?? undefined,
      };
    case 'deployment':
      return {
        color: getStatusColor(entry.status),
        title: `${t('admin', 'tlDeploy')} · ${entry.projectName}`,
        status: entry.status,
        detail: entry.trigger,
        error: entry.errorMessage,
      };
    case 'server':
      return {
        dot: 'is-active',
        title: `${entry.isManaged ? t('admin', 'tlServerManaged') : t('admin', 'tlServerByos')} · ${entry.name}`,
        detail: entry.provider,
      };
    case 'database':
      return {
        dot: 'is-active',
        title: `${t('admin', 'tlDatabase')} · ${entry.name}`,
        detail: entry.type,
      };
  }
}
