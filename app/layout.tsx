import type { Metadata } from 'next';
import { Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';

const syne = Syne({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    template: '%s | PRİZMA',
    default: 'PRİZMA — Ücretsiz Dosya Dönüştürücü',
  },
  description: 'JPG, PNG, MP4, MP3, PDF ve 30+ format dönüştürücü. 100% tarayıcıda, gizli ve ücretsiz.',
};

import { FileProvider } from '@/components/FileProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html
      lang="tr"
      className={`${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#06060c] text-[#e8e8f4] font-sans selection:bg-[#4d9fff]/30 selection:text-[#e8e8f4]">
        <FileProvider>
          {/* Header */}
          <header className="border-b border-[#1c1c2e] bg-[#06060c]/85 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="group flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-[#ff4d6d] via-[#ff8c42] via-[#ffd166] via-[#06d6a0] via-[#4d9fff] to-[#b56cff] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  PRİZMA
                </span>
              </Link>
              <nav className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar max-w-[65%] whitespace-nowrap">
                <Link
                  href="/kategori/goruntu"
                  className="text-sm font-semibold text-[#5a5a7a] hover:text-[#e8e8f4] transition-colors"
                >
                  Görüntü
                </Link>
                <Link
                  href="/kategori/video"
                  className="text-sm font-semibold text-[#5a5a7a] hover:text-[#e8e8f4] transition-colors"
                >
                  Video
                </Link>
                <Link
                  href="/kategori/ses"
                  className="text-sm font-semibold text-[#5a5a7a] hover:text-[#e8e8f4] transition-colors"
                >
                  Ses
                </Link>
                <Link
                  href="/kategori/belge"
                  className="text-sm font-semibold text-[#5a5a7a] hover:text-[#e8e8f4] transition-colors"
                >
                  Belge
                </Link>
                <Link
                  href="/kategori/arsiv"
                  className="text-sm font-semibold text-[#5a5a7a] hover:text-[#e8e8f4] transition-colors"
                >
                  Arşiv
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Footer */}
          <footer className="border-t border-[#1c1c2e] bg-[#0d0d18] py-8 text-center">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#5a5a7a]">
                &copy; {new Date().getFullYear()} PRİZMA. Tüm hakları saklıdır.
              </p>
              <div className="flex gap-6 text-sm text-[#5a5a7a]">
                <Link href="/" className="hover:text-[#e8e8f4] transition-colors">
                  Ana Sayfa
                </Link>
                <Link href="/sitemap.xml" className="hover:text-[#e8e8f4] transition-colors">
                  Site Haritası
                </Link>
              </div>
            </div>
          </footer>

          <Analytics />
        </FileProvider>
      </body>
    </html>
  );
}
