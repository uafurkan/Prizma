'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/dictionaries';

export const COOKIE_CONSENT_KEY = 'prizma_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'prizma:consent-changed';

interface CookieConsentProps {
  dict: Dictionary;
  privacyHref: string;
}

export default function CookieConsent({ dict, privacyHref }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reads a stored preference from localStorage (an external system),
    // so this has to run as an effect rather than during render.
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, blocked storage) - skip banner
    }
  }, []);

  const respond = (choice: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {
      // ignore storage errors
    }
    setVisible(false);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-[10000] p-4 md:p-6 animate-fade-in"
    >
      <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-xs md:text-sm text-muted leading-relaxed flex-1">
          {dict.cookieConsent.message}{' '}
          <Link href={privacyHref} className="text-prism-b hover:underline font-semibold whitespace-nowrap">
            {dict.cookieConsent.privacyLink}
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
          <button
            onClick={() => respond('rejected')}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {dict.cookieConsent.reject}
          </button>
          <button
            onClick={() => respond('accepted')}
            className="flex-1 md:flex-none btn-primary px-4 py-2 text-xs"
          >
            {dict.cookieConsent.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
