/**
 * Canonical form of a CLI login code: case, hyphens and whitespace are ignored so
 * `abcd-1234`, `ABCD 1234` and `ABCD1234` all compare equal.
 */
export function normalizeCliAuthCode(raw: string | null | undefined): string {
  return (raw ?? '').replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Device-code phishing guard (RFC 8628 §5.4): the /cli/auth page never shows the code from the
 * URL, so the user has to type the code their own terminal printed. Approval is only allowed when
 * that typed code matches the one in the link — a link someone else sent carries their code.
 */
export function cliAuthCodeMatches(
  urlCode: string | null | undefined,
  typedCode: string | null | undefined
): boolean {
  const expected = normalizeCliAuthCode(urlCode);
  if (!expected) return false;
  return normalizeCliAuthCode(typedCode) === expected;
}
