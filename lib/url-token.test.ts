import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrubUrlToken, stripUrlToken, URL_TOKEN_PARAM } from './url-token';

describe('stripUrlToken', () => {
  it('removes the token from the query string', () => {
    expect(stripUrlToken('/reset-password', '?token=abc123', '')).toBe('/reset-password');
    expect(stripUrlToken('/verify-email', 'token=abc123', '')).toBe('/verify-email');
  });

  it('keeps unrelated parameters and the fragment', () => {
    expect(
      stripUrlToken('/accept-invitation', '?utm_source=email&token=abc&lang=tr', '#top')
    ).toBe('/accept-invitation?utm_source=email&lang=tr#top');
  });

  it('removes every copy of the token', () => {
    expect(stripUrlToken('/verify-email', '?token=a&token=b', '')).toBe('/verify-email');
  });

  it('returns null when there is no token', () => {
    expect(stripUrlToken('/reset-password', '', '')).toBeNull();
    expect(stripUrlToken('/reset-password', '?utm_source=email', '#token=x')).toBeNull();
  });

  it('uses the shared parameter name', () => {
    expect(URL_TOKEN_PARAM).toBe('token');
  });
});

describe('scrubUrlToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubWindow = (search: string) => {
    const replaceState = vi.fn();
    const state = { __NA: true };
    vi.stubGlobal('window', {
      location: { pathname: '/reset-password', search, hash: '' },
      history: { state, replaceState },
    });
    return { replaceState, state };
  };

  it('replaces the URL with the scrubbed one and keeps the router state', () => {
    const { replaceState, state } = stubWindow('?token=secret&utm_source=email');
    scrubUrlToken();
    expect(replaceState).toHaveBeenCalledWith(state, '', '/reset-password?utm_source=email');
  });

  it('leaves history alone when the URL has no token', () => {
    const { replaceState } = stubWindow('?utm_source=email');
    scrubUrlToken();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('is a no-op on the server', () => {
    expect(() => scrubUrlToken()).not.toThrow();
  });
});
