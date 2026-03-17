/**
 * Shared formatting utilities used across dashboard pages.
 * Eliminates duplicated formatTimeAgo / formatBytes / formatDate definitions.
 */

type TranslationFn = (ns: any, key: any) => string;

/** Relative time string — e.g. "3m ago", "2h ago", uses i18n when `t` is provided */
export function formatTimeAgo(date: string, t?: TranslationFn): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (t) {
    if (seconds < 60) return t('time', 'justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t('time', 'minutesAgo')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t('time', 'hoursAgo')}`;
    const days = Math.floor(hours / 24);
    return `${days}${t('time', 'daysAgo')}`;
  }

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/** MB/GB storage display — e.g. "1.5 GB", "512 MB" */
export function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

/** Bytes display — e.g. "1.2 KB", "3.5 MB", "2 GB" */
export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx > 0 ? 1 : 0)} ${units[idx]}`;
}

/** Short date — e.g. "Mar 17, 02:30 PM" */
export function formatShortDate(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
