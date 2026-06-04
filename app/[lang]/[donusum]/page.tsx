import { notFound } from 'next/navigation';
import { DONUSUM_DATA, getDonusumBySlug } from '@/lib/donusum-data';
import ConvertPage from './ConvertPage';
import type { Metadata } from 'next';
import { getDictionary } from '@/dictionaries';

interface PageProps {
  params: Promise<{ lang: string; donusum: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'tr'];
  const params: { lang: string; donusum: string }[] = [];
  
  locales.forEach(lang => {
    DONUSUM_DATA.forEach(d => {
      params.push({ lang, donusum: d.slug });
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
    title: `${cift.from} → ${cift.to} | PRİZMA`,
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
    name: `${cift.from} to ${cift.to} Converter`,
    operatingSystem: 'All',
    applicationCategory: 'UtilityApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${lang}/${cift.slug}`,
      },
      {
        '@type': 'HowToStep',
        name: dict.howTo.step2Title,
        text: dict.howTo.step2Desc,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${lang}/${cift.slug}`,
      },
      {
        '@type': 'HowToStep',
        name: dict.howTo.step3Title,
        text: dict.howTo.step3Desc,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${lang}/${cift.slug}`,
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
