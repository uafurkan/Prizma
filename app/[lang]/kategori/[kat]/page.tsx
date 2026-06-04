import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDonusumlerByKategori, getKategoriBySlug, KATEGORILER, KategoriSlug } from '@/lib/donusum-data';
import FormatBadge from '@/components/FormatBadge';
import AdSlot from '@/components/AdSlot';
import type { Metadata } from 'next';
import { getDictionary } from '@/dictionaries';

interface CategoryPageProps {
  params: Promise<{ lang: string; kat: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'tr'];
  const params: { lang: string; kat: string }[] = [];
  
  locales.forEach(lang => {
    KATEGORILER.forEach(c => {
      params.push({ lang, kat: c.slug });
    });
  });
  
  return params;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, kat } = await params;
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) return {};

  const baslik = kategori.baslik[lang as 'en'|'tr'] || kategori.baslik['en'];
  const aciklama = kategori.aciklama[lang as 'en'|'tr'] || kategori.aciklama['en'];

  return {
    title: `${baslik} | PRİZMA`,
    description: aciklama,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, kat } = await params;
  const dict = getDictionary(lang);
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) {
    notFound();
  }

  const donusumler = getDonusumlerByKategori(kat as KategoriSlug);
  const baslik = kategori.baslik[lang as 'en'|'tr'] || kategori.baslik['en'];
  const aciklama = kategori.aciklama[lang as 'en'|'tr'] || kategori.aciklama['en'];

  return (
    <div className="flex flex-col gap-10 py-12 px-4 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Category Header */}
      <section className="flex flex-col gap-4 text-center md:text-left pt-6">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <span className="text-4xl md:text-5xl">{kategori.ikon}</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-[#e8e8f4] to-[#5a5a7a] bg-clip-text text-transparent">
            {baslik}
          </h1>
        </div>
        <p className="text-[#5a5a7a] md:text-lg max-w-2xl font-medium">
          {aciklama}
        </p>
      </section>

      {/* Rectangle Ad below Header */}
      <AdSlot format="rectangle" className="my-2" />

      {/* Conversion Cards Grid */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donusumler.map((d) => {
            const dAciklama = d.aciklama[lang as 'en'|'tr'] || d.aciklama['en'];
            return (
              <Link
                key={d.slug}
                href={`/${lang}/${d.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-5 hover:border-[#5a5a7a]/50 hover:bg-[#12121e] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FormatBadge format={d.from} size="sm" />
                  <svg className="w-4 h-4 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <FormatBadge format={d.to} size="sm" />
                </div>
                <p className="text-xs text-[#5a5a7a] line-clamp-2 mt-2 leading-relaxed">
                  {dAciklama}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
