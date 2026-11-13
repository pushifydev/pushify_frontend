'use client';

import { useState } from 'react';
import { Modal, ModalActions } from './Modal';
import { Checkbox } from '@/components/Checkbox';
import { useTranslation, useProjects } from '@/hooks';
import { Select } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import {
  API_KEY_MAX_PROJECTS,
  apiKeyProjectIdsToCreate,
  isDeleteScope,
  toggleApiKeyProject,
} from '@/lib/api-key-projects';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    scopes: string[];
    expiresAt?: string;
    projectIds?: string[];
  }) => Promise<void>;
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
  const [restrictProjects, setRestrictProjects] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  // The projects list only holds projects the current user can access.
  const { data: projects = [] } = useProjects();

  const hasDeleteScopes = Object.keys(availableScopes).some(isDeleteScope);
  const projectLimitReached = selectedProjectIds.length >= API_KEY_MAX_PROJECTS;
  const missingProjects = restrictProjects && selectedProjectIds.length === 0;

  const handleClose = () => {
    setKeyName('');
    setSelectedScopes(['*']);
    setExpiresIn('never');
    setRestrictProjects(false);
    setSelectedProjectIds([]);
    setError('');
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

    setError('');
    try {
      await onCreate({
        name: keyName,
        scopes: selectedScopes,
        expiresAt,
        projectIds: apiKeyProjectIdsToCreate(restrictProjects, selectedProjectIds),
      });
    } catch (err) {
      // Keep the form open so a 400/403 from the backend can be fixed in place.
      setError(getApiErrorMessage(err));
      return;
    }

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
        <Select
          value={expiresIn}
          onValueChange={setExpiresIn}
          className="w-full"
          aria-label={t('apiKeys', 'expiresAt')}
          options={[
            { value: 'never', label: t('apiKeys', 'noExpiration') },
            { value: '30', label: '30 days' },
            { value: '60', label: '60 days' },
            { value: '90', label: '90 days' },
            { value: '365', label: '1 year' },
          ]}
        />
      </div>

      {/* Scopes */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {t('apiKeys', 'scopes')}
        </label>
        <p className="text-xs text-[var(--text-muted)] mb-3">{t('apiKeys', 'scopesDesc')}</p>
        {hasDeleteScopes && (
          <p className="text-xs text-[var(--text-muted)] mb-3">{t('apiKeys', 'deleteScopesHint')}</p>
        )}
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

      {/* Project restriction */}
      <div className="mt-4 mb-2">
        <Checkbox
          checked={restrictProjects}
          onChange={setRestrictProjects}
          label={t('apiKeys', 'restrictProjects')}
          description={t('apiKeys', 'restrictProjectsDesc').replace('{max}', String(API_KEY_MAX_PROJECTS))}
        />
        {restrictProjects && (
          <div className="mt-3">
            <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--border-subtle)] p-2">
              {projects.length === 0 ? (
                <p className="p-2 text-sm text-[var(--text-muted)]">{t('apiKeys', 'noProjectsAvailable')}</p>
              ) : (
                projects.map((project) => {
                  const checked = selectedProjectIds.includes(project.id);
                  return (
                    <div key={project.id} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
                      <Checkbox
                        checked={checked}
                        onChange={() =>
                          setSelectedProjectIds((prev) => toggleApiKeyProject(prev, project.id))
                        }
                        disabled={!checked && projectLimitReached}
                        label={project.name}
                      />
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {t('apiKeys', 'projectsSelected')
                .replace('{count}', String(selectedProjectIds.length))
                .replace('{max}', String(API_KEY_MAX_PROJECTS))}
            </p>
            {projectLimitReached && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>
                {t('apiKeys', 'projectsLimitReached').replace('{max}', String(API_KEY_MAX_PROJECTS))}
              </p>
            )}
            {missingProjects && projects.length > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>
                {t('apiKeys', 'noProjectsSelected')}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm mt-3" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}

      <ModalActions>
        <button onClick={handleClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!keyName.trim() || missingProjects || isPending}
          className="btn btn-primary"
        >
          {isPending ? t('apiKeys', 'creating') : t('common', 'create')}
        </button>
      </ModalActions>
    </Modal>
  );
}
