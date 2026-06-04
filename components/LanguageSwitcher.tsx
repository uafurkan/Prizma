'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getTranslatedPath } from '@/lib/donusum-data';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (lang: string) => {
    if (!pathname) return;
    const newPath = getTranslatedPath(pathname, currentLang, lang);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-surface2 border border-border rounded-xl p-1">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'en'
            ? 'bg-prism-b/20 text-prism-b'
            : 'text-muted hover:text-foreground'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'tr'
            ? 'bg-prism-r/20 text-prism-r'
            : 'text-muted hover:text-foreground'
        }`}
      >
        TR
      </button>
    </div>
  );
}
