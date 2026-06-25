'use client';

import { Plus, Terminal } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { EnvVariableRow } from './EnvVariableRow';
import type { EnvVariable } from './types';

interface EnvironmentStepProps {
  envVariables: EnvVariable[];
  addEnvVariable: () => void;
  updateEnvVariable: (id: string, field: keyof EnvVariable, value: string | boolean) => void;
  removeEnvVariable: (id: string) => void;
}

export function EnvironmentStep({
  envVariables,
  addEnvVariable,
  updateEnvVariable,
  removeEnvVariable,
}: EnvironmentStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('newProject', 'envVariables')}</h2>
        <p className="text-[var(--text-secondary)]">{t('newProject', 'envVariablesDesc')}</p>
      </div>

      <div className="space-y-3">
        {envVariables.map((env) => (
          <EnvVariableRow
            key={env.id}
            env={env}
            onUpdate={(field, value) => updateEnvVariable(env.id, field, value)}
            onRemove={() => removeEnvVariable(env.id)}
          />
        ))}

        <button
          onClick={addEnvVariable}
          className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-cyan)] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('newProject', 'addEnvVariable')}
        </button>
      </div>

      {envVariables.length === 0 && (
        <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
          <Terminal className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">{t('newProject', 'noEnvVariables')}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('newProject', 'envVariablesLater')}</p>
        </div>
      )}
    </div>
  );
}
