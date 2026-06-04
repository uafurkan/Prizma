'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (lang: string) => {
    // If we're on /en/foo, change to /tr/foo
    if (!pathname) return;
    const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-[#12121e] border border-[#1c1c2e] rounded-xl p-1">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'en'
            ? 'bg-[#4d9fff]/20 text-[#4d9fff]'
            : 'text-[#5a5a7a] hover:text-[#e8e8f4]'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          currentLang === 'tr'
            ? 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
            : 'text-[#5a5a7a] hover:text-[#e8e8f4]'
        }`}
      >
        TR
      </button>
    </div>
  );
}
