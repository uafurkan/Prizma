'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT_ID } from '@/lib/adsense';
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from '@/components/CookieConsent';

interface AdSlotProps {
  format: 'leaderboard' | 'rectangle' | 'responsive';
  className?: string;
}

// One AdSense ad unit ("ad slot") per placement shape, reused everywhere
// that shape appears on the site. Set these once real ad unit IDs exist.
const SLOT_IDS: Record<AdSlotProps['format'], string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
  responsive: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESPONSIVE,
};

function hasConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export default function AdSlot({ format, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  const sizes: Record<string, { width: string; height: string }> = {
    leaderboard: { width: '728px', height: '90px' },
    rectangle: { width: '336px', height: '280px' },
    responsive: { width: '100%', height: 'auto' },
  };

  const slot = SLOT_IDS[format];

  useEffect(() => {
    if (pushed.current || !slot) return;

    const requestAd = () => {
      if (pushed.current) return;
      try {
        // Google's own snippet queues into this array even before the main
        // AdSense script has loaded, so this works whether the script is
        // already present or loads later.
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded
      }
    };

    // The verification script itself always loads (Google requires it
    // present on every page), but an actual ad is only requested once the
    // visitor has accepted cookies.
    if (hasConsent()) {
      requestAd();
      return;
    }

    const onConsentChange = (e: Event) => {
      const detail = (e as CustomEvent<'accepted' | 'rejected'>).detail;
      if (detail === 'accepted') requestAd();
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, [slot]);

  // Without a slot ID for this shape, skip rendering the unit (and
  // reserving layout space for it) until one is configured.
  if (!slot) return null;

  const { width, height } = sizes[format];

  return (
    <div
      ref={adRef}
      className={`flex items-center justify-center mx-auto ${className}`}
      style={{ maxWidth: width, minHeight: height === 'auto' ? '100px' : height }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width, height }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      />
    </div>
  );
}
