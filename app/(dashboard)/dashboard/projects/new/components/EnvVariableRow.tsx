'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { Checkbox } from '@/components/Checkbox';
import type { EnvVariable } from './types';

// Environment Variable Row Component
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
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)]">
      <input
        type="text"
        value={env.key}
        onChange={(e) => onUpdate('key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
        placeholder="KEY_NAME"
        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm terminal-text"
      />
      <span className="text-[var(--text-muted)]">=</span>
      <div className="flex-1 relative">
        <input
          type={showValue ? 'text' : 'password'}
          value={env.value}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="value"
          className="w-full px-3 py-2 pr-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm terminal-text"
        />
        <button
          onClick={() => setShowValue(!showValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <Checkbox
        checked={env.isSecret}
        onChange={(checked) => onUpdate('isSecret', checked)}
        label={t('newProject', 'secret')}
      />
      <button
        onClick={onRemove}
        className="p-2 text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
