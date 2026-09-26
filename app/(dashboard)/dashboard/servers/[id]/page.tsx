'use client';

import { use, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Terminal,
  Loader2,
  MoreHorizontal,
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
import { PageHeader, MetaLabel, Tabs, TabPanel } from '@/components/dashboard/PageKit';
import { EmptyState } from '@/components/EmptyState';
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
import { StatTile } from '../components/ServerDetailSection';
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

type Tab = 'overview' | 'workloads' | 'network' | 'activity' | 'details';
const VALID_TABS: Tab[] = ['overview', 'workloads', 'network', 'activity', 'details'];

const copy = {
  workloads: { en: 'Workloads', tr: 'İş yükleri' },
  details: { en: 'Details', tr: 'Ayrıntılar' },
  more: { en: 'More actions', tr: 'Diğer işlemler' },
};

export default function ServerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const l = (s: { en: string; tr: string }) => (locale === 'tr' ? s.tr : s.en);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const setActiveTab = useCallback(
    (tab: Tab) => {
      const next = new URLSearchParams(searchParams.toString());
      if (tab === 'overview') next.delete('tab');
      else next.set('tab', tab);
      const qs = next.toString();
      router.push(`/dashboard/servers/${id}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, id, searchParams],
  );

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
      <div className="dash-page max-w-7xl" aria-busy="true" aria-label={t('common', 'loading')}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-40 bg-[var(--bg-secondary)] rounded" />
          <div className="h-9 w-64 bg-[var(--bg-secondary)] rounded" />
          <div className="h-4 max-w-md bg-[var(--bg-secondary)] rounded" />
          <div className="h-10 border-b border-[var(--border-subtle)]" />
          <div className="h-64 bg-[var(--bg-secondary)] rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="dash-page max-w-7xl">
        <EmptyState
          label={t('navigation', 'servers')}
          title={t('servers', 'notFound')}
          action={{ label: t('common', 'back'), href: '/dashboard/servers' }}
        />
      </div>
    );
  }

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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: t('servers', 'overview') },
    {
      id: 'workloads',
      label: l(copy.workloads),
      count: server.projectCount + server.databaseCount || undefined,
    },
    { id: 'network', label: t('servers', 'network') },
    { id: 'activity', label: t('servers', 'timelineTitle') },
    { id: 'details', label: l(copy.details) },
  ];

  const runMenu = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-hidden">
      <PageHeader
        back={{ href: '/dashboard/servers', label: t('navigation', 'servers') }}
        crumb={server.name}
        title={server.name}
        badge={
          <>
            <StatusBadge status={server.status} label={statusLabel} />
            {server.isManaged && <span className="badge badge-neutral shrink-0">{t('servers', 'managedBadge')}</span>}
          </>
        }
        meta={[
          <MetaLabel key="provider">{providerLabel}</MetaLabel>,
          <MetaLabel key="region">{server.region}</MetaLabel>,
          server.ipv4 && (
            <span key="ip" className="terminal-text text-xs text-[var(--text-secondary)]">
              {server.ipv4}
            </span>
          ),
          <span key="specs" className="terminal-text text-xs tabular-nums">
            {server.vcpus} vCPU · {memoryLabel} · {server.diskGb} GB
          </span>,
          server.projectCount > 0 && (
            <button
              key="projects"
              type="button"
              onClick={() => setActiveTab('workloads')}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {t('servers', 'projectCount').replace('{count}', String(server.projectCount))}
            </button>
          ),
          server.databaseCount > 0 && (
            <button
              key="dbs"
              type="button"
              onClick={() => setActiveTab('workloads')}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {t('servers', 'databaseCount').replace('{count}', String(server.databaseCount))}
            </button>
          ),
        ]}
        actions={
          <>
            <ServerDetailActions
              server={server}
              onEdit={() => setShowEditModal(true)}
              onResize={() => setShowResizeModal(true)}
            />
            {server.status === 'stopped' && (
              <button
                type="button"
                onClick={() => startServer.mutate(id)}
                disabled={actionPending}
                className="btn btn-primary justify-center flex-1 sm:flex-none"
              >
                <Play className={ICON_SM} />
                {t('servers', 'start')}
              </button>
            )}
            {server.status === 'running' && (
              <Link
                href={`/dashboard/servers/${id}/terminal`}
                className="btn btn-primary justify-center flex-1 sm:flex-none"
              >
                <Terminal className={ICON_SM} />
                {t('servers', 'openTerminal')}
              </Link>
            )}
            <div className="relative self-center">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={l(copy.more)}
                title={l(copy.more)}
                className="dash-icon-action !w-9 !h-9 border border-[var(--border-subtle)]"
              >
                {syncServer.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="dash-menu absolute right-0 top-full mt-1 w-48 z-20" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      disabled={actionPending}
                      onClick={() => runMenu(() => syncServer.mutate(id))}
                      className="dash-menu-item"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('servers', 'sync')}
                    </button>
                    {server.status === 'running' && (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={actionPending}
                          onClick={() => runMenu(() => rebootServer.mutate(id))}
                          className="dash-menu-item"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {t('servers', 'reboot')}
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={actionPending}
                          onClick={() => runMenu(() => stopServer.mutate(id))}
                          className="dash-menu-item"
                        >
                          <Square className="w-3.5 h-3.5" />
                          {t('servers', 'stop')}
                        </button>
                      </>
                    )}
                    <div className="dash-menu-separator" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => runMenu(() => setShowDeleteModal(true))}
                      className="dash-menu-item is-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('servers', 'deleteServer')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        }
      />

      {server.statusMessage === 'resizing' && (
        <SetupBanner
          variant="info"
          title={t('servers', 'timelineResizing')}
          description={t('servers', 'resizeWarning')}
          icon={<Loader2 className="w-3.5 h-3.5 animate-spin" />}
        />
      )}

      {showStatusBanner && (
        <SetupBanner
          variant={infraCreditsStopped ? 'info' : 'error'}
          title={infraCreditsStopped ? t('servers', 'statusInfraCreditsStopped') : statusLabel}
          description={
            infraCreditsStopped
              ? `${statusMessageText} ${t('servers', 'statusInfraCreditsStoppedHint')}`
              : statusMessageText!
          }
        />
      )}

      {server.status === 'running' && server.setupStatus !== 'completed' && server.setupStatus !== 'failed' && (
        <SetupBanner
          variant="info"
          title={t('servers', 'setupBannerTitle')}
          description={t('servers', 'setupBannerDesc')}
          icon={<Loader2 className="w-3.5 h-3.5 animate-spin" />}
        />
      )}

      {server.setupStatus === 'failed' && (
        <SetupBanner
          variant="error"
          title={t('servers', 'setupFailedTitle')}
          description={statusMessageText || t('servers', 'setupFailed')}
        />
      )}

      <Tabs label={server.name} idPrefix="server-tab" items={tabs} active={activeTab} onChange={setActiveTab} />

      <TabPanel idPrefix="server-tab" active={activeTab}>
        {activeTab === 'overview' && (
          <div className="space-y-6 min-w-0">
            {server.status === 'running' && server.setupStatus === 'completed' && (
              <SetupBanner
                variant="success"
                title={t('servers', 'setupReadyTitle')}
                description={t('servers', 'setupReadyDesc')}
              />
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <StatTile label={t('servers', 'vcpus')} value={String(server.vcpus)} />
              <StatTile label={t('servers', 'memory')} value={memoryLabel} />
              <StatTile
                label={t('servers', 'disk')}
                value={
                  // The hourly check knows how full it actually is; the size alone does not
                  typeof server.diskUsedPercent === 'number'
                    ? `${server.diskUsedPercent}% / ${server.diskGb} GB`
                    : `${server.diskGb} GB`
                }
              />
              <StatTile label={t('servers', 'region')} value={server.region} />
            </div>

            {server.infraBilling && <ServerInfraBillingCard server={server} />}

            <ServerNextStepsCard server={server} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
              <ServerHealthPanel server={server} />
              <ServerContainersPanel server={server} />
            </div>
          </div>
        )}

        {activeTab === 'workloads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            <ServerProjectsSection serverId={id} />
            <ServerDatabasesSection
              server={server}
              readyServers={
                server.status === 'running' && server.setupStatus === 'completed' ? [server] : []
              }
            />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
            <div className="lg:col-span-2 space-y-6 min-w-0">
              <ServerNetworkSection
                server={server}
                providerData={providerData}
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              {server.ipv4 && <ServerSshPanel serverId={id} />}
            </div>
            <div className="min-w-0">
              <ServerFirewallPanel />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <ServerTimelinePanel serverId={id} />
            <ServerSnapshotsPanel server={server} />
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <ServerProviderPanels server={server} providerData={providerData} />
          </div>
        )}
      </TabPanel>

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
