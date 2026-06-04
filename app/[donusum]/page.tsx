import { notFound } from 'next/navigation';
import { DONUSUM_DATA, getDonusumBySlug } from '@/lib/donusum-data';
import ConvertPage from './ConvertPage';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ donusum: string }>;
}

export async function generateStaticParams() {
  return DONUSUM_DATA.map((d) => ({
    donusum: d.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) return {};

  return {
    title: `${cift.from} → ${cift.to} Dönüştürücü`,
    description: `${cift.from} dosyalarını anında ${cift.to}'ye çevirin. 100% tarayıcıda, sunucuya dosya gönderilmez. Ücretsiz, kayıt gerektirmez.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { donusum } = await params;
  const cift = getDonusumBySlug(donusum);
  if (!cift) {
    notFound();
  }

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
    name: `${cift.from} dosyasını ${cift.to} formatına dönüştürme`,
    description: `Dosyalarınızı internet sunucularına göndermeden yerel olarak ${cift.from}'den ${cift.to}'ye çevirin.`,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Dosyanızı Yükleyin',
        text: `Cihazınızdan .${cift.fromExt} uzantılı dosyayı yükleyin.`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${cift.slug}`,
      },
      {
        '@type': 'HowToStep',
        name: 'Dönüştürme İşlemini Başlatın',
        text: 'Eğer varsa seçenekleri ayarlayın ve Dönüştür butonuna tıklayın.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${cift.slug}`,
      },
      {
        '@type': 'HowToStep',
        name: 'Yeni Dosyanızı İndirin',
        text: 'İşlem bittiğinde dönüştürülen dosyayı anında bilgisayarınıza veya telefonunuza indirin.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app'}/${cift.slug}`,
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
      <ConvertPage cift={cift} />
    </>
  );
}
