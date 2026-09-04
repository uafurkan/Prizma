// AdSense requires a real ads.txt file at the domain root, listing the
// publisher ID it already knows from NEXT_PUBLIC_ADSENSE_ID - generated
// here instead of a static file so the two never drift out of sync.
export async function GET() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const publisherId = adsenseId?.replace(/^ca-/, '');

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
