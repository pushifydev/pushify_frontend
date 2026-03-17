'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Server,
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
  Copy,
  Check,
  Terminal,
  Shield,
  Network,
  Box,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, formatShortDate } from '@/lib/formatters';
import {
  useServer,
  useStartServer,
  useStopServer,
  useRebootServer,
  useSyncServer,
} from '@/hooks';
import { DeleteServerModal } from '../components/DeleteServerModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ServerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: server, isLoading, error, refetch } = useServer(id);
  const startServer = useStartServer();
  const stopServer = useStopServer();
  const rebootServer = useRebootServer();
  const syncServer = useSyncServer();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'provisioning':
        return 'bg-blue-500';
      case 'rebooting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'deleting':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return t('servers', status as 'running' | 'stopped' | 'provisioning' | 'rebooting' | 'error' | 'deleting');
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-cyan)]" />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[var(--text-muted)]">{t('servers', 'notFound')}</p>
        <button
          onClick={() => router.push('/dashboard/servers')}
          className="btn btn-secondary"
        >
          {t('common', 'back')}
        </button>
      </div>
    );
  }

  const providerData = server.labels as {
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
    volumes?: number[];
    loadBalancers?: number[];
    protection?: {
      delete: boolean;
      rebuild: boolean;
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/servers')}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
              <Server className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{server.name}</h1>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                <span>{getStatusText(server.status)}</span>
                {server.ipv4 && (
                  <>
                    <span>•</span>
                    <span>{server.ipv4}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncServer.mutate(id)}
            disabled={syncServer.isPending}
            className="btn btn-secondary"
            title={t('servers', 'sync')}
          >
            <RefreshCw className={`w-4 h-4 ${syncServer.isPending ? 'animate-spin' : ''}`} />
          </button>

          {server.status === 'stopped' && (
            <button
              onClick={() => startServer.mutate(id)}
              disabled={startServer.isPending}
              className="btn btn-primary"
            >
              <Play className="w-4 h-4" />
              {t('servers', 'start')}
            </button>
          )}

          {server.status === 'running' && (
            <>
              <button
                onClick={() => rebootServer.mutate(id)}
                disabled={rebootServer.isPending}
                className="btn btn-secondary"
              >
                <RotateCcw className="w-4 h-4" />
                {t('servers', 'reboot')}
              </button>
              <button
                onClick={() => stopServer.mutate(id)}
                disabled={stopServer.isPending}
                className="btn btn-secondary"
              >
                <Square className="w-4 h-4" />
                {t('servers', 'stop')}
              </button>
            </>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            {t('servers', 'deleteServer')}
          </button>
        </div>
      </div>

      {/* Setup Progress Banner */}
      {server.status === 'running' && server.setupStatus !== 'completed' && (
        <div className="rounded-xl border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin" />
            <div>
              <h3 className="font-semibold text-[var(--accent-cyan)]">Setting up your server...</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Installing Docker, Nginx, and Certbot. This may take a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {server.setupStatus === 'failed' && (
        <div className="rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--status-error)]/10 flex items-center justify-center">
              <span className="text-[var(--status-error)] text-xl">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--status-error)]">Setup Failed</h3>
              <p className="text-sm text-[var(--text-muted)]">
                {server.statusMessage || 'Server setup encountered an error. Please try syncing or recreating the server.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {server.status === 'running' && server.setupStatus === 'completed' && (
        <div className="rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success)]/5 p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--status-success)]/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-[var(--status-success)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--status-success)]">Server Ready</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Docker, Nginx, and Certbot are installed. Your server is ready for deployments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Server Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--accent-cyan)]" />
              {t('servers', 'overview')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm">vCPU</span>
                </div>
                <p className="text-2xl font-bold">{server.vcpus}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <MemoryStick className="w-4 h-4" />
                  <span className="text-sm">RAM</span>
                </div>
                <p className="text-2xl font-bold">{(server.memoryMb / 1024).toFixed(0)} GB</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm">Disk</span>
                </div>
                <p className="text-2xl font-bold">{server.diskGb} GB</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{t('servers', 'region')}</span>
                </div>
                <p className="text-2xl font-bold">{server.region}</p>
              </div>
            </div>
          </div>

          {/* Network Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-[var(--accent-cyan)]" />
              {t('servers', 'network')}
            </h2>
            <div className="space-y-4">
              {server.ipv4 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">IPv4</p>
                    <p className="font-mono">{server.ipv4}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(server.ipv4!, 'ipv4')}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                  >
                    {copiedField === 'ipv4' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
              {server.ipv6 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">IPv6</p>
                    <p className="font-mono text-sm">{server.ipv6}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(server.ipv6!, 'ipv6')}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                  >
                    {copiedField === 'ipv6' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
              {server.privateIp && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Private IP</p>
                    <p className="font-mono">{server.privateIp}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(server.privateIp!, 'privateIp')}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                  >
                    {copiedField === 'privateIp' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Traffic Info */}
            {providerData.traffic && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Traffic</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Ingoing</p>
                    <p className="font-mono">{formatBytes(providerData.traffic.ingoing)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Outgoing</p>
                    <p className="font-mono">{formatBytes(providerData.traffic.outgoing)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Included</p>
                    <p className="font-mono">{formatBytes(providerData.traffic.included)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SSH Access Card */}
          {server.ipv4 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[var(--accent-cyan)]" />
                SSH Access
              </h2>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                <code className="font-mono text-sm">ssh root@{server.ipv4}</code>
                <button
                  onClick={() => copyToClipboard(`ssh root@${server.ipv4}`, 'ssh')}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  {copiedField === 'ssh' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Server Type Card */}
          {providerData.serverType && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-[var(--accent-cyan)]" />
                Server Type
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Type</p>
                  <p className="font-semibold">{providerData.serverType.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Description</p>
                  <p>{providerData.serverType.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">CPU Type</p>
                    <p className="capitalize">{providerData.serverType.cpuType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Architecture</p>
                    <p>{providerData.serverType.architecture}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Storage Type</p>
                  <p className="uppercase">{providerData.serverType.storageType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Image Card */}
          {providerData.image && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--accent-cyan)]" />
                {t('servers', 'image')}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Name</p>
                  <p className="font-semibold">{providerData.image.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Description</p>
                  <p>{providerData.image.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">OS</p>
                    <p className="capitalize">{providerData.image.osFamily}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Version</p>
                    <p>{providerData.image.osVersion}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Card */}
          {providerData.location && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--accent-cyan)]" />
                Location
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">City</p>
                  <p className="font-semibold">{providerData.location.city}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Country</p>
                  <p>{providerData.location.country}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Datacenter</p>
                  <p>{providerData.datacenter}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Network Zone</p>
                  <p>{providerData.location.network_zone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Protection Card */}
          {providerData.protection && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--accent-cyan)]" />
                Protection
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Delete Protection</span>
                  <span className={providerData.protection.delete ? 'text-green-500' : 'text-[var(--text-muted)]'}>
                    {providerData.protection.delete ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Rebuild Protection</span>
                  <span className={providerData.protection.rebuild ? 'text-green-500' : 'text-[var(--text-muted)]'}>
                    {providerData.protection.rebuild ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--accent-cyan)]" />
              Timestamps
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t('servers', 'created')}</p>
                <p>{formatShortDate(server.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Last Updated</p>
                <p>{formatShortDate(server.updatedAt)}</p>
              </div>
              {server.lastSeenAt && (
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Last Seen</p>
                  <p>{formatShortDate(server.lastSeenAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteServerModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        server={server}
        onSuccess={() => router.push('/dashboard/servers')}
      />
    </div>
  );
}