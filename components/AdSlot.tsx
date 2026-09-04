'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  format: 'leaderboard' | 'rectangle' | 'responsive';
  className?: string;
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID;

// One AdSense ad unit ("ad slot") per placement shape, reused everywhere
// that shape appears on the site. Set these once real ad unit IDs exist.
const SLOT_IDS: Record<AdSlotProps['format'], string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
  responsive: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESPONSIVE,
};

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
    if (pushed.current || !ADSENSE_CLIENT || !slot) return;
    try {
      // Google's own snippet queues into this array even before the main
      // AdSense script has loaded, so this works whether the script is
      // already present or loads later (e.g. after cookie consent).
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, [slot]);

  // Without a client ID and a slot ID for this shape, AdSense would reject
  // the request outright - skip rendering the unit (and reserving layout
  // space for it) until both are configured.
  if (!ADSENSE_CLIENT || !slot) return null;

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
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      />
    </div>
  );
}
