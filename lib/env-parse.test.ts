import { describe, expect, it } from 'vitest';
import { parseEnvContent } from './env-parse';

const PEM = [
  '-----BEGIN PRIVATE KEY-----',
  'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7',
  'k3hY1Rm0r2Q2pYt9c8bNf6dL4uJm0HqgK2sS1vP0aB8eZ3wX9yQ',
  '-----END PRIVATE KEY-----',
].join('\n');

describe('parseEnvContent', () => {
  it('reads plain KEY=VALUE lines and skips blank lines and comments', () => {
    const { vars, warnings } = parseEnvContent('# app\nAPI_KEY=abc\n\nDATABASE_URL=postgres://u:p@h/db\n');
    expect(vars).toEqual([
      { key: 'API_KEY', value: 'abc' },
      { key: 'DATABASE_URL', value: 'postgres://u:p@h/db' },
    ]);
    expect(warnings).toEqual([]);
  });

  it('keeps a double-quoted PEM key that spans several lines intact', () => {
    const { vars, warnings } = parseEnvContent(`PRIVATE_KEY="${PEM}"\nNEXT=1`);
    expect(vars).toEqual([
      { key: 'PRIVATE_KEY', value: PEM },
      { key: 'NEXT', value: '1' },
    ]);
    expect(warnings).toEqual([]);
  });

  it('keeps a single-quoted multi-line value literally', () => {
    expect(parseEnvContent(`PRIVATE_KEY='${PEM}'`).vars).toEqual([{ key: 'PRIVATE_KEY', value: PEM }]);
  });

  it('expands \\n escapes inside double quotes only', () => {
    const escaped = PEM.split('\n').join('\\n');
    const { vars } = parseEnvContent(`DQ="${escaped}"\nSQ='a\\nb'\nRAW=a\\nb`);
    expect(vars).toEqual([
      { key: 'DQ', value: PEM },
      { key: 'SQ', value: 'a\\nb' },
      { key: 'RAW', value: 'a\\nb' },
    ]);
  });

  it('unescapes quotes and backslashes inside double quotes', () => {
    const { vars } = parseEnvContent('JSON="{\\"a\\":1}"\nPATH_WIN="C:\\\\new"\nOTHER="\\$HOME"');
    expect(vars).toEqual([
      { key: 'JSON', value: '{"a":1}' },
      { key: 'PATH_WIN', value: 'C:\\new' },
      { key: 'OTHER', value: '\\$HOME' },
    ]);
  });

  it('accepts an export prefix', () => {
    expect(parseEnvContent('export FOO=bar\n  export   BAZ="q x"').vars).toEqual([
      { key: 'FOO', value: 'bar' },
      { key: 'BAZ', value: 'q x' },
    ]);
  });

  it('cuts a " #" comment from unquoted values but keeps # inside a value', () => {
    const { vars } = parseEnvContent(
      'URL=https://x.dev # the API\nPASS=ab#cd\nHASH=#fff\nEMPTY= # nothing\nQUOTED="a # b" # note'
    );
    expect(vars).toEqual([
      { key: 'URL', value: 'https://x.dev' },
      { key: 'PASS', value: 'ab#cd' },
      { key: 'HASH', value: '#fff' },
      { key: 'EMPTY', value: '' },
      { key: 'QUOTED', value: 'a # b' },
    ]);
  });

  it('handles CRLF line endings, also inside a quoted value', () => {
    const crlf = `A=1\r\nKEY="${PEM.split('\n').join('\r\n')}"\r\nB="two"\r\n`;
    const { vars, warnings } = parseEnvContent(crlf);
    expect(vars).toEqual([
      { key: 'A', value: '1' },
      { key: 'KEY', value: PEM },
      { key: 'B', value: 'two' },
    ]);
    expect(warnings).toEqual([]);
  });

  it('keeps empty values', () => {
    expect(parseEnvContent('A=\nB=""\nC=\'\'\nD =  ').vars).toEqual([
      { key: 'A', value: '' },
      { key: 'B', value: '' },
      { key: 'C', value: '' },
      { key: 'D', value: '' },
    ]);
  });

  it('trims unquoted values and spaces around =, but not inside quotes', () => {
    expect(parseEnvContent('A =  x y  \nB=" padded "').vars).toEqual([
      { key: 'A', value: 'x y' },
      { key: 'B', value: ' padded ' },
    ]);
  });

  it('strips a UTF-8 BOM', () => {
    expect(parseEnvContent('\uFEFFFIRST=1').vars).toEqual([{ key: 'FIRST', value: '1' }]);
  });

  it('keeps key case and reports a lowercase name instead of uppercasing it', () => {
    const { vars, warnings } = parseEnvContent('foo=bar\nmy.key="a\nb"\nOK=1');
    expect(vars).toEqual([{ key: 'OK', value: '1' }]);
    expect(warnings).toEqual([
      { line: 1, reason: 'invalidKey', key: 'foo' },
      { line: 2, reason: 'invalidKey', key: 'my.key' },
    ]);
  });

  it('reports lines that are not KEY=VALUE, such as an unquoted multi-line value', () => {
    const { vars, warnings } = parseEnvContent(`KEY=${PEM}`);
    expect(vars).toEqual([{ key: 'KEY', value: '-----BEGIN PRIVATE KEY-----' }]);
    expect(warnings).toEqual([
      { line: 2, reason: 'invalidLine' },
      { line: 3, reason: 'invalidLine' },
      { line: 4, reason: 'invalidLine' },
    ]);
  });

  it('skips only the variable whose quote is never closed', () => {
    const { vars, warnings } = parseEnvContent('A=1\nKEY="-----BEGIN\nB=2');
    expect(vars).toEqual([
      { key: 'A', value: '1' },
      { key: 'B', value: '2' },
    ]);
    expect(warnings).toEqual([{ line: 2, reason: 'unterminatedQuote', key: 'KEY' }]);
  });

  it('reports text after the closing quote', () => {
    const { vars, warnings } = parseEnvContent('KEY="abc"def\nNEXT=1');
    expect(vars).toEqual([{ key: 'NEXT', value: '1' }]);
    expect(warnings).toEqual([{ line: 1, reason: 'trailingText', key: 'KEY' }]);
  });

  it('uses the later value of a repeated key, like dotenv, and says so', () => {
    const { vars, warnings } = parseEnvContent('A=1\nB=2\nA=3');
    expect(vars).toEqual([
      { key: 'A', value: '3' },
      { key: 'B', value: '2' },
    ]);
    expect(warnings).toEqual([{ line: 3, reason: 'duplicateKey', key: 'A' }]);
  });

  it('returns nothing for empty input', () => {
    expect(parseEnvContent('')).toEqual({ vars: [], warnings: [] });
    expect(parseEnvContent('\n  \n# only a comment\n')).toEqual({ vars: [], warnings: [] });
  });
});
