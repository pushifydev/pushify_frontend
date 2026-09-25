import type { useTranslation } from '@/hooks';

export type T = ReturnType<typeof useTranslation>['t'];

export type Tone = 'success' | 'warning' | 'error' | 'neutral';

/** Colour only for real status: live is green, in-flight is amber, broken is red. */
export function databaseTone(status: string): Tone {
  if (status === 'running') return 'success';
  if (status === 'provisioning' || status === 'deleting') return 'warning';
  if (status === 'error') return 'error';
  return 'neutral';
}

export function backupTone(status: string): Tone {
  if (status === 'completed' || status === 'restored') return 'success';
  if (status === 'creating' || status === 'restoring') return 'warning';
  if (status === 'failed') return 'error';
  return 'neutral';
}

/** Square icon-only action inside a row; hover overlay + visible focus ring. */
export const iconButtonClass =
  'w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ' +
  'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay-md)] ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-1 ' +
  'disabled:opacity-40 disabled:pointer-events-none';
