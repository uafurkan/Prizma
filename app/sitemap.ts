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

  const categoryRoutes = KATEGORILER.map((cat) => ({
    url: `${baseUrl}${getCategoryPath(cat.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const conversionRoutes = DONUSUM_DATA.map((d) => ({
    url: `${baseUrl}${getDonusumPath(d.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const legalRoutes = [
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/en/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...routes, ...categoryRoutes, ...conversionRoutes, ...legalRoutes];
}
