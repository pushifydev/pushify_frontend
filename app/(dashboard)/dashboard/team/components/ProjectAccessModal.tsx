'use client';

import { useEffect, useState } from 'react';
import { FolderLock, Check } from 'lucide-react';
import { Modal, ModalActions } from '@/components/Modal';
import { useTranslation, useProjects } from '@/hooks';
import { useUpdateMemberProjectAccess } from '@/hooks/useOrganization';
import type { OrganizationMember } from '@/lib/api';

interface ProjectAccessModalProps {
  member: OrganizationMember | null;
  onClose: () => void;
}

export function ProjectAccessModal({ member, onClose }: ProjectAccessModalProps) {
  const { t } = useTranslation();
  const { data: projects = [] } = useProjects();
  const updateAccess = useUpdateMemberProjectAccess();

  const [restricted, setRestricted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setRestricted(member.restrictedAccess);
      setSelectedIds(new Set(member.projectIds));
      setError('');
    }
  }, [member]);

  const toggleProject = (projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!member) return;
    setError('');
    try {
      await updateAccess.mutateAsync({
        userId: member.user.id,
        input: { restricted, projectIds: restricted ? [...selectedIds] : [] },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update access');
    }
  };

  return (
    <Modal
      isOpen={!!member}
      onClose={onClose}
      title={t('team', 'projectAccessTitle')}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {t('team', 'projectAccessDescription')}
        </p>

        {/* All projects / selected projects switch */}
        <div className="space-y-2" role="radiogroup" aria-label={t('team', 'projectAccessTitle')}>
          <button
            type="button"
            role="radio"
            aria-checked={!restricted}
            onClick={() => setRestricted(false)}
            className={`dash-option w-full justify-between text-left${!restricted ? ' is-active' : ''}`}
            style={{ alignItems: 'center' }}
          >
            <span className="text-sm font-medium">{t('team', 'accessAllProjects')}</span>
            {!restricted && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={restricted}
            onClick={() => setRestricted(true)}
            className={`dash-option w-full justify-between text-left${restricted ? ' is-active' : ''}`}
            style={{ alignItems: 'center' }}
          >
            <span className="text-sm font-medium">{t('team', 'accessSelectedProjects')}</span>
            {restricted && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
          </button>
        </div>

        {/* Project checklist */}
        {restricted && (
          <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {projects.length === 0 ? (
              <p className="p-3 text-sm text-[var(--text-muted)]">{t('team', 'noProjectsYet')}</p>
            ) : (
              projects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--hover-overlay)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(project.id)}
                    onChange={() => toggleProject(project.id)}
                    className="shrink-0"
                  />
                  <span className="text-sm truncate">{project.name}</span>
                </label>
              ))
            )}
          </div>
        )}

        {restricted && selectedIds.size === 0 && (
          <p className="text-xs" style={{ color: 'var(--status-warning)' }}>
            {t('team', 'noProjectsSelectedWarning')}
          </p>
        )}

        {error && (
          <p className="text-sm" style={{ color: 'var(--status-error)' }}>
            {error}
          </p>
        )}

        <ModalActions>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('team', 'cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={updateAccess.isPending}
            className="btn btn-primary"
          >
            <FolderLock className="w-4 h-4" />
            {t('team', 'saveAccess')}
          </button>
        </ModalActions>
      </div>
    </Modal>
  );
}
