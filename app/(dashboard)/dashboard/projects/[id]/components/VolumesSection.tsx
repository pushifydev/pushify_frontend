'use client';

import { useState } from 'react';
import { HardDrive, Plus, Trash2 } from 'lucide-react';
import {
  useProjectVolumes,
  useCreateProjectVolume,
  useDeleteProjectVolume,
  useTranslation,
} from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { SettingsSection } from './SettingsParts';

export function VolumesSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [containerPath, setContainerPath] = useState('');

  const confirm = useConfirm();
  const { data: volumes = [] } = useProjectVolumes(projectId);
  const createVolume = useCreateProjectVolume(projectId);
  const deleteVolume = useDeleteProjectVolume(projectId);

  const isValid = /^[a-z0-9][a-z0-9-]{0,30}$/.test(name) && containerPath.startsWith('/');

  const handleCreate = async () => {
    await createVolume.mutateAsync({ name, containerPath });
    setName('');
    setContainerPath('');
    setShowForm(false);
  };

  const handleDelete = async (volumeId: string, volumeName: string) => {
    const ok = await confirm({
      title: t('volumes', 'deleteConfirmTitle'),
      description: t('volumes', 'deleteConfirmMessage').replace('{name}', volumeName),
      variant: 'danger',
    });
    if (ok) deleteVolume.mutate(volumeId);
  };

  return (
    <SettingsSection
      id="settings-volumes"
      title={t('volumes', 'title')}
      description={t('volumes', 'description')}
      action={
        !showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn btn-secondary btn-sm">
            <Plus className="w-4 h-4" />
            {t('volumes', 'addVolume')}
          </button>
        )
      }
      padded
    >
      {showForm && (
        <div className="p-4 mb-4 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="volume-name" className="dash-section-label block mb-2">
                {t('volumes', 'name')}
              </label>
              <input
                id="volume-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder={t('volumes', 'namePlaceholder')}
                className="input w-full text-sm terminal-text"
              />
            </div>
            <div className="flex-[2]">
              <label htmlFor="volume-path" className="dash-section-label block mb-2">
                {t('volumes', 'containerPath')}
              </label>
              <input
                id="volume-path"
                type="text"
                value={containerPath}
                onChange={(e) => setContainerPath(e.target.value)}
                placeholder={t('volumes', 'containerPathPlaceholder')}
                className="input w-full terminal-text text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!isValid || createVolume.isPending}
              className="btn btn-primary"
            >
              {t('volumes', 'addVolume')}
            </button>
          </div>
        </div>
      )}

      {volumes.length === 0 && !showForm ? (
        <p className="text-[13px] text-[var(--text-muted)]">{t('volumes', 'noVolumes')}</p>
      ) : volumes.length > 0 && (
        <div className="rounded-[10px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
          {volumes.map((volume) => (
            <div key={volume.id} className="flex items-center gap-3 pl-3 pr-1.5 py-1.5">
              <HardDrive className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="text-[13px] font-medium">{volume.name}</span>
                <code className="terminal-text text-xs text-[var(--text-secondary)] truncate">
                  {volume.containerPath}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(volume.id, volume.name)}
                aria-label={`${t('common', 'delete')} ${volume.name}`}
                title={t('common', 'delete')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="dash-field-hint">{t('volumes', 'applyNote')}</p>
    </SettingsSection>
  );
}
