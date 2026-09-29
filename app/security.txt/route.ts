/**
 * RFC 9116 security.txt, served at /.well-known/security.txt through a rewrite (next.config.ts).
 * As public/.well-known/security.txt it answered 404 in production (from Next.js) although the
 * same build served it locally; a route does not depend on the dot-directory reaching the
 * release's public/.
 */
const BODY = `Contact: mailto:support@pushify.dev
Contact: https://github.com/pushifydev/pushify_backend/security/advisories/new
Expires: 2027-09-29T00:00:00.000Z
Preferred-Languages: en, tr
Canonical: https://pushify.dev/.well-known/security.txt
Policy: https://pushify.dev/security
`;

export const dynamic = 'force-static';

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
