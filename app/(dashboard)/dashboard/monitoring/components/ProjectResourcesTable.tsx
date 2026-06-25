'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { formatStorage } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';
import type { ProjectMetricSnapshot } from '@/lib/api';

export function ProjectResourcesTable({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  t,
}: {
  projects: ProjectMetricSnapshot[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold">{t('monitoring', 'projectResources')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                {t('monitoring', 'project')}
              </th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                {t('monitoring', 'cpu')}
              </th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                {t('monitoring', 'memory')}
              </th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                {t('monitoring', 'network')}
              </th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                {t('monitoring', 'status')}
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const cpuColor =
                project.cpuPercent > 85 ? 'var(--status-error)' :
                project.cpuPercent > 60 ? 'var(--status-warning)' : STATUS_COLORS.cyan;
              const memColor =
                project.memoryPercent > 85 ? 'var(--status-error)' :
                project.memoryPercent > 60 ? 'var(--status-warning)' : STATUS_COLORS.purple;

              return (
                <tr
                  key={project.projectId}
                  className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer ${
                    selectedProjectId === project.projectId ? 'bg-[var(--bg-tertiary)]' : ''
                  }`}
                  onClick={() => setSelectedProjectId(
                    selectedProjectId === project.projectId ? null : project.projectId
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent-cyan)]">
                        {project.projectName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{project.projectName}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{project.projectSlug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(project.cpuPercent, 100)}%`, backgroundColor: cpuColor }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-mono" style={{ color: cpuColor }}>
                        {project.cpuPercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(project.memoryPercent, 100)}%`, backgroundColor: memColor }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-mono" style={{ color: memColor }}>
                        {formatStorage(project.memoryUsageMB)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <ArrowDownRight className="w-3 h-3 text-[#34d399]" />
                      <span className="text-[#34d399]">{formatStorage(project.networkRxMB)}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <ArrowUpRight className="w-3 h-3 text-[#3b82f6]" />
                      <span className="text-[#3b82f6]">{formatStorage(project.networkTxMB)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`badge ${
                        project.containerStatus === 'running' ? 'badge-success' : 'badge-error'
                      }`}
                    >
                      {project.containerStatus === 'running'
                        ? t('monitoring', 'running')
                        : t('monitoring', 'stopped')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/projects/${project.projectId}`}
                      className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
