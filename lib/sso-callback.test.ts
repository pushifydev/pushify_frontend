import { describe, expect, it } from 'vitest';
import { readSsoCallbackParams, stripSsoCallbackParams } from './sso-callback';

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
