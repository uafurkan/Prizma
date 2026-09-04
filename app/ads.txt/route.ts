import { ADSENSE_CLIENT_ID } from '@/lib/adsense';

// AdSense requires a real ads.txt file at the domain root, listing the
// publisher ID it already knows - generated here instead of a static file
// so the two can never drift out of sync.
export async function GET() {
  const publisherId = ADSENSE_CLIENT_ID.replace(/^ca-/, '');
  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
