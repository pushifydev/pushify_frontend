'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
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
import { useProjects, useDeleteProject, useTranslation } from '@/hooks';
import { formatTimeAgo } from '@/lib/formatters';
import { PROJECT_STATUS_COLORS } from '@/lib/constants';
import type { Project, ProjectStatus } from '@/lib/api';

type FilterStatus = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleStatusChange = async (projectId: string, status: ProjectStatus) => {
    const { projectsService } = await import('@/lib/api');
    await projectsService.updateStatus(projectId, status);
    setOpenDropdown(null);
    window.location.reload();
  };

  const handleDelete = async (projectId: string) => {
    if (confirm(t('projects', 'deleteConfirm'))) {
      deleteProject.mutate(projectId);
    }
    setOpenDropdown(null);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">

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
            className="input pl-9"
          />
        </div>

        <div className="flex gap-1.5">
          {(['all', 'active', 'paused', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: filterStatus === s ? 'rgba(34,211,238,0.1)' : 'var(--bg-secondary)',
                color: filterStatus === s ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: filterStatus === s ? '1px solid rgba(34,211,238,0.25)' : '1px solid var(--glass-border)',
              }}
            >
              {s === 'all' ? t('projects', 'allStatus') : t('projects', s as 'active' | 'paused' | 'inactive')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => {
            const accent = PROJECT_STATUS_COLORS[project.status] ?? '#52525e';
            return (
              <div
                key={project.id}
                className="relative rounded-xl p-5 group transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderWidth: '2px 1px 1px 1px',
                  borderStyle: 'solid',
                  borderColor: `${accent}50 var(--glass-border) var(--glass-border) var(--glass-border)`,
                  borderRadius: 12,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${accent}70 var(--glass-border-strong) var(--glass-border-strong) var(--glass-border-strong)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${accent}50 var(--glass-border) var(--glass-border) var(--glass-border)`;
                }}
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
                            onClick={() => handleDelete(project.id)}
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
    </div>
  );
}
