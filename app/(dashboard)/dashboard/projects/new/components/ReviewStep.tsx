'use client';

import { useTranslation } from '@/hooks';
import { FRAMEWORKS } from '@/lib/frameworks';
import { SettingsSection, SettingsField, SettingsSwitch } from '@/components/dashboard/SettingsParts';
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
    <div className="dash-settings-stack">
      <SettingsSection
        id="np-review"
        title={t('newProject', 'reviewDeploy')}
        description={t('newProject', 'reviewDeployDesc')}
        padded
      >
        <p className="text-base font-medium text-[var(--text-primary)] break-words">{projectName}</p>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          {description || t('newProject', 'noDescription')}
        </p>
        <div className="mt-3">
          <div className="dash-kv">
            <span>{t('newProject', 'framework')}</span>
            <span>{FRAMEWORKS.find((f) => f.id === selectedFramework)?.name || '-'}</span>
          </div>
          <div className="dash-kv">
            <span>{t('newProject', 'branch')}</span>
            <span>{gitBranch || 'main'}</span>
          </div>
          {repositoryUrl && (
            <div className="dash-kv">
              <span>{t('newProject', 'repository')}</span>
              <span>{repositoryUrl}</span>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection id="np-review-build" title={t('newProject', 'buildConfig')} padded>
        <div className="dash-kv">
          <span>{t('newProject', 'rootDirectory')}</span>
          <span>{rootDirectory}</span>
        </div>
        <div className="dash-kv">
          <span>{t('newProject', 'installCommand')}</span>
          <span>{installCommand || '-'}</span>
        </div>
        <div className="dash-kv">
          <span>{t('newProject', 'buildCommand')}</span>
          <span>{buildCommand || '-'}</span>
        </div>
        <div className="dash-kv">
          <span>{t('newProject', 'outputDirectory')}</span>
          <span>{outputDirectory || '-'}</span>
        </div>
      </SettingsSection>

      {envVariables.length > 0 && (
        <SettingsSection
          id="np-review-env"
          title={
            <>
              {t('newProject', 'envVariables')}
              <span className="ml-2 opacity-60 tabular-nums">{envVariables.length}</span>
            </>
          }
          padded
        >
          {envVariables.map((env) => (
            <div key={env.id} className="dash-kv">
              <span className="terminal-text text-xs">{env.key}</span>
              <span>{env.isSecret ? '••••••••' : env.value}</span>
            </div>
          ))}
        </SettingsSection>
      )}

      <SettingsSection id="np-review-auto" title={t('newProject', 'autoDeploy')}>
        <SettingsField label={t('newProject', 'autoDeploy')} hint={t('newProject', 'autoDeployDesc')}>
          <div className="md:pt-1.5">
            <SettingsSwitch
              checked={autoDeploy}
              onChange={setAutoDeploy}
              label={t('newProject', 'autoDeploy')}
            />
          </div>
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
