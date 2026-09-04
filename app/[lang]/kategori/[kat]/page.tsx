import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDonusumlerByKategori, getKategoriBySlug, KategoriSlug, getDonusumPath, getCategoryPath } from '@/lib/donusum-data';
import FormatBadge from '@/components/FormatBadge';
import { CATEGORY_ICONS, DocumentIcon } from '@/components/icons';
import AdSlot from '@/components/AdSlot';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ lang: string; kat: string }>;
}

// This route is only reachable through the /en/category/[kat] wrapper,
// which imports it directly rather than redirecting. It is not itself a public
// URL, so it isn't statically generated and direct requests to it 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { kat } = await params;
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) return {};

  const baslik = kategori.baslik.en;
  const aciklama = kategori.aciklama.en;
  const title = `${baslik} | PRIZMA`;
  const canonicalPath = getCategoryPath(kat);

  return {
    title,
    description: aciklama,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description: aciklama,
      url: canonicalPath,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description: aciklama,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, kat } = await params;
  const kategori = getKategoriBySlug(kat as KategoriSlug);
  if (!kategori) {
    notFound();
  }

  const donusumler = getDonusumlerByKategori(kat as KategoriSlug);
  const baslik = kategori.baslik.en;
  const aciklama = kategori.aciklama.en;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.monster';
  const breadcrumbItems = [
    { label: 'Home', href: '/en' },
    { label: baslik },
  ];

  return (
    <div className="flex flex-col gap-10 py-12 px-4 max-w-6xl mx-auto w-full animate-fade-in">
      <Breadcrumbs items={breadcrumbItems} baseUrl={baseUrl} />

      {/* Category Header */}
      <section className="flex flex-col gap-4 text-center md:text-left pt-2">
        <div className="flex items-center justify-center md:justify-start gap-4">
          <span
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center flex-shrink-0"
            style={{ color: kategori.renk, borderColor: `color-mix(in srgb, ${kategori.renk} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${kategori.renk} 12%, transparent)` }}
          >
            {(() => {
              const Icon = CATEGORY_ICONS[kategori.ikon] || DocumentIcon;
              return <Icon className="w-6 h-6 md:w-7 md:h-7" />;
            })()}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent">
            {baslik}
          </h1>
        </div>
        <p className="text-muted md:text-lg max-w-2xl font-medium">
          {aciklama}
        </p>
      </section>

      {/* Rectangle Ad below Header */}
      <AdSlot format="rectangle" className="my-2" />

      {/* Conversion Cards Grid */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donusumler.map((d) => {
            const dAciklama = d.aciklama.en;
            return (
              <Link
                key={d.slug}
                href={getDonusumPath(d.slug)}
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
