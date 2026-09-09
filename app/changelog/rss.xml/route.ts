import { getChangelogEntries, SOURCES } from '../shared';

// Same hourly cadence as the changelog page itself.
export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const entries = (await getChangelogEntries()).slice(0, 50);
  const base = 'https://pushify.dev';
  const sourceLabel = (key: string) => SOURCES.find((s) => s.key === key)?.label ?? key;

  const items = entries
    .map((e) => {
      const body = e.sections
        .map((s) => `${s.title}:\n${s.items.map((i) => `• ${i}`).join('\n')}`)
        .join('\n\n');
      return `    <item>
      <title>${escapeXml(`${sourceLabel(e.source)} ${e.version}`)}</title>
      <link>${base}/changelog</link>
      <guid isPermaLink="false">${escapeXml(`${e.source}-${e.version}`)}</guid>
      <pubDate>${new Date(`${e.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(body)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pushify Changelog</title>
    <link>${base}/changelog</link>
    <atom:link href="${base}/changelog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Every Pushify release — platform, API and dashboard.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
