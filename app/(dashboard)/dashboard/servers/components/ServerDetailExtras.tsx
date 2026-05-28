'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Pencil,
  ArrowUpCircle,
  Shield,
  Key,
  Download,
  Copy,
  Check,
  Camera,
  Trash2,
  Loader2,
  History,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Modal, ModalActions } from '@/components/Modal';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useServerResizeOptions,
  useResizeServer,
  useUpdateServer,
  useServerSnapshots,
  useCreateServerSnapshot,
  useDeleteServerSnapshot,
  useServerTimeline,
  useServerSshInfo,
  useDownloadServerSshKey,
} from '@/hooks/useServers';
import type { Server, ServerSize } from '@/lib/api';
import { formatShortDate } from '@/lib/formatters';

const ICON_SM = 'w-4 h-4 shrink-0';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function memoryLabel(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;
}

export function EditServerModal({
  server,
  isOpen,
  onClose,
}: {
  server: Server;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const updateServer = useUpdateServer();
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateServer.mutateAsync({
      serverId: server.id,
      input: { name: name.trim(), description: description.trim() || null },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('servers', 'editServerTitle')} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('servers', 'serverName')}</label>
          <input
            className="input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('servers', 'serverDescription')}</label>
          <textarea
            className="input w-full resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <ModalActions>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common', 'cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={updateServer.isPending}>
            {updateServer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common', 'save')}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}

export function ResizeServerModal({
  server,
  isOpen,
  onClose,
}: {
  server: Server;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const canResize = server.isManaged && server.provider === 'hetzner';
  const { data: options = [], isLoading } = useServerResizeOptions(server.id, isOpen && canResize);
  const resizeServer = useResizeServer();
  const [selected, setSelected] = useState<ServerSize | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;
    await resizeServer.mutateAsync({ serverId: server.id, size: selected });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('servers', 'resizeTitle')}
      description={t('servers', 'resizeDesc')}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : options.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('servers', 'resizeNoOptions')}</p>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {options.map((opt) => (
            <button
              key={opt.size}
              type="button"
              onClick={() => setSelected(opt.size)}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                borderColor:
                  selected === opt.size ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                background:
                  selected === opt.size ? 'var(--dash-accent-bg-md)' : 'var(--bg-tertiary)',
              }}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase">{opt.size}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {opt.specs.vcpus} vCPU · {memoryLabel(opt.specs.memoryMb)} · {opt.specs.diskGb} GB
                  </p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  {formatUsd(opt.specs.customerPriceMonthlyCents)}/{t('servers', 'perMonthShort')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--text-muted)] mt-4">{t('servers', 'resizeWarning')}</p>
      <ModalActions>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t('common', 'cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected || resizeServer.isPending}
          onClick={handleSubmit}
        >
          {resizeServer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('servers', 'resizeConfirm')}
        </button>
      </ModalActions>
    </Modal>
  );
}

export function ServerSshPanel({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { data: sshInfo, isLoading } = useServerSshInfo(serverId);
  const downloadKey = useDownloadServerSshKey();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="dash-panel p-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
      </div>
    );
  }

  if (!sshInfo?.host) return null;

  const connect = `ssh ${sshInfo.username}@${sshInfo.host} -p ${sshInfo.port}`;

  const copyConnect = () => {
    navigator.clipboard.writeText(connect);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const data = await downloadKey.mutateAsync(serverId);
    const blob = new Blob([data.privateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pushify-${data.host || 'server'}.pem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dash-panel p-4 sm:p-5">
      <div className="dash-panel-title mb-3">
        <Key className="w-4 h-4 text-[var(--text-secondary)]" />
        {t('servers', 'sshPanelTitle')}
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">{t('servers', 'sshConnectCommand')}</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs font-mono p-2 rounded-lg bg-[var(--bg-tertiary)] break-all">
              {connect}
            </code>
            <button type="button" onClick={copyConnect} className="dash-icon-btn p-2 shrink-0">
              {copied ? <Check className={ICON_SM} /> : <Copy className={ICON_SM} />}
            </button>
          </div>
        </div>
        {sshInfo.hasPrivateKey && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadKey.isPending}
            className="btn btn-secondary w-full dash-icon-row text-sm"
          >
            {downloadKey.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className={ICON_SM} />
            )}
            {t('servers', 'sshDownloadKey')}
          </button>
        )}
      </div>
    </div>
  );
}

export function ServerFirewallPanel() {
  const { t } = useTranslation();
  const ports = [
    { port: '22', labelKey: 'firewallPort22' as const },
    { port: '80', labelKey: 'firewallPort80' as const },
    { port: '443', labelKey: 'firewallPort443' as const },
  ];

  return (
    <div className="dash-panel p-4 sm:p-5">
      <div className="dash-panel-title mb-3">
        <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
        {t('servers', 'firewallTitle')}
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">{t('servers', 'firewallDesc')}</p>
      <ul className="space-y-2">
        {ports.map((p) => (
          <li
            key={p.port}
            className="flex items-start gap-2 text-sm text-[var(--text-secondary)] rounded-lg px-2 py-1.5 bg-[var(--bg-tertiary)]"
          >
            <span className="font-mono text-xs font-semibold text-[var(--accent-cyan)] shrink-0">
              TCP {p.port}
            </span>
            <span>{t('servers', p.labelKey)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[var(--text-muted)] mt-3 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        {t('servers', 'firewallHetznerHint')}
      </p>
    </div>
  );
}

export function ServerSnapshotsPanel({ server }: { server: Server }) {
  const { t } = useTranslation();
  const enabled = server.isManaged && server.provider === 'hetzner';
  const { data: snapshots = [], isLoading } = useServerSnapshots(server.id, enabled);
  const createSnapshot = useCreateServerSnapshot();
  const deleteSnapshot = useDeleteServerSnapshot();

  if (!enabled) return null;

  return (
    <div className="dash-panel p-4 sm:p-5">
      <div className="dash-panel-header !mb-3">
        <div className="dash-panel-title">
          <Camera className="w-4 h-4 text-[var(--text-secondary)]" />
          {t('servers', 'snapshotsTitle')}
        </div>
        {server.status === 'running' && (
          <button
            type="button"
            onClick={() => createSnapshot.mutate({ serverId: server.id })}
            disabled={createSnapshot.isPending}
            className="dash-link text-sm"
          >
            {createSnapshot.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin inline" />
            ) : (
              t('servers', 'snapshotCreate')
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">{t('servers', 'snapshotsDesc')}</p>
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : snapshots.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('servers', 'snapshotsEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {snapshots.map((snap) => (
            <li
              key={snap.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{snap.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {snap.sizeGb} GB · {snap.status} · {formatShortDate(snap.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteSnapshot.mutate({ serverId: server.id, snapshotId: snap.id })}
                disabled={deleteSnapshot.isPending}
                className="p-1.5 text-[var(--status-error)] hover:opacity-80"
                title={t('common', 'delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TIMELINE_TYPE_KEYS: Record<string, 'timelineCreated' | 'timelineSynced' | 'timelineResizing' | 'timelineInfraStopped'> = {
  created: 'timelineCreated',
  synced: 'timelineSynced',
  resizing: 'timelineResizing',
  infra_stopped: 'timelineInfraStopped',
};

export function ServerTimelinePanel({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useServerTimeline(serverId);

  return (
    <div className="dash-panel p-4 sm:p-5">
      <div className="dash-panel-title mb-3">
        <History className="w-4 h-4 text-[var(--text-secondary)]" />
        {t('servers', 'timelineTitle')}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-cyan)]" />
        </div>
      ) : (
        <ul className="space-y-3">
          {(data?.lifecycle ?? []).map((ev, i) => {
            const key = TIMELINE_TYPE_KEYS[ev.type];
            return (
              <li key={`lc-${i}`} className="text-sm flex justify-between gap-2">
                <span className="text-[var(--text-secondary)]">
                  {key ? t('servers', key) : ev.type}
                </span>
                <span className="text-xs text-[var(--text-muted)] shrink-0">
                  {formatShortDate(ev.at)}
                </span>
              </li>
            );
          })}
          {(data?.deployments ?? []).map((d) => (
            <li key={d.id} className="text-sm">
              <Link
                href={`/dashboard/projects/${d.projectId}`}
                className="flex items-center justify-between gap-2 hover:opacity-80 group"
              >
                <span className="min-w-0 truncate text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {d.projectName} · {d.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0">
                  {formatShortDate(d.createdAt)}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </Link>
            </li>
          ))}
          {!data?.lifecycle?.length && !data?.deployments?.length && (
            <p className="text-sm text-[var(--text-muted)]">{t('servers', 'timelineEmpty')}</p>
          )}
        </ul>
      )}
    </div>
  );
}

export function ServerDetailActions({
  server,
  onEdit,
  onResize,
}: {
  server: Server;
  onEdit: () => void;
  onResize: () => void;
}) {
  const { t } = useTranslation();
  const canResize = server.isManaged && server.provider === 'hetzner';

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onEdit} className="btn btn-secondary dash-icon-row text-sm">
        <Pencil className={ICON_SM} />
        {t('servers', 'editServer')}
      </button>
      {canResize && (
        <button type="button" onClick={onResize} className="btn btn-secondary dash-icon-row text-sm">
          <ArrowUpCircle className={ICON_SM} />
          {t('servers', 'resizeButton')}
        </button>
      )}
    </div>
  );
}
