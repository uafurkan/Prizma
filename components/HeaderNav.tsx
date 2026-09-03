'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCategoryPath } from '@/lib/donusum-data';
import type { Dictionary } from '@/dictionaries';

export default function HeaderNav({ lang, dict }: { lang: string; dict: Dictionary }) {
  const pathname = usePathname() || '';

  const categories = [
    { slug: 'goruntu', name: dict.kategoriler.goruntu },
    { slug: 'video', name: dict.kategoriler.video },
    { slug: 'ses', name: dict.kategoriler.ses },
    { slug: 'desifre', name: dict.kategoriler.desifre },
    { slug: 'belge', name: dict.kategoriler.belge },
    { slug: 'arsiv', name: dict.kategoriler.arsiv },
    { slug: 'altyazi', name: dict.kategoriler.altyazi },
  ];

  return (
    <>
      {categories.map((cat) => {
        const catPath = getCategoryPath(lang, cat.slug);
        const isActive = pathname === catPath || pathname.startsWith(`${catPath}/`);
        
        return (
          <Link
            key={cat.slug}
            href={catPath}
            className={`text-sm font-semibold transition-colors ${
              isActive 
                ? 'text-foreground bg-surface2 px-2 py-1 rounded-md border border-border shadow-sm' 
                : 'text-muted hover:text-foreground'
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </>
  );
}
