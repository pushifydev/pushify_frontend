'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { ProviderIcon } from '@/components/servers/ProviderIcon';
import {
  COMING_SOON_CLOUD_PROVIDERS,
  MANAGED_CLOUD_PROVIDER,
} from '@/lib/cloud-providers';

export function ManagedCloudProviderBar() {
  const { t } = useTranslation();

  return (
    <div className="dash-panel space-y-3">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('servers', 'managedProviderActive')}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: 'var(--dash-accent-bg)',
            border: '1px solid var(--dash-accent-border)',
            color: 'var(--text-primary)',
          }}
        >
          <ProviderIcon provider={MANAGED_CLOUD_PROVIDER} size="sm" />
          <span>{t('servers', MANAGED_CLOUD_PROVIDER)}</span>
          <Check className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
        </div>
        {COMING_SOON_CLOUD_PROVIDERS.map((provider) => (
          <div
            key={provider}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm opacity-60"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
            title={t('servers', 'managedProvidersComingSoon')}
          >
            <ProviderIcon provider={provider} size="sm" />
            <span>{t('servers', provider)}</span>
            <span className="text-xs uppercase tracking-wide">{t('servers', 'comingSoonBadge')}</span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('servers', 'managedProvidersComingSoon')}
      </p>
    </div>
  );
}
