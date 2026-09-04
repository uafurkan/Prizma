import type { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';
import { getDictionary } from '@/dictionaries';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return [{ lang: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.termsPage.title} | PRIZMA`,
    description: dict.termsPage.intro,
    alternates: {
      canonical: '/en/terms',
    },
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params;
  return <LegalPageContent lang={lang} page="termsPage" />;
}
