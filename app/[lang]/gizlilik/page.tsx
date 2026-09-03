import type { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/PrivacyPolicyContent';
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
    title: `${dict.privacyPage.title} | ${lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}`,
    description: dict.privacyPage.intro,
    alternates: {
      canonical: '/tr/gizlilik',
      languages: {
        tr: '/tr/gizlilik',
        en: '/en/privacy',
      },
    },
  };
}

export default async function GizlilikPage({ params }: PageProps) {
  const { lang } = await params;
  return <PrivacyPolicyContent lang={lang} />;
}
