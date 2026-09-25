'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { StudioColumn, StudioFilter, StudioFilterOperator } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n';
import type { T } from './_shared';
import { useTranslation } from '@/hooks';

type DatabasesKey = keyof TranslationKeys['databases'];

interface FilterBarProps {
  columns: StudioColumn[];
  filters: StudioFilter[];
  onChange: (filters: StudioFilter[]) => void;
  t: T;
}

const OPERATOR_KEYS: Record<StudioFilterOperator, DatabasesKey> = {
  eq: 'studioOpEq',
  neq: 'studioOpNeq',
  gt: 'studioOpGt',
  gte: 'studioOpGte',
  lt: 'studioOpLt',
  lte: 'studioOpLte',
  contains: 'studioOpContains',
  startsWith: 'studioOpStartsWith',
  endsWith: 'studioOpEndsWith',
  isNull: 'studioOpIsNull',
  isNotNull: 'studioOpIsNotNull',
};

const OPERATORS = Object.keys(OPERATOR_KEYS) as StudioFilterOperator[];
const VALUELESS: StudioFilterOperator[] = ['isNull', 'isNotNull'];

export function FilterBar({ columns, filters, onChange, t }: FilterBarProps) {
  const { locale } = useTranslation();
  const copy = locale === 'tr' ? { column: 'Sütun', operator: 'Operatör' } : { column: 'Column', operator: 'Operator' };
  const [column, setColumn] = useState(columns[0]?.name ?? '');
  const [operator, setOperator] = useState<StudioFilterOperator>('eq');
  const [value, setValue] = useState('');

  const needsValue = !VALUELESS.includes(operator);
  const activeColumn = columns.some((c) => c.name === column) ? column : (columns[0]?.name ?? '');

  const add = () => {
    if (!activeColumn) return;
    if (needsValue && value.trim() === '') return;
    onChange([
      ...filters,
      { column: activeColumn, operator, value: needsValue ? value : undefined },
    ]);
    setValue('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activeColumn}
          onChange={(e) => setColumn(e.target.value)}
          className="select w-auto! py-1.5! text-[13px]! font-mono"
          style={{ minWidth: 140 }}
          aria-label={copy.column}
        >
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as StudioFilterOperator)}
          className="select w-auto! py-1.5! text-[13px]!"
          style={{ minWidth: 130 }}
          aria-label={copy.operator}
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>
              {t('databases', OPERATOR_KEYS[op])}
            </option>
          ))}
        </select>

        {needsValue && (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder={t('databases', 'studioFilterValue')}
            aria-label={t('databases', 'studioFilterValue')}
            className="input w-auto! py-1.5! text-[13px]!"
            style={{ minWidth: 160 }}
          />
        )}

        <button type="button" onClick={add} className="btn btn-secondary btn-sm">
          <Plus className="w-3.5 h-3.5" />
          {t('databases', 'studioAddFilter')}
        </button>

        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="btn btn-ghost btn-sm"
          >
            {t('databases', 'studioClearFilters')}
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter, index) => (
            <span
              key={`${filter.column}-${filter.operator}-${index}`}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 rounded-full text-xs"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {filter.column} {t('databases', OPERATOR_KEYS[filter.operator])}
              {filter.value !== undefined ? ` ${filter.value}` : ''}
              <button
                type="button"
                onClick={() => onChange(filters.filter((_, i) => i !== index))}
                aria-label="remove filter"
                className="w-5 h-5 rounded-full inline-flex items-center justify-center hover:bg-(--hover-overlay-md) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
