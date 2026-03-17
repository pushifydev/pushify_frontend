'use client';

import { useState } from 'react';
import { X, Database, Server, Loader2 } from 'lucide-react';
import { useTranslation, useCreateDatabase, useDatabaseTypes } from '@/hooks';
import type { Server as ServerType, DatabaseType } from '@/lib/api';

interface CreateDatabaseModalProps {
  onClose: () => void;
  servers: ServerType[];
}

import { DB_TYPE_INFO } from '@/lib/constants';

export function CreateDatabaseModal({ onClose, servers }: CreateDatabaseModalProps) {
  const { t } = useTranslation();
  const createDatabase = useCreateDatabase();
  const { data: dbTypes = [] } = useDatabaseTypes();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DatabaseType>('postgresql');
  const [serverId, setServerId] = useState(servers[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  const selectedType = dbTypes.find((t) => t.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('databases', 'nameRequired'));
      return;
    }

    if (!serverId) {
      setError(t('databases', 'serverRequired'));
      return;
    }

    try {
      await createDatabase.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        serverId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create database');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-lg rounded-xl"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-[var(--accent-cyan)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('databases', 'createTitle')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('databases', 'createSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Database Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('databases', 'type')}</label>
            <div className="grid grid-cols-2 gap-3">
              {(['postgresql', 'mysql', 'redis', 'mongodb'] as DatabaseType[]).map((dbType) => {
                const info = DB_TYPE_INFO[dbType];
                const typeInfo = dbTypes.find((t) => t.type === dbType);
                return (
                  <button
                    key={dbType}
                    type="button"
                    onClick={() => setType(dbType)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      type === dbType
                        ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{info.icon}</span>
                      <span className="font-medium capitalize">{dbType}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{info.description}</p>
                    {typeInfo && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">v{typeInfo.defaultVersion}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('databases', 'name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('databases', 'namePlaceholder')}
              className="input w-full"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('databases', 'descriptionLabel')}
              <span className="text-[var(--text-muted)] font-normal ml-1">({t('common', 'optional')})</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('databases', 'descriptionPlaceholder')}
              className="input w-full"
            />
          </div>

          {/* Server Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('databases', 'server')}</label>
            <div className="space-y-2">
              {servers.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => setServerId(server.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    serverId === server.id
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <Server className="w-5 h-5 text-[var(--text-muted)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{server.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {server.ipv4} &bull; {server.region}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20">
              <p className="text-sm text-[var(--status-error)]">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('common', 'cancel')}
            </button>
            <button
              type="submit"
              disabled={createDatabase.isPending || !name.trim() || !serverId}
              className="btn btn-primary"
            >
              {createDatabase.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('databases', 'creating')}
                </>
              ) : (
                t('databases', 'create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
