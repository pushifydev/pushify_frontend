'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Checkbox } from '@/components/Checkbox';
import type { EnvVariable } from './types';

/** One KEY = value line of the wizard's variables list (a hairline row). */
export function EnvVariableRow({
  env,
  onUpdate,
  onRemove,
}: {
  env: EnvVariable;
  onUpdate: (field: keyof EnvVariable, value: string | boolean) => void;
  onRemove: () => void;
}) {
  const [showValue, setShowValue] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="dash-row flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <input
        type="text"
        value={env.key}
        onChange={(e) => onUpdate('key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
        placeholder="KEY_NAME"
        aria-label="Key"
        className="input terminal-text text-[13px] sm:flex-1 min-w-0"
      />
      <span className="hidden sm:inline terminal-text text-[var(--text-muted)]" aria-hidden>=</span>
      <div className="sm:flex-1 relative min-w-0">
        <input
          type={showValue ? 'text' : 'password'}
          value={env.value}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="value"
          aria-label="Value"
          className="input terminal-text text-[13px] pr-10!"
        />
        <button
          type="button"
          onClick={() => setShowValue(!showValue)}
          aria-label={showValue ? 'Hide value' : 'Show value'}
          className="absolute right-2 top-1/2 -translate-y-1/2 dash-icon-action"
        >
          {showValue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
        <Checkbox
          checked={env.isSecret}
          onChange={(checked) => onUpdate('isSecret', checked)}
          label={t('newProject', 'secret')}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('common', 'delete')}
          title={t('common', 'delete')}
          className="dash-icon-action hover:!text-[var(--status-error)]"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
