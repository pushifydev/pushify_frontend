/**
 * Product-funnel events, sent to GA4 through the `gtag` that components/Analytics.tsx loads.
 *
 * When GA isn't loaded (local dev, self-hosted builds without NEXT_PUBLIC_GA_ID, ad blockers)
 * this is a silent no-op — tracking must never break a user flow.
 */

/** Sub-steps between "verified email" and "created a project", in funnel order. */
export const FUNNEL_EVENTS = {
  /** Clicked the "Connect your repo" CTA (dashboard empty state or post-verify screen). */
  connectRepoCtaClicked: 'onboarding_connect_repo_cta_click',
  /** Started connecting GitHub (OAuth or GitHub App install). */
  githubConnectStarted: 'project_create_github_connect_start',
  /** The wizard sees a connected GitHub account / App installation. */
  githubConnected: 'project_create_github_connected',
  /** A repository was picked (GitHub, GitLab or a pasted URL). */
  repoSelected: 'project_create_repo_selected',
  /** A server was picked on the configure step. */
  serverSelected: 'project_create_server_selected',
  /** "Create & deploy" was pressed. */
  projectSubmitted: 'project_create_submit',
} as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

type EventParams = Record<string, string | number | boolean | undefined>;

type Gtag = (command: 'event', name: string, params?: EventParams) => void;

export function trackEvent(name: FunnelEvent, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', name, params);
  } catch {
    // Analytics failures are never user-facing.
  }
}
