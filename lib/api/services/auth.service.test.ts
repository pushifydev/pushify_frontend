import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosAdapter } from 'axios';

vi.mock('@/lib/get-request-locale', () => ({ getRequestLocale: () => 'en' }));

// Minimal browser-ish globals: the API client only touches window/localStorage.
const storage = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
});

const { api, getAccessToken, getRefreshToken } = await import('@/lib/api/client');
const { githubLoginCallback, googleLoginCallback } = await import('./auth.service');

const user = { id: 'u1', email: 'a@b.c', name: 'A' };
const originalAdapter = api.defaults.adapter;

function reply(data: unknown): AxiosAdapter {
  return (config) => Promise.resolve({ data, status: 200, statusText: '200', headers: {}, config });
}

const sessionReply = { data: { user }, accessToken: 'atk', refreshToken: 'rtk' };

beforeEach(() => storage.clear());
afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe.each([
  ['github', githubLoginCallback],
  ['google', googleLoginCallback],
] as const)('%s login callback', (_name, callback) => {
  it('refuses a web session and writes no tokens when no local state exists', async () => {
    api.defaults.adapter = reply(sessionReply);
    const result = await callback('code', 'state', { requireMobileHandoff: true });
    expect(result.data).toBeUndefined();
    expect(result.error?.code).toBe('OAUTH_STATE_MISSING');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('refuses a 2FA challenge when no local state exists and no appRedirect', async () => {
    api.defaults.adapter = reply({ requiresTwoFactor: true, twoFactorToken: 'tf' });
    const result = await callback('code', 'state', { requireMobileHandoff: true });
    expect(result.data).toBeUndefined();
    expect(result.error?.code).toBe('OAUTH_STATE_MISSING');
  });

  it('still allows the mobile handoff without local state', async () => {
    api.defaults.adapter = reply({ ...sessionReply, appRedirect: 'pushify://auth' });
    const result = await callback('code', 'state', { requireMobileHandoff: true });
    expect(result.error).toBeUndefined();
    expect(result.data?.mobileHandoff).toEqual({
      appRedirect: 'pushify://auth',
      accessToken: 'atk',
      refreshToken: 'rtk',
    });
    expect(getAccessToken()).toBeNull();
  });

  it('opens a web session when the local state was verified', async () => {
    api.defaults.adapter = reply(sessionReply);
    const result = await callback('code', 'state');
    expect(result.error).toBeUndefined();
    expect(getAccessToken()).toBe('atk');
    expect(getRefreshToken()).toBe('rtk');
  });
});
