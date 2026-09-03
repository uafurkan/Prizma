'use client';

import { useEffect } from 'react';
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from '@/components/CookieConsent';

interface AdsenseLoaderProps {
  adsenseId: string;
}

function loadAdsenseScript(adsenseId: string) {
  if (document.querySelector('script[data-adsbygoogle-loader]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
  script.crossOrigin = 'anonymous';
  script.dataset.adsbygoogleLoader = 'true';
  document.head.appendChild(script);
}

export default function AdsenseLoader({ adsenseId }: AdsenseLoaderProps) {
  useEffect(() => {
    const tryLoad = () => {
      try {
        if (localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted') {
          loadAdsenseScript(adsenseId);
        }
      } catch {
        // localStorage unavailable - skip loading ads
      }
    };

    tryLoad();

    const onConsentChange = (e: Event) => {
      const detail = (e as CustomEvent<'accepted' | 'rejected'>).detail;
      if (detail === 'accepted') {
        loadAdsenseScript(adsenseId);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, [adsenseId]);

  return null;
}
