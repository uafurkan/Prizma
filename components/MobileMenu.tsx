'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCategoryPath } from '@/lib/donusum-data';

interface MobileMenuProps {
  lang: string;
  dict: any;
  children: React.ReactNode; // For ThemeToggle and LanguageSwitcher
}

export default function MobileMenu({ lang, dict, children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || '';

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const categories = [
    { slug: 'goruntu', name: dict.kategoriler.goruntu },
    { slug: 'video', name: dict.kategoriler.video },
    { slug: 'ses', name: dict.kategoriler.ses },
    { slug: 'belge', name: dict.kategoriler.belge },
    { slug: 'arsiv', name: dict.kategoriler.arsiv },
    { slug: 'altyazi', name: dict.kategoriler.altyazi },
  ];

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] z-50 focus:outline-none"
        aria-label="Toggle Menu"
      >
        <div className="w-6 h-[2px] bg-foreground rounded-full transition-all"></div>
        <div className="w-6 h-[2px] bg-foreground rounded-full transition-all"></div>
        <div className="w-6 h-[2px] bg-foreground rounded-full transition-all"></div>
      </button>

      {/* Full Screen Overlay Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0d1424] flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Close Icon */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white p-2 focus:outline-none"
          aria-label="Close Menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Menu Links */}
        <nav className="flex flex-col items-center gap-8 w-full px-6">
          <Link
            href={`/${lang}`}
            className={`text-2xl font-serif tracking-wider transition-colors ${
              pathname === `/${lang}` ? 'text-prism-y' : 'text-slate-200 hover:text-white'
            }`}
          >
            {dict.common.home || 'Home'}
          </Link>
          
          {categories.map((cat) => {
            const catPath = getCategoryPath(lang, cat.slug);
            const isActive = pathname === catPath || pathname.startsWith(`${catPath}/`);
            
            return (
              <Link
                key={cat.slug}
                href={catPath}
                className={`text-2xl font-serif tracking-wider transition-colors ${
                  isActive ? 'text-prism-y' : 'text-slate-200 hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}

          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-slate-700/50">
            {children}
          </div>
        </nav>
      </div>
    </>
  );
}
