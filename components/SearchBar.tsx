'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { DONUSUM_DATA, getFormatRenk } from '@/lib/donusum-data';

export default function SearchBar({ lang }: { lang: string }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return DONUSUM_DATA.filter((d) => {
      const baslik = d.baslik[lang as 'en'|'tr'] || d.baslik['en'];
      return (
        baslik.toLowerCase().includes(q) ||
        d.from.toLowerCase().includes(q) ||
        d.to.toLowerCase().includes(q) ||
        d.slug.includes(q)
      );
    }).slice(0, 8);
  }, [query, lang]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
          focused
            ? 'border-[#4d9fff]/50 shadow-[0_0_30px_rgba(77,159,255,0.15)]'
            : 'border-[#1c1c2e] hover:border-[#5a5a7a]/50'
        } bg-[#0d0d18]`}
      >
        <svg
          className="absolute left-4 w-5 h-5 text-[#5a5a7a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Dönüşüm ara... (ör. JPG, PDF, MP4)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          className="w-full py-4 pl-12 pr-4 bg-transparent border-none text-[#e8e8f4] placeholder-[#5a5a7a] outline-none font-sans text-base"
        />
      </div>

      {/* Sonuçlar dropdown */}
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d18] border border-[#1c1c2e] rounded-2xl overflow-hidden shadow-2xl z-50 backdrop-blur-xl">
          {results.map((res) => (
            <Link
              key={res.slug}
              href={`/${lang}/${res.slug}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#12121e] transition-colors group/item"
              onClick={() => setFocused(false)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-md font-mono"
                  style={{
                    color: getFormatRenk(res.from),
                    backgroundColor: `${getFormatRenk(res.from)}15`,
                  }}
                >
                  {res.from}
                </span>
                <svg className="w-4 h-4 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-md font-mono"
                  style={{
                    color: getFormatRenk(res.to),
                    backgroundColor: `${getFormatRenk(res.to)}15`,
                  }}
                >
                  {res.to}
                </span>
              </div>
              <span className="font-bold text-sm text-[#e8e8f4] group-hover/item:text-[#4d9fff] transition-colors">
                {res.baslik[lang as 'en'|'tr'] || res.baslik['en']}
              </span>
            </Link>
          ))}
        </div>
      )}

      {focused && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d18] border border-[#1c1c2e] rounded-2xl p-6 text-center shadow-2xl z-50">
          <p className="text-[#5a5a7a] text-sm">Sonuç bulunamadı. Farklı bir arama deneyin.</p>
        </div>
      )}
    </div>
  );
}
