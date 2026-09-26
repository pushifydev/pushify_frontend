'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Pencil,
  ArrowUpCircle,
  Download,
  Copy,
  Check,
  Camera,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Modal, ModalActions } from '@/components/Modal';
import { RowList } from '@/components/dashboard/PageKit';
import { SettingsField, SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMessage } from '@/lib/i18n/format-message';
import {
  useServerResizeOptions,
  useResizeServer,
  useUpdateServer,
  useServerSnapshots,
  useCreateServerSnapshot,
  useDeleteServerSnapshot,
  useRestoreServerSnapshot,
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('servers', 'editServerTitle')} maxWidth="lg">
      <form onSubmit={handleSubmit}>
        {/* Label-left rows, with a narrower label column than full-page settings. */}
        <div className="-mt-4 md:[&_.dash-field]:!grid-cols-[8.5rem_minmax(0,1fr)] md:[&_.dash-field]:!gap-4">
          <SettingsField label={t('servers', 'serverName')} htmlFor="edit-server-name">
            <input
              id="edit-server-name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </SettingsField>
          <SettingsField label={t('servers', 'serverDescription')} htmlFor="edit-server-description">
            <textarea
              id="edit-server-description"
              className="input w-full resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </SettingsField>
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
        <div className="dash-rows">
          <div className="dash-row flex justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          </div>
        </div>
      ) : options.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('servers', 'resizeNoOptions')}</p>
      ) : (
        <div
          className="dash-rows max-h-[50vh] !overflow-y-auto"
          role="radiogroup"
          aria-label={t('servers', 'resizeTitle')}
        >
          {options.map((opt) => {
            const isSelected = selected === opt.size;
            return (
              <button
                key={opt.size}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(opt.size)}
                className={`dash-row w-full flex items-center gap-3 text-left transition-colors ${
                  isSelected ? 'bg-[var(--hover-overlay-lg)]' : 'hover:bg-[var(--hover-overlay)]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                    isSelected ? 'border-[var(--text-primary)]' : 'border-[var(--border-default)]'
                  }`}
                  aria-hidden
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />}
                </span>
                <span className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="terminal-text text-sm font-medium uppercase text-[var(--text-primary)] w-10">
                    {opt.size}
                  </span>
                  <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums">
                    {opt.specs.vcpus} vCPU · {memoryLabel(opt.specs.memoryMb)} · {opt.specs.diskGb} GB
                  </span>
                </span>
                <span className={`terminal-text text-xs tabular-nums shrink-0 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {formatUsd(opt.specs.customerPriceMonthlyCents)}/{t('servers', 'perMonthShort')}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-2">
        <span className="dash-status-dot is-warning" aria-hidden />
        {t('servers', 'resizeWarning')}
      </p>
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
      <RowList label={t('servers', 'sshPanelTitle')}>
        <div className="dash-row flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
        </div>
      </RowList>
    );
  }

  if (!sshInfo?.host) return null;

  const keyFile = `pushify-${sshInfo.host}.pem`;
  const connect = sshInfo.hasPrivateKey
    ? `ssh -i ${keyFile} ${sshInfo.username}@${sshInfo.host} -p ${sshInfo.port}`
    : `ssh ${sshInfo.username}@${sshInfo.host} -p ${sshInfo.port}`;

  const copyConnect = () => {
    navigator.clipboard.writeText(connect);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const data = await downloadKey.mutateAsync(serverId);
    const pem = data.privateKey.endsWith('\n') ? data.privateKey : `${data.privateKey}\n`;
    const blob = new Blob([pem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = keyFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RowList label={t('servers', 'sshPanelTitle')}>
      <div className="dash-row">
        <p className="text-xs text-[var(--text-muted)] mb-1.5">{t('servers', 'sshConnectCommand')}</p>
        <div className="flex items-start gap-2">
          <code className="flex-1 min-w-0 terminal-text text-xs leading-relaxed text-[var(--text-primary)] break-all">
            {connect}
          </code>
          <button
            type="button"
            onClick={copyConnect}
            className="dash-icon-action"
            aria-label={t('servers', 'sshConnectCommand')}
            title={t('servers', 'sshConnectCommand')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {sshInfo.hasPrivateKey && (
        <div className="dash-row flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadKey.isPending}
            className="btn btn-secondary btn-sm self-start"
          >
            {downloadKey.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {t('servers', 'sshDownloadKey')}
          </button>
          <p className="text-xs text-[var(--text-muted)]">{t('servers', 'sshKeyChmodHint')}</p>
        </div>
      )}
    </RowList>
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
    <RowList label={t('servers', 'firewallTitle')}>
      <div className="dash-row text-[13px] text-[var(--text-secondary)]">{t('servers', 'firewallDesc')}</div>
      {ports.map((p) => (
        <div key={p.port} className="dash-row flex items-center gap-3 text-[13px]">
          <span className="dash-status-dot is-success" aria-hidden />
          <span className="terminal-text text-xs text-[var(--text-primary)] w-16 shrink-0">TCP {p.port}</span>
          <span className="text-[var(--text-secondary)] min-w-0">{t('servers', p.labelKey)}</span>
        </div>
      ))}
      <div className="dash-row text-xs text-[var(--text-muted)]">{t('servers', 'firewallHetznerHint')}</div>
    </RowList>
  );
}

export function ServerSnapshotsPanel({ server }: { server: Server }) {
  const { t } = useTranslation();
  const enabled = server.isManaged && server.provider === 'hetzner';
  const updateServer = useUpdateServer();
  const { data: snapshots = [], isLoading } = useServerSnapshots(server.id, enabled);
  const createSnapshot = useCreateServerSnapshot();
  const deleteSnapshot = useDeleteServerSnapshot();
  const restoreSnapshot = useRestoreServerSnapshot();
  const [restoreTarget, setRestoreTarget] = useState<{ id: string; name: string } | null>(null);

  const canRestore =
    server.status !== 'provisioning' && server.status !== 'deleting' && !restoreSnapshot.isPending;

  if (!enabled) return null;

  return (
    <>
      <RowList
        label={t('servers', 'snapshotsTitle')}
        action={
          server.status === 'running' ? (
            <button
              type="button"
              onClick={() => createSnapshot.mutate({ serverId: server.id })}
              disabled={createSnapshot.isPending}
              className="btn btn-secondary btn-sm"
            >
              {createSnapshot.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {t('servers', 'snapshotCreate')}
            </button>
          ) : undefined
        }
      >
        <div className="dash-row text-[13px] text-[var(--text-secondary)]">{t('servers', 'snapshotsDesc')}</div>
        <div className="dash-row flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('servers', 'autoSnapshotTitle')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('servers', 'autoSnapshotDesc')}</p>
            {server.lastAutoSnapshotAt && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {formatMessage(t('servers', 'autoSnapshotLastRun'), {
                  date: formatShortDate(server.lastAutoSnapshotAt),
                })}
              </p>
            )}
          </div>
          <SettingsSwitch
            checked={server.autoSnapshotEnabled}
            disabled={updateServer.isPending || server.status !== 'running'}
            label={t('servers', 'autoSnapshotTitle')}
            onChange={(next) =>
              updateServer.mutate({
                serverId: server.id,
                input: { autoSnapshotEnabled: next },
              })
            }
          />
        </div>
        {isLoading ? (
          <div className="dash-row flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="dash-row text-[13px] text-[var(--text-muted)]">{t('servers', 'snapshotsEmpty')}</div>
        ) : (
          snapshots.map((snap) => {
            const isCreating = snap.status === 'creating';
            const isAvailable =
              snap.status === 'available' || snap.status === 'ACTIVE' || snap.status === 'active';
            const sizeLabel =
              isCreating && snap.sizeGb <= 0
                ? t('servers', 'snapshotSizePending')
                : snap.sizeGb > 0
                  ? `${snap.sizeGb} GB`
                  : null;
            const statusLabel = isCreating
              ? snap.progress != null && snap.progress > 0
                ? formatMessage(t('servers', 'snapshotProgress'), {
                    percent: snap.progress,
                  })
                : t('servers', 'snapshotStatusCreating')
              : isAvailable
                ? t('servers', 'snapshotStatusAvailable')
                : snap.status;
            const metaParts = [sizeLabel, statusLabel, formatShortDate(snap.createdAt)].filter(
              Boolean
            );

            return (
              <div key={snap.id} className="dash-row flex items-center gap-3">
                <span
                  className={`dash-status-dot ${isCreating ? 'is-warning animate-pulse' : isAvailable ? 'is-success' : ''}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{snap.name}</p>
                  <p className="terminal-text text-xs text-[var(--text-muted)] mt-0.5">{metaParts.join(' · ')}</p>
                  {isCreating && snap.progress != null && snap.progress > 0 && (
                    <div className="dash-metric-track mt-1.5">
                      <div className="dash-metric-fill" style={{ width: `${Math.min(100, snap.progress)}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isAvailable && (
                    <button
                      type="button"
                      onClick={() => setRestoreTarget({ id: snap.id, name: snap.name })}
                      disabled={!canRestore}
                      className="dash-icon-action disabled:opacity-40"
                      title={t('servers', 'snapshotRestore')}
                      aria-label={`${t('servers', 'snapshotRestore')}: ${snap.name}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteSnapshot.mutate({ serverId: server.id, snapshotId: snap.id })}
                    disabled={deleteSnapshot.isPending}
                    className="dash-icon-action hover:!text-[var(--status-error)]"
                    title={t('common', 'delete')}
                    aria-label={`${t('common', 'delete')}: ${snap.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </RowList>

      <Modal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title={t('servers', 'snapshotRestoreTitle')}
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('servers', 'snapshotRestoreWarning')}
        </p>
        {restoreTarget && (
          <p className="text-sm font-medium text-[var(--text-primary)] mt-3 truncate">
            {restoreTarget.name}
          </p>
        )}
        <ModalActions>
          <button type="button" className="btn btn-secondary" onClick={() => setRestoreTarget(null)}>
            {t('common', 'cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!restoreTarget || restoreSnapshot.isPending}
            onClick={() => {
              if (!restoreTarget) return;
              restoreSnapshot.mutate(
                { serverId: server.id, snapshotId: restoreTarget.id },
                { onSuccess: () => setRestoreTarget(null) },
              );
            }}
          >
            {restoreSnapshot.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t('servers', 'snapshotRestoreConfirm')
            )}
          </button>
        </ModalActions>
      </Modal>
    </>
  );
}

const TIMELINE_TYPE_KEYS: Record<string, 'timelineCreated' | 'timelineSynced' | 'timelineResizing' | 'timelineInfraStopped'> = {
  created: 'timelineCreated',
  synced: 'timelineSynced',
  resizing: 'timelineResizing',
  infra_stopped: 'timelineInfraStopped',
};

function deploymentDot(status: string): string {
  if (status === 'running' || status === 'ready' || status === 'active') return 'is-success';
  if (status === 'failed' || status === 'cancelled') return 'is-error';
  if (status === 'building' || status === 'deploying' || status === 'queued' || status === 'pending') return 'is-warning';
  return '';
}

export function ServerTimelinePanel({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useServerTimeline(serverId);

  return (
    <RowList label={t('servers', 'timelineTitle')}>
      {isLoading ? (
        <div className="dash-row flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : !data?.lifecycle?.length && !data?.deployments?.length ? (
        <div className="dash-row text-[13px] text-[var(--text-muted)]">{t('servers', 'timelineEmpty')}</div>
      ) : (
        <>
          {(data?.lifecycle ?? []).map((ev, i) => {
            const key = TIMELINE_TYPE_KEYS[ev.type];
            return (
              <div key={`lc-${i}`} className="dash-row flex items-center gap-3 text-[13px]">
                <span className="dash-status-dot" aria-hidden />
                <span className="flex-1 min-w-0 text-[var(--text-secondary)]">
                  {key ? t('servers', key) : ev.type}
                </span>
                <span className="terminal-text text-xs text-[var(--text-muted)] shrink-0">
                  {formatShortDate(ev.at)}
                </span>
              </div>
            );
          })}
          {(data?.deployments ?? []).map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/projects/${d.projectId}`}
              className="dash-row group flex items-center gap-3 text-[13px] hover:bg-[var(--hover-overlay)] transition-colors"
            >
              <span className={`dash-status-dot ${deploymentDot(d.status)}`} aria-hidden />
              <span className="flex-1 min-w-0 truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                {d.projectName}
              </span>
              <span className="dash-section-label shrink-0">{d.status}</span>
              <span className="terminal-text text-xs text-[var(--text-muted)] shrink-0">
                {formatShortDate(d.createdAt)}
              </span>
            </Link>
          ))}
        </>
      )}
    </RowList>
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
    <>
      <button type="button" onClick={onEdit} className="btn btn-secondary justify-center flex-1 sm:flex-none">
        <Pencil className={ICON_SM} />
        {t('servers', 'editServer')}
      </button>
      {canResize && (
        <button type="button" onClick={onResize} className="btn btn-secondary justify-center flex-1 sm:flex-none">
          <ArrowUpCircle className={ICON_SM} />
          {t('servers', 'resizeButton')}
        </button>
      )}
    </>
  );
}
