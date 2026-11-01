/**
 * Parser for the "Paste .env" form on a project's Environment tab, kept pure so it can be unit
 * tested. It reads files the way dotenv does:
 *
 * - an optional `export ` prefix;
 * - single- or double-quoted values, which may span several lines (a PEM private key);
 * - inside double quotes `\n`, `\r`, `\"` and `\\` are escapes; single quotes are literal;
 * - on an unquoted value, a `#` after whitespace starts a comment (`URL=x # note` → `x`);
 * - CRLF line endings and a UTF-8 BOM.
 *
 * Keys keep their case. A line it cannot read is never dropped or half-imported silently: it is
 * returned as a warning with its line number so the preview can list it.
 */

export interface ParsedEnvVar {
  key: string;
  value: string;
}

export type EnvParseWarningReason =
  /** not a KEY=VALUE line (e.g. the 2nd line of an unquoted multi-line value) */
  | 'invalidLine'
  /** a name the platform does not accept; the variable is skipped */
  | 'invalidKey'
  /** the opening quote is never closed; the variable is skipped */
  | 'unterminatedQuote'
  /** text after the closing quote that is not a comment; the variable is skipped */
  | 'trailingText'
  /** the key was already set on an earlier line; this later value is used (as in dotenv) */
  | 'duplicateKey';

export interface EnvParseWarning {
  /** 1-based line number in the pasted content */
  line: number;
  reason: EnvParseWarningReason;
  key?: string;
}

export interface ParsedEnv {
  vars: ParsedEnvVar[];
  warnings: EnvParseWarning[];
}

/**
 * Names the dashboard can store: uppercase letters, digits and underscores, not starting with a
 * digit. Lowercase names are reported instead of being uppercased, since the app would read a
 * different variable than the one in the file.
 */
export const ENV_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

// `[\w.-]+` is dotenv's key syntax; names outside ENV_KEY_PATTERN are reported as invalidKey.
const ASSIGNMENT = /^\s*(?:export\s+)?([\w.-]+)\s*=(.*)$/;

const DOUBLE_QUOTE_ESCAPES: Record<string, string> = { n: '\n', r: '\r', '"': '"', '\\': '\\' };

type QuotedRead =
  | { ok: true; value: string; endLine: number }
  | { ok: false; reason: 'unterminatedQuote' | 'trailingText' };

/** Reads a quoted value that starts at `lines[start]` and may continue on the following lines. */
function readQuoted(lines: string[], start: number, firstText: string): QuotedRead {
  const quote = firstText[0];
  let text = firstText.slice(1);
  let raw = '';

  for (let lineIndex = start; ; ) {
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (quote === '"' && char === '\\' && index + 1 < text.length) {
        const next = text[index + 1];
        raw += DOUBLE_QUOTE_ESCAPES[next] ?? char + next;
        index += 1;
      } else if (char === quote) {
        const after = text.slice(index + 1).trim();
        if (after && !after.startsWith('#')) return { ok: false, reason: 'trailingText' };
        return { ok: true, value: raw, endLine: lineIndex };
      } else {
        raw += char;
      }
    }

    lineIndex += 1;
    if (lineIndex >= lines.length) return { ok: false, reason: 'unterminatedQuote' };
    raw += '\n';
    text = lines[lineIndex];
  }
}

function readUnquoted(text: string): string {
  const comment = text.search(/\s#/);
  return (comment === -1 ? text : text.slice(0, comment)).trim();
}

export function parseEnvContent(content: string): ParsedEnv {
  const input = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  // A Map keeps the first position of a key while a later line replaces its value.
  const vars = new Map<string, string>();
  const warnings: EnvParseWarning[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lineIndex + 1;
    const trimmed = lines[lineIndex].trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = ASSIGNMENT.exec(lines[lineIndex]);
    if (!match) {
      warnings.push({ line, reason: 'invalidLine' });
      continue;
    }

    const key = match[1];
    const rawValue = match[2];
    const valueText = rawValue.trimStart();
    let value: string;

    if (valueText.startsWith('"') || valueText.startsWith("'")) {
      const quoted = readQuoted(lines, lineIndex, valueText);
      if (!quoted.ok) {
        // Skip only this variable; the lines after it are read normally.
        warnings.push({ line, reason: quoted.reason, key });
        continue;
      }
      value = quoted.value;
      lineIndex = quoted.endLine;
    } else {
      value = readUnquoted(rawValue);
    }

    if (!ENV_KEY_PATTERN.test(key)) {
      warnings.push({ line, reason: 'invalidKey', key });
      continue;
    }
    if (vars.has(key)) warnings.push({ line, reason: 'duplicateKey', key });
    vars.set(key, value);
  }

  return {
    vars: Array.from(vars, ([key, value]) => ({ key, value })),
    warnings,
  };
}
