'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Folder,
  Database,
  Plus,
  Rocket,
  Wallet,
  Terminal,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useTranslation, useProjects, useDatabases } from '@/hooks';
import type { Server, Project, Database as DatabaseType } from '@/lib/api';
import { CreateDatabaseModal } from '@/app/(dashboard)/dashboard/databases/components/CreateDatabaseModal';

const ICON_SM = 'w-4 h-4 shrink-0';

type HubStepLabelKey =
  | 'hubStepTopUp'
  | 'hubStepStart'
  | 'hubStepFixSetup'
  | 'hubStepWaitSetup'
  | 'hubStepDeployFirst'
  | 'hubStepRunningReady'
  | 'hubStepTerminal';

export function ServerNextStepsCard({ server }: { server: Server }) {
  const { t } = useTranslation();
  const steps: { id: string; labelKey: HubStepLabelKey; icon: React.ReactNode; href?: string }[] = [];

  const isReady = server.status === 'running' && server.setupStatus === 'completed';
  const needsTopUp =
    server.isManaged &&
    server.infraBilling &&
    !server.infraBilling.canStart &&
    server.status === 'stopped';

  if (needsTopUp) {
    steps.push({
      id: 'topup',
      labelKey: 'hubStepTopUp',
      icon: <Wallet className={ICON_SM} />,
      href: '/dashboard/billing',
    });
  } else if (server.status === 'stopped' && server.infraBilling?.canStart) {
    steps.push({ id: 'start', labelKey: 'hubStepStart', icon: <Rocket className={ICON_SM} /> });
  } else if (server.setupStatus === 'failed') {
    steps.push({ id: 'fixSetup', labelKey: 'hubStepFixSetup', icon: <AlertTriangle className={ICON_SM} /> });
  } else if (server.status === 'running' && server.setupStatus !== 'completed') {
    steps.push({
      id: 'waitSetup',
      labelKey: 'hubStepWaitSetup',
      icon: <Loader2 className={`${ICON_SM} animate-spin`} />,
    });
  } else if (isReady) {
    if (server.projectCount === 0) {
      steps.push({
        id: 'deployFirst',
        labelKey: 'hubStepDeployFirst',
        icon: <Plus className={ICON_SM} />,
        href: `/dashboard/projects/new?serverId=${server.id}`,
      });
    } else {
      steps.push({ id: 'runningReady', labelKey: 'hubStepRunningReady', icon: <Rocket className={ICON_SM} /> });
    }
    steps.push({
      id: 'terminal',
      labelKey: 'hubStepTerminal',
      icon: <Terminal className={ICON_SM} />,
      href: `/dashboard/servers/${server.id}/terminal`,
    });
  }

  if (steps.length === 0) return null;

  return (
    <div className="dash-panel p-4 sm:p-5">
      <h3 className="text-sm font-semibold mb-3">{t('servers', 'hubNextStepsTitle')}</h3>
      <ul className="space-y-2">
        {steps.map((step) => {
          const content = (
            <span className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
              <span className="mt-0.5 text-[var(--accent-cyan)]">{step.icon}</span>
              <span>{t('servers', step.labelKey)}</span>
            </span>
          );

          if (step.href) {
            return (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-[var(--bg-tertiary)] transition-colors group"
                >
                  {content}
                  <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                </Link>
              </li>
            );
          }

          return <li key={step.id}>{content}</li>;
        })}
      </ul>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const { t } = useTranslation();
  const statusClass =
    project.status === 'active' ? 'badge-success' : project.status === 'paused' ? 'badge-warning' : 'badge-error';

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors group"
    >
      <div className="min-w-0 flex items-center gap-2">
        <Folder className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{project.name}</p>
          <p className="text-xs text-[var(--text-muted)] font-mono truncate">{project.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`badge text-[10px] ${statusClass}`}>{project.status}</span>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
      </div>
    </Link>
  );
}

export function ServerProjectsSection({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { data: projects = [], isLoading } = useProjects();
  const onServer = useMemo(() => projects.filter((p) => p.serverId === serverId), [projects, serverId]);

  return (
    <div id="server-hub-projects" className="dash-panel p-4 sm:p-5 scroll-mt-6">
      <div className="dash-panel-header !mb-3">
        <div className="dash-panel-title">
          <Folder className="w-4 h-4 text-[var(--text-secondary)]" />
          {t('servers', 'hubProjectsTitle')}
        </div>
        <Link
          href={`/dashboard/projects/new?serverId=${serverId}`}
          className="dash-link flex items-center gap-1 shrink-0"
        >
          {t('servers', 'hubNewProject')}
          <Plus className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : onServer.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('servers', 'hubProjectsEmpty')}</p>
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden">
          {onServer.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function DatabaseRow({ database }: { database: DatabaseType }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0 flex items-center gap-2">
        <Database className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{database.name}</p>
          <p className="text-xs text-[var(--text-muted)] capitalize">{database.type}</p>
        </div>
      </div>
      <span className="badge text-[10px] capitalize shrink-0">{database.status}</span>
    </div>
  );
}

export function ServerDatabasesSection({
  server,
  readyServers,
}: {
  server: Server;
  readyServers: Server[];
}) {
  const { t } = useTranslation();
  const { data: databases = [], isLoading } = useDatabases();
  const [createOpen, setCreateOpen] = useState(false);

  const onServer = useMemo(
    () => databases.filter((d) => d.serverId === server.id),
    [databases, server.id]
  );

  const canCreate = server.status === 'running' && server.setupStatus === 'completed';

  return (
    <>
      <div id="server-hub-databases" className="dash-panel p-4 sm:p-5 scroll-mt-6">
        <div className="dash-panel-header !mb-3">
          <div className="dash-panel-title">
            <Database className="w-4 h-4 text-[var(--text-secondary)]" />
            {t('servers', 'hubDatabasesTitle')}
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="dash-link flex items-center gap-1 shrink-0"
            >
              {t('servers', 'hubAddDatabase')}
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
          </div>
        ) : onServer.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t('servers', 'hubDatabasesEmpty')}</p>
        ) : (
          <div className="rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {onServer.map((d) => (
              <DatabaseRow key={d.id} database={d} />
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateDatabaseModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          servers={readyServers}
          initialServerId={server.id}
        />
      )}
    </>
  );
}
