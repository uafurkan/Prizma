import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDonusumlerByKategori, getKategoriBySlug, KATEGORILER, KategoriSlug } from '@/lib/donusum-data';
import FormatBadge from '@/components/FormatBadge';
import AdSlot from '@/components/AdSlot';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ kat: string }>;
}

export async function generateStaticParams() {
  return KATEGORILER.map((c) => ({
    kat: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { kat } = await params;
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) return {};

  return {
    title: `${kategori.baslik} Dönüştürücüler — Ücretsiz Online`,
    description: `${kategori.baslik} dönüştürme araçları. ${kategori.aciklama} 100% tarayıcıda, sunucuya dosya gönderilmez. Hızlı ve güvenli.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { kat } = await params;
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) {
    notFound();
  }

  const donusumler = getDonusumlerByKategori(kat as KategoriSlug);

  return (
    <div className="flex flex-col gap-10 py-12 px-4 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Category Header */}
      <section className="flex flex-col gap-4 text-center md:text-left pt-6">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <span className="text-4xl md:text-5xl">{kategori.ikon}</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-[#e8e8f4] to-[#5a5a7a] bg-clip-text text-transparent">
            {kategori.baslik} Dönüştürücüler
          </h1>
        </div>
        <p className="text-[#5a5a7a] md:text-lg max-w-2xl font-medium">
          {kategori.aciklama}
        </p>
      </section>

      {/* Rectangle Ad below Header */}
      <AdSlot format="rectangle" className="my-2" />

      {/* Conversion Cards Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold font-sans">
          Desteklenen Dönüşüm Formatları
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donusumler.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
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
                {d.aciklama}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#5a5a7a] group-hover:text-[#e8e8f4] transition-colors">
                <span>Dönüştürmeye başla</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
