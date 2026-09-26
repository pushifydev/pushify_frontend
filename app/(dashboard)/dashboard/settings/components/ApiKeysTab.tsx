'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { EmptyState } from '@/components/EmptyState';
import { SettingsSection } from '@/components/dashboard/SettingsParts';

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
    <>
      <SettingsSection
        id="api-keys"
        title={t('apiKeys', 'title')}
        description={t('apiKeys', 'description')}
        action={
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            {t('apiKeys', 'createKey')}
          </button>
        }
        footer={
          billingInfo ? (
            <>
              <p className="text-[13px] text-[var(--text-secondary)] min-w-0 flex-1">
                {billingInfo.apiRequestsPerMinute === -1
                  ? t('apiKeys', 'rateLimitBannerUnlimited')
                  : t('apiKeys', 'rateLimitBanner').replace(
                      '{count}',
                      String(billingInfo.apiRequestsPerMinute ?? 60)
                    )}
              </p>
              <Link href="/dashboard/billing" className="dash-link shrink-0">
                {t('apiKeys', 'viewBilling')}
              </Link>
            </>
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="dash-settings-rows" aria-busy>
            {[1, 2].map((i) => (
              <div key={i} className="dash-row space-y-2" aria-hidden>
                <div className="dash-skeleton h-3.5 w-36 rounded" />
                <div className="dash-skeleton h-3 w-60 rounded" />
              </div>
            ))}
          </div>
        ) : apiKeys.length === 0 ? (
          <EmptyState
            variant="bare"
            title={t('apiKeys', 'noKeys')}
            description={t('apiKeys', 'noKeysDesc')}
            action={{
              label: t('apiKeys', 'createKey'),
              onClick: () => setShowCreateModal(true),
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        ) : (
          <div className="dash-settings-rows">
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
      </SettingsSection>

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
    </>
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
  const live = apiKey.isActive && !isExpired;

  return (
    <div className="dash-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className={`flex items-start gap-3 min-w-0 flex-1 ${live ? '' : 'opacity-60'}`}>
        <span
          className={`dash-status-dot mt-[7px] ${isExpired ? 'is-error' : apiKey.isActive ? 'is-success' : ''}`}
          aria-hidden
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{apiKey.name}</span>
            {isExpired ? (
              <span className="badge badge-error">{t('apiKeys', 'expired')}</span>
            ) : (
              apiKey.isActive && <span className="badge badge-success">{t('security', 'active')}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 terminal-text text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text-secondary)]">{apiKey.prefix}…</span>
            <span>
              {t('apiKeys', 'lastUsed')}{' '}
              {apiKey.lastUsedAt ? formatTimeAgo(apiKey.lastUsedAt, t) : t('apiKeys', 'never').toLowerCase()}
            </span>
            <span>
              {apiKey.scopes === '*'
                ? t('apiKeys', 'allPermissions')
                : `${apiKey.scopes.split(',').length} scopes`}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onRevoke}
        className="btn btn-secondary btn-sm shrink-0 self-start sm:self-center"
        disabled={!apiKey.isActive}
      >
        <Trash2 className="w-3.5 h-3.5" />
        {t('apiKeys', 'revoke')}
      </button>
    </div>
  );
}
