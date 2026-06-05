import Link from 'next/link';
import UniversalConverter from '@/components/UniversalConverter';
import AdSlot from '@/components/AdSlot';
import FormatBadge from '@/components/FormatBadge';
import { KATEGORILER, DONUSUM_DATA, getCategoryPath, getDonusumPath } from '@/lib/donusum-data';
import { getDictionary } from '@/dictionaries';
import SearchBar from '@/components/SearchBar';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  
  // Popüler dönüşümler
  const populerDonusumler = DONUSUM_DATA.filter((d) => d.populer).slice(0, 16);

  // Kategori başına dönüşüm sayısı
  const getCatCount = (slug: string) => {
    return DONUSUM_DATA.filter((d) => d.kategori === slug).length;
  };

  return (
    <div className="flex flex-col gap-16 py-12 px-4 max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center gap-6 animate-fade-in pt-8">
        <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
          <div className="w-[500px] h-[300px] bg-gradient-to-r from-prism-r/10 via-prism-g/10 to-prism-p/10 rounded-full blur-3xl opacity-50 animate-pulse-glow" />
        </div>

        {/* Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-surface border border-border text-foreground flex items-center gap-1.5">
            <span>🔒</span> {dict.hero.badge1}
          </span>
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-surface border border-border text-foreground flex items-center gap-1.5">
            <span>⚡</span> {dict.hero.badge2}
          </span>
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-surface border border-border text-foreground flex items-center gap-1.5">
            <span>∞</span> {dict.hero.badge3}
          </span>
        </div>

        {/* Animated SVG Prism */}
        <div className="relative w-28 h-28 my-2">
          <svg
            className="w-full h-full animate-spin-slow"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="20%" stopColor="#ff8c42" />
                <stop offset="40%" stopColor="#ffd166" />
                <stop offset="60%" stopColor="#06d6a0" />
                <stop offset="80%" stopColor="#4d9fff" />
                <stop offset="100%" stopColor="#b56cff" />
              </linearGradient>
            </defs>
            <polygon
              points="50,15 15,80 85,80"
              stroke="url(#rainbow)"
              strokeWidth="4"
              className="animate-prism-rotate"
            />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-br from-foreground to-muted bg-clip-text text-transparent max-w-4xl">
          {dict.hero.title1} <br />
          <span className="bg-gradient-to-r from-prism-r via-prism-y to-prism-b bg-clip-text text-transparent">
            {dict.hero.title2}
          </span>
        </h1>

        <p className="text-muted md:text-lg max-w-2xl font-medium">
          {dict.hero.subtitle}
        </p>

        <div className="w-full mt-4 z-20">
          <SearchBar lang={lang} />
        </div>

        {/* Universal Converter Island */}
        <div className="w-full mt-8">
          <UniversalConverter lang={lang} />
        </div>
      </section>

      {/* Leaderboard Ad below Hero */}
      <AdSlot format="leaderboard" className="my-4" />

      {/* Categories Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-center md:text-left">
          {dict.common.categories}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {KATEGORILER.map((c) => {
            const count = getCatCount(c.slug);
            const baslik = c.baslik[lang as 'en'|'tr'] || c.baslik['en'];
            return (
              <Link
                key={c.slug}
                href={getCategoryPath(lang, c.slug)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 hover:bg-surface2 hover:border-muted/50 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-foreground/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <span className="text-3xl mb-3 block">{c.ikon}</span>
                  <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-prism-r group-hover:to-prism-p group-hover:bg-clip-text">
                    {baslik}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-muted font-mono mt-4 block">
                  {dict.common.pairCount.replace('{count}', count.toString())}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Conversions */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-center md:text-left">
          {dict.common.popular}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {populerDonusumler.map((d) => {
            const aciklama = d.aciklama[lang as 'en'|'tr'] || d.aciklama['en'];
            return (
              <Link
                key={d.slug}
                href={getDonusumPath(lang, d.slug)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 hover:border-muted/50 hover:bg-surface2 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FormatBadge format={d.from} size="sm" lang={lang} />
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <FormatBadge format={d.to} size="sm" lang={lang} />
                </div>
                <p className="text-xs text-muted line-clamp-2 mt-2 leading-relaxed">
                  {aciklama}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Rectangle Ad between Popular and How It Works */}
      <AdSlot format="rectangle" className="my-4" />

      {/* How it Works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-border bg-surface/25 rounded-3xl p-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-prism-b/10 border border-prism-b/30 flex items-center justify-center text-prism-b font-bold text-lg">
            1
          </div>
          <h3 className="font-bold text-lg text-foreground">{dict.howTo.step1Title}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {dict.howTo.step1Desc}
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-prism-r/10 border border-prism-r/30 flex items-center justify-center text-prism-r font-bold text-lg">
            2
          </div>
          <h3 className="font-bold text-lg text-foreground">{dict.howTo.step2Title}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {dict.howTo.step2Desc}
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-prism-g/10 border border-prism-g/30 flex items-center justify-center text-prism-g font-bold text-lg">
            3
          </div>
          <h3 className="font-bold text-lg text-foreground">{dict.howTo.step3Title}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {dict.howTo.step3Desc}
          </p>
        </div>
      </section>

      {/* Security explanation */}
      <section className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-surface to-surface2 rounded-3xl p-8 border border-border">
        <div className="flex-1 flex flex-col gap-4">
          <span className="text-xs font-bold font-mono text-prism-g tracking-wider uppercase">{dict.security.subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{dict.security.title}</h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            {dict.security.desc}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-prism-g font-bold">✓</span> {dict.security.list1}
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-prism-g font-bold">✓</span> {dict.security.list2}
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-prism-g font-bold">✓</span> {dict.security.list3}
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-prism-g font-bold">✓</span> {dict.security.list4}
            </li>
          </ul>
        </div>
        <div className="w-full md:w-64 h-48 bg-background border border-border rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-prism-r to-prism-p" />
          <span className="text-4xl">🛡️</span>
          <p className="text-xs text-muted font-mono leading-relaxed">
            {dict.security.shieldText}
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center">{dict.common.faq}</h2>
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-2">
            <h3 className="font-bold text-foreground">{dict.faqSection.q1}</h3>
            <p className="text-sm text-muted leading-relaxed">{dict.faqSection.a1}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-2">
            <h3 className="font-bold text-foreground">{dict.faqSection.q2}</h3>
            <p className="text-sm text-muted leading-relaxed">{dict.faqSection.a2}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-2">
            <h3 className="font-bold text-foreground">{dict.faqSection.q3}</h3>
            <p className="text-sm text-muted leading-relaxed">{dict.faqSection.a3}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-2">
            <h3 className="font-bold text-foreground">{dict.faqSection.q4}</h3>
            <p className="text-sm text-muted leading-relaxed">{dict.faqSection.a4}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
