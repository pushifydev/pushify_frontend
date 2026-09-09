'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  List,
  GitBranch,
  Plus,
  Search,
  Globe,
  Rocket,
  MoreVertical,
  ExternalLink,
  Trash2,
  Settings,
  Play,
  Pause,
  Clock,
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
import { PROJECT_STATUS_COLORS } from '@/lib/constants';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonProjectCard } from '@/components/Skeleton';
import type { Project } from '@/lib/api';

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

  // Cards for a handful of projects, a dense table once there are many — remembered per browser.
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('projects:view');
      if (saved === 'table' || saved === 'cards') setViewMode(saved);
    } catch {}
  }, []);
  const changeView = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    try { localStorage.setItem('projects:view', mode); } catch {}
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  const renderTable = () => (
    <div className="dash-panel p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.06em]" style={{ color: 'var(--text-muted)' }}>
              <th className="text-left font-medium px-4 py-2.5">{t('projects', 'title')}</th>
              <th className="text-left font-medium px-3 py-2.5">{t('projects', 'status')}</th>
              <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">Framework</th>
              <th className="text-left font-medium px-3 py-2.5 hidden lg:table-cell">URL</th>
              <th className="text-right font-medium px-3 py-2.5 whitespace-nowrap">{t('projects', 'updated')}</th>
              <th className="px-3 py-2.5" aria-label="actions" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filteredProjects.map((project) => {
              const accent = PROJECT_STATUS_COLORS[project.status] ?? 'var(--text-muted)';
              return (
                <tr key={project.id} className="group hover:bg-[var(--hover-overlay)] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className="px-4 py-2.5 min-w-0">
                    <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline underline-offset-4 truncate block max-w-[260px]" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    {project.framework ? (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{project.framework}</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell min-w-0">
                    {project.productionUrl ? (
                      <a href={project.productionUrl} target="_blank" rel="noopener noreferrer" className="text-xs truncate block max-w-[260px] hover:underline underline-offset-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {project.productionUrl.replace('https://', '')}
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs whitespace-nowrap tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {formatTimeAgo(project.updatedAt, t)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {project.productionUrl && (
                        <a href={project.productionUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay-md)]" style={{ color: 'var(--text-muted)' }} title={t('projects', 'visitSite')}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link href={`/dashboard/projects/${project.id}?tab=settings`} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay-md)]" style={{ color: 'var(--text-muted)' }} title={t('common', 'settings')}>
                        <Settings className="w-3.5 h-3.5" />
                      </Link>
                      {project.status === 'active' ? (
                        <button type="button" onClick={() => handleStatusChange(project.id, 'paused')} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay-md)]" style={{ color: 'var(--text-muted)' }} title={t('projects', 'pause')}>
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => handleStatusChange(project.id, 'active')} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay-md)]" style={{ color: 'var(--text-muted)' }} title={t('projects', 'resume')}>
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteClick(project)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--status-error)]/10" style={{ color: 'var(--text-muted)' }} title={t('common', 'delete')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="dash-page max-w-5xl space-y-6 animate-slide-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('projects', 'title')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('projects', 'subtitle')}
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          {t('projects', 'newProject')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('projects', 'searchPlaceholder')}
            className="input pl-9!"
          />
        </div>

        <div className="flex gap-1.5">
          {(['all', 'active', 'paused'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: filterStatus === s ? 'var(--dash-accent-bg)' : 'var(--bg-secondary)',
                color: filterStatus === s ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: filterStatus === s ? '1px solid var(--dash-accent-border-strong)' : '1px solid var(--glass-border)',
              }}
            >
              {s === 'all' ? t('projects', 'allStatus') : t('projects', s)}
            </button>
          ))}
        </div>

        <div className="flex gap-1 shrink-0 rounded-lg p-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
          {([['cards', LayoutGrid, t('projects', 'viewCards')], ['table', List, t('projects', 'viewTable')]] as const).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => changeView(mode)}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
              style={{
                background: viewMode === mode ? 'var(--dash-accent-bg)' : 'transparent',
                color: viewMode === mode ? 'var(--accent-cyan)' : 'var(--text-muted)',
              }}
              title={label}
              aria-pressed={viewMode === mode}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="dash-panel p-8 sm:p-12 text-center">
          <Rocket className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-medium mb-1">
            {searchQuery || filterStatus !== 'all' ? t('projects', 'noProjectsFound') : t('projects', 'noProjectsYet')}
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery || filterStatus !== 'all' ? t('projects', 'adjustCriteria') : t('projects', 'createProjectDesc')}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link href="/dashboard/projects/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              {t('projects', 'createProject')}
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        renderTable()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => {
            const accent = PROJECT_STATUS_COLORS[project.status] ?? 'var(--text-muted)';
            return (
              <div
                key={project.id}
                className="relative dash-panel p-5 group transition-colors hover:border-[var(--border-default)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${accent}14` }}
                    >
                      <GitBranch className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-medium truncate text-sm group-hover:text-[var(--accent-cyan)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: accent, boxShadow: `0 0 4px ${accent}` }}
                        />
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openDropdown === project.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div
                          className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl shadow-xl z-20"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border-md)',
                          }}
                        >
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                          >
                            <Settings className="w-3.5 h-3.5" />
                            {t('common', 'settings')}
                          </Link>
                          {project.productionUrl && (
                            <a
                              href={project.productionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t('projects', 'visitSite')}
                            </a>
                          )}
                          <div className="my-1 mx-3" style={{ height: 1, background: 'var(--glass-divider-md)' }} />
                          {project.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(project.id, 'paused')}
                              className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                            >
                              <Pause className="w-3.5 h-3.5" />
                              {t('projects', 'pause')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(project.id, 'active')}
                              className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                            >
                              <Play className="w-3.5 h-3.5" />
                              {t('projects', 'resume')}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(project)}
                            className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left"
                            style={{ color: 'var(--status-error)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('common', 'delete')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p
                    className="text-xs mb-3 line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {project.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {project.framework && (
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ background: 'var(--bg-tertiary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {project.framework}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(project.updatedAt, t)}
                  </span>
                </div>

                {/* Production URL */}
                {project.productionUrl && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                        {project.productionUrl.replace('https://', '')}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-auto shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
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
