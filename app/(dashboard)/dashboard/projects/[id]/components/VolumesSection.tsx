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
    <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            {t('volumes', 'title')}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('volumes', 'description')}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-secondary shrink-0">
          <Plus className="w-4 h-4" />
          {t('volumes', 'addVolume')}
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">{t('volumes', 'applyNote')}</p>

      {showForm && (
        <div className="p-4 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                {t('volumes', 'name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder={t('volumes', 'namePlaceholder')}
                className="input w-full text-sm"
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                {t('volumes', 'containerPath')}
              </label>
              <input
                type="text"
                value={containerPath}
                onChange={(e) => setContainerPath(e.target.value)}
                placeholder={t('volumes', 'containerPathPlaceholder')}
                className="input w-full terminal-text text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
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
        <p className="text-sm text-[var(--text-muted)]">{t('volumes', 'noVolumes')}</p>
      ) : (
        <div className="space-y-2">
          {volumes.map((volume) => (
            <div
              key={volume.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
            >
              <HardDrive className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="font-medium text-sm">{volume.name}</span>
                <code className="text-xs text-[var(--text-secondary)] truncate">
                  {volume.containerPath}
                </code>
              </div>
              <button
                onClick={() => handleDelete(volume.id, volume.name)}
                className="btn btn-ghost h-8 text-xs text-[var(--status-error)] shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
