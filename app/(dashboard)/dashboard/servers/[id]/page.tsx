'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  MapPin,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Terminal,
  AlertTriangle,
  Check,
  Loader2,
  Folder,
  Database,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  isInfraCreditsStoppedMessage,
  resolveServerStatusMessage,
} from '@/lib/server-status-message';
import { ServerInfraBillingCard } from '../components/ServerInfraBillingCard';
import {
  useServer,
  useStartServer,
  useStopServer,
  useRebootServer,
  useSyncServer,
  useServerStatusEvents,
} from '@/hooks';
import {
  ServerNextStepsCard,
  ServerProjectsSection,
  ServerDatabasesSection,
} from '@/components/servers/ServerHubSections';
import { ServerHealthPanel } from '@/components/servers/ServerHealthPanel';
import { ServerContainersPanel } from '@/components/servers/ServerContainersPanel';
import { SERVER_STATUS_COLORS } from '@/lib/constants';
import { ProviderIcon } from '@/components/servers/ProviderIcon';
import { DeleteServerModal } from '../components/DeleteServerModal';
import {
  EditServerModal,
  ResizeServerModal,
  ServerDetailActions,
  ServerSshPanel,
  ServerFirewallPanel,
  ServerSnapshotsPanel,
  ServerTimelinePanel,
} from '../components/ServerDetailExtras';
import {
  ServerDetailSection,
  StatTile,
} from '../components/ServerDetailSection';
import { StatusBadge, SetupBanner } from '../components/ServerDetailBanners';
import {
  ServerNetworkSection,
  ServerProviderPanels,
  type ProviderLabels,
} from '../components/ServerProviderInfo';

const ICON_SM = 'w-4 h-4 shrink-0';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ServerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);

  const { data: server, isLoading, error } = useServer(id);
  useServerStatusEvents(id);
  const startServer = useStartServer();
  const stopServer = useStopServer();
  const rebootServer = useRebootServer();
  const syncServer = useSyncServer();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[320px] gap-4">
        <p style={{ color: 'var(--text-muted)' }}>{t('servers', 'notFound')}</p>
        <Link href="/dashboard/servers" className="btn btn-secondary">
          {t('common', 'back')}
        </Link>
      </div>
    );
  }

  const statusAccent = SERVER_STATUS_COLORS[server.status] ?? 'var(--text-muted)';
  const statusLabel = t('servers', server.status);
  const providerI18nKey =
    server.provider === 'self_hosted' ? 'selfHosted' : server.provider;
  const providerLabel =
    t('servers', providerI18nKey as 'hetzner' | 'digitalocean' | 'aws' | 'gcp' | 'selfHosted') ||
    server.provider;

  const providerData = server.labels as ProviderLabels;
  const memoryLabel =
    server.memoryMb >= 1024
      ? `${(server.memoryMb / 1024).toFixed(0)} GB`
      : `${server.memoryMb} MB`;

  const actionPending =
    startServer.isPending || stopServer.isPending || rebootServer.isPending || syncServer.isPending;

  const statusMessageText = resolveServerStatusMessage(server.statusMessage, t);
  const infraCreditsStopped = isInfraCreditsStoppedMessage(server.statusMessage);
  const showStatusBanner =
    !!statusMessageText &&
    server.setupStatus !== 'failed' &&
    server.status !== 'running' &&
    server.status !== 'rebooting';

  return (
    <div className="dash-page max-w-5xl space-y-6 min-w-0 overflow-x-hidden pb-8 animate-slide-in">
      {/* Back */}
      <Link
        href="/dashboard/servers"
        className="dash-icon-row text-sm font-medium transition-opacity hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className={ICON_SM} strokeWidth={2} />
        {t('servers', 'detailBack')}
      </Link>

      {/* Header */}
      <div className="dash-card p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <ProviderIcon provider={server.provider} size="md" status={server.status} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold tracking-tight truncate">{server.name}</h1>
                <StatusBadge status={server.status} label={statusLabel} />
                {server.isManaged && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{
                      background: 'var(--dash-accent-bg)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid var(--dash-accent-border)',
                    }}
                  >
                    {t('servers', 'managedBadge')}
                  </span>
                )}
              </div>
              <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                {providerLabel}
                <span style={{ color: 'var(--text-muted)' }}> · </span>
                {server.region}
                {server.ipv4 && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}> · </span>
                    <span className="font-mono text-xs">{server.ipv4}</span>
                  </>
                )}
              </p>
              {(server.projectCount > 0 || server.databaseCount > 0) && (
                <p className="text-xs mt-2 flex flex-wrap items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                  {server.projectCount > 0 && (
                    <a href="#server-hub-projects" className="dash-icon-row gap-1.5 hover:opacity-80 transition-opacity">
                      <Folder className="w-3.5 h-3.5" strokeWidth={2} />
                      {t('servers', 'projectCount').replace('{count}', String(server.projectCount))}
                    </a>
                  )}
                  {server.databaseCount > 0 && (
                    <a href="#server-hub-databases" className="dash-icon-row gap-1.5 hover:opacity-80 transition-opacity">
                      <Database className="w-3.5 h-3.5" strokeWidth={2} />
                      {t('servers', 'databaseCount').replace('{count}', String(server.databaseCount))}
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {server.status === 'stopped' && (
              <button
                type="button"
                onClick={() => startServer.mutate(id)}
                disabled={actionPending}
                className="btn btn-primary dash-icon-row"
              >
                <Play className={ICON_SM} strokeWidth={2} />
                {t('servers', 'start')}
              </button>
            )}

            {server.status === 'running' && (
              <Link href={`/dashboard/servers/${id}/terminal`} className="btn btn-primary dash-icon-row">
                <Terminal className={ICON_SM} strokeWidth={2} />
                {t('servers', 'openTerminal')}
              </Link>
            )}

            <div
              className="inline-flex items-center gap-0.5 rounded-lg p-0.5"
              style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}
            >
              <button
                type="button"
                onClick={() => syncServer.mutate(id)}
                disabled={actionPending}
                className="dash-icon-btn p-2 rounded-md inline-flex items-center justify-center transition-colors hover:opacity-80"
                title={t('servers', 'sync')}
                style={{ color: 'var(--text-secondary)' }}
              >
                <RefreshCw className={`${ICON_SM} ${syncServer.isPending ? 'animate-spin' : ''}`} strokeWidth={2} />
              </button>

              {server.status === 'running' && (
                <>
                  <span className="w-px h-4 self-center" style={{ background: 'var(--glass-divider)' }} />
                  <button
                    type="button"
                    onClick={() => rebootServer.mutate(id)}
                    disabled={actionPending}
                    className="dash-icon-btn p-2 rounded-md inline-flex items-center justify-center transition-colors hover:opacity-80"
                    title={t('servers', 'reboot')}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <RotateCcw className={ICON_SM} strokeWidth={2} />
                  </button>
                  <span className="w-px h-4 self-center" style={{ background: 'var(--glass-divider)' }} />
                  <button
                    type="button"
                    onClick={() => stopServer.mutate(id)}
                    disabled={actionPending}
                    className="dash-icon-btn p-2 rounded-md inline-flex items-center justify-center transition-colors hover:opacity-80"
                    title={t('servers', 'stop')}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Square className={ICON_SM} strokeWidth={2} />
                  </button>
                </>
              )}

              <span className="w-px h-4 self-center" style={{ background: 'var(--glass-divider)' }} />
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="dash-icon-btn p-2 rounded-md inline-flex items-center justify-center transition-colors"
                title={t('servers', 'deleteServer')}
                style={{ color: 'var(--status-error)' }}
              >
                <Trash2 className={ICON_SM} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {server.infraBilling && <ServerInfraBillingCard server={server} />}

      <ServerDetailActions
        server={server}
        onEdit={() => setShowEditModal(true)}
        onResize={() => setShowResizeModal(true)}
      />

      {server.statusMessage === 'resizing' && (
        <SetupBanner
          variant="info"
          title={t('servers', 'timelineResizing')}
          description={t('servers', 'resizeWarning')}
          icon={<Loader2 className="w-5 h-5 shrink-0 animate-spin" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2} />}
        />
      )}

      <ServerNextStepsCard server={server} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <ServerProjectsSection serverId={id} />
        <ServerDatabasesSection
          server={server}
          readyServers={
            server.status === 'running' && server.setupStatus === 'completed' ? [server] : []
          }
        />
      </div>

      {showStatusBanner && (
        <SetupBanner
          variant={infraCreditsStopped ? 'info' : 'error'}
          title={infraCreditsStopped ? t('servers', 'statusInfraCreditsStopped') : statusLabel}
          description={
            infraCreditsStopped
              ? `${statusMessageText} ${t('servers', 'statusInfraCreditsStoppedHint')}`
              : statusMessageText!
          }
          icon={
            infraCreditsStopped ? (
              <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2} />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--status-error)' }} strokeWidth={2} />
            )
          }
        />
      )}

      {server.status === 'running' && server.setupStatus !== 'completed' && server.setupStatus !== 'failed' && (
        <SetupBanner
          variant="info"
          title={t('servers', 'setupBannerTitle')}
          description={t('servers', 'setupBannerDesc')}
          icon={<Loader2 className="w-5 h-5 shrink-0 animate-spin" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2} />}
        />
      )}

      {server.setupStatus === 'failed' && (
        <SetupBanner
          variant="error"
          title={t('servers', 'setupFailedTitle')}
          description={statusMessageText || t('servers', 'setupFailed')}
          icon={<AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--status-error)' }} strokeWidth={2} />}
        />
      )}

      {server.status === 'running' && server.setupStatus === 'completed' && (
        <SetupBanner
          variant="success"
          title={t('servers', 'setupReadyTitle')}
          description={t('servers', 'setupReadyDesc')}
          icon={<Check className="w-5 h-5 shrink-0" style={{ color: 'var(--status-success)' }} strokeWidth={2} />}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <ServerDetailSection icon={Activity} title={t('servers', 'overview')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile icon={Cpu} label={t('servers', 'vcpus')} value={String(server.vcpus)} />
              <StatTile icon={MemoryStick} label={t('servers', 'memory')} value={memoryLabel} />
              <StatTile icon={HardDrive} label={t('servers', 'disk')} value={`${server.diskGb} GB`} />
              <StatTile icon={MapPin} label={t('servers', 'region')} value={server.region} />
            </div>
          </ServerDetailSection>

          <ServerNetworkSection
            server={server}
            providerData={providerData}
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

        </div>

        <div className="space-y-6 min-w-0">
          {server.ipv4 && <ServerSshPanel serverId={id} />}
          <ServerFirewallPanel />
          <ServerContainersPanel server={server} />
          <ServerHealthPanel server={server} />
          <ServerSnapshotsPanel server={server} />
          <ServerTimelinePanel serverId={id} />
          <ServerProviderPanels server={server} providerData={providerData} />
        </div>
      </div>

      <DeleteServerModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        server={server}
        onSuccess={() => router.push('/dashboard/servers')}
      />
      <EditServerModal server={server} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
      <ResizeServerModal server={server} isOpen={showResizeModal} onClose={() => setShowResizeModal(false)} />
    </div>
  );
}
