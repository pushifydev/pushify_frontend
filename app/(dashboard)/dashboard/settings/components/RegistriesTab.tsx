'use client';

import { useState } from 'react';
import { Boxes, Plus, Trash2 } from 'lucide-react';
import { useTranslation, useRegistries, useCreateRegistry, useDeleteRegistry } from '@/hooks';
import { formatTimeAgo } from '@/lib/formatters';
import { SkeletonKeyValueRow } from '@/components/Skeleton';
import { SettingsCard } from './SettingsCard';
import { Modal, ModalActions, AlertBox } from './Modal';

/**
 * Private container registries for the organization. Used at deploy time for a Dockerfile whose
 * `FROM` is a private base image, and for projects that deploy a ready image. The token is
 * write-only: it is sent once and never comes back, so a stored one can only be replaced.
 */
export function RegistriesTab() {
  const { t } = useTranslation();
  const { data: registries = [], isLoading } = useRegistries();
  const createRegistry = useCreateRegistry();
  const deleteRegistry = useDeleteRegistry();

  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', registry: '', username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setShowAdd(false);
    setForm({ name: '', registry: '', username: '', password: '' });
    setError(null);
  };

  const submit = async () => {
    setError(null);
    try {
      await createRegistry.mutateAsync({
        name: form.name.trim() || undefined,
        registry: form.registry.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold mb-1">{t('registries', 'title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('registries', 'description')}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary justify-center w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4" />
          {t('registries', 'add')}
        </button>
      </div>

      <SettingsCard title={t('registries', 'listTitle')}>
        <div className="-mx-5 -mb-5 md:-mx-6 border-t border-[var(--border-subtle)]">
          {isLoading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2].map((i) => (
                <SkeletonKeyValueRow key={i} />
              ))}
            </div>
          ) : registries.length === 0 ? (
            <div className="p-12 bg-[var(--bg-secondary)] text-center">
              <div className="inline-flex p-4 rounded-2xl bg-[var(--bg-tertiary)] mb-4">
                <Boxes className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('registries', 'empty')}</h3>
              <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                {t('registries', 'emptyDesc')}
              </p>
              <button onClick={() => setShowAdd(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                {t('registries', 'add')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {registries.map((registry) => (
                <div key={registry.id} className="px-5 md:px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{registry.name}</p>
                    <p className="text-sm text-[var(--text-secondary)] truncate terminal-text">
                      {registry.registry} · {registry.username}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {registry.lastUsedAt
                        ? t('registries', 'lastUsed').replace('{time}', formatTimeAgo(registry.lastUsedAt, t))
                        : t('registries', 'neverUsed')}
                    </p>
                  </div>
                  <button
                    onClick={() => setToDelete(registry.id)}
                    className="btn btn-ghost h-8 text-xs shrink-0"
                    aria-label={t('registries', 'remove')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      <Modal isOpen={showAdd} onClose={close} title={t('registries', 'add')}>
        <div className="space-y-4">
          {error && <AlertBox variant="error">{error}</AlertBox>}
          <label className="block">
            <span className="text-sm font-medium">{t('registries', 'host')}</span>
            <input
              value={form.registry}
              onChange={(e) => setForm({ ...form, registry: e.target.value })}
              placeholder="ghcr.io"
              className="input w-full mt-1 terminal-text"
            />
            <span className="text-xs text-[var(--text-muted)]">{t('registries', 'hostHint')}</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t('registries', 'username')}</span>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="off"
              className="input w-full mt-1 terminal-text"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t('registries', 'password')}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              className="input w-full mt-1 terminal-text"
            />
            <span className="text-xs text-[var(--text-muted)]">{t('registries', 'passwordHint')}</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t('registries', 'name')}</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={form.registry || 'ghcr.io'}
              className="input w-full mt-1"
            />
          </label>
        </div>
        <ModalActions>
          <button onClick={close} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button
            onClick={submit}
            disabled={createRegistry.isPending || !form.registry.trim() || !form.username.trim() || !form.password}
            className="btn btn-primary"
          >
            {createRegistry.isPending ? t('common', 'loading') : t('registries', 'add')}
          </button>
        </ModalActions>
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title={t('registries', 'remove')}>
        <p className="text-[var(--text-secondary)]">{t('registries', 'removeConfirm')}</p>
        <ModalActions>
          <button onClick={() => setToDelete(null)} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button
            onClick={async () => {
              if (toDelete) await deleteRegistry.mutateAsync(toDelete);
              setToDelete(null);
            }}
            disabled={deleteRegistry.isPending}
            className="btn btn-danger"
          >
            {t('registries', 'remove')}
          </button>
        </ModalActions>
      </Modal>
    </div>
  );
}
