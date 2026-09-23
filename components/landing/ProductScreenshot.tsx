'use client';

/**
 * A real screenshot of the product, in a browser frame.
 *
 * The drawn mockups elsewhere on this page are good, but they are illustrations: they prove the
 * design, not the product. A screenshot of the running app — with its real app names, real
 * versions, real counts — is the thing that answers "does this actually exist".
 *
 * Two files, one per theme. The site's dark mode is a class on <html>, not a media query, so the
 * swap is CSS rather than <picture>: the wrong-theme image would otherwise glare white inside a
 * dark page.
 */
export function ProductScreenshot({
  light,
  dark,
  alt,
  caption,
}: {
  light: string;
  dark: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--lp-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.10)' }}
      >
        {/* Window chrome, so it reads as an application rather than a floating rectangle.
            It shrinks on narrow screens: the screenshot below scales down with the column, and
            a fixed-size chrome bar would end up taller than the app it frames. */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5"
          style={{ background: 'var(--lp-surface)', borderBottom: '1px solid var(--lp-border)' }}
        >
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ef4444]/70" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#eab308]/70" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#22c55e]/70" />
          <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>
            pushify.dev
          </span>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dark}
          alt={alt}
          width={2000}
          height={1250}
          loading="lazy"
          decoding="async"
          className="block w-full h-auto product-shot-dark"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={light}
          alt={alt}
          width={2000}
          height={1250}
          loading="lazy"
          decoding="async"
          className="block w-full h-auto product-shot-light"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-xs" style={{ color: 'var(--lp-muted)' }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
