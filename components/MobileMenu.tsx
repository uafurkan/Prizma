'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCategoryPath } from '@/lib/donusum-data';
import type { Dictionary } from '@/dictionaries';

const subscribeNoop = () => () => {};

interface MobileMenuProps {
  lang: string;
  dict: Dictionary;
  children: React.ReactNode; // For ThemeToggle and LanguageSwitcher
}

export default function MobileMenu({ lang, dict, children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const pathname = usePathname() || '';
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close menu on route change (adjust state during render, not in an effect)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

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
      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[9999] bg-[var(--mobile-menu-bg)] flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          {/* Close Icon */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-[var(--mobile-menu-close)] p-2 focus:outline-none hover:opacity-80 transition-opacity"
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
              className={`text-2xl font-serif tracking-wider transition-all ${
                pathname === `/${lang}` ? 'text-[var(--mobile-menu-active)]' : 'text-[var(--mobile-menu-text)] hover:opacity-70'
              }`}
            >
              {dict.common.home}
            </Link>
            
            {categories.map((cat) => {
              const catPath = getCategoryPath(cat.slug);
              const isActive = pathname === catPath || pathname.startsWith(`${catPath}/`);
              
              return (
                <Link
                  key={cat.slug}
                  href={catPath}
                  className={`text-2xl font-serif tracking-wider transition-all ${
                    isActive ? 'text-[var(--mobile-menu-active)]' : 'text-[var(--mobile-menu-text)] hover:opacity-70'
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
        </div>,
        document.body
      )}
    </>
  );
}
