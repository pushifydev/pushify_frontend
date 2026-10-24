/**
 * What the dashboard guard should do with the current auth state, kept pure so it can be
 * unit tested.
 *
 * `checkAuth` (stores/auth.ts) clears the tokens only when the backend actually refuses the
 * session (401/403). On a network error, 5xx or 429 it keeps them and leaves
 * `isAuthenticated` false. Sending that user to /login would bounce straight back, because
 * the tokens are still there, and every round trip calls /auth/me again. So "not
 * authenticated but still holding a token" means "the server could not be reached": show a
 * retry screen and stay on the page.
 */

export type DashboardGate =
  /** checkAuth is still running */
  | 'loading'
  /** Signed in: render the dashboard */
  | 'ready'
  /** Session not refused, the server just could not be reached: offer a retry, don't redirect */
  | 'unreachable'
  /** No session (never signed in, or the backend refused it): go to /login */
  | 'login';

export interface DashboardGateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Whether an access token is still stored (`getAccessToken() !== null`) */
  hasToken: boolean;
}

export function dashboardGate({ isLoading, isAuthenticated, hasToken }: DashboardGateInput): DashboardGate {
  if (isLoading) return 'loading';
  if (isAuthenticated) return 'ready';
  return hasToken ? 'unreachable' : 'login';
}
