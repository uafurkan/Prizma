'use client';

import { usePathname } from 'next/navigation';
import { getTranslatedPath } from '@/lib/donusum-data';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();

  const getHref = (lang: string) => {
    if (!pathname) return `/${lang}`;
    return getTranslatedPath(pathname, currentLang, lang);
  };

  return (
    <div className="flex items-center gap-1 bg-surface2 border border-border rounded-xl p-1">
      <a
        href={getHref('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'en'
            ? 'bg-prism-b/20 text-prism-b pointer-events-none'
            : 'text-muted hover:text-foreground'
        }`}
      >
        EN
      </a>
      <a
        href={getHref('tr')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'tr'
            ? 'bg-prism-r/20 text-prism-r pointer-events-none'
            : 'text-muted hover:text-foreground'
        }`}
      >
        TR
      </a>
    </div>
  );
}
