import { notFound } from 'next/navigation';
import { getDonusumBySlug, getTranslatedFormat, getDonusumPath, getKategoriBySlug, getCategoryPath } from '@/lib/donusum-data';
import ConvertPage from './ConvertPage';
import type { Metadata } from 'next';
import { getDictionary } from '@/dictionaries';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PageProps {
  params: Promise<{ lang: string; kat: string; donusum: string }>;
}

// This route is only reachable through the /en/category/[kat]/[donusum] wrapper,
// which imports it directly rather than redirecting. It is not itself a public
// URL, so it isn't statically generated and direct requests to it 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) return {};

  const aciklama = cift.aciklama.en;
  const title = `${getTranslatedFormat(cift.from)} → ${getTranslatedFormat(cift.to)} | PRIZMA`;
  const canonicalPath = getDonusumPath(cift.slug);

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

export default async function Page({ params }: PageProps) {
  const { lang, donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) {
    notFound();
  }

  const dict = getDictionary(lang);
  const title = cift.baslik.en;
  const desc = cift.aciklama.en;

  // Schema definitions
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${getTranslatedFormat(cift.from)} to ${getTranslatedFormat(cift.to)} Converter`,
    operatingSystem: 'All',
    applicationCategory: 'UtilityApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.monster';
  const pageUrl = `${baseUrl}${getDonusumPath(cift.slug)}`;

  const kategori = getKategoriBySlug(cift.kategori);
  const kategoriLabel = kategori ? kategori.baslik.en : cift.kategori;
  const breadcrumbItems = [
    { label: 'Home', href: '/en' },
    { label: kategoriLabel, href: getCategoryPath(cift.kategori) },
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

  const fromLabel = getTranslatedFormat(cift.from);
  const toLabel = getTranslatedFormat(cift.to);
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
