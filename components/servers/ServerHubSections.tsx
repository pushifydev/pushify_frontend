'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Rocket,
  Wallet,
  Terminal,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useTranslation, useProjects, useDatabases } from '@/hooks';
import { RowList } from '@/components/dashboard/PageKit';
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
    <RowList label={t('servers', 'hubNextStepsTitle')}>
      {steps.map((step) => {
        const content = (
          <>
            <span className="text-[var(--text-muted)] shrink-0" aria-hidden="true">{step.icon}</span>
            <span className="flex-1 min-w-0 text-sm text-[var(--text-primary)]">{t('servers', step.labelKey)}</span>
          </>
        );

        if (step.href) {
          return (
            <Link
              key={step.id}
              href={step.href}
              className="dash-row group flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
            >
              {content}
              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" aria-hidden="true" />
            </Link>
          );
        }

        return (
          <div key={step.id} className="dash-row flex items-center gap-3">
            {content}
          </div>
        );
      })}
    </RowList>
  );
}

function projectDot(status: string): string {
  return status === 'active' ? 'is-success' : status === 'paused' ? 'is-warning' : 'is-error';
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="dash-row group flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
    >
      <span className={`dash-status-dot ${projectDot(project.status)}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:underline underline-offset-2">
          {project.name}
        </p>
        <p className="terminal-text text-xs text-[var(--text-muted)] truncate mt-0.5">{project.slug}</p>
      </div>
      {project.status !== 'active' && <span className="badge badge-warning shrink-0">{project.status}</span>}
      <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" aria-hidden="true" />
    </Link>
  );
}

export function ServerProjectsSection({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { data: projects = [], isLoading } = useProjects();
  const onServer = useMemo(() => projects.filter((p) => p.serverId === serverId), [projects, serverId]);

  return (
    <div id="server-hub-projects" className="scroll-mt-6 min-w-0">
      <RowList
        label={
          <>
            {t('servers', 'hubProjectsTitle')}
            {onServer.length > 0 && <span className="ml-2 opacity-60 tabular-nums">{onServer.length}</span>}
          </>
        }
        action={
          <Link href={`/dashboard/projects/new?serverId=${serverId}`} className="btn btn-secondary btn-sm">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            {t('servers', 'hubNewProject')}
          </Link>
        }
      >
        {isLoading ? (
          <div className="dash-row flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : onServer.length === 0 ? (
          <div className="dash-row text-[13px] text-[var(--text-muted)]">{t('servers', 'hubProjectsEmpty')}</div>
        ) : (
          onServer.map((p) => <ProjectRow key={p.id} project={p} />)
        )}
      </RowList>
    </div>
  );
}

function DatabaseRow({ database }: { database: DatabaseType }) {
  const dot =
    database.status === 'running'
      ? 'is-success'
      : database.status === 'error'
        ? 'is-error'
        : database.status === 'provisioning'
          ? 'is-warning'
          : '';
  return (
    <div className="dash-row flex items-center gap-3">
      <span className={`dash-status-dot ${dot}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{database.name}</p>
        <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mt-0.5">
          {database.type}
        </p>
      </div>
      <span className="dash-section-label shrink-0">{database.status}</span>
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
      <div id="server-hub-databases" className="scroll-mt-6 min-w-0">
        <RowList
          label={
            <>
              {t('servers', 'hubDatabasesTitle')}
              {onServer.length > 0 && <span className="ml-2 opacity-60 tabular-nums">{onServer.length}</span>}
            </>
          }
          action={
            canCreate ? (
              <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-secondary btn-sm">
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                {t('servers', 'hubAddDatabase')}
              </button>
            ) : undefined
          }
        >
          {isLoading ? (
            <div className="dash-row flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : onServer.length === 0 ? (
            <div className="dash-row text-[13px] text-[var(--text-muted)]">{t('servers', 'hubDatabasesEmpty')}</div>
          ) : (
            onServer.map((d) => <DatabaseRow key={d.id} database={d} />)
          )}
        </RowList>
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
