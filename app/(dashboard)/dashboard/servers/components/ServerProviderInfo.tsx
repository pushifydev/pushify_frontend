'use client';

import { Globe, Clock, MapPin, Shield, Network, Box } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, formatShortDate } from '@/lib/formatters';
import type { Server } from '@/lib/api';
import { ServerDetailSection, CopyField, InfoRow } from './ServerDetailSection';

export type ProviderLabels = {
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

export function ServerNetworkSection({
  server,
  providerData,
  copiedField,
  onCopy,
}: {
  server: Server;
  providerData: ProviderLabels;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <ServerDetailSection icon={Network} title={t('servers', 'network')}>
      <div>
        {server.ipv4 && (
          <CopyField
            label="IPv4"
            value={server.ipv4}
            fieldKey="ipv4"
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}
        {server.ipv6 && (
          <CopyField
            label="IPv6"
            value={server.ipv6}
            fieldKey="ipv6"
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}
        {server.privateIp && (
          <CopyField
            label={t('servers', 'privateIp')}
            value={server.privateIp}
            fieldKey="privateIp"
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}
      </div>

      {providerData.traffic && (
        <>
          <InfoRow label={t('servers', 'trafficIngoing')} value={formatBytes(providerData.traffic.ingoing)} />
          <InfoRow label={t('servers', 'trafficOutgoing')} value={formatBytes(providerData.traffic.outgoing)} />
          <InfoRow label={t('servers', 'trafficIncluded')} value={formatBytes(providerData.traffic.included)} />
        </>
      )}
    </ServerDetailSection>
  );
}

export function ServerProviderPanels({
  server,
  providerData,
}: {
  server: Server;
  providerData: ProviderLabels;
}) {
  const { t } = useTranslation();

  return (
    <>
      {providerData.serverType && (
        <ServerDetailSection icon={Box} title={t('servers', 'serverType')}>
          <div>
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
          <div>
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
          <div>
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
        <ServerDetailSection icon={Shield} title={t('servers', 'protection')}>
          <div>
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
        <div>
          <InfoRow label={t('servers', 'createdAtLabel')} value={formatShortDate(server.createdAt)} />
          <InfoRow label={t('servers', 'updatedAtLabel')} value={formatShortDate(server.updatedAt)} />
          {server.lastSeenAt && (
            <InfoRow label={t('servers', 'lastSeen')} value={formatShortDate(server.lastSeenAt)} />
          )}
        </div>
      </ServerDetailSection>
    </>
  );
}
