'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { SettingsSection, SettingsField } from '@/components/dashboard/SettingsParts';
import { useTranslation } from '@/hooks';
import { FRAMEWORKS } from '@/lib/frameworks';
import type { Server as ServerType } from '@/lib/api';
import { Select } from '@/components/ui/select';

interface ConfigureStepProps {
  projectName: string;
  setProjectName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedFramework: string | null;
  setSelectedFramework: (value: string | null) => void;
  rootDirectory: string;
  setRootDirectory: (value: string) => void;
  installCommand: string;
  setInstallCommand: (value: string) => void;
  buildCommand: string;
  setBuildCommand: (value: string) => void;
  outputDirectory: string;
  setOutputDirectory: (value: string) => void;
  startCommand: string;
  setStartCommand: (value: string) => void;
  port: number | undefined;
  setPort: (value: number | undefined) => void;
  isLoadingServers: boolean;
  availableServers: ServerType[];
  selectedServerId: string | undefined;
  setSelectedServerId: (value: string | undefined) => void;
}

export function ConfigureStep({
  projectName,
  setProjectName,
  description,
  setDescription,
  selectedFramework,
  setSelectedFramework,
  rootDirectory,
  setRootDirectory,
  installCommand,
  setInstallCommand,
  buildCommand,
  setBuildCommand,
  outputDirectory,
  setOutputDirectory,
  startCommand,
  setStartCommand,
  port,
  setPort,
  isLoadingServers,
  availableServers,
  selectedServerId,
  setSelectedServerId,
}: ConfigureStepProps) {
  const { t } = useTranslation();

  const buildFields: {
    id: string;
    label: string;
    value: string;
    set: (v: string) => void;
    placeholder: string;
  }[] = [
    { id: 'np-root', label: t('newProject', 'rootDirectory'), value: rootDirectory, set: setRootDirectory, placeholder: './' },
    { id: 'np-install', label: t('newProject', 'installCommand'), value: installCommand, set: setInstallCommand, placeholder: 'npm install' },
    { id: 'np-build', label: t('newProject', 'buildCommand'), value: buildCommand, set: setBuildCommand, placeholder: 'npm run build' },
    { id: 'np-output', label: t('newProject', 'outputDirectory'), value: outputDirectory, set: setOutputDirectory, placeholder: 'dist' },
    { id: 'np-start', label: t('newProject', 'startCommand'), value: startCommand, set: setStartCommand, placeholder: 'npm start' },
  ];

  return (
    <div className="dash-settings-stack">
      <SettingsSection
        id="np-project"
        title={t('newProject', 'configureProject')}
        description={t('newProject', 'configureProjectDesc')}
      >
        <SettingsField
          label={<>{t('newProject', 'projectName')} *</>}
          hint={t('newProject', 'projectNameHint')}
          htmlFor="np-name"
        >
          <input
            id="np-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-awesome-project"
            className="input terminal-text"
            required
          />
        </SettingsField>
        <SettingsField label={t('newProject', 'description')} htmlFor="np-description">
          <input
            id="np-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('newProject', 'descriptionPlaceholder')}
            className="input"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection id="np-framework" title={<>{t('newProject', 'framework')} *</>} padded>
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
          role="radiogroup"
          aria-label={t('newProject', 'framework')}
        >
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              type="button"
              role="radio"
              aria-checked={selectedFramework === fw.id}
              onClick={() => setSelectedFramework(fw.id)}
              className="dash-option !flex-col !items-center !gap-1.5 !p-3 text-center"
            >
              <span className="text-xl leading-none" aria-hidden>{fw.icon}</span>
              <span className="text-xs font-medium text-[var(--text-primary)]">{fw.name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection id="np-build" title={t('newProject', 'buildSettings')}>
        {buildFields.map((f) => (
          <SettingsField key={f.id} label={f.label} htmlFor={f.id}>
            <input
              id={f.id}
              type="text"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.placeholder}
              className="input terminal-text"
            />
          </SettingsField>
        ))}
        <SettingsField label={t('newProject', 'port')} htmlFor="np-port">
          <input
            id="np-port"
            type="number"
            value={port || ''}
            onChange={(e) => setPort(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="3000"
            className="input terminal-text max-w-[10rem]"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        id="np-server"
        title={t('newProject', 'deploymentServer')}
        description={t('newProject', 'deploymentServerDesc')}
        padded={isLoadingServers || availableServers.length === 0}
      >
        {isLoadingServers ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('newProject', 'loadingServers')}
          </div>
        ) : availableServers.length === 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-secondary)]">{t('newProject', 'noServersAvailable')}</p>
            <Link href="/dashboard/servers" className="btn btn-secondary btn-sm shrink-0 self-start sm:self-auto">
              {t('newProject', 'createServerLink')}
            </Link>
          </div>
        ) : (
          <SettingsField
            label={t('newProject', 'deploymentServer')}
            hint={t('newProject', 'serverSelectionHint')}
            htmlFor="np-server-select"
          >
            <Select
              id="np-server-select"
              value={selectedServerId || ''}
              onValueChange={(v) => setSelectedServerId(v || undefined)}
              className="w-full"
              options={[
                { value: '', label: t('newProject', 'noServerSelected') },
                ...availableServers.map((server) => ({
                  value: server.id,
                  label: `${server.name} (${server.ipv4 ?? ''})`,
                })),
              ]}
            />
          </SettingsField>
        )}
      </SettingsSection>
    </div>
  );
}
