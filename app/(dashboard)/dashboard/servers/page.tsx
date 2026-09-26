'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  MoreHorizontal,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { ServerMapView } from '@/components/servers/ServerMapView';
import { useTranslation, useServers, useStartServer, useStopServer, useRebootServer, useSyncServer } from '@/hooks';
import { DeleteServerModal } from './components';
import { Skeleton } from '@/components/Skeleton';
import { PageHeader, MetaLabel, Tabs, TabPanel } from '@/components/dashboard/PageKit';
import type { Server as ServerType, ServerStatus, ServerSetupStatus } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';

const copy = {
  list: { en: 'List', tr: 'Liste' },
  running: { en: 'running', tr: 'çalışıyor' },
};

/** Server status → the one status dot the product uses. */
function serverDot(status: ServerStatus): string {
  switch (status) {
    case 'running':
      return 'is-success';
    case 'provisioning':
    case 'rebooting':
    case 'deleting':
      return 'is-warning';
    case 'error':
      return 'is-error';
    default:
      return '';
  }
}

function serverBadge(status: ServerStatus): string {
  switch (status) {
    case 'running':
      return 'badge-success';
    case 'provisioning':
    case 'rebooting':
    case 'deleting':
      return 'badge-warning';
    case 'error':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

export default function ServersPage() {
  const { t, locale } = useTranslation();
  const l = (s: { en: string; tr: string }) => (locale === 'tr' ? s.tr : s.en);
  const setupStatusLabel: Record<ServerSetupStatus, string> = {
    pending: t('servers', 'setupPending'),
    installing: t('servers', 'setupInstalling'),
    completed: t('servers', 'setupReady'),
    failed: t('servers', 'setupFailed'),
  };
  const { data: servers = [], isLoading } = useServers();
  const startServer  = useStartServer();
  const stopServer   = useStopServer();
  const rebootServer = useRebootServer();
  const syncServer   = useSyncServer();

  const [deleteServer, setDeleteServer] = useState<ServerType | null>(null);
  const [actionMenu, setActionMenu]     = useState<string | null>(null);
  const [viewMode, setViewMode]         = useState<'cards' | 'map'>('cards');

  const handleStart  = async (id: string) => { setActionMenu(null); await startServer.mutateAsync(id); };
  const handleStop   = async (id: string) => { setActionMenu(null); await stopServer.mutateAsync(id); };
  const handleReboot = async (id: string) => { setActionMenu(null); await rebootServer.mutateAsync(id); };
  const handleSync   = async (id: string) => { setActionMenu(null); await syncServer.mutateAsync(id); };

  const formatMemory = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;
  const runningCount = servers.filter((s) => s.status === 'running').length;

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        title={t('servers', 'title')}
        description={t('servers', 'description')}
        meta={
          isLoading
            ? []
            : [
                <MetaLabel key="n">
                  {servers.length} {t('navigation', 'servers')}
                </MetaLabel>,
                runningCount > 0 && (
                  <span key="r" className="inline-flex items-center gap-1.5">
                    <span className="dash-status-dot is-success" aria-hidden />
                    {runningCount} {l(copy.running)}
                  </span>
                ),
              ]
        }
        actions={
          <Link href="/dashboard/servers/new" className="btn btn-primary justify-center flex-1 sm:flex-none">
            <Plus className="w-4 h-4" />
            {t('servers', 'newServer')}
          </Link>
        }
      />

      {isLoading ? (
        <div className="dash-rows">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="dash-row flex items-center gap-3">
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[35%] max-w-[200px]" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : servers.length === 0 ? (
        <EmptyState
          label={t('navigation', 'servers')}
          title={t('servers', 'noServers')}
          description={t('servers', 'noServersDesc')}
          action={{ label: t('servers', 'createServer'), href: '/dashboard/servers/new', icon: <Plus className="w-4 h-4" /> }}
        />
      ) : (
        <div className="space-y-5 min-w-0">
          <Tabs
            label={t('servers', 'title')}
            idPrefix="servers-view"
            active={viewMode}
            onChange={setViewMode}
            items={[
              { id: 'cards', label: l(copy.list), count: servers.length },
              { id: 'map', label: t('servers', 'viewMap') },
            ]}
          />
          <TabPanel idPrefix="servers-view" active={viewMode}>
            {viewMode === 'map' ? (
              <ServerMapView servers={servers} t={t} />
            ) : (
              <ul className="dash-rows !overflow-visible" aria-label={t('servers', 'title')}>
                {servers.map((server) => {
                  const busy = server.status === 'provisioning' || server.status === 'rebooting';
                  const diskHot = typeof server.diskUsedPercent === 'number' && server.diskUsedPercent >= 85;
                  return (
                    <li
                      key={server.id}
                      className="dash-row group relative flex items-center gap-3 border-t border-[var(--border-subtle)] first:border-t-0 first:rounded-t-[14px] last:rounded-b-[14px] hover:bg-[var(--hover-overlay)] transition-colors"
                    >
                      <span
                        className={`dash-status-dot ${serverDot(server.status)}${busy ? ' animate-pulse' : ''}`}
                        aria-hidden
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                          <Link
                            href={`/dashboard/servers/${server.id}`}
                            className="text-sm font-medium text-[var(--text-primary)] truncate hover:underline underline-offset-2 after:absolute after:inset-0"
                          >
                            {server.name}
                          </Link>
                          {server.status !== 'running' && (
                            <span className={`badge shrink-0 ${serverBadge(server.status)}`}>
                              {t('servers', server.status as any)}
                            </span>
                          )}
                          {server.status === 'running' && server.setupStatus !== 'completed' && (
                            <span className={`badge shrink-0 ${server.setupStatus === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                              {setupStatusLabel[server.setupStatus]}
                            </span>
                          )}
                          {server.status !== 'running' && server.setupStatus === 'failed' && (
                            <span className="badge badge-error shrink-0">{setupStatusLabel.failed}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-[var(--text-muted)] min-w-0">
                          <MetaLabel>{t('servers', server.provider as any) || server.provider}</MetaLabel>
                          <MetaLabel>{server.region}</MetaLabel>
                          {server.ipv4 && <span className="terminal-text">{server.ipv4}</span>}
                          <span className="terminal-text tabular-nums">
                            {server.vcpus} vCPU · {formatMemory(server.memoryMb)} ·{' '}
                            {/* A disk near full takes every container on the box with it, so the
                                number that matters is how much is left, not how big it is. */}
                            <span className={diskHot ? 'text-[var(--status-warning)]' : undefined}>
                              {typeof server.diskUsedPercent === 'number'
                                ? `${server.diskUsedPercent}% / ${server.diskGb} GB`
                                : `${server.diskGb} GB`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {(server.projectCount > 0 || server.databaseCount > 0) && (
                        <div className="hidden md:flex items-center gap-3 text-xs text-[var(--text-muted)] shrink-0">
                          {server.projectCount > 0 && (
                            <span>{t('servers', 'projectCount').replace('{count}', String(server.projectCount))}</span>
                          )}
                          {server.databaseCount > 0 && (
                            <span>{t('servers', 'databaseCount').replace('{count}', String(server.databaseCount))}</span>
                          )}
                        </div>
                      )}

                      <div className="relative z-[1] shrink-0">
                        <button
                          type="button"
                          onClick={() => setActionMenu(actionMenu === server.id ? null : server.id)}
                          aria-haspopup="menu"
                          aria-expanded={actionMenu === server.id}
                          aria-label={server.name}
                          className="dash-icon-action"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {actionMenu === server.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="dash-menu absolute right-0 top-full mt-1 w-48 z-20" role="menu">
                              {server.status === 'stopped' && (
                                <button type="button" role="menuitem" onClick={() => handleStart(server.id)} className="dash-menu-item">
                                  <Play className="w-3.5 h-3.5" />
                                  {t('servers', 'start')}
                                </button>
                              )}
                              {server.status === 'running' && (
                                <>
                                  <button type="button" role="menuitem" onClick={() => handleStop(server.id)} className="dash-menu-item">
                                    <Square className="w-3.5 h-3.5" />
                                    {t('servers', 'stop')}
                                  </button>
                                  <button type="button" role="menuitem" onClick={() => handleReboot(server.id)} className="dash-menu-item">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {t('servers', 'reboot')}
                                  </button>
                                </>
                              )}
                              <button type="button" role="menuitem" onClick={() => handleSync(server.id)} className="dash-menu-item">
                                <RefreshCw className="w-3.5 h-3.5" />
                                {t('servers', 'sync')}
                              </button>
                              <div className="dash-menu-separator" />
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setActionMenu(null); setDeleteServer(server); }}
                                className="dash-menu-item is-danger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t('servers', 'deleteServer')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabPanel>
        </div>
      )}

      {deleteServer && (
        <DeleteServerModal isOpen onClose={() => setDeleteServer(null)} server={deleteServer} />
      )}
    </div>
  );
}
