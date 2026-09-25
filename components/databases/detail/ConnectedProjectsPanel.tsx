'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Database, Project } from '@/lib/api';
import { iconButtonClass, type T } from './_shared';

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
    <section className="dash-rows">
      <div className="dash-row">
        <h2 className="dash-panel-title">{t('databases', 'connectedProjects')}</h2>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'connectedProjectsHint')}
        </p>
      </div>

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
            <div key={connection.id} className="dash-row flex items-center gap-3 py-2.5!">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {project ? (
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-[13px] font-medium truncate underline-offset-4 hover:underline focus-visible:underline"
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
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="select flex-1 min-w-0 py-2! text-sm"
            aria-label={t('databases', 'selectProject')}
          >
            <option value="">{t('databases', 'selectProject')}</option>
            {available.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input
            value={envVarName}
            onChange={(event) => setEnvVarName(event.target.value.trim())}
            spellCheck={false}
            className="input sm:w-44 py-2! text-sm font-mono"
            style={envValid ? undefined : { borderColor: 'var(--status-error)' }}
            aria-invalid={!envValid}
            aria-label={t('databases', 'envVarLabel')}
          />
          <select
            value={readonlyAvailable ? permissions : 'readwrite'}
            onChange={(event) => setPermissions(event.target.value as 'readwrite' | 'readonly')}
            className="select sm:w-40 py-2! text-sm"
            aria-label={t('databases', 'accessReadWrite')}
          >
            <option value="readwrite">{t('databases', 'accessReadWrite')}</option>
            <option value="readonly" disabled={!readonlyAvailable}>
              {readonlyAvailable ? t('databases', 'accessReadOnly') : t('databases', 'readonlyNotForRedis')}
            </option>
          </select>
          <button type="submit" disabled={pending || !projectId || !envValid} className="btn btn-primary shrink-0">
            {pending ? '…' : t('databases', 'connectProject')}
          </button>
        </form>
      )}
    </section>
  );
}
