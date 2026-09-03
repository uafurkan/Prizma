import { notFound } from 'next/navigation';
import { DONUSUM_DATA, getDonusumBySlug, getTranslatedFormat, getDonusumPath, getKategoriBySlug, getCategoryPath } from '@/lib/donusum-data';
import ConvertPage from './ConvertPage';
import type { Metadata } from 'next';
import { getDictionary } from '@/dictionaries';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  
  const aciklama = cift.aciklama[lang as 'en'|'tr'] || cift.aciklama['en'];
  const title = `${getTranslatedFormat(cift.from, lang)} → ${getTranslatedFormat(cift.to, lang)} | ${lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}`;
  const canonicalPath = getDonusumPath(lang, cift.slug);

  return {
    title,
    description: aciklama,
    alternates: {
      canonical: canonicalPath,
      languages: {
        tr: getDonusumPath('tr', cift.slug),
        en: getDonusumPath('en', cift.slug),
      },
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

  const kategori = getKategoriBySlug(cift.kategori);
  const kategoriLabel = kategori ? (kategori.baslik[lang as 'en'|'tr'] || kategori.baslik['en']) : cift.kategori;
  const breadcrumbItems = [
    { label: lang === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${lang}` },
    { label: kategoriLabel, href: getCategoryPath(lang, cift.kategori) },
    { label: title },
  ];

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

  const fromLabel = getTranslatedFormat(cift.from, lang);
  const toLabel = getTranslatedFormat(cift.to, lang);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: dict.convertPage.faq1Title.replace('{from}', cift.from).replace('{to}', cift.to),
        acceptedAnswer: { '@type': 'Answer', text: dict.convertPage.faq1Desc.replace('{from}', cift.from) },
      },
      {
        '@type': 'Question',
        name: dict.convertPage.faq2Title,
        acceptedAnswer: { '@type': 'Answer', text: dict.convertPage.faq2Desc },
      },
      {
        '@type': 'Question',
        name: dict.convertPage.faq3Title,
        acceptedAnswer: { '@type': 'Answer', text: dict.convertPage.faq3Desc },
      },
      {
        '@type': 'Question',
        name: dict.convertPage.faq4Title,
        acceptedAnswer: { '@type': 'Answer', text: dict.convertPage.faq4Desc },
      },
      {
        '@type': 'Question',
        name: dict.convertPage.faq5Title.replace('{from}', fromLabel).replace('{to}', toLabel),
        acceptedAnswer: { '@type': 'Answer', text: dict.convertPage.faq5Desc },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="pt-6 pb-0 px-4 max-w-5xl mx-auto w-full">
        <Breadcrumbs items={breadcrumbItems} baseUrl={baseUrl} />
      </div>
      <ConvertPage cift={cift} lang={lang} />
    </>
  );
}
