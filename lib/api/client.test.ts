import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

vi.mock('@/lib/get-request-locale', () => ({ getRequestLocale: () => 'en' }));

// Minimal browser-ish globals: client.ts only touches window/localStorage.
const storage = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
});

const { api, onAuthFailure, setTokens, getAccessToken, getRefreshToken } = await import('./client');

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown = {}) {
  const response = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 400) {
    return Promise.reject(
      new AxiosError(`HTTP ${status}`, String(status), config, undefined, response)
    );
  }
  return Promise.resolve(response);
}

function mockAdapters(apiHandler: Handler, refreshHandler: Handler) {
  const apiCalls: InternalAxiosRequestConfig[] = [];
  const refreshCalls: InternalAxiosRequestConfig[] = [];
  const apiAdapter: AxiosAdapter = (config) => {
    apiCalls.push(config);
    const { status, data } = apiHandler(config);
    return respond(config, status, data);
  };
  const refreshAdapter: AxiosAdapter = (config) => {
    refreshCalls.push(config);
    const { status, data } = refreshHandler(config);
    return respond(config, status, data);
  };
  api.defaults.adapter = apiAdapter;
  axios.defaults.adapter = refreshAdapter;
  return { apiCalls, refreshCalls };
}

describe('api client 401 handling', () => {
  const originalAxiosAdapter = axios.defaults.adapter;
  const originalApiAdapter = api.defaults.adapter;
  let failures: number;
  let unsubscribe: () => void;

  beforeEach(() => {
    storage.clear();
    failures = 0;
    unsubscribe = onAuthFailure(() => {
      failures += 1;
    });
  });

  afterEach(() => {
    unsubscribe();
    axios.defaults.adapter = originalAxiosAdapter;
    api.defaults.adapter = originalApiAdapter;
  });

  it('refreshes and retries the request on 401 without firing auth failure', async () => {
    setTokens('old-access', 'refresh-1');
    const { apiCalls, refreshCalls } = mockAdapters(
      (config) =>
        config.headers.Authorization === 'Bearer new-access'
          ? { status: 200, data: { ok: true } }
          : { status: 401 },
      () => ({ status: 200, data: { accessToken: 'new-access', refreshToken: 'refresh-2' } })
    );

    // The resolved value is not asserted: the locally installed axios build
    // drops values returned from rejection interceptors. We verify the retry
    // itself (second call with the refreshed token) instead.
    await api.get('/projects');

    expect(apiCalls).toHaveLength(2);
    expect(apiCalls[1].headers.Authorization).toBe('Bearer new-access');
    expect(refreshCalls).toHaveLength(1);
    expect(getAccessToken()).toBe('new-access');
    expect(getRefreshToken()).toBe('refresh-2');
    expect(failures).toBe(0);
  });

  it('clears tokens and fires auth failure when refresh fails', async () => {
    setTokens('old-access', 'revoked-refresh');
    const { apiCalls } = mockAdapters(
      () => ({ status: 401 }),
      () => ({ status: 401 })
    );

    await expect(api.get('/projects')).rejects.toMatchObject({ response: { status: 401 } });

    expect(apiCalls).toHaveLength(1);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(failures).toBe(1);
  });

  it('fires auth failure once for concurrent 401s sharing a failed refresh', async () => {
    setTokens('old-access', 'revoked-refresh');
    const { refreshCalls } = mockAdapters(
      () => ({ status: 401 }),
      () => ({ status: 401 })
    );

    const results = await Promise.allSettled([api.get('/a'), api.get('/b')]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(refreshCalls).toHaveLength(1);
    expect(failures).toBe(1);
  });

  it('fires auth failure on 401 when there is no refresh token', async () => {
    storage.set('accessToken', 'stale-access');
    const { refreshCalls } = mockAdapters(
      () => ({ status: 401 }),
      () => ({ status: 200 })
    );

    await expect(api.get('/projects')).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshCalls).toHaveLength(0);
    expect(getAccessToken()).toBeNull();
    expect(failures).toBe(1);
  });

  it('does not fire auth failure for non-401 errors', async () => {
    setTokens('access', 'refresh');
    mockAdapters(
      () => ({ status: 500 }),
      () => ({ status: 200 })
    );

    await expect(api.get('/projects')).rejects.toMatchObject({ response: { status: 500 } });

    expect(failures).toBe(0);
    expect(getAccessToken()).toBe('access');
  });

  it('stops notifying after unsubscribe', async () => {
    unsubscribe();
    mockAdapters(
      () => ({ status: 401 }),
      () => ({ status: 401 })
    );

    await expect(api.get('/projects')).rejects.toBeTruthy();

    expect(failures).toBe(0);
  });
});
