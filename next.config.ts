import type { NextConfig } from "next";
import { DONUSUM_DATA } from "./lib/donusum-data";

const nextConfig: NextConfig = {
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
        'belge': 'document', 'arsiv': 'archive', 'altyazi': 'subtitle',
        'desifre': 'transcription'
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
