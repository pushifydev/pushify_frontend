'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, Building2, Folder, Server, Database, MonitorSmartphone, History,
  LogIn, UserPlus, KeyRound, ShieldAlert, Activity, Rocket,
} from 'lucide-react';
import { useTranslation, useAdminUser } from '@/hooks';
import type { AdminTimelineEntry } from '@/lib/api';
import { STATUS_COLORS, ROLE_COLORS, getStatusColor } from '@/lib/constants';
import { Skeleton } from '@/components/Skeleton';
import {
  AdminPanel, AdminError, Avatar, EmptyRow,
  rowBorder, authEventLabel, authEventColor, methodLabel, planBadgeClass, describeUserAgent,
  timeOfDay, dayKey, dayLabel, shortDate, relative,
} from '../../shared';

export default function AdminUserPage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error, refetch } = useAdminUser(userId);

  if (error) return <AdminError error={error} onRetry={() => refetch()} />;

  const lastSeen = data
    ? [
        ...data.authEvents.filter((e) => e.event === 'login' || e.event === 'register').map((e) => e.createdAt),
        ...data.activity.map((a) => a.createdAt),
        ...data.sessions.map((s) => s.createdAt),
      ].sort().at(-1) ?? null
    : null;

  return (
    <div className="space-y-4">
      <Link href="/admin/users" className="dash-link inline-flex items-center gap-1">
        <ChevronLeft className="w-3.5 h-3.5" />
        {t('admin', 'backToUsers')}
      </Link>

      {/* Who */}
      <section className="dash-panel">
        {isLoading || !data ? (
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-64 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar name={data.user.name} avatarUrl={data.user.avatarUrl} size={48} />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate">{data.user.name}</h2>
              <p className="text-sm truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {data.user.email}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Chip>{t('admin', 'joined')} {shortDate(data.user.createdAt)}</Chip>
                <Chip>{methodLabel(t, data.user.signupMethod)}</Chip>
                <Chip tone={data.user.emailVerified ? STATUS_COLORS.success : STATUS_COLORS.warning}>
                  {data.user.emailVerified ? t('admin', 'emailVerified') : t('admin', 'emailUnverified')}
                </Chip>
                <Chip tone={data.user.twoFactorEnabled ? STATUS_COLORS.success : undefined}>
                  {data.user.twoFactorEnabled ? t('admin', 'twoFactorOn') : t('admin', 'twoFactorOff')}
                </Chip>
                <Chip>{data.user.hasPassword ? t('admin', 'passwordSet') : t('admin', 'oauthOnly')}</Chip>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('admin', 'lastSeen')}</p>
              <p className="text-sm font-medium">{relative(lastSeen, t)}</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* What they own */}
        <div className="lg:col-span-2 space-y-4">
          <AdminPanel title={t('admin', 'orgsTitle')} icon={<Building2 className="w-4 h-4" />} meta={data?.organizations.length}>
            {!data ? <Loading /> : data.organizations.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.organizations.map((o, idx) => (
                  <li key={o.id} className="px-5 py-3" style={rowBorder(idx)}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium truncate">{o.name}</span>
                      <span className={planBadgeClass(o.plan)}>{o.plan}</span>
                    </div>
                    <p className="text-xs mt-1 flex flex-wrap gap-x-2" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: ROLE_COLORS[o.role] }}>{o.role}</span>
                      <span>· {o.memberCount} {t('admin', 'members')}</span>
                      <span>· {o.projectCount} {t('admin', 'projects').toLowerCase()}</span>
                      {o.infraWalletBalanceCents !== 0 && (
                        <span>· {t('admin', 'wallet')} ${(o.infraWalletBalanceCents / 100).toFixed(2)}</span>
                      )}
                      {o.billingStatus !== 'active' && (
                        <span style={{ color: STATUS_COLORS.error }}>· {o.billingStatus}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'projectsTitle')} icon={<Folder className="w-4 h-4" />} meta={data?.projects.length}>
            {!data ? <Loading /> : data.projects.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.projects.map((p, idx) => (
                  <li key={p.id} className="px-5 py-3 flex items-center gap-3" style={rowBorder(idx)}>
                    <span className="dash-status-dot shrink-0" style={{ background: getStatusColor(p.lastDeploymentStatus ?? p.status) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{shortDate(p.createdAt)}</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
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

          <AdminPanel title={t('admin', 'serversTitle')} icon={<Server className="w-4 h-4" />} meta={data?.servers.length}>
            {!data ? <Loading /> : data.servers.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.servers.map((s, idx) => (
                  <li key={s.id} className="px-5 py-3 flex items-center gap-3" style={rowBorder(idx)}>
                    <span className="dash-status-dot shrink-0" style={{ background: getStatusColor(s.status) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium truncate">{s.name}</span>
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{shortDate(s.createdAt)}</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {s.provider} · {s.isManaged ? t('admin', 'managed') : t('admin', 'byos')} · {s.region} · {s.size}
                        {s.ipv4 && <span style={{ fontFamily: 'var(--font-mono)' }}> · {s.ipv4}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'databasesTitle')} icon={<Database className="w-4 h-4" />} meta={data?.databases.length}>
            {!data ? <Loading /> : data.databases.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.databases.map((d, idx) => (
                  <li key={d.id} className="px-5 py-3 flex items-center gap-3" style={rowBorder(idx)}>
                    <span className="dash-status-dot shrink-0" style={{ background: getStatusColor(d.status) }} />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium truncate">{d.name} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{d.type}</span></span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{shortDate(d.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel title={t('admin', 'sessionsTitle')} icon={<MonitorSmartphone className="w-4 h-4" />} meta={data?.sessions.length}>
            {!data ? <Loading /> : data.sessions.length === 0 ? <EmptyRow>{t('admin', 'sectionEmpty')}</EmptyRow> : (
              <ul>
                {data.sessions.map((s, idx) => (
                  <li key={s.id} className="px-5 py-3" style={rowBorder(idx)}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm truncate">{describeUserAgent(s.userAgent) ?? '—'}</span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{relative(s.createdAt, t)}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {s.ipAddress ?? '—'} · {t('admin', 'expires')} {shortDate(s.expiresAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>

        {/* What they did — one thread, newest first */}
        <AdminPanel
          title={t('admin', 'timelineTitle')}
          icon={<History className="w-4 h-4" />}
          meta={data?.timeline.length}
          className="lg:col-span-3"
        >
          {!data ? <Loading rows={6} /> : data.timeline.length === 0 ? (
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

function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="px-5 py-4 space-y-3">
      {[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
      style={{ background: 'var(--bg-tertiary)', color: tone ?? 'var(--text-secondary)' }}
    >
      {tone && <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone }} />}
      {children}
    </span>
  );
}

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
    <div className="px-5 py-2">
      {groups.map((group) => (
        <div key={group.key}>
          <div
            className="sticky top-0 z-[1] py-2 text-xs font-medium"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            {group.label}
          </div>
          <ol className="ml-2.5 pl-6 relative" style={{ borderLeft: '1px solid var(--glass-border)' }}>
            {group.entries.map((entry, i) => {
              const v = describe(entry, t);
              return (
                <li key={`${entry.kind}-${entry.at}-${i}`} className="relative py-2">
                  <span
                    className="absolute -left-[35px] top-2 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                    style={{ background: 'var(--bg-secondary)', border: `1px solid ${v.color}`, color: v.color }}
                    aria-hidden
                  >
                    {v.icon}
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm">
                        {v.title}
                        {v.status && (
                          <span
                            className="ml-2 text-xs px-1.5 py-0.5 rounded align-middle"
                            style={{ background: `${v.color}18`, color: v.color, fontFamily: 'var(--font-mono)' }}
                          >
                            {v.status}
                          </span>
                        )}
                      </p>
                      {v.detail && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{v.detail}</p>
                      )}
                      {v.error && (
                        <p className="text-xs mt-1 break-words" style={{ color: STATUS_COLORS.error, fontFamily: 'var(--font-mono)' }}>
                          {v.error}
                        </p>
                      )}
                    </div>
                    <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {timeOfDay(entry.at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

type T = ReturnType<typeof useTranslation>['t'];

function describe(entry: AdminTimelineEntry, t: T): {
  icon: React.ReactNode;
  color: string;
  title: string;
  detail?: string;
  status?: string;
  error?: string | null;
} {
  const iconClass = 'w-3 h-3';
  const neutral = 'var(--text-muted)';

  switch (entry.kind) {
    case 'auth': {
      const failed = entry.event === 'login_failed' || entry.event === 'two_factor_failed';
      const icon = entry.event === 'register' ? <UserPlus className={iconClass} />
        : failed ? <ShieldAlert className={iconClass} />
        : entry.event === 'two_factor_required' ? <KeyRound className={iconClass} />
        : <LogIn className={iconClass} />;
      return {
        icon,
        color: authEventColor(entry.event),
        title: authEventLabel(t, entry.event),
        detail: [
          `${t('admin', 'via')} ${methodLabel(t, entry.method)}`,
          entry.ipAddress,
          describeUserAgent(entry.userAgent),
        ].filter(Boolean).join(' · '),
      };
    }
    case 'activity':
      return {
        icon: <Activity className={iconClass} />,
        color: neutral,
        title: entry.description,
        detail: [entry.action, entry.projectName].filter(Boolean).join(' · '),
      };
    case 'project':
      return {
        icon: <Folder className={iconClass} />,
        color: STATUS_COLORS.purple,
        title: `${t('admin', 'tlProject')} · ${entry.name}`,
        detail: entry.gitProvider ?? undefined,
      };
    case 'deployment':
      return {
        icon: <Rocket className={iconClass} />,
        color: getStatusColor(entry.status),
        title: `${t('admin', 'tlDeploy')} · ${entry.projectName}`,
        status: entry.status,
        detail: entry.trigger,
        error: entry.errorMessage,
      };
    case 'server':
      return {
        icon: <Server className={iconClass} />,
        color: STATUS_COLORS.orange,
        title: `${entry.isManaged ? t('admin', 'tlServerManaged') : t('admin', 'tlServerByos')} · ${entry.name}`,
        detail: entry.provider,
      };
    case 'database':
      return {
        icon: <Database className={iconClass} />,
        color: STATUS_COLORS.cyan,
        title: `${t('admin', 'tlDatabase')} · ${entry.name}`,
        detail: entry.type,
      };
  }
}
