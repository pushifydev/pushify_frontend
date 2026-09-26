'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Settings,
  Play,
  Pause,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProjects,
  useDeleteProject,
  useTranslation,
  projectKeys,
} from '@/hooks';
import { updateProjectStatus } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Skeleton } from '@/components/Skeleton';
import { PageHeader, MetaLabel } from '@/components/dashboard/PageKit';
import type { Project } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';

type ListableStatus = 'active' | 'paused';
type FilterStatus = 'all' | ListableStatus;

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const handleStatusChange = async (projectId: string, status: ListableStatus) => {
    const result = await updateProjectStatus(projectId, status);
    if (result.error) throw new Error(result.error.message);
    setOpenDropdown(null);
    await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  };

  const handleDeleteClick = (project: Project) => {
    setDeleteTarget(project);
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const pausedCount = projects.filter((p) => p.status === 'paused').length;

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        title={t('projects', 'title')}
        description={t('projects', 'subtitle')}
        meta={
          isLoading
            ? []
            : [
                <MetaLabel key="n">
                  {projects.length} {t('navigation', 'projects')}
                </MetaLabel>,
                activeCount > 0 && (
                  <span key="a" className="inline-flex items-center gap-1.5">
                    <span className="dash-status-dot is-success" aria-hidden />
                    {activeCount} {t('projects', 'active').toLowerCase()}
                  </span>
                ),
                pausedCount > 0 && (
                  <span key="p" className="inline-flex items-center gap-1.5">
                    <span className="dash-status-dot is-warning" aria-hidden />
                    {pausedCount} {t('projects', 'paused').toLowerCase()}
                  </span>
                ),
              ]
        }
        actions={
          <Link href="/dashboard/projects/new" className="btn btn-primary justify-center flex-1 sm:flex-none">
            <Plus className="w-4 h-4" />
            {t('projects', 'newProject')}
          </Link>
        }
      />

      {isLoading ? (
        <div className="dash-rows">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="dash-row flex items-center gap-3">
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[40%] max-w-[220px]" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          label={t('navigation', 'projects')}
          title={t('projects', 'noProjectsYet')}
          description={t('projects', 'createProjectDesc')}
          action={{ label: t('projects', 'createProject'), href: '/dashboard/projects/new', icon: <Plus className="w-4 h-4" /> }}
        />
      ) : (
        <div className="dash-rows !overflow-visible">
          <div className="dash-toolbar rounded-t-[14px]">
            <div className="relative flex-1 min-w-[12rem]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('projects', 'searchPlaceholder')}
                aria-label={t('projects', 'searchPlaceholder')}
                className="input h-9 !py-0 pl-9!"
              />
            </div>
            <div className="dash-segmented" role="group" aria-label={t('projects', 'status')}>
              {(['all', 'active', 'paused'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  aria-pressed={filterStatus === s}
                >
                  {s === 'all' ? t('projects', 'allStatus') : t('projects', s)}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState
              variant="bare"
              title={t('projects', 'noProjectsFound')}
              description={t('projects', 'adjustCriteria')}
            />
          ) : (
            <ul aria-label={t('projects', 'title')}>
              {filteredProjects.map((project) => (
                <li
                  key={project.id}
                  className="dash-row group flex items-center gap-3 border-t border-[var(--border-subtle)] first:border-t-0 last:rounded-b-[14px] hover:bg-[var(--hover-overlay)] transition-colors"
                >
                  <span
                    className={`dash-status-dot ${project.status === 'active' ? 'is-success' : project.status === 'paused' ? 'is-warning' : ''}`}
                    title={project.status}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-sm font-medium text-[var(--text-primary)] truncate hover:underline underline-offset-2"
                      >
                        {project.name}
                      </Link>
                      {project.status !== 'active' && (
                        <span className="badge badge-warning shrink-0">{project.status}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-[var(--text-muted)] min-w-0">
                      {project.framework && <MetaLabel>{project.framework}</MetaLabel>}
                      {project.productionUrl && (
                        <a
                          href={project.productionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="terminal-text truncate max-w-full sm:max-w-[18rem] hover:text-[var(--text-primary)] hover:underline underline-offset-2"
                        >
                          {project.productionUrl.replace('https://', '')}
                        </a>
                      )}
                      {project.description && (
                        <span className="hidden lg:inline truncate max-w-[20rem]">{project.description}</span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:inline text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                    {formatTimeAgo(project.updatedAt, t)}
                  </span>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      aria-haspopup="menu"
                      aria-expanded={openDropdown === project.id}
                      aria-label={`${project.name} — ${t('common', 'settings')}`}
                      className="dash-icon-action"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openDropdown === project.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="dash-menu absolute right-0 top-full mt-1 w-48 z-20" role="menu">
                          <Link
                            href={`/dashboard/projects/${project.id}?tab=settings`}
                            className="dash-menu-item"
                            role="menuitem"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            {t('common', 'settings')}
                          </Link>
                          {project.productionUrl && (
                            <a
                              href={project.productionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dash-menu-item"
                              role="menuitem"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t('projects', 'visitSite')}
                            </a>
                          )}
                          <div className="dash-menu-separator" />
                          {project.status === 'active' ? (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleStatusChange(project.id, 'paused')}
                              className="dash-menu-item"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              {t('projects', 'pause')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleStatusChange(project.id, 'active')}
                              className="dash-menu-item"
                            >
                              <Play className="w-3.5 h-3.5" />
                              {t('projects', 'resume')}
                            </button>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleDeleteClick(project)}
                            className="dash-menu-item is-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('common', 'delete')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant="danger"
        title={deleteTarget ? `${t('common', 'delete')} "${deleteTarget.name}"` : ''}
        description={t('projects', 'deleteConfirm')}
        confirmText={t('common', 'delete')}
        cancelText={t('common', 'cancel')}
        loading={deleteProject.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
