'use client';

import { useState } from 'react';
import { Key, Plus, Trash2, Clock, Shield } from 'lucide-react';
import {
  useTranslation,
  useApiKeys,
  useApiKeyScopes,
  useCreateApiKey,
  useRevokeApiKey,
} from '@/hooks';
import type { ApiKeyWithSecret } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { ApiKeySecretModal } from './ApiKeySecretModal';
import { RevokeApiKeyModal } from './RevokeApiKeyModal';

export function ApiKeysTab() {
  const { t } = useTranslation();

  // API Keys hooks
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
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">{t('apiKeys', 'title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('apiKeys', 'description')}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          {t('apiKeys', 'createKey')}
        </button>
      </div>

      {/* API Keys List */}
      <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 bg-[var(--bg-secondary)] animate-pulse">
                <div className="h-5 w-40 bg-[var(--bg-tertiary)] rounded mb-3" />
                <div className="h-4 w-64 bg-[var(--bg-tertiary)] rounded" />
              </div>
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
      className={`p-5 bg-[var(--bg-secondary)] transition-opacity ${
        !apiKey.isActive || isExpired ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
            <Key className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{apiKey.name}</h3>
              {isExpired && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {t('apiKeys', 'expired')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <code className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono text-xs">
                {apiKey.prefix}...
              </code>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {apiKey.lastUsedAt ? formatTimeAgo(apiKey.lastUsedAt, t) : t('apiKeys', 'never')}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {apiKey.scopes === '*'
                  ? t('apiKeys', 'allPermissions')
                  : `${apiKey.scopes.split(',').length} scopes`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onRevoke}
          className="btn btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/30 text-sm"
          disabled={!apiKey.isActive}
        >
          <Trash2 className="w-4 h-4" />
          {t('apiKeys', 'revoke')}
        </button>
      </div>
    </div>
  );
}
