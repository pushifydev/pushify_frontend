/**
 * An account waiting to be deleted cannot sign in; every sign-in path answers with
 * `ACCOUNT_PENDING_DELETION` and a short-lived restore token instead (SSO passes it in the URL
 * fragment). The login page picks it up from here and offers to restore the account.
 */

export interface PendingDeletion {
  scheduledFor: string;
  restoreToken: string;
}

const KEY = 'pushify:pending-deletion';

/** From an API error body: `{ code: 'ACCOUNT_PENDING_DELETION', details: { scheduledFor, restoreToken } }`. */
export function pendingDeletionFromError(error: { code?: string; details?: unknown } | null | undefined): PendingDeletion | null {
  if (!error || error.code !== 'ACCOUNT_PENDING_DELETION') return null;
  const d = error.details as Partial<PendingDeletion> | undefined;
  if (!d || typeof d.restoreToken !== 'string' || !d.restoreToken) return null;
  return { restoreToken: d.restoreToken, scheduledFor: typeof d.scheduledFor === 'string' ? d.scheduledFor : '' };
}

/** From an SSO redirect: `#restoreToken=…&scheduledFor=…`. */
export function pendingDeletionFromHash(hash: string): PendingDeletion | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const restoreToken = params.get('restoreToken');
  if (!restoreToken) return null;
  return { restoreToken, scheduledFor: params.get('scheduledFor') ?? '' };
}

export function rememberPendingDeletion(p: PendingDeletion): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: the login page falls back to a plain error */
  }
}

export function readPendingDeletion(): PendingDeletion | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingDeletion>;
    return typeof parsed.restoreToken === 'string' ? { restoreToken: parsed.restoreToken, scheduledFor: parsed.scheduledFor ?? '' } : null;
  } catch {
    return null;
  }
}

export function clearPendingDeletion(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
