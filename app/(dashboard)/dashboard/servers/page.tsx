'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Plus,
  MoreVertical,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
} from 'lucide-react';
import { useTranslation, useServers, useStartServer, useStopServer, useRebootServer, useSyncServer } from '@/hooks';
import { CreateServerModal, DeleteServerModal } from './components';
import { SERVER_STATUS_COLORS } from '@/lib/constants';
import type { Server as ServerType, ServerStatus, ServerSetupStatus } from '@/lib/api';

const providerLogos: Record<string, string> = {
  hetzner:      '/providers/hetzner.svg',
  digitalocean: '/providers/digitalocean.svg',
  aws:          '/providers/aws.svg',
  gcp:          '/providers/gcp.svg',
};

const setupStatusConfig: Record<ServerSetupStatus, { label: string; color: string }> = {
  pending:    { label: 'Waiting...', color: 'var(--text-muted)' },
  installing: { label: 'Installing Docker, Nginx...', color: 'var(--accent-cyan)' },
  completed:  { label: 'Ready', color: 'var(--status-success)' },
  failed:     { label: 'Setup Failed', color: 'var(--status-error)' },
};

export default function ServersPage() {
  const { t } = useTranslation();
  const { data: servers = [], isLoading } = useServers();
  const startServer  = useStartServer();
  const stopServer   = useStopServer();
  const rebootServer = useRebootServer();
  const syncServer   = useSyncServer();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteServer, setDeleteServer]       = useState<ServerType | null>(null);
  const [actionMenu, setActionMenu]           = useState<string | null>(null);

  const handleStart  = async (id: string) => { setActionMenu(null); await startServer.mutateAsync(id); };
  const handleStop   = async (id: string) => { setActionMenu(null); await stopServer.mutateAsync(id); };
  const handleReboot = async (id: string) => { setActionMenu(null); await rebootServer.mutateAsync(id); };
  const handleSync   = async (id: string) => { setActionMenu(null); await syncServer.mutateAsync(id); };

  const formatMemory = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-7 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('servers', 'title')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('servers', 'description')}
          </p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          {t('servers', 'newServer')}
        </button>
      </div>

      {/* Empty */}
      {servers.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.1)' }}
          >
            <Server className="w-7 h-7" style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h3 className="font-semibold mb-1">{t('servers', 'noServers')}</h3>
          <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            {t('servers', 'noServersDesc')}
          </p>
          <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            {t('servers', 'createServer')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {servers.map((server) => {
            const accent = SERVER_STATUS_COLORS[server.status];
            return (
              <Link
                href={`/dashboard/servers/${server.id}`}
                key={server.id}
                className="block rounded-xl p-5 relative group transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderWidth: '2px 1px 1px 1px',
                  borderStyle: 'solid',
                  borderColor: `${accent}45 var(--glass-border) var(--glass-border) var(--glass-border)`,
                  borderRadius: 12,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${accent}70 var(--glass-border-strong) var(--glass-border-strong) var(--glass-border-strong)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${accent}45 var(--glass-border) var(--glass-border) var(--glass-border)`;
                }}
              >
                {/* Provider + name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      {providerLogos[server.provider] ? (
                        <img
                          src={providerLogos[server.provider]}
                          alt={server.provider}
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Server
                        className={`w-4 h-4 ${providerLogos[server.provider] ? 'hidden' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{server.name}</h3>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                        {t('servers', server.provider as any) || server.provider}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative" onClick={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActionMenu(actionMenu === server.id ? null : server.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenu === server.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div
                          className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl z-20 py-1"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border-md)' }}
                        >
                          {server.status === 'stopped' && (
                            <button
                              onClick={() => handleStart(server.id)}
                              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                              style={{ color: 'var(--status-success)' }}
                            >
                              <Play className="w-3.5 h-3.5" />
                              {t('servers', 'start')}
                            </button>
                          )}
                          {server.status === 'running' && (
                            <>
                              <button
                                onClick={() => handleStop(server.id)}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                                style={{ color: 'var(--status-warning)' }}
                              >
                                <Square className="w-3.5 h-3.5" />
                                {t('servers', 'stop')}
                              </button>
                              <button
                                onClick={() => handleReboot(server.id)}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                                style={{ color: 'var(--accent-cyan)' }}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {t('servers', 'reboot')}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleSync(server.id)}
                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {t('servers', 'sync')}
                          </button>
                          <div className="my-1 mx-3" style={{ height: 1, background: 'var(--glass-divider-md)' }} />
                          <button
                            onClick={() => { setActionMenu(null); setDeleteServer(server); }}
                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                            style={{ color: 'var(--status-error)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('servers', 'deleteServer')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${server.status === 'provisioning' || server.status === 'rebooting' ? 'animate-pulse' : ''}`}
                      style={{ background: accent }}
                    />
                    {t('servers', server.status as any)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{server.region}</span>
                </div>

                {/* Setup in progress */}
                {server.status === 'running' && server.setupStatus !== 'completed' && (
                  <div
                    className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
                  >
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin shrink-0" style={{ borderColor: 'var(--accent-cyan) var(--accent-cyan) var(--accent-cyan) transparent' }} />
                    <span className="text-xs" style={{ color: setupStatusConfig[server.setupStatus].color }}>
                      {setupStatusConfig[server.setupStatus].label}
                    </span>
                  </div>
                )}
                {server.setupStatus === 'failed' && (
                  <div
                    className="mb-3 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--status-error)' }}>
                      {setupStatusConfig[server.setupStatus].label}
                    </span>
                  </div>
                )}

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    {server.vcpus} vCPU
                  </span>
                  <span className="flex items-center gap-1">
                    <MemoryStick className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    {formatMemory(server.memoryMb)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    {server.diskGb} GB
                  </span>
                </div>

                {/* IP */}
                {server.ipv4 && (
                  <div
                    className="flex items-center gap-2 pt-3 text-xs"
                    style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
                  >
                    <Globe className="w-3 h-3" />
                    <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {server.ipv4}
                    </code>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <CreateServerModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      {deleteServer && (
        <DeleteServerModal isOpen onClose={() => setDeleteServer(null)} server={deleteServer} />
      )}
    </div>
  );
}
