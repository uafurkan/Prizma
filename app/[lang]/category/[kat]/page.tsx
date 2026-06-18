import { notFound } from 'next/navigation';
import CategoryPage, { generateMetadata as _generateMetadata } from '../../kategori/[kat]/page';
import { KATEGORILER } from '@/lib/donusum-data';
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

interface CategoryPageProps {
  params: Promise<{ lang: string; kat: string }>;
}

export async function generateStaticParams() {
  const params: { lang: string; kat: string }[] = [];
  KATEGORILER.forEach(c => {
    const enSlug = Object.keys(enToTrMap).find(key => enToTrMap[key] === c.slug) || c.slug;
    params.push({ lang: 'en', kat: enSlug });
  });
  return params;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolved = await params;
  const mappedKat = enToTrMap[resolved.kat] || resolved.kat;
  return _generateMetadata({ params: Promise.resolve({ lang: resolved.lang, kat: mappedKat }) });
}

export default async function EnglishCategoryPage({ params }: CategoryPageProps) {
  const resolved = await params;
  const mappedKat = enToTrMap[resolved.kat] || resolved.kat;
  return CategoryPage({ params: Promise.resolve({ lang: resolved.lang, kat: mappedKat }) });
}
