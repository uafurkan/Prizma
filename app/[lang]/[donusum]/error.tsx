'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-xl mx-auto w-full animate-fade-in gap-6">
      <div className="w-16 h-16 rounded-2xl bg-[#ff4d6d]/15 border border-[#ff4d6d]/30 flex items-center justify-center text-4xl text-[#ff4d6d]">
        ⚠️
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#e8e8f4]">
          Dönüşüm Sırasında Bir Hata Oluştu
        </h1>
        <p className="text-sm text-[#5a5a7a] leading-relaxed">
          Dosya dönüştürme işlemi sırasında beklenmeyen bir hata meydana geldi. Tarayıcınız veya dosyanız bu işlem için uygun olmayabilir.
        </p>
      </div>

      {/* Collapsed Technical Detail */}
      <details className="w-full text-left bg-[#0d0d18] border border-[#1c1c2e] rounded-xl p-4 cursor-pointer group">
        <summary className="text-xs font-semibold text-[#5a5a7a] group-hover:text-[#e8e8f4] select-none outline-none">
          Hata Detayları
        </summary>
        <p className="mt-2 text-xs font-mono text-[#ff4d6d] bg-[#06060c] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-[#1c1c2e]">
          {error.message || error.toString()}
          {error.digest && `\nDigest: ${error.digest}`}
        </p>
      </details>

      <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
        <button
          onClick={reset}
          className="flex-1 btn-primary"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="btn-secondary flex-shrink-0"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
