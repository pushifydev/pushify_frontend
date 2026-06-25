'use client';

import Link from 'next/link';
import { Loader2, Server } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { FRAMEWORKS } from '@/lib/frameworks';
import type { Server as ServerType } from '@/lib/api';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('newProject', 'configureProject')}</h2>
        <p className="text-[var(--text-secondary)]">{t('newProject', 'configureProjectDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('newProject', 'projectName')} *</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-awesome-project"
            className="input"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('newProject', 'projectNameHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('newProject', 'description')}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('newProject', 'descriptionPlaceholder')}
            className="input"
          />
        </div>
      </div>

      {/* Framework Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">{t('newProject', 'framework')} *</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setSelectedFramework(fw.id)}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                selectedFramework === fw.id
                  ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
              }`}
            >
              <span className="text-2xl mb-1 block">{fw.icon}</span>
              <span className="text-xs font-medium">{fw.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Build Settings */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-4">{t('newProject', 'buildSettings')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'rootDirectory')}</label>
            <input
              type="text"
              value={rootDirectory}
              onChange={(e) => setRootDirectory(e.target.value)}
              placeholder="./"
              className="input terminal-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'installCommand')}</label>
            <input
              type="text"
              value={installCommand}
              onChange={(e) => setInstallCommand(e.target.value)}
              placeholder="npm install"
              className="input terminal-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'buildCommand')}</label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="npm run build"
              className="input terminal-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'outputDirectory')}</label>
            <input
              type="text"
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
              placeholder="dist"
              className="input terminal-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'startCommand')}</label>
            <input
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder="npm start"
              className="input terminal-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'port')}</label>
            <input
              type="number"
              value={port || ''}
              onChange={(e) => setPort(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="3000"
              className="input terminal-text"
            />
          </div>
        </div>
      </div>

      {/* Deployment Server Selection */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-[var(--accent-cyan)]" />
          {t('newProject', 'deploymentServer')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('newProject', 'deploymentServerDesc')}
        </p>

        {isLoadingServers ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('newProject', 'loadingServers')}
          </div>
        ) : availableServers.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <p className="text-sm text-[var(--text-muted)]">
              {t('newProject', 'noServersAvailable')}
            </p>
            <Link href="/dashboard/servers" className="text-sm text-[var(--accent-cyan)] hover:underline">
              {t('newProject', 'createServerLink')}
            </Link>
          </div>
        ) : (
          <div>
            <select
              value={selectedServerId || ''}
              onChange={(e) => setSelectedServerId(e.target.value || undefined)}
              className="input w-full max-w-md"
            >
              <option value="">{t('newProject', 'noServerSelected')}</option>
              {availableServers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.ipv4})
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {t('newProject', 'serverSelectionHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
