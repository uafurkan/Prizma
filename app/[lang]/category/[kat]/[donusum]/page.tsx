import { notFound } from 'next/navigation';
import DonusumPage, { generateMetadata as _generateMetadata } from '../../../kategori/[kat]/[donusum]/page';
import { DONUSUM_DATA } from '@/lib/donusum-data';
import type { Metadata } from 'next';

const enToTrMap: Record<string, string> = {
  'image': 'goruntu',
  'video': 'video',
  'audio': 'ses',
  'document': 'belge',
  'archive': 'arsiv',
  'subtitle': 'altyazi',
  'transcription': 'desifre'
};

interface PageProps {
  params: Promise<{ lang: string; kat: string; donusum: string }>;
}

export async function generateStaticParams() {
  const params: { lang: string; kat: string; donusum: string }[] = [];
  DONUSUM_DATA.forEach(d => {
    const enSlug = Object.keys(enToTrMap).find(key => enToTrMap[key] === d.kategori) || d.kategori;
    params.push({ lang: 'en', kat: enSlug, donusum: d.slug });
  });
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const mappedKat = enToTrMap[resolved.kat] || resolved.kat;
  return _generateMetadata({ params: Promise.resolve({ ...resolved, kat: mappedKat }) });
}

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  const mappedKat = enToTrMap[resolved.kat] || resolved.kat;
  
  if (resolved.lang !== 'en') {
    notFound();
  }
  
  return <DonusumPage params={Promise.resolve({ ...resolved, kat: mappedKat })} />;
}
