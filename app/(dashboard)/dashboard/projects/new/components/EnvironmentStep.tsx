'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
import { EmptyState } from '@/components/EmptyState';
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
    <SettingsSection
      id="np-env"
      title={t('newProject', 'envVariables')}
      description={t('newProject', 'envVariablesDesc')}
      action={
        <button type="button" onClick={addEnvVariable} className="btn btn-secondary btn-sm">
          <Plus className="w-3.5 h-3.5" />
          {t('newProject', 'addEnvVariable')}
        </button>
      }
      padded={envVariables.length === 0}
    >
      {envVariables.length === 0 ? (
        <EmptyState
          variant="bare"
          title={t('newProject', 'noEnvVariables')}
          description={t('newProject', 'envVariablesLater')}
        />
      ) : (
        <div className="-mx-5">
          {envVariables.map((env) => (
            <EnvVariableRow
              key={env.id}
              env={env}
              onUpdate={(field, value) => updateEnvVariable(env.id, field, value)}
              onRemove={() => removeEnvVariable(env.id)}
            />
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
