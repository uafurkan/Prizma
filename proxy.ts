import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'tr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest) {
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    if (acceptLang.toLowerCase().includes('tr')) {
      return 'tr';
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Ignore static files
  const isPublicFile = /\.(.*)$/.test(pathname);
  if (isPublicFile) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
