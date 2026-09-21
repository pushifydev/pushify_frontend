import { describe, it, expect } from 'vitest';
import { dnsRecordName, registrableDomain, wwwTwin } from './dns-record';

describe('dnsRecordName', () => {
  it('is @ for the apex — "yeliapp" here made people create yeliapp.yeliapp.com', () => {
    expect(dnsRecordName('yeliapp.com')).toBe('@');
    expect(dnsRecordName('yeliapp.com.tr')).toBe('@');
    expect(dnsRecordName('example.co.uk')).toBe('@');
  });

  it('is the subdomain part otherwise', () => {
    expect(dnsRecordName('www.yeliapp.com')).toBe('www');
    expect(dnsRecordName('app.staging.yeliapp.com')).toBe('app.staging');
    expect(dnsRecordName('www.yeliapp.com.tr')).toBe('www');
  });
});

describe('registrableDomain', () => {
  it('knows common two-part suffixes', () => {
    expect(registrableDomain('shop.yeliapp.com.tr')).toBe('yeliapp.com.tr');
    expect(registrableDomain('shop.yeliapp.com')).toBe('yeliapp.com');
  });
});

describe('wwwTwin', () => {
  it('pairs the apex with www, both ways', () => {
    expect(wwwTwin('yeliapp.com')).toBe('www.yeliapp.com');
    expect(wwwTwin('www.yeliapp.com')).toBe('yeliapp.com');
    expect(wwwTwin('yeliapp.com.tr')).toBe('www.yeliapp.com.tr');
  });

  it('has no twin for other subdomains', () => {
    expect(wwwTwin('app.yeliapp.com')).toBeNull();
  });
});
