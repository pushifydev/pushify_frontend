import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isExpectedSsoCallback,
  readSsoCallbackParams,
  rememberSsoStart,
  SSO_PENDING_KEY,
  SSO_PENDING_MAX_AGE_MS,
  stripSsoCallbackParams,
  takeSsoStart,
} from './sso-callback';

describe('isExpectedSsoCallback', () => {
  const now = 1_800_000_000_000;

  it('refuses a callback this tab never started (login CSRF)', () => {
    expect(isExpectedSsoCallback(null, now)).toBe(false);
    expect(isExpectedSsoCallback('', now)).toBe(false);
  });

  it('accepts a recent start', () => {
    expect(isExpectedSsoCallback(String(now), now)).toBe(true);
    expect(isExpectedSsoCallback(String(now - 60_000), now)).toBe(true);
    expect(isExpectedSsoCallback(String(now - SSO_PENDING_MAX_AGE_MS), now)).toBe(true);
  });

  it('refuses a start older than ten minutes', () => {
    expect(SSO_PENDING_MAX_AGE_MS).toBe(10 * 60 * 1000);
    expect(isExpectedSsoCallback(String(now - SSO_PENDING_MAX_AGE_MS - 1), now)).toBe(false);
  });

  it('refuses a start in the future', () => {
    expect(isExpectedSsoCallback(String(now + 1), now)).toBe(false);
  });

  it('refuses a malformed marker', () => {
    for (const marker of ['abc', '1e12', '-5', ' 1', '1.5', 'NaN', 'Infinity']) {
      expect(isExpectedSsoCallback(marker, now)).toBe(false);
    }
  });
});

describe('rememberSsoStart / takeSsoStart', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips the start time and admits the callback', () => {
    rememberSsoStart(1000);
    expect(storage.get(SSO_PENDING_KEY)).toBe('1000');
    expect(isExpectedSsoCallback(takeSsoStart(), 1000 + 5_000)).toBe(true);
  });

  it('admits only one callback per start', () => {
    rememberSsoStart(1000);
    expect(takeSsoStart()).toBe('1000');
    expect(takeSsoStart()).toBeNull();
    expect(storage.has(SSO_PENDING_KEY)).toBe(false);
  });

  it('has nothing to take when no sign-in was started', () => {
    expect(takeSsoStart()).toBeNull();
  });

  it('degrades to a refused callback when storage is unavailable', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });
    expect(() => rememberSsoStart(1000)).not.toThrow();
    expect(takeSsoStart()).toBeNull();
  });
});

describe('readSsoCallbackParams', () => {
  it('reads tokens from the fragment', () => {
    expect(readSsoCallbackParams('#accessToken=a&refreshToken=r', '')).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      twoFactorToken: null,
    });
  });

  it('falls back to the query string', () => {
    expect(readSsoCallbackParams('', '?accessToken=a&refreshToken=r')).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      twoFactorToken: null,
    });
  });

  it('prefers the fragment and never mixes sources', () => {
    expect(readSsoCallbackParams('#accessToken=h', '?accessToken=q&refreshToken=q')).toEqual({
      accessToken: 'h',
      refreshToken: null,
      twoFactorToken: null,
    });
  });

  it('reads a two-factor token from either place', () => {
    expect(readSsoCallbackParams('#twoFactorToken=t', '').twoFactorToken).toBe('t');
    expect(readSsoCallbackParams('', '?twoFactorToken=t').twoFactorToken).toBe('t');
  });

  it('ignores unrelated fragments', () => {
    expect(readSsoCallbackParams('#section', '?accessToken=a&refreshToken=r').accessToken).toBe('a');
  });

  it('returns nulls when nothing is present', () => {
    expect(readSsoCallbackParams('', '')).toEqual({
      accessToken: null,
      refreshToken: null,
      twoFactorToken: null,
    });
  });
});

describe('stripSsoCallbackParams', () => {
  it('removes tokens from the fragment', () => {
    expect(stripSsoCallbackParams('/login/sso', '', '#accessToken=a&refreshToken=r')).toBe('/login/sso');
  });

  it('removes tokens from the query and keeps other params', () => {
    expect(stripSsoCallbackParams('/login/sso', '?accessToken=a&refreshToken=r&lang=tr', '')).toBe(
      '/login/sso?lang=tr'
    );
  });

  it('removes tokens from both places at once', () => {
    expect(
      stripSsoCallbackParams('/login/sso', '?refreshToken=r', '#accessToken=a&twoFactorToken=t')
    ).toBe('/login/sso');
  });

  it('returns null when there is nothing to strip', () => {
    expect(stripSsoCallbackParams('/login/sso', '?lang=tr', '')).toBeNull();
  });
});
