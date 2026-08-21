import { describe, expect, it } from 'vitest';
import { detectDelimiter, parseCsv } from './csv-parse';

describe('parseCsv', () => {
  it('reads a plain file', () => {
    expect(parseCsv('a,b\n1,2\n3,4').rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('keeps quoted delimiters, quotes and newlines inside the field', () => {
    const { rows } = parseCsv('name,note\n"Smith, John","say ""hi"""\n"multi\nline",x');

    expect(rows[1]).toEqual(['Smith, John', 'say "hi"']);
    expect(rows[2]).toEqual(['multi\nline', 'x']);
  });

  it('handles CRLF the same as LF', () => {
    expect(parseCsv('a,b\r\n1,2\r\n').rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('preserves empty fields, which become NULL on import', () => {
    expect(parseCsv('a,b,c\n1,,3').rows[1]).toEqual(['1', '', '3']);
  });

  it('drops the trailing blank line files usually end with', () => {
    expect(parseCsv('a,b\n1,2\n').rows).toHaveLength(2);
  });

  it('strips a UTF-8 BOM so the first header is clean', () => {
    expect(parseCsv('﻿id,name\n1,a').rows[0]).toEqual(['id', 'name']);
  });

  it('flags a file that ends inside an open quote', () => {
    const result = parseCsv('a,b\n"unterminated,2');
    expect(result.malformed).toBe(true);
  });

  it('reads a different delimiter when told to', () => {
    expect(parseCsv('a;b\n1;2', ';').rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('keeps unicode intact', () => {
    expect(parseCsv('ad,not\nıçğüşö,日本語 🎉').rows[1]).toEqual(['ıçğüşö', '日本語 🎉']);
  });
});

describe('detectDelimiter', () => {
  it('picks the delimiter that appears in the header', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a\tb\tc')).toBe('\t');
  });

  it('falls back to a comma for a single-column file', () => {
    expect(detectDelimiter('name\nalice')).toBe(',');
  });
});
