'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  format: 'leaderboard' | 'rectangle' | 'responsive';
  className?: string;
}

export default function AdSlot({ format, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  const sizes: Record<string, { width: string; height: string }> = {
    leaderboard: { width: '728px', height: '90px' },
    rectangle: { width: '336px', height: '280px' },
    responsive: { width: '100%', height: 'auto' },
  };

  useEffect(() => {
    if (pushed.current) return;
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
  }, []);

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
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      />
    </div>
  );
}
