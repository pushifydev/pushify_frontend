'use client';

import { use, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Clock,
  MapPin,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Terminal,
  Shield,
  Network,
  Box,
  AlertTriangle,
  Check,
  Loader2,
  Folder,
  Database,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, formatShortDate } from '@/lib/formatters';
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
import { SERVER_STATUS_COLORS } from '@/lib/constants';
import type { ServerStatus } from '@/lib/api';
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
  CopyField,
  InfoRow,
} from '../components/ServerDetailSection';

const ICON_SM = 'w-4 h-4 shrink-0';

interface PageProps {
  params: Promise<{ id: string }>;
}

type ProviderLabels = {
  hetznerServerId?: number;
  datacenter?: string;
  datacenterDescription?: string;
  location?: {
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    network_zone: string;
  };
  serverType?: {
    id: number;
    name: string;
    description: string;
    cpuType: string;
    architecture: string;
    storageType: string;
  };
  image?: {
    id: number;
    name: string;
    description: string;
    osFamily: string;
    osVersion: string;
    architecture: string;
  };
  traffic?: {
    outgoing: number | null;
    ingoing: number | null;
    included: number;
  };
  protection?: {
    delete: boolean;
    rebuild: boolean;
  };
};

function StatusBadge({
  status,
  label,
}: {
  status: ServerStatus;
  label: string;
}) {
  const accent = SERVER_STATUS_COLORS[status] ?? 'var(--text-muted)';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: `${accent}18`,
        border: `1px solid ${accent}35`,
        color: accent,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: accent }}
      />
      {label}
    </span>
  );
}

function SetupBanner({
  variant,
  title,
  description,
  icon,
}: {
  variant: 'info' | 'error' | 'success';
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const styles = {
    info: {
      border: 'var(--accent-cyan)',
      bg: 'rgba(34,211,238,0.06)',
      title: 'var(--accent-cyan)',
    },
    error: {
      border: 'var(--status-error)',
      bg: 'rgba(239,68,68,0.06)',
      title: 'var(--status-error)',
    },
    success: {
      border: 'var(--status-success)',
      bg: 'rgba(34,197,94,0.06)',
      title: 'var(--status-success)',
    },
  }[variant];

  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{
        background: styles.bg,
        border: `1px solid color-mix(in srgb, ${styles.border} 35%, transparent)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg dash-section-icon"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: styles.title }}>
          {title}
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
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

          <ServerDetailSection icon={Network} title={t('servers', 'network')}>
            <div className="space-y-3">
              {server.ipv4 && (
                <CopyField
                  label="IPv4"
                  value={server.ipv4}
                  fieldKey="ipv4"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )}
              {server.ipv6 && (
                <CopyField
                  label="IPv6"
                  value={server.ipv6}
                  fieldKey="ipv6"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )}
              {server.privateIp && (
                <CopyField
                  label={t('servers', 'privateIp')}
                  value={server.privateIp}
                  fieldKey="privateIp"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              )}
            </div>

            {providerData.traffic && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('servers', 'trafficIngoing')}
                  </p>
                  <p className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatBytes(providerData.traffic.ingoing)}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('servers', 'trafficOutgoing')}
                  </p>
                  <p className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatBytes(providerData.traffic.outgoing)}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('servers', 'trafficIncluded')}
                  </p>
                  <p className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatBytes(providerData.traffic.included)}
                  </p>
                </div>
              </div>
            )}
          </ServerDetailSection>

        </div>

        <div className="space-y-6 min-w-0">
          {server.ipv4 && <ServerSshPanel serverId={id} />}
          <ServerFirewallPanel />
          <ServerSnapshotsPanel server={server} />
          <ServerTimelinePanel serverId={id} />
          {providerData.serverType && (
            <ServerDetailSection icon={Box} title={t('servers', 'serverType')}>
              <div className="rounded-lg px-4" style={{ background: 'var(--bg-tertiary)' }}>
                <InfoRow label={t('servers', 'fieldType')} value={providerData.serverType.name} />
                <InfoRow label={t('servers', 'fieldDescription')} value={providerData.serverType.description} />
                <InfoRow
                  label={t('servers', 'cpuType')}
                  value={<span className="capitalize">{providerData.serverType.cpuType}</span>}
                />
                <InfoRow label={t('servers', 'architecture')} value={providerData.serverType.architecture} />
                <InfoRow
                  label={t('servers', 'storageType')}
                  value={<span className="uppercase">{providerData.serverType.storageType}</span>}
                />
              </div>
            </ServerDetailSection>
          )}

          {providerData.image && (
            <ServerDetailSection icon={Globe} title={t('servers', 'image')}>
              <div className="rounded-lg px-4" style={{ background: 'var(--bg-tertiary)' }}>
                <InfoRow label={t('servers', 'fieldType')} value={providerData.image.name} />
                <InfoRow label={t('servers', 'fieldDescription')} value={providerData.image.description} />
                <InfoRow
                  label={t('servers', 'fieldOs')}
                  value={<span className="capitalize">{providerData.image.osFamily}</span>}
                />
                <InfoRow label={t('servers', 'architecture')} value={providerData.image.osVersion} />
              </div>
            </ServerDetailSection>
          )}

          {providerData.location && (
            <ServerDetailSection icon={MapPin} title={t('servers', 'location')}>
              <div className="rounded-lg px-4" style={{ background: 'var(--bg-tertiary)' }}>
                <InfoRow label={t('servers', 'city')} value={providerData.location.city} />
                <InfoRow label={t('servers', 'country')} value={providerData.location.country} />
                {providerData.datacenter && (
                  <InfoRow label={t('servers', 'datacenter')} value={providerData.datacenter} />
                )}
                <InfoRow label={t('servers', 'networkZone')} value={providerData.location.network_zone} />
              </div>
            </ServerDetailSection>
          )}

          {providerData.protection && (
            <ServerDetailSection icon={Shield} iconColor="var(--accent-purple)" title={t('servers', 'protection')}>
              <div className="rounded-lg px-4" style={{ background: 'var(--bg-tertiary)' }}>
                <InfoRow
                  label={t('servers', 'deleteProtection')}
                  value={
                    providerData.protection.delete
                      ? t('servers', 'detailEnabled')
                      : t('servers', 'detailDisabled')
                  }
                />
                <InfoRow
                  label={t('servers', 'rebuildProtection')}
                  value={
                    providerData.protection.rebuild
                      ? t('servers', 'detailEnabled')
                      : t('servers', 'detailDisabled')
                  }
                />
              </div>
            </ServerDetailSection>
          )}

          <ServerDetailSection icon={Clock} title={t('servers', 'timestamps')}>
            <div className="rounded-lg px-4" style={{ background: 'var(--bg-tertiary)' }}>
              <InfoRow label={t('servers', 'createdAtLabel')} value={formatShortDate(server.createdAt)} />
              <InfoRow label={t('servers', 'updatedAtLabel')} value={formatShortDate(server.updatedAt)} />
              {server.lastSeenAt && (
                <InfoRow label={t('servers', 'lastSeen')} value={formatShortDate(server.lastSeenAt)} />
              )}
            </div>
          </ServerDetailSection>
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
