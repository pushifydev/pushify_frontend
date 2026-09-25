import { describe, expect, it } from 'vitest';
import { isMarketingPath } from './marketing-routes';

describe('isMarketingPath', () => {
  it('covers the public site', () => {
    for (const p of ['/', '/pricing', '/features', '/vs/vercel', '/blog', '/blog/some-post', '/docs', '/changelog/archive/2', '/deploy/nextjs', '/apps/abc', '/privacy']) {
      expect(isMarketingPath(p), p).toBe(true);
    }
  });
  it('leaves the product alone', () => {
    for (const p of ['/dashboard', '/dashboard/sites', '/login', '/register', '/new', '/admin', '/verify-email', '/reset-password', '/cli/auth', '/deployments', '/vsx']) {
      expect(isMarketingPath(p), p).toBe(false);
    }
  });
});
