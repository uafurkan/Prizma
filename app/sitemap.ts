import { MetadataRoute } from 'next';
import { DONUSUM_DATA, KATEGORILER } from '@/lib/donusum-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prizma.app';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // Category routes
  const categoryRoutes = KATEGORILER.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Conversion routes
  const conversionRoutes = DONUSUM_DATA.map((d) => ({
    url: `${baseUrl}/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...categoryRoutes, ...conversionRoutes];
}
