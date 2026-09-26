'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { formatStorage } from '@/lib/formatters';
import { RowList } from '@/components/dashboard/PageKit';
import type { ProjectMetricSnapshot } from '@/lib/api';

function level(percent: number) {
  return percent > 85 ? ' is-critical' : percent > 60 ? ' is-warning' : '';
}

/** A small usage figure for a row: mono value over a thin metric track. */
function UsageCell({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="dash-section-label text-[10px]!">{label}</span>
        <span className="terminal-text text-xs text-[var(--text-primary)] tabular-nums truncate">{value}</span>
      </div>
      <div className="dash-metric-track h-1!" aria-hidden>
        <div className={`dash-metric-fill${level(percent)}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

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
    <RowList label={t('monitoring', 'projectResources')}>
      {projects.map((project) => {
        const selected = selectedProjectId === project.projectId;
        const running = project.containerStatus === 'running';
        return (
          <div
            key={project.projectId}
            className={`dash-row relative flex flex-col gap-3 md:flex-row md:items-center md:gap-6 transition-colors ${
              selected ? 'bg-[var(--hover-overlay)]' : 'hover:bg-[var(--hover-overlay)]'
            }`}
          >
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedProjectId(selected ? null : project.projectId)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left rounded pr-24 md:pr-0"
            >
              <span className={`dash-status-dot ${running ? 'is-success' : 'is-error'}`} aria-hidden />
              <span className="min-w-0">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">{project.projectName}</span>
                  <span className="sr-only">
                    {running ? t('monitoring', 'running') : t('monitoring', 'stopped')}
                  </span>
                </span>
                <span className="block terminal-text text-[11px] text-[var(--text-muted)] truncate">{project.projectSlug}</span>
              </span>
            </button>

            <div className="grid grid-cols-3 gap-4 md:w-[26rem] shrink-0 pl-[1.125rem] md:pl-0">
              <UsageCell
                label={t('monitoring', 'cpu')}
                value={`${project.cpuPercent.toFixed(1)}%`}
                percent={project.cpuPercent}
              />
              <UsageCell
                label={t('monitoring', 'memory')}
                value={formatStorage(project.memoryUsageMB)}
                percent={project.memoryPercent}
              />
              <div className="min-w-0">
                <span className="dash-section-label text-[10px]! block mb-1">{t('monitoring', 'network')}</span>
                <span className="terminal-text text-[11px] text-[var(--text-secondary)] tabular-nums block truncate">
                  ↓{formatStorage(project.networkRxMB)} ↑{formatStorage(project.networkTxMB)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 absolute top-3 right-3 md:static">
              {!running && <span className="badge badge-error">{t('monitoring', 'stopped')}</span>}
              <Link
                href={`/dashboard/projects/${project.projectId}`}
                className="dash-icon-action"
                aria-label={`${t('monitoring', 'viewProject')}: ${project.projectName}`}
                title={t('monitoring', 'viewProject')}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </RowList>
  );
}
