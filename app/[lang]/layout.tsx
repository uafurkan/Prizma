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

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'tr' ? 'PRİZMA | Evrensel Dosya Dönüştürücü' : 'PRIZMA | The Universal File Converter',
    description: lang === 'tr' ? 'Dosyalarınızı tarayıcınızda güvenle ve anında dönüştürün.' : 'Instantly convert files securely in your browser.',
  };
}

import { FileProvider } from '@/components/FileProvider';
import { getDictionary } from '@/dictionaries';
import { getCategoryPath } from '@/lib/donusum-data';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AnimatedFavicon from '@/components/AnimatedFavicon';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderNav from '@/components/HeaderNav';
import MobileMenu from '@/components/MobileMenu';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${syne.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-prism-b/30">
        <AnimatedFavicon />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <FileProvider>
          {/* Header */}
          <header className="border-b border-border bg-background/85 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
              {/* Spacer on mobile to keep hamburger on the right when logo is absolute */}
              <div className="w-8 md:hidden" />
              
              <Link href={`/${lang}`} className="group flex items-center gap-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                <span 
                  className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-prism-r via-prism-o via-prism-y via-prism-g via-prism-b to-prism-p bg-clip-text text-transparent group-hover:opacity-90 transition-opacity animate-gradient-text select-none"
                  style={{ WebkitTouchCallout: 'none' }}
                >
                  {lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}
                </span>
              </Link>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-4 md:gap-6 max-w-[65%] whitespace-nowrap">
                <ThemeToggle dict={dict} />
                <LanguageSwitcher currentLang={lang} />
                <HeaderNav lang={lang} dict={dict} />
                <a href="https://github.com/uafurkan/Prizma" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-2 group">
                  <svg className="w-5 h-5 text-prism-b group-hover:text-prism-r transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              </nav>

              {/* Mobile Nav */}
              <MobileMenu lang={lang} dict={dict}>
                <ThemeToggle dict={dict} />
                <LanguageSwitcher currentLang={lang} />
              </MobileMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Footer */}
          <footer className="border-t border-border bg-surface py-8 text-center">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted">
                &copy; {new Date().getFullYear()} {lang === 'tr' ? 'PRİZMA' : 'PRIZMA'}. {dict.common.allRightsReserved}
              </p>
              <div className="flex gap-6 text-sm text-muted">
                <Link href={`/${lang}`} className="hover:text-foreground transition-colors">
                  {dict.common.home}
                </Link>
                <Link href={`/${lang}/sitemap.xml`} className="hover:text-foreground transition-colors">
                  {dict.common.sitemap}
                </Link>
              </div>
            </div>
          </footer>

          <Analytics />
          </FileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
