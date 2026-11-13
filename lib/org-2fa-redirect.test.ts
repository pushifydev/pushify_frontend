import { describe, expect, it } from 'vitest';
import { ORG_2FA_REASON, ORG_2FA_SETUP_PATH, orgTwoFactorRedirectTarget } from './org-2fa-redirect';

describe('orgTwoFactorRedirectTarget', () => {
  it('sends the user to the 2FA setup with the explanation flag', () => {
    expect(orgTwoFactorRedirectTarget('/dashboard/projects', '')).toBe(ORG_2FA_SETUP_PATH);
    expect(ORG_2FA_SETUP_PATH).toBe(`/dashboard/settings?tab=security&reason=${ORG_2FA_REASON}`);
  });

  it('redirects from other settings tabs to the security tab', () => {
    expect(orgTwoFactorRedirectTarget('/dashboard/settings', '?tab=profile')).toBe(ORG_2FA_SETUP_PATH);
    expect(orgTwoFactorRedirectTarget('/dashboard/settings', '')).toBe(ORG_2FA_SETUP_PATH);
  });

  it('stays put on the 2FA setup page so refused requests there cannot loop', () => {
    expect(orgTwoFactorRedirectTarget('/dashboard/settings', '?tab=security')).toBeNull();
    expect(orgTwoFactorRedirectTarget('/dashboard/settings', `?tab=security&reason=${ORG_2FA_REASON}`)).toBeNull();
    expect(orgTwoFactorRedirectTarget('/dashboard/settings/', '?reason=org-2fa&tab=security')).toBeNull();
  });

  it('is stable: following the target never produces another redirect', () => {
    const target = orgTwoFactorRedirectTarget('/dashboard', '')!;
    const url = new URL(target, 'https://pushify.invalid');
    expect(orgTwoFactorRedirectTarget(url.pathname, url.search)).toBeNull();
  });
});
