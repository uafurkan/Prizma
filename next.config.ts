import type { NextConfig } from "next";
import { DONUSUM_DATA, getCategoryPath } from "./lib/donusum-data";

const nextConfig: NextConfig = {
  // @ts-ignore
  turbopack: {},
  async redirects() {
    const redirectList: { source: string; destination: string; permanent: boolean }[] = [];

    // Redirect old flat URLs: /[lang]/[slug] → /[lang]/kategori|category/[kat]/[slug]
    DONUSUM_DATA.forEach(d => {
      // TR: /tr/jpg-to-png → /tr/kategori/goruntu/jpg-to-png
      redirectList.push({
        source: `/tr/${d.slug}`,
        destination: `/tr/kategori/${d.kategori}/${d.slug}`,
        permanent: true,
      });
      // EN: /en/jpg-to-png → /en/category/image/jpg-to-png
      const enCatMap: Record<string, string> = {
        'goruntu': 'image', 'video': 'video', 'ses': 'audio',
        'belge': 'document', 'arsiv': 'archive', 'altyazi': 'subtitle'
      };
      redirectList.push({
        source: `/en/${d.slug}`,
        destination: `/en/category/${enCatMap[d.kategori] || d.kategori}/${d.slug}`,
        permanent: true,
      });
    });

    return redirectList;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Ensure @ffmpeg/core resolves properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
