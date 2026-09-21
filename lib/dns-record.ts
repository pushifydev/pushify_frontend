/**
 * Second-level public suffixes people actually register under (".com.tr", ".co.uk", …). Not the
 * full public suffix list — enough that "yeliapp.com.tr" is read as an apex, not as the
 * "yeliapp" subdomain of "com.tr".
 */
const SECOND_LEVEL_SUFFIXES = new Set([
  'com.tr', 'net.tr', 'org.tr', 'gen.tr', 'web.tr', 'biz.tr', 'info.tr', 'av.tr', 'dr.tr',
  'bel.tr', 'edu.tr', 'gov.tr', 'k12.tr', 'tv.tr', 'name.tr', 'tel.tr', 'bbs.tr',
  'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'ac.uk', 'net.uk',
  'com.au', 'net.au', 'org.au', 'co.nz', 'net.nz', 'org.nz', 'co.jp', 'ne.jp', 'or.jp',
  'com.br', 'net.br', 'com.mx', 'co.za', 'com.cn', 'com.hk', 'com.sg', 'co.in', 'co.il',
  'com.ar', 'com.co', 'com.pl', 'com.ua', 'co.kr', 'com.my', 'com.ph', 'com.vn', 'com.eg',
  'com.sa', 'com.pk', 'co.id', 'co.th', 'com.cy', 'com.gr', 'com.ru', 'com.es', 'com.pt',
]);

/** "example.com" / "example.com.tr" for any host under it. */
export function registrableDomain(host: string): string {
  const labels = host.toLowerCase().replace(/\.$/, '').split('.');
  const lastTwo = labels.slice(-2).join('.');
  const take = SECOND_LEVEL_SUFFIXES.has(lastTwo) ? 3 : 2;
  return labels.slice(-take).join('.');
}

/** The "Name" to type into a DNS provider: "@" for the apex, "www" / "app.staging" otherwise. */
export function dnsRecordName(host: string): string {
  const h = host.toLowerCase().replace(/\.$/, '');
  const apex = registrableDomain(h);
  return h === apex ? '@' : h.slice(0, -(apex.length + 1));
}

/**
 * The www / apex twin Pushify redirects to this domain when its DNS points at the server:
 * example.com ↔ www.example.com. Null for other subdomains (app.example.com has no twin).
 */
export function wwwTwin(host: string): string | null {
  const h = host.toLowerCase();
  const apex = registrableDomain(h);
  if (h === apex) return `www.${h}`;
  if (h === `www.${apex}`) return apex;
  return null;
}
