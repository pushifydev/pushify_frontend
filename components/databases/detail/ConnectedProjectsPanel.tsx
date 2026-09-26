'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Database, Project } from '@/lib/api';
import { iconButtonClass, type T } from './_shared';
import { Select } from '@/components/ui/select';

const ENV_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;

export function ConnectedProjectsPanel({
  database,
  projects,
  onConnect,
  onDisconnect,
  pending,
  canEdit,
  t,
}: {
  database: Database;
  projects: Project[];
  onConnect: (projectId: string, envVarName: string, permissions: 'readwrite' | 'readonly') => Promise<void>;
  onDisconnect: (connectionId: string) => void;
  pending: boolean;
  canEdit: boolean;
  t: T;
}) {
  const [projectId, setProjectId] = useState('');
  const [envVarName, setEnvVarName] = useState('DATABASE_URL');
  const [permissions, setPermissions] = useState<'readwrite' | 'readonly'>('readwrite');
  const readonlyAvailable = database.type !== 'redis';

  const connections = database.connections ?? [];
  const connectedIds = new Set(connections.map((c) => c.projectId));
  const available = projects.filter((p) => !connectedIds.has(p.id));
  const envValid = ENV_NAME_RE.test(envVarName);

  return (
    <section className="min-w-0" aria-labelledby="db-connected-title">
      <div className="mb-2.5">
        <h2 id="db-connected-title" className="dash-section-label">{t('databases', 'connectedProjects')}</h2>
        <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t('databases', 'connectedProjectsHint')}
        </p>
      </div>
      <div className="dash-rows">

      {connections.length === 0 ? (
        <div className="dash-row">
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {t('databases', 'noConnectedProjects')}
          </p>
        </div>
      ) : (
        connections.map((connection) => {
          const project = connection.project;
          // Apps on another server can't reach the private network address.
          const elsewhere =
            project?.serverId !== undefined && project.serverId !== database.serverId && !database.externalAccess;
          return (
            <div key={connection.id} className="dash-row flex items-center gap-3">
              <span className="dash-status-dot is-success" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {project ? (
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-sm font-medium truncate underline-offset-4 hover:underline focus-visible:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {project.name}
                    </Link>
                  ) : (
                    <span className="text-[13px] font-medium">—</span>
                  )}
                  <code className="dash-mono-caption" style={{ color: 'var(--text-secondary)' }}>
                    {connection.envVarName}
                  </code>
                  {connection.permissions === 'readonly' && (
                    <span className="badge badge-neutral">{t('databases', 'readonlyBadge')}</span>
                  )}
                </div>
                {elsewhere && (
                  <p className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>
                    {t('databases', 'otherServerNote')}
                  </p>
                )}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onDisconnect(connection.id)}
                  className={iconButtonClass}
                  title={t('databases', 'disconnectProject')}
                  aria-label={t('databases', 'disconnectProject')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })
      )}

      {canEdit && available.length > 0 && (
        <form
          className="dash-row flex flex-col sm:flex-row gap-2"
          style={{ background: 'var(--bg-tertiary)' }}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!projectId || !envValid) return;
            await onConnect(projectId, envVarName, readonlyAvailable ? permissions : 'readwrite');
            setProjectId('');
          }}
        >
          <Select
            value={projectId}
            onValueChange={setProjectId}
            className="flex-1 min-w-0"
            aria-label={t('databases', 'selectProject')}
            options={[
              { value: '', label: t('databases', 'selectProject') },
              ...available.map((project) => ({ value: project.id, label: project.name })),
            ]}
          />
          <input
            value={envVarName}
            onChange={(event) => setEnvVarName(event.target.value.trim())}
            spellCheck={false}
            className="input sm:w-44 py-2! text-sm font-mono"
            style={envValid ? undefined : { borderColor: 'var(--status-error)' }}
            aria-invalid={!envValid}
            aria-label={t('databases', 'envVarLabel')}
          />
          <Select
            value={readonlyAvailable ? permissions : 'readwrite'}
            onValueChange={(v) => setPermissions(v as 'readwrite' | 'readonly')}
            className="sm:w-40"
            aria-label={t('databases', 'accessReadWrite')}
            options={[
              { value: 'readwrite', label: t('databases', 'accessReadWrite') },
              {
                value: 'readonly',
                label: readonlyAvailable ? t('databases', 'accessReadOnly') : t('databases', 'readonlyNotForRedis'),
                disabled: !readonlyAvailable,
              },
            ]}
          />
          <button type="submit" disabled={pending || !projectId || !envValid} className="btn btn-primary shrink-0">
            {pending ? '…' : t('databases', 'connectProject')}
          </button>
        </form>
      )}
      </div>
    </section>
  );
}
