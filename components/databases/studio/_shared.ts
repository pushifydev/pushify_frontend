import type { useTranslation } from '@/hooks';

export type T = ReturnType<typeof useTranslation>['t'];

export const panelStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass-border)',
  borderRadius: 12,
} as const;

/** Cells are JSON values; render them as the compact text a grid can show on one line. */
export function displayValue(value: unknown): { text: string; isNull: boolean } {
  if (value === null || value === undefined) return { text: 'NULL', isNull: true };
  if (typeof value === 'boolean') return { text: value ? 'true' : 'false', isNull: false };
  if (typeof value === 'object') return { text: JSON.stringify(value), isNull: false };
  return { text: String(value), isNull: false };
}

/**
 * Local identity for a row in the grid. The separator is a unit-separator symbol so composite
 * keys like ('a b', 'c') and ('a', 'b c') cannot produce the same key.
 */
export function rowKey(row: Record<string, unknown>, primaryKey: string[]): string {
  return primaryKey.map((column) => String(row[column])).join('\u241f');
}

export function pickPrimaryKey(
  row: Record<string, unknown>,
  primaryKey: string[]
): Record<string, unknown> {
  const pk: Record<string, unknown> = {};
  for (const column of primaryKey) pk[column] = row[column];
  return pk;
}
