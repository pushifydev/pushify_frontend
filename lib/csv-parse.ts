/**
 * A small RFC 4180 CSV reader for the studio's import flow.
 *
 * Files are parsed in the browser so the user can map columns and see a preview before anything
 * is sent. It handles quoted fields, embedded commas, quotes and newlines, and both CRLF and LF.
 */

export interface ParsedCsv {
  rows: string[][];
  /** true when the file ended inside an unterminated quoted field */
  malformed: boolean;
}

export function parseCsv(text: string, delimiter = ','): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let malformed = false;

  // Strip a UTF-8 BOM; spreadsheets add one and it would end up inside the first header.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const endField = () => {
    row.push(field);
    field = '';
  };

  const endRow = () => {
    endField();
    // Ignore the trailing empty line files usually end with.
    if (row.length > 1 || row[0] !== '') rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === '') {
      inQuotes = true;
    } else if (char === delimiter) {
      endField();
    } else if (char === '\n') {
      endRow();
    } else if (char === '\r') {
      // CRLF: the newline handler takes care of the row.
      if (input[index + 1] !== '\n') endRow();
    } else {
      field += char;
    }
  }

  if (inQuotes) malformed = true;
  if (field !== '' || row.length > 0) endRow();

  return { rows, malformed };
}

/** Guess the delimiter from the header line — comma, semicolon or tab. */
export function detectDelimiter(text: string): string {
  const line = text.split('\n', 1)[0] ?? '';
  const counts: [string, number][] = [
    [',', (line.match(/,/g) ?? []).length],
    [';', (line.match(/;/g) ?? []).length],
    ['\t', (line.match(/\t/g) ?? []).length],
  ];

  const [best] = counts.sort((a, b) => b[1] - a[1]);
  return best[1] > 0 ? best[0] : ',';
}
