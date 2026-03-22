'use client';

import { useState } from 'react';
import { Database, Server, Loader2 } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import { useTranslation, useCreateDatabase, useDatabaseTypes } from '@/hooks';
import type { Server as ServerType, DatabaseType } from '@/lib/api';
import { DB_TYPE_INFO } from '@/lib/constants';

interface CreateDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: ServerType[];
}

export function CreateDatabaseModal({ isOpen, onClose, servers }: CreateDatabaseModalProps) {
  const { t } = useTranslation();
  const createDatabase = useCreateDatabase();
  const { data: dbTypes = [] } = useDatabaseTypes();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DatabaseType>('postgresql');
  const [serverId, setServerId] = useState(servers[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

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
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create database');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('databases', 'createTitle')}
      description={t('databases', 'createSubtitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Database Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('databases', 'type')}</label>
          <div className="grid grid-cols-2 gap-3">
            {(['postgresql', 'mysql', 'redis', 'mongodb'] as DatabaseType[]).map((dbType) => {
              const info = DB_TYPE_INFO[dbType];
              const typeInfo = dbTypes.find((dt) => dt.type === dbType);
              return (
                <button
                  key={dbType}
                  type="button"
                  onClick={() => setType(dbType)}
                  className="p-3 rounded-lg border text-left transition-all"
                  style={{
                    borderColor: type === dbType ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    background: type === dbType ? 'rgba(34,211,238,0.08)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-medium capitalize">{dbType}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{info.description}</p>
                  {typeInfo && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>v{typeInfo.defaultVersion}</p>
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
            <span className="font-normal ml-1" style={{ color: 'var(--text-muted)' }}>({t('common', 'optional')})</span>
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
                className="w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3"
                style={{
                  borderColor: serverId === server.id ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  background: serverId === server.id ? 'rgba(34,211,238,0.08)' : 'transparent',
                }}
              >
                <Server className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{server.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {server.ipv4} &bull; {server.region}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <AlertBox variant="error">{error}</AlertBox>}

        {/* Actions */}
        <ModalActions>
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
        </ModalActions>
      </form>
    </Modal>
  );
}
