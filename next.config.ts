import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  turbopack: {},
  async rewrites() {
    return [
      { source: '/en/category/image', destination: '/en/kategori/goruntu' },
      { source: '/en/category/video', destination: '/en/kategori/video' },
      { source: '/en/category/audio', destination: '/en/kategori/ses' },
      { source: '/en/category/document', destination: '/en/kategori/belge' },
      { source: '/en/category/archive', destination: '/en/kategori/arsiv' },
      { source: '/en/category/subtitle', destination: '/en/kategori/altyazi' },
    ];
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
