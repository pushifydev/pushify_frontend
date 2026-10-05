import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

vi.mock('@/lib/get-request-locale', () => ({ getRequestLocale: () => 'en' }));

// Minimal browser-ish globals: the API client only touches window/localStorage.
const storage = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
});

const { api, setTokens, getAccessToken, getRefreshToken } = await import('@/lib/api/client');
const { useAuthStore } = await import('./auth');

type Reply = { status: number; data?: unknown } | 'network-error';

function adapter(reply: (config: InternalAxiosRequestConfig) => Reply): AxiosAdapter {
  return (config) => {
    const r = reply(config);
    if (r === 'network-error') {
      return Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config));
    }
    const response = { data: r.data ?? {}, status: r.status, statusText: String(r.status), headers: {}, config };
    if (r.status >= 400) {
      return Promise.reject(new AxiosError(`HTTP ${r.status}`, String(r.status), config, undefined, response));
    }
    return Promise.resolve(response);
  };
}

const user = { id: 'u1', email: 'a@b.c', name: 'A' };
const originalApiAdapter = api.defaults.adapter;
const originalAxiosAdapter = axios.defaults.adapter;

beforeEach(() => {
  storage.clear();
  setTokens('access', 'refresh');
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true, error: null });
  // The refresh endpoint goes through the global axios instance
  axios.defaults.adapter = adapter(() => ({ status: 401 }));
});

afterEach(() => {
  api.defaults.adapter = originalApiAdapter;
  axios.defaults.adapter = originalAxiosAdapter;
});

describe('checkAuth', () => {
  it('authenticates when /auth/me succeeds', async () => {
    api.defaults.adapter = adapter(() => ({ status: 200, data: { data: user } }));
    await useAuthStore.getState().checkAuth();
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user).toEqual(user);
    expect(s.isLoading).toBe(false);
  });

  it('keeps the tokens on a network error', async () => {
    api.defaults.adapter = adapter(() => 'network-error');
    await useAuthStore.getState().checkAuth();
    const s = useAuthStore.getState();
    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
    expect(s.isAuthenticated).toBe(false);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeTruthy();
  });

  it('keeps the tokens on a 5xx', async () => {
    api.defaults.adapter = adapter(() => ({ status: 502 }));
    await useAuthStore.getState().checkAuth();
    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
    expect(useAuthStore.getState().error).toBeTruthy();
  });

  it('keeps an already-authenticated session on a transient error', async () => {
    useAuthStore.setState({ user: user as never, isAuthenticated: true });
    api.defaults.adapter = adapter(() => ({ status: 503 }));
    await useAuthStore.getState().checkAuth();
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user).toEqual(user);
  });

  it('clears the tokens on 401', async () => {
    api.defaults.adapter = adapter(() => ({
      status: 401,
      data: { error: { code: 'UNAUTHORIZED', message: 'nope' } },
    }));
    await useAuthStore.getState().checkAuth();
    const s = useAuthStore.getState();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.user).toBeNull();
  });

  it('clears the tokens on 403', async () => {
    api.defaults.adapter = adapter(() => ({ status: 403 }));
    await useAuthStore.getState().checkAuth();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
