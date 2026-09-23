/**
 * The social preview image, spelled out per page.
 *
 * Next.js replaces `openGraph` wholesale when a page declares one — it is not merged into the
 * root layout's — so every page that set its own title and url silently dropped the image along
 * with it. Sharing any of them on LinkedIn, Slack, WhatsApp or Discord produced a bare grey card.
 * The same goes for `twitter`.
 *
 * Spread this into both rather than relying on inheritance that does not happen.
 */
export const OG_IMAGE = [
  {
    url: '/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Pushify — open-source deployment platform',
  },
];

/**
 * Cut a meta description to what a search result actually shows (~160 characters), at a word
 * boundary rather than mid-word. Put the sentence that belongs to *this* page first and let this
 * trim the tail: Google truncates either way, and it is better to choose which half survives.
 */
export function clampDescription(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(' '));
  return atWord.replace(/[\s.,;:—-]+$/, '') + '…';
}
