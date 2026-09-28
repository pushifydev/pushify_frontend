import { describe, expect, it } from 'vitest';
import { buildAuthPath, sanitizeRedirectPath } from './auth-redirect';

describe('sanitizeRedirectPath', () => {
  it.each([
    ['//evil.com'],
    ['/\t/evil.com'],
    ['/\n/evil.com'],
    ['/\r/evil.com'],
    ['\t//evil.com'],
    ['/\\evil.com'],
    ['/\u0000/evil.com'],
    ['/\u007F/evil.com'],
    ['https://evil.com'],
    ['javascript:alert(1)'],
    ['/foo?next=https://evil.com'],
    ['evil.com'],
  ])('rejects %j', (raw) => {
    expect(sanitizeRedirectPath(raw)).toBeNull();
  });

  it('rejects the decoded `%2F%09%2Fevil.com` payload from a query string', () => {
    const raw = new URLSearchParams('redirect=%2F%09%2Fevil.com').get('redirect');
    expect(sanitizeRedirectPath(raw)).toBeNull();
  });

  it.each([['/login'], ['/login?x=1'], ['/register/'], ['/verify-email/abc'], ['/dashboard/../login']])(
    'rejects auth page %j',
    (raw) => {
      expect(sanitizeRedirectPath(raw)).toBeNull();
    },
  );

  it('returns null for empty input', () => {
    expect(sanitizeRedirectPath(null)).toBeNull();
    expect(sanitizeRedirectPath(undefined)).toBeNull();
    expect(sanitizeRedirectPath('')).toBeNull();
    expect(sanitizeRedirectPath('   ')).toBeNull();
  });

  it('keeps valid same-origin paths with query and hash', () => {
    expect(sanitizeRedirectPath('/dashboard/x?y=1')).toBe('/dashboard/x?y=1');
    expect(sanitizeRedirectPath('/dashboard/x?y=1#tab')).toBe('/dashboard/x?y=1#tab');
    expect(sanitizeRedirectPath('  /dashboard  ')).toBe('/dashboard');
    expect(sanitizeRedirectPath('/')).toBe('/');
  });
});

describe('buildAuthPath', () => {
  it('drops unsafe redirects', () => {
    expect(buildAuthPath('login', '/\t/evil.com')).toBe('/login');
  });

  it('carries safe redirects', () => {
    expect(buildAuthPath('register', '/dashboard/x?y=1')).toBe(
      `/register?redirect=${encodeURIComponent('/dashboard/x?y=1')}`,
    );
  });
});
