import type { useTranslation } from '@/hooks';

export type T = ReturnType<typeof useTranslation>['t'];

export const panelStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass-border)',
  borderRadius: 12,
} as const;
