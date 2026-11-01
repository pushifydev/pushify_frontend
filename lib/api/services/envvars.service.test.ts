import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

vi.mock('@/lib/get-request-locale', () => ({ getRequestLocale: () => 'en' }));

// Minimal browser-ish globals: the API client only touches window/localStorage.
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} });

const { api } = await import('@/lib/api/client');
const { bulkCreateEnvVars, createEnvVar } = await import('./envvars.service');

const originalAdapter = api.defaults.adapter;
afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

/** Replies with `data` and records the JSON body of every request. */
function capture(data: unknown) {
  const bodies: unknown[] = [];
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    bodies.push(JSON.parse(config.data as string));
    return Promise.resolve({ data: { data }, status: 200, statusText: '200', headers: {}, config });
  };
  api.defaults.adapter = adapter;
  return bodies;
}

describe('env var secrecy default', () => {
  it('marks a single variable secret unless told otherwise', async () => {
    const bodies = capture({});
    await createEnvVar('p1', { key: 'A', value: '1' });
    expect(bodies[0]).toMatchObject({ key: 'A', isSecret: true });
  });

  it('marks pasted variables secret too, matching the single-variable path', async () => {
    const bodies = capture([]);
    await bulkCreateEnvVars('p1', [
      { key: 'A', value: '1' },
      { key: 'B', value: '2', isSecret: false },
    ]);
    expect(bodies[0]).toEqual({
      variables: [
        { key: 'A', value: '1', isSecret: true },
        { key: 'B', value: '2', isSecret: false },
      ],
    });
  });
});
