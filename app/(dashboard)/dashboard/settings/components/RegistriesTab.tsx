'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation, useRegistries, useCreateRegistry, useDeleteRegistry } from '@/hooks';
import { formatTimeAgo } from '@/lib/formatters';
import { EmptyState } from '@/components/EmptyState';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
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
    <>
      <SettingsSection
        id="registries"
        title={t('registries', 'title')}
        description={t('registries', 'description')}
        action={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            {t('registries', 'add')}
          </button>
        }
      >
        {isLoading ? (
          <div className="dash-settings-rows" aria-busy>
            {[1, 2].map((i) => (
              <div key={i} className="dash-row space-y-2" aria-hidden>
                <div className="dash-skeleton h-3.5 w-32 rounded" />
                <div className="dash-skeleton h-3 w-56 rounded" />
              </div>
            ))}
          </div>
        ) : registries.length === 0 ? (
          <EmptyState
            variant="bare"
            title={t('registries', 'empty')}
            description={t('registries', 'emptyDesc')}
            action={{
              label: t('registries', 'add'),
              onClick: () => setShowAdd(true),
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        ) : (
          <div className="dash-settings-rows">
            {registries.map((registry) => (
              <div key={registry.id} className="dash-row flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`dash-status-dot mt-[7px] ${registry.lastUsedAt ? 'is-success' : ''}`} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{registry.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 terminal-text text-xs text-[var(--text-muted)] min-w-0">
                      <span className="text-[var(--text-secondary)] truncate">
                        {registry.registry} · {registry.username}
                      </span>
                      <span>
                        {registry.lastUsedAt
                          ? t('registries', 'lastUsed').replace('{time}', formatTimeAgo(registry.lastUsedAt, t))
                          : t('registries', 'neverUsed')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setToDelete(registry.id)}
                  className="dash-icon-action w-8! h-8!"
                  aria-label={`${t('registries', 'remove')} ${registry.name}`}
                  title={t('registries', 'remove')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <Modal isOpen={showAdd} onClose={close} title={t('registries', 'add')}>
        <div className="space-y-4">
          {error && <AlertBox variant="error">{error}</AlertBox>}
          <label className="block">
            <span className="dash-field-label pt-0!">{t('registries', 'host')}</span>
            <input
              value={form.registry}
              onChange={(e) => setForm({ ...form, registry: e.target.value })}
              placeholder="ghcr.io"
              className="input w-full mt-1 terminal-text"
            />
            <span className="dash-field-hint block mt-1.5!">{t('registries', 'hostHint')}</span>
          </label>
          <label className="block">
            <span className="dash-field-label pt-0!">{t('registries', 'username')}</span>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="off"
              className="input w-full mt-1 terminal-text"
            />
          </label>
          <label className="block">
            <span className="dash-field-label pt-0!">{t('registries', 'password')}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              className="input w-full mt-1 terminal-text"
            />
            <span className="dash-field-hint block mt-1.5!">{t('registries', 'passwordHint')}</span>
          </label>
          <label className="block">
            <span className="dash-field-label pt-0!">{t('registries', 'name')}</span>
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
    </>
  );
}
