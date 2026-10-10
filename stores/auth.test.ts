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
const { useAuthStore, onSessionEnd } = await import('./auth');
const { QueryClient } = await import('@tanstack/react-query');

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

  it('does not end the session on a transient error', async () => {
    const listener = vi.fn();
    const unsubscribe = onSessionEnd(listener);
    try {
      api.defaults.adapter = adapter(() => 'network-error');
      await useAuthStore.getState().checkAuth();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
    }
  });

  it('clears the tokens on 403', async () => {
    api.defaults.adapter = adapter(() => ({ status: 403 }));
    await useAuthStore.getState().checkAuth();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('session end clears the query cache', () => {
  // Mirrors the subscription in app/providers.tsx
  let queryClient: InstanceType<typeof QueryClient>;
  let unsubscribe: () => void;

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['projects'], [{ id: 'p1', name: "A's project" }]);
    unsubscribe = onSessionEnd(() => queryClient.clear());
  });

  afterEach(() => {
    unsubscribe();
  });

  it('on logout', async () => {
    useAuthStore.setState({ user: user as never, isAuthenticated: true });
    api.defaults.adapter = adapter(() => ({ status: 200 }));
    await useAuthStore.getState().logout();
    expect(queryClient.getQueryData(['projects'])).toBeUndefined();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('when the API client gives up on the session', async () => {
    useAuthStore.setState({ user: user as never, isAuthenticated: true });
    // Request 401s and the refresh (global axios, see beforeEach) 401s too
    api.defaults.adapter = adapter(() => ({ status: 401 }));
    await api.get('/projects').catch(() => undefined);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('when /auth/me rejects the stored token', async () => {
    api.defaults.adapter = adapter(() => ({ status: 401 }));
    await useAuthStore.getState().checkAuth();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('stops clearing after unsubscribe', async () => {
    unsubscribe();
    api.defaults.adapter = adapter(() => ({ status: 200 }));
    await useAuthStore.getState().logout();
    expect(queryClient.getQueryData(['projects'])).toBeDefined();
  });
});
