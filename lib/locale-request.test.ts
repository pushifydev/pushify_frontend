import { describe, expect, it } from 'vitest';
import { isSupportedLocale, localeFromAcceptLanguage } from './locale-request';

describe('localeFromAcceptLanguage', () => {
  it('reads a region-tagged language', () => {
    expect(localeFromAcceptLanguage('tr-TR,tr;q=0.9,en-US;q=0.8')).toBe('tr');
  });

  it('follows the q-values rather than the written order', () => {
    // A browser is entitled to list a lower preference first.
    expect(localeFromAcceptLanguage('en;q=0.4,tr;q=0.9')).toBe('tr');
  });

  it('skips languages it does not have and takes the next best', () => {
    expect(localeFromAcceptLanguage('de-DE,fr;q=0.9,tr;q=0.5')).toBe('tr');
  });

  it('ignores a language the visitor explicitly refused', () => {
    // q=0 means "not acceptable"; answering in it would be the one thing they ruled out.
    expect(localeFromAcceptLanguage('tr;q=0,en;q=0.8')).toBe('en');
  });

  it('falls back to English for a header it cannot use', () => {
    expect(localeFromAcceptLanguage('de,fr,es')).toBe('en');
    expect(localeFromAcceptLanguage('')).toBe('en');
    expect(localeFromAcceptLanguage(null)).toBe('en');
    expect(localeFromAcceptLanguage('tr;q=abc')).toBe('en');
  });

  it('does not care about case or spacing', () => {
    expect(localeFromAcceptLanguage('  TR-tr ; q=1.0 , EN ; q=0.2 ')).toBe('tr');
  });
});

describe('isSupportedLocale', () => {
  it('accepts what there are dictionaries for, and nothing else', () => {
    expect(isSupportedLocale('tr')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('de')).toBe(false);
    expect(isSupportedLocale('tr-TR')).toBe(false); // a cookie holds the base tag, never a region
    expect(isSupportedLocale(null)).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });
});
