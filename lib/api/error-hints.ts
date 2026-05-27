const DOCS_BASE = 'https://pushify.dev/docs';

/** Maps API error codes to optional documentation paths (hash anchors). */
const DOC_HINTS: Record<string, string> = {
  RATE_LIMITED: `${DOCS_BASE}?section=errors`,
  VALIDATION_ERROR: `${DOCS_BASE}?section=errors`,
  UNAUTHORIZED: `${DOCS_BASE}?section=auth`,
};

export function getDocsHintForErrorCode(code: string | undefined): string | null {
  if (!code) return null;
  return DOC_HINTS[code] ?? null;
}

export function appendDocsHint(message: string, code: string | undefined): string {
  const hint = getDocsHintForErrorCode(code);
  if (!hint) return message;
  return `${message} (${hint})`;
}
