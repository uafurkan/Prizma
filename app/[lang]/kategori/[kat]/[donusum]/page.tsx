import { notFound } from 'next/navigation';
import { DONUSUM_DATA, getDonusumBySlug, getTranslatedFormat, getDonusumPath } from '@/lib/donusum-data';
import ConvertPage from './ConvertPage';
import type { Metadata } from 'next';
import { getDictionary } from '@/dictionaries';

interface PageProps {
  params: Promise<{ lang: string; kat: string; donusum: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'tr'];
  const params: { lang: string; kat: string; donusum: string }[] = [];
  
  locales.forEach(lang => {
    DONUSUM_DATA.forEach(d => {
      // The 'kategori' path is nested under 'kategori/[kat]' for BOTH languages in the physical folder structure.
      // But we will handle english via rewrite or proxy. For physical static params, we just use the raw category slug
      // wait, actually, if the folder is `kategori/[kat]`, then `kat` must be the tr category slug for both.
      params.push({ lang, kat: d.kategori, donusum: d.slug });
    });
  });
  
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) return {};
  
  const dict = getDictionary(lang);
  const baslik = cift.baslik[lang as 'en'|'tr'] || cift.baslik['en'];
  const aciklama = cift.aciklama[lang as 'en'|'tr'] || cift.aciklama['en'];

  return {
    title: `${getTranslatedFormat(cift.from, lang)} → ${getTranslatedFormat(cift.to, lang)} | ${lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}`,
    description: aciklama,
  };
}

export default async function Page({ params }: PageProps) {
  const { lang, donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) {
    notFound();
  }
  
  const dict = getDictionary(lang);
  const title = cift.baslik[lang as 'en'|'tr'] || cift.baslik['en'];
  const desc = cift.aciklama[lang as 'en'|'tr'] || cift.aciklama['en'];

  // Schema definitions
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${getTranslatedFormat(cift.from, lang)} to ${getTranslatedFormat(cift.to, lang)} Converter`,
    operatingSystem: 'All',
    applicationCategory: 'UtilityApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.monster';
  const pageUrl = `${baseUrl}${getDonusumPath(lang, cift.slug)}`;

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: desc,
    step: [
      {
        '@type': 'HowToStep',
        name: dict.howTo.step1Title,
        text: dict.howTo.step1Desc,
        url: pageUrl,
      },
      {
        '@type': 'HowToStep',
        name: dict.howTo.step2Title,
        text: dict.howTo.step2Desc,
        url: pageUrl,
      },
      {
        '@type': 'HowToStep',
        name: dict.howTo.step3Title,
        text: dict.howTo.step3Desc,
        url: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <ConvertPage cift={cift} lang={lang} />
    </>
  );
}
