import { safeStorage } from '@/lib/safe-storage';

const KEY = 'github_return_to';

/**
 * Remember where to come back to after GitHub's OAuth or App-install screens — e.g. the
 * project's Settings tab rather than always the New Project page. Only dashboard paths.
 */
export function rememberGitHubReturn(path?: string | void): void {
  if (typeof path === 'string' && path.startsWith('/dashboard')) safeStorage.set(KEY, path);
  else safeStorage.remove(KEY);
}

/** Where GitHub's flow should end, without forgetting it (for retry / back links). */
export function peekGitHubReturn(fallback: string): string {
  const value = safeStorage.get(KEY);
  return value && value.startsWith('/dashboard') ? value : fallback;
}

/** Where to go once GitHub has sent the browser back (read once). */
export function consumeGitHubReturn(fallback: string): string {
  const value = peekGitHubReturn(fallback);
  safeStorage.remove(KEY);
  return value;
}
