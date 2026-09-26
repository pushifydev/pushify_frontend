import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER, isSupportedLocale, localeFromAcceptLanguage } from '@/lib/locale-request';

/**
 * Decide the language before the page is rendered.
 *
 * The pages are built from client components whose text comes from a store in the browser, so the
 * server had nothing to go on and always produced English. A Turkish visitor watched English paint
 * and then switch — about 85ms, on every reload. localStorage cannot help: the server never sees
 * it. A cookie can, because it arrives with the request.
 */
export function middleware(request: NextRequest) {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(stored)
    ? stored
    : localeFromAcceptLanguage(request.headers.get('accept-language'));

  // Passed on as a header rather than left for the layout to read from cookies(): on a first
  // visit there is no cookie yet, and this carries the Accept-Language answer for that request.
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  headers.set(PATH_HEADER, request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers } });

  // Write it back so the next request does not have to work it out again, and so a language
  // chosen in settings survives a reload.
  if (stored !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Everything a person looks at. Static assets and the image optimiser carry no language.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|js|css|woff|woff2)$).*)',
  ],
};
