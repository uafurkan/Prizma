'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { WarningIcon } from '@/components/icons';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error(error);
  }, [error]);

  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const dict = getDictionary(lang);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-xl mx-auto w-full animate-fade-in gap-6">
      <div className="w-16 h-16 rounded-2xl bg-prism-r/15 border border-prism-r/30 flex items-center justify-center text-prism-r">
        <WarningIcon className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
          {dict.convertPage.errorTitle || 'Dönüşüm Sırasında Bir Hata Oluştu'}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {dict.convertPage.errorDesc || 'Dosya dönüştürme işlemi sırasında beklenmeyen bir hata meydana geldi. Tarayıcınız veya dosyanız bu işlem için uygun olmayabilir.'}
        </p>
      </div>

      {/* Collapsed Technical Detail */}
      <details className="w-full text-left bg-surface border border-border rounded-xl p-4 cursor-pointer group">
        <summary className="text-xs font-semibold text-muted group-hover:text-foreground select-none outline-none">
          {dict.convertPage.errorDetails || 'Hata Detayları'}
        </summary>
        <p className="mt-2 text-xs font-mono text-prism-r bg-background p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-border">
          {error.message || error.toString()}
          {error.digest && `\nDigest: ${error.digest}`}
        </p>
      </details>

      <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
        <button
          onClick={reset}
          className="flex-1 btn-primary"
        >
          {dict.convertPage.tryAgain || 'Tekrar Dene'}
        </button>
        <Link
          href={`/${lang}`}
          className="btn-secondary flex-shrink-0"
        >
          {dict.convertPage.backToHome || 'Ana Sayfaya Dön'}
        </Link>
      </div>
    </div>
  );
}
