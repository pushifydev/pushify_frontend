/**
 * Shared color and status constants used across dashboard pages.
 * Eliminates duplicated STATUS_ACCENT / roleAccents / DB_COLORS definitions.
 */

// ─── General Status Colors ───
export const STATUS_COLORS = {
  success:  '#22c55e',
  warning:  '#eab308',
  error:    '#ef4444',
  info:     '#3b82f6',
  neutral:  '#52525e',
  cyan:     '#22d3ee',
  purple:   '#a78bfa',
  orange:   '#fb923c',
  pink:     '#f87171',
  green:    '#4ade80',
} as const;

// ─── Project Status ───
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  active:   STATUS_COLORS.success,
  paused:   STATUS_COLORS.warning,
  inactive: STATUS_COLORS.neutral,
};

// ─── Server Status ───
export const SERVER_STATUS_COLORS: Record<string, string> = {
  provisioning: STATUS_COLORS.warning,
  running:      STATUS_COLORS.success,
  stopped:      STATUS_COLORS.neutral,
  rebooting:    STATUS_COLORS.cyan,
  error:        STATUS_COLORS.error,
  deleting:     STATUS_COLORS.pink,
};

// ─── Database Status ───
export const DATABASE_STATUS_COLORS: Record<string, string> = {
  provisioning: STATUS_COLORS.warning,
  running:      STATUS_COLORS.success,
  stopped:      STATUS_COLORS.neutral,
  error:        STATUS_COLORS.error,
  deleting:     STATUS_COLORS.pink,
};

// ─── Database Types ───
export const DB_TYPE_COLORS: Record<string, string> = {
  postgresql: '#336791',
  mysql:      '#00758f',
  redis:      '#dc382d',
  mongodb:    '#4db33d',
};

export const DB_TYPE_LABELS: Record<string, string> = {
  postgresql: 'PostgreSQL',
  mysql:      'MySQL',
  redis:      'Redis',
  mongodb:    'MongoDB',
};

// ─── Database Info ───
export const DB_TYPE_INFO: Record<string, { description: string; icon: string }> = {
  postgresql: { description: 'Powerful, open-source relational database', icon: '🐘' },
  mysql:      { description: 'Popular open-source relational database', icon: '🐬' },
  redis:      { description: 'In-memory data structure store', icon: '🔴' },
  mongodb:    { description: 'Document-oriented NoSQL database', icon: '🍃' },
};

// ─── Deployment Status ───
export const DEPLOYMENT_STATUS_COLORS: Record<string, string> = {
  queued:    STATUS_COLORS.neutral,
  building:  STATUS_COLORS.warning,
  deploying: STATUS_COLORS.cyan,
  ready:     STATUS_COLORS.success,
  failed:    STATUS_COLORS.error,
  cancelled: STATUS_COLORS.neutral,
};

// ─── Team Role Colors ───
export const ROLE_COLORS: Record<string, string> = {
  owner:  STATUS_COLORS.purple,
  admin:  STATUS_COLORS.cyan,
  member: STATUS_COLORS.success,
  viewer: STATUS_COLORS.neutral,
};

// ─── Activity Action Colors ───
export const ACTIVITY_ACTION_COLORS: Record<string, string> = {
  'project.created':     STATUS_COLORS.success,
  'project.updated':     STATUS_COLORS.info,
  'project.deleted':     STATUS_COLORS.error,
  'deployment.created':  STATUS_COLORS.cyan,
  'deployment.success':  STATUS_COLORS.success,
  'deployment.failed':   STATUS_COLORS.error,
  'deployment.cancelled': STATUS_COLORS.warning,
  'server.created':      STATUS_COLORS.success,
  'server.deleted':      STATUS_COLORS.error,
  'database.created':    STATUS_COLORS.success,
  'database.deleted':    STATUS_COLORS.error,
  'member.invited':      STATUS_COLORS.info,
  'member.removed':      STATUS_COLORS.error,
  'settings.updated':    STATUS_COLORS.neutral,
};

/** Get accent color for any status string, with neutral fallback */
export function getStatusColor(status: string): string {
  return (
    PROJECT_STATUS_COLORS[status] ??
    SERVER_STATUS_COLORS[status] ??
    DATABASE_STATUS_COLORS[status] ??
    DEPLOYMENT_STATUS_COLORS[status] ??
    STATUS_COLORS.neutral
  );
}
