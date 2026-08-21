'use client';

import type { StudioColumnDefinition, StudioTypeInfo } from '@/lib/api';
import type { T } from './_shared';

export type DraftColumn = StudioColumnDefinition;

/** The default first column of a new table: an auto-incrementing primary key. */
export function defaultIdColumn(types: StudioTypeInfo[]): DraftColumn {
  const intType = types.find((type) => type.autoIncrementable)?.name ?? types[0]?.name ?? 'integer';
  return {
    name: 'id',
    type: intType,
    nullable: false,
    primaryKey: true,
    autoIncrement: true,
  };
}

export function emptyColumn(types: StudioTypeInfo[]): DraftColumn {
  return {
    name: '',
    type: types.find((type) => type.name === 'text')?.name ?? types[0]?.name ?? 'text',
    nullable: true,
  };
}

/** Strip the fields the chosen type cannot carry, so the payload stays honest. */
export function normalizeColumn(column: DraftColumn, types: StudioTypeInfo[]): DraftColumn {
  const info = types.find((type) => type.name === column.type);
  return {
    name: column.name.trim(),
    type: column.type,
    length: info?.hasLength && column.length ? Number(column.length) : undefined,
    scale: info?.hasScale && column.scale ? Number(column.scale) : undefined,
    nullable: column.nullable !== false,
    primaryKey: column.primaryKey === true,
    autoIncrement: info?.autoIncrementable ? column.autoIncrement === true : false,
    unique: column.unique === true,
    defaultValue: column.defaultValue?.trim() ? column.defaultValue.trim() : undefined,
  };
}

const mono = { fontFamily: 'var(--font-jetbrains-mono), monospace' } as const;

interface ColumnFieldsProps {
  column: DraftColumn;
  types: StudioTypeInfo[];
  /** the primary-key and auto-increment toggles only make sense while creating a table */
  allowKeyFlags?: boolean;
  onChange: (patch: Partial<DraftColumn>) => void;
  t: T;
}

export function ColumnFields({
  column,
  types,
  allowKeyFlags = true,
  onChange,
  t,
}: ColumnFieldsProps) {
  const info = types.find((type) => type.name === column.type);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={column.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t('databases', 'studioColumnName')}
          className="input text-sm flex-1"
          style={{ ...mono, minWidth: 140 }}
        />

        <select
          value={column.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="input text-sm"
          style={{ ...mono, minWidth: 150 }}
        >
          {types.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>

        {info?.hasLength && (
          <input
            type="number"
            min={1}
            value={column.length ?? ''}
            onChange={(e) =>
              onChange({ length: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            placeholder={t('databases', 'studioColumnLength')}
            className="input text-sm"
            style={{ width: 96 }}
          />
        )}

        {info?.hasScale && (
          <input
            type="number"
            min={0}
            value={column.scale ?? ''}
            onChange={(e) =>
              onChange({ scale: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            placeholder={t('databases', 'studioColumnScale')}
            className="input text-sm"
            style={{ width: 90 }}
          />
        )}

        <input
          value={column.defaultValue ?? ''}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
          placeholder={t('databases', 'studioColumnDefault')}
          className="input text-sm"
          style={{ ...mono, minWidth: 150 }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {allowKeyFlags && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={column.primaryKey === true}
              onChange={(e) => onChange({ primaryKey: e.target.checked })}
              className="cursor-pointer"
            />
            {t('databases', 'studioPrimaryKey')}
          </label>
        )}

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={column.nullable !== false}
            onChange={(e) => onChange({ nullable: e.target.checked })}
            className="cursor-pointer"
          />
          {t('databases', 'studioNullable')}
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={column.unique === true}
            onChange={(e) => onChange({ unique: e.target.checked })}
            className="cursor-pointer"
          />
          {t('databases', 'studioUnique')}
        </label>

        {allowKeyFlags && info?.autoIncrementable && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={column.autoIncrement === true}
              onChange={(e) => onChange({ autoIncrement: e.target.checked })}
              className="cursor-pointer"
            />
            {t('databases', 'studioAutoIncrement')}
          </label>
        )}
      </div>
    </div>
  );
}
