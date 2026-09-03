import type { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';
import { getDictionary } from '@/dictionaries';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return [{ lang: 'tr' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.termsPage.title} | ${lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}`,
    description: dict.termsPage.intro,
    alternates: {
      canonical: '/tr/kullanim-kosullari',
      languages: {
        tr: '/tr/kullanim-kosullari',
        en: '/en/terms',
      },
    },
  };
}

export default async function KullanimKosullariPage({ params }: PageProps) {
  const { lang } = await params;
  return <LegalPageContent lang={lang} page="termsPage" />;
}
