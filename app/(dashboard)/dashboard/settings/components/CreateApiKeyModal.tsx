'use client';

import { useState } from 'react';
import { Modal, ModalActions } from './Modal';
import { Checkbox } from '@/components/Checkbox';
import { useTranslation } from '@/hooks';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; scopes: string[]; expiresAt?: string }) => Promise<void>;
  availableScopes: Record<string, string>;
  isPending: boolean;
}

export function CreateApiKeyModal({
  isOpen,
  onClose,
  onCreate,
  availableScopes,
  isPending,
}: CreateApiKeyModalProps) {
  const { t } = useTranslation();
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['*']);
  const [expiresIn, setExpiresIn] = useState<string>('never');

  const handleClose = () => {
    setKeyName('');
    setSelectedScopes(['*']);
    setExpiresIn('never');
    onClose();
  };

  const handleSubmit = async () => {
    let expiresAt: string | undefined;
    if (expiresIn !== 'never') {
      const days = parseInt(expiresIn);
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString();
    }

    await onCreate({
      name: keyName,
      scopes: selectedScopes,
      expiresAt,
    });

    handleClose();
  };

  const toggleScope = (scope: string) => {
    if (scope === '*') {
      setSelectedScopes(selectedScopes.includes('*') ? [] : ['*']);
      return;
    } else {
      const newScopes = selectedScopes.filter((s) => s !== '*');
      if (newScopes.includes(scope)) {
        setSelectedScopes(newScopes.filter((s) => s !== scope));
      } else {
        setSelectedScopes([...newScopes, scope]);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('apiKeys', 'createKey')}>
      {/* Key Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {t('apiKeys', 'keyName')}
        </label>
        <input
          type="text"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder={t('apiKeys', 'keyNamePlaceholder')}
          className="input w-full"
        />
      </div>

      {/* Expiration */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {t('apiKeys', 'expiresAt')}
        </label>
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(e.target.value)}
          className="input w-full"
        >
          <option value="never">{t('apiKeys', 'noExpiration')}</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
        </select>
      </div>

      {/* Scopes */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {t('apiKeys', 'scopes')}
        </label>
        <p className="text-xs text-[var(--text-muted)] mb-3">{t('apiKeys', 'scopesDesc')}</p>
        <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--border-subtle)] p-2">
          <div className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
            <Checkbox
              checked={selectedScopes.includes('*')}
              onChange={() => toggleScope('*')}
              label={t('apiKeys', 'allPermissions')}
            />
          </div>
          {Object.entries(availableScopes).map(([scope, description]) => (
            <div key={scope} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
              <Checkbox
                checked={selectedScopes.includes('*') || selectedScopes.includes(scope)}
                onChange={() => toggleScope(scope)}
                disabled={selectedScopes.includes('*')}
                label={scope}
                description={description}
              />
            </div>
          ))}
        </div>
      </div>

      <ModalActions>
        <button onClick={handleClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!keyName.trim() || isPending}
          className="btn btn-primary"
        >
          {isPending ? t('apiKeys', 'creating') : t('common', 'create')}
        </button>
      </ModalActions>
    </Modal>
  );
}
