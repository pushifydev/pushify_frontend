'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, X } from 'lucide-react';
import type { Database, Project } from '@/lib/api';
import { STATUS_COLORS } from '@/lib/constants';
import { panelStyle, type T } from './_shared';

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

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  } as const;

  return (
    <section className="rounded-xl p-5" style={panelStyle}>
      <h2 className="text-sm font-semibold">{t('databases', 'connectedProjects')}</h2>
      <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
        {t('databases', 'connectedProjectsHint')}
      </p>

      {connections.length === 0 ? (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('databases', 'noConnectedProjects')}
        </p>
      ) : (
        <ul className="space-y-2 mb-4">
          {connections.map((connection) => {
            const project = connection.project;
            // Apps on another server can't reach the private network address.
            const elsewhere =
              project?.serverId !== undefined && project.serverId !== database.serverId && !database.externalAccess;
            return (
              <li
                key={connection.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
              >
                <Link2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {project ? (
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-sm font-medium truncate hover:underline"
                      >
                        {project.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">—</span>
                    )}
                    <code
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {connection.envVarName}
                    </code>
                    {connection.permissions === 'readonly' && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded-full"
                        style={{ border: '1px solid var(--glass-border-md)', color: 'var(--text-muted)' }}
                      >
                        {t('databases', 'readonlyBadge')}
                      </span>
                    )}
                  </div>
                  {elsewhere && (
                    <p className="text-xs mt-1" style={{ color: STATUS_COLORS.warning }}>
                      {t('databases', 'otherServerNote')}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDisconnect(connection.id)}
                    className="p-1.5 rounded-md transition-colors hover:bg-[var(--hover-overlay)]"
                    style={{ color: 'var(--text-muted)' }}
                    title={t('databases', 'disconnectProject')}
                    aria-label={t('databases', 'disconnectProject')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && available.length > 0 && (
        <form
          className="flex flex-col sm:flex-row gap-2"
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
            className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
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
            className="sm:w-44 rounded-lg px-3 py-2 text-sm font-mono"
            style={{ ...inputStyle, borderColor: envValid ? 'var(--glass-border)' : STATUS_COLORS.error }}
            aria-label="Environment variable"
          />
          <select
            value={readonlyAvailable ? permissions : 'readwrite'}
            onChange={(event) => setPermissions(event.target.value as 'readwrite' | 'readonly')}
            className="sm:w-40 rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
            aria-label={t('databases', 'accessReadWrite')}
          >
            <option value="readwrite">{t('databases', 'accessReadWrite')}</option>
            <option value="readonly" disabled={!readonlyAvailable}>
              {readonlyAvailable ? t('databases', 'accessReadOnly') : t('databases', 'readonlyNotForRedis')}
            </option>
          </select>
          <button type="submit" disabled={pending || !projectId || !envValid} className="btn btn-primary text-sm py-2">
            {pending ? '…' : t('databases', 'connectProject')}
          </button>
        </form>
      )}
    </section>
  );
}
