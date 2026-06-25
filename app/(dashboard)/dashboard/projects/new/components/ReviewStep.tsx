'use client';

import { Box, FolderCode, Terminal } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { FRAMEWORKS } from '@/lib/frameworks';
import type { EnvVariable } from './types';

interface ReviewStepProps {
  projectName: string;
  description: string;
  selectedFramework: string | null;
  gitBranch: string;
  repositoryUrl: string;
  rootDirectory: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  envVariables: EnvVariable[];
  autoDeploy: boolean;
  setAutoDeploy: (value: boolean) => void;
}

export function ReviewStep({
  projectName,
  description,
  selectedFramework,
  gitBranch,
  repositoryUrl,
  rootDirectory,
  installCommand,
  buildCommand,
  outputDirectory,
  envVariables,
  autoDeploy,
  setAutoDeploy,
}: ReviewStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('newProject', 'reviewDeploy')}</h2>
        <p className="text-[var(--text-secondary)]">{t('newProject', 'reviewDeployDesc')}</p>
      </div>

      {/* Project Summary */}
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-[var(--bg-tertiary)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center">
              <Box className="w-7 h-7 text-[var(--bg-primary)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{projectName}</h3>
              <p className="text-[var(--text-muted)]">{description || t('newProject', 'noDescription')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'framework')}:</span>
              <span className="ml-2 font-medium">
                {FRAMEWORKS.find(f => f.id === selectedFramework)?.name || '-'}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'branch')}:</span>
              <span className="ml-2 font-medium terminal-text">{gitBranch || 'main'}</span>
            </div>
            {repositoryUrl && (
              <div className="col-span-2">
                <span className="text-[var(--text-muted)]">{t('newProject', 'repository')}:</span>
                <span className="ml-2 font-medium terminal-text text-[var(--accent-cyan)]">{repositoryUrl}</span>
              </div>
            )}
          </div>
        </div>

        {/* Build Configuration */}
        <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FolderCode className="w-4 h-4 text-[var(--accent-cyan)]" />
            {t('newProject', 'buildConfig')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'rootDirectory')}:</span>
              <span className="ml-2 terminal-text">{rootDirectory}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'installCommand')}:</span>
              <span className="ml-2 terminal-text">{installCommand || '-'}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'buildCommand')}:</span>
              <span className="ml-2 terminal-text">{buildCommand || '-'}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t('newProject', 'outputDirectory')}:</span>
              <span className="ml-2 terminal-text">{outputDirectory || '-'}</span>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        {envVariables.length > 0 && (
          <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--accent-purple)]" />
              {t('newProject', 'envVariables')} ({envVariables.length})
            </h4>
            <div className="space-y-2">
              {envVariables.map((env) => (
                <div key={env.id} className="flex items-center gap-2 text-sm">
                  <span className="terminal-text text-[var(--accent-cyan)]">{env.key}</span>
                  <span className="text-[var(--text-muted)]">=</span>
                  <span className="terminal-text">
                    {env.isSecret ? '••••••••' : env.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto Deploy Toggle */}
        <div className="p-5 rounded-xl border border-[var(--border-subtle)]">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <h4 className="font-semibold">{t('newProject', 'autoDeploy')}</h4>
              <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'autoDeployDesc')}</p>
            </div>
            <button
              onClick={() => setAutoDeploy(!autoDeploy)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoDeploy ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--bg-tertiary)]'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                autoDeploy ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
