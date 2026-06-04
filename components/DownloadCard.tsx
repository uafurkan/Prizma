'use client';

import { useState, useEffect, useRef } from 'react';
import { downloadBlob, downloadAll } from '@/lib/download';

interface ResultItem {
  blob: Blob;
  filename: string;
  originalSize: number;
  convertedSize: number;
  width?: number;
  height?: number;
}

interface DownloadCardProps {
  results: ResultItem[];
  onReset: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DownloadCard({ results, onReset }: DownloadCardProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    // Initialize editable filenames
    setFileNames(results.map((r) => r.filename));

    // Generate thumbnails for image blobs
    const urls = results.map((r) => {
      if (r.blob.type.startsWith('image/')) {
        return URL.createObjectURL(r.blob);
      }
      return '';
    });
    setThumbnails(urls);

    return () => {
      // Clean up object URLs on unmount
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [results]);

  const handleRename = (index: number, newName: string) => {
    setFileNames((prev) => {
      const copy = [...prev];
      copy[index] = newName;
      return copy;
    });
  };

  const handleDownloadSingle = (index: number) => {
    const filename = fileNames[index] || results[index].filename;
    downloadBlob(results[index].blob, filename);
  };

  const handleDownloadAllZip = async () => {
    const filesToDownload = results.map((r, i) => ({
      blob: r.blob,
      filename: fileNames[i] || r.filename,
    }));
    await downloadAll(filesToDownload, 'prizma-donusturulenler.zip');
  };

  const isSingle = results.length === 1;

  if (isSingle) {
    const r = results[0];
    const name = fileNames[0] || r.filename;
    const thumb = thumbnails[0];
    const ratio = r.originalSize > 0 ? (r.convertedSize / r.originalSize) * 100 : 0;
    const isSmaller = r.convertedSize < r.originalSize;
    const diffPercentage = Math.abs(100 - ratio).toFixed(0);

    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-6 flex flex-col gap-6 animate-fade-in">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#06d6a0]/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Thumbnail / Icon */}
          <div className="w-24 h-24 rounded-xl border border-[#1c1c2e] bg-[#06060c] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="Önizleme" className="object-cover w-full h-full" />
            ) : (
              <span className="text-3xl">📄</span>
            )}
          </div>

          <div className="flex-1 w-full flex flex-col gap-3">
            {/* Editable Filename */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5a5a7a] font-mono">Dosya Adı</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleRename(0, e.target.value)}
                className="w-full bg-[#06060c] border border-[#1c1c2e] hover:border-[#5a5a7a]/50 text-[#e8e8f4] px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-[#4d9fff] font-mono"
              />
            </div>

            {/* Size Comparison */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#5a5a7a]">{formatFileSize(r.originalSize)}</span>
              <span className="text-[#5a5a7a]">→</span>
              <span className={isSmaller ? 'text-[#06d6a0] font-bold' : 'text-[#ff4d6d] font-bold'}>
                {formatFileSize(r.convertedSize)}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] ${
                  isSmaller ? 'bg-[#06d6a0]/15 text-[#06d6a0]' : 'bg-[#ff4d6d]/15 text-[#ff4d6d]'
                }`}
              >
                {isSmaller ? `%${diffPercentage} daha küçük` : `%${diffPercentage} daha büyük`}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleDownloadSingle(0)}
            className="flex-1 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Dosyayı İndir
          </button>
          <button
            onClick={onReset}
            className="btn-secondary"
          >
            Yeni Dönüşüm
          </button>
        </div>
      </div>
    );
  }

  // Multiple files
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-6 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 border-b border-[#1c1c2e] pb-4">
        <h3 className="font-bold text-[#e8e8f4]">Dönüştürülen Dosyalar ({results.length})</h3>
        <button
          onClick={handleDownloadAllZip}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#06d6a0]/15 text-[#06d6a0] hover:bg-[#06d6a0]/25 flex items-center gap-1.5"
        >
          📦 Tümünü ZIP Olarak İndir
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-3 bg-[#06060c] border border-[#1c1c2e] rounded-xl hover:border-[#5a5a7a]/30 transition-colors"
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <input
                type="text"
                value={fileNames[i] || r.filename}
                onChange={(e) => handleRename(i, e.target.value)}
                className="bg-transparent border-none text-[#e8e8f4] font-semibold text-sm outline-none focus:bg-[#12121e] px-1 py-0.5 rounded w-full font-mono"
              />
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#5a5a7a]">
                <span>{formatFileSize(r.originalSize)}</span>
                <span>→</span>
                <span className={r.convertedSize < r.originalSize ? 'text-[#06d6a0]' : 'text-[#ff4d6d]'}>
                  {formatFileSize(r.convertedSize)}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDownloadSingle(i)}
              className="p-2 rounded-lg bg-[#12121e] border border-[#1c1c2e] text-[#5a5a7a] hover:text-[#06d6a0] hover:border-[#06d6a0]/30 transition-colors flex-shrink-0"
              title="Dosyayı İndir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1c1c2e] flex justify-end">
        <button
          onClick={onReset}
          className="btn-secondary w-full sm:w-auto"
        >
          Yeni Dönüşüm Başlat
        </button>
      </div>
    </div>
  );
}
