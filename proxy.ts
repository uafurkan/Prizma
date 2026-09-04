import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TR_KATEGORI_TO_EN: Record<string, string> = {
  'goruntu': 'image',
  'video': 'video',
  'ses': 'audio',
  'belge': 'document',
  'arsiv': 'archive',
  'altyazi': 'subtitle',
  'desifre': 'transcription',
};

// Maps a legacy /tr/... path to its English equivalent so old, possibly
// indexed, Turkish URLs keep working via a permanent redirect instead of 404ing.
function mapLegacyTurkishPath(pathname: string): string {
  if (pathname === '/tr') return '/en';
  if (pathname === '/tr/gizlilik') return '/en/privacy';
  if (pathname === '/tr/kullanim-kosullari') return '/en/terms';

  const kategoriMatch = pathname.match(/^\/tr\/kategori\/([^/]+)(?:\/([^/]+))?\/?$/);
  if (kategoriMatch) {
    const [, kat, donusum] = kategoriMatch;
    const enKat = TR_KATEGORI_TO_EN[kat] || kat;
    return donusum ? `/en/category/${enKat}/${donusum}` : `/en/category/${enKat}`;
  }

  return pathname.replace(/^\/tr(\/|$)/, '/en$1');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/tr' || pathname.startsWith('/tr/')) {
    request.nextUrl.pathname = mapLegacyTurkishPath(pathname);
    return NextResponse.redirect(request.nextUrl, 301);
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) return;

  // Ignore static files
  const isPublicFile = /\.(.*)$/.test(pathname);
  if (isPublicFile) return;

  request.nextUrl.pathname = `/en${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
};
