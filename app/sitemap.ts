import { MetadataRoute } from 'next';
import { DONUSUM_DATA, KATEGORILER, getCategoryPath, getDonusumPath } from '@/lib/donusum-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.monster';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // Category routes (Both TR and EN)
  const categoryRoutesTR = KATEGORILER.map((cat) => ({
    url: `${baseUrl}${getCategoryPath('tr', cat.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const categoryRoutesEN = KATEGORILER.map((cat) => ({
    url: `${baseUrl}${getCategoryPath('en', cat.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const categoryRoutes = [...categoryRoutesTR, ...categoryRoutesEN];

  // Conversion routes (Both TR and EN, using canonical localized paths)
  const conversionRoutesTR = DONUSUM_DATA.map((d) => ({
    url: `${baseUrl}${getDonusumPath('tr', d.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  const conversionRoutesEN = DONUSUM_DATA.map((d) => ({
    url: `${baseUrl}${getDonusumPath('en', d.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const legalRoutes = [
    {
      url: `${baseUrl}/tr/gizlilik`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...routes, ...categoryRoutes, ...conversionRoutesTR, ...conversionRoutesEN, ...legalRoutes];
}
