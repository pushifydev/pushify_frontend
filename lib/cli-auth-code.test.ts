import { describe, expect, it } from 'vitest';
import { cliAuthCodeMatches, normalizeCliAuthCode } from './cli-auth-code';

describe('normalizeCliAuthCode', () => {
  it('ignores case, hyphens and whitespace', () => {
    expect(normalizeCliAuthCode('abcd-1234')).toBe('ABCD1234');
    expect(normalizeCliAuthCode('  AbCd 1234 ')).toBe('ABCD1234');
  });

  it('treats missing values as empty', () => {
    expect(normalizeCliAuthCode(null)).toBe('');
    expect(normalizeCliAuthCode(undefined)).toBe('');
  });
});

describe('cliAuthCodeMatches', () => {
  it('accepts the code the terminal printed, however it was typed', () => {
    expect(cliAuthCodeMatches('ABCD-1234', 'ABCD-1234')).toBe(true);
    expect(cliAuthCodeMatches('ABCD-1234', 'abcd1234')).toBe(true);
    expect(cliAuthCodeMatches('abcd1234', 'ABCD-1234')).toBe(true);
    expect(cliAuthCodeMatches('ABCD-1234', ' abcd - 1234 ')).toBe(true);
  });

  it('refuses a different code (link sent by someone else)', () => {
    expect(cliAuthCodeMatches('ABCD-1234', 'WXYZ-9876')).toBe(false);
    expect(cliAuthCodeMatches('ABCD-1234', 'ABCD-123')).toBe(false);
    expect(cliAuthCodeMatches('ABCD-1234', 'ABCD-12345')).toBe(false);
  });

  it('refuses while nothing has been typed yet', () => {
    expect(cliAuthCodeMatches('ABCD-1234', '')).toBe(false);
    expect(cliAuthCodeMatches('ABCD-1234', '  -  ')).toBe(false);
    expect(cliAuthCodeMatches('ABCD-1234', null)).toBe(false);
  });

  it('never matches when the link has no usable code', () => {
    expect(cliAuthCodeMatches(null, '')).toBe(false);
    expect(cliAuthCodeMatches('', '')).toBe(false);
    expect(cliAuthCodeMatches('--', '')).toBe(false);
    expect(cliAuthCodeMatches(undefined, undefined)).toBe(false);
  });
});
