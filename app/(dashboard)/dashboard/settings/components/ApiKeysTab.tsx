'use client';

import { useState } from 'react';
import { Check, Key, Plus, Trash2, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import {
  useTranslation,
  useApiKeys,
  useApiKeyScopes,
  useCreateApiKey,
  useRevokeApiKey,
  useBillingInfo,
} from '@/hooks';
import type { ApiKeyWithSecret } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { ApiKeySecretModal } from './ApiKeySecretModal';
import { RevokeApiKeyModal } from './RevokeApiKeyModal';
import { SkeletonKeyValueRow } from '@/components/Skeleton';
import { SettingsCard } from './SettingsCard';

export function ApiKeysTab() {
  const { t } = useTranslation();

  // API Keys hooks
  const { data: billingInfo } = useBillingInfo();
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const { data: availableScopes = {} } = useApiKeyScopes();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ApiKeyWithSecret | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  const handleCreateKey = async (data: { name: string; scopes: string[]; expiresAt?: string }) => {
    const result = await createApiKey.mutateAsync(data);
    setNewKeyResult(result);
    setShowCreateModal(false);
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;
    await revokeApiKey.mutateAsync(keyToRevoke);
    setKeyToRevoke(null);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold mb-1">{t('apiKeys', 'title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('apiKeys', 'description')}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary justify-center w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4" />
          {t('apiKeys', 'createKey')}
        </button>
      </div>

      {billingInfo && (
        <div className="dash-panel px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Shield className="w-4 h-4 inline-block mr-2 -mt-0.5 opacity-70" />
            {billingInfo.apiRequestsPerMinute === -1
              ? t('apiKeys', 'rateLimitBannerUnlimited')
              : t('apiKeys', 'rateLimitBanner').replace(
                  '{count}',
                  String(billingInfo.apiRequestsPerMinute ?? 60)
                )}
          </p>
          <Link href="/dashboard/billing" className="text-sm font-medium shrink-0 hover:opacity-80" style={{ color: 'var(--accent-cyan)' }}>
            {t('apiKeys', 'viewBilling')}
          </Link>
        </div>
      )}

      {/* API Keys List */}
      <SettingsCard title={t('apiKeys', 'listTitle')}>
        <div className="-mx-5 -mb-5 md:-mx-6 border-t border-[var(--border-subtle)]">
          {isLoading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2].map((i) => (
                <SkeletonKeyValueRow key={i} />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {apiKeys.map((key) => (
                <ApiKeyRow
                  key={key.id}
                  apiKey={key}
                  isExpired={isExpired(key.expiresAt)}
                  onRevoke={() => setKeyToRevoke(key.id)}
                />
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Modals */}
      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateKey}
        availableScopes={availableScopes}
        isPending={createApiKey.isPending}
      />

      {newKeyResult && (
        <ApiKeySecretModal
          isOpen={!!newKeyResult}
          onClose={() => setNewKeyResult(null)}
          secretKey={newKeyResult.secretKey}
        />
      )}

      <RevokeApiKeyModal
        isOpen={!!keyToRevoke}
        onClose={() => setKeyToRevoke(null)}
        onRevoke={handleRevoke}
        isPending={revokeApiKey.isPending}
      />
    </div>
  );
}

// Sub-components
interface EmptyStateProps {
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="p-12 bg-[var(--bg-secondary)] text-center">
      <div className="inline-flex p-4 rounded-2xl bg-[var(--bg-tertiary)] mb-4">
        <Key className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t('apiKeys', 'noKeys')}</h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
        {t('apiKeys', 'noKeysDesc')}
      </p>
      <button onClick={onCreateClick} className="btn btn-primary">
        <Plus className="w-4 h-4" />
        {t('apiKeys', 'createKey')}
      </button>
    </div>
  );
}

interface ApiKeyRowProps {
  apiKey: {
    id: string;
    name: string;
    prefix: string;
    scopes: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    isActive: boolean;
  };
  isExpired: boolean;
  onRevoke: () => void;
}

function ApiKeyRow({ apiKey, isExpired, onRevoke }: ApiKeyRowProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`p-4 md:p-5 bg-[var(--bg-secondary)] transition-opacity ${
        !apiKey.isActive || isExpired ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <Key className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">{apiKey.name}</h3>
              {isExpired ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {t('apiKeys', 'expired')}
                </span>
              ) : (
                apiKey.isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <Check className="w-3 h-3" />
                    {t('security', 'active')}
                  </span>
                )
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--text-muted)] mt-1">
              <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono text-[11px]">
                {apiKey.prefix}...
              </code>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {apiKey.lastUsedAt ? formatTimeAgo(apiKey.lastUsedAt, t) : t('apiKeys', 'never')}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {apiKey.scopes === '*'
                  ? t('apiKeys', 'allPermissions')
                  : `${apiKey.scopes.split(',').length} scopes`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onRevoke}
          className="btn btn-secondary h-8 text-xs text-red-400 hover:text-red-300 hover:border-red-500/30 shrink-0 self-start sm:self-center"
          disabled={!apiKey.isActive}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('apiKeys', 'revoke')}
        </button>
      </div>
    </div>
  );
}
