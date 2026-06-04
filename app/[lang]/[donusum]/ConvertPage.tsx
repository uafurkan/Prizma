'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DonusumCift } from '@/lib/donusum-data';
import { getFormatRenk, getIlgiliDonusumler } from '@/lib/donusum-data';
import DropZone from '@/components/DropZone';
import ProgressRing from '@/components/ProgressRing';
import DownloadCard from '@/components/DownloadCard';
import FormatBadge from '@/components/FormatBadge';
import RelatedGrid from '@/components/RelatedGrid';
import AdSlot from '@/components/AdSlot';
import { isFFmpegSupported } from '@/lib/ffmpeg-loader';
import { useFFmpeg } from '@/lib/use-ffmpeg';
import { getFFmpegArgs, getClipArgs } from '@/lib/converters/video-audio';
import { convertViaCanvas, convertHEIC, imagesToPDF, pdfToImages } from '@/lib/converters/image';
import { docxToHTML, textToPDF, mergePDFs, splitPDF, excelToCSV, csvToExcel } from '@/lib/converters/document';
import { filesToZip, extractZip } from '@/lib/converters/archive';
import { convertSubtitle } from '@/lib/converters/subtitle';
import { useGlobalFiles } from '@/components/FileProvider';
import { getDictionary } from '@/dictionaries';

interface ConvertPageProps {
  cift: DonusumCift;
  lang: string;
}

interface ResultItem {
  blob: Blob;
  filename: string;
  originalSize: number;
  convertedSize: number;
  width?: number;
  height?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ConvertPage({ cift, lang }: ConvertPageProps) {
  const dict = getDictionary(lang);
  const baslik = cift.baslik[lang as 'en'|'tr'] || cift.baslik['en'];
  const aciklama = cift.aciklama[lang as 'en'|'tr'] || cift.aciklama['en'];

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [options, setOptions] = useState<Record<string, string | number | boolean>>({});
  const [localConverting, setLocalConverting] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [ffmpegSupported, setFfmpegSupported] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const { globalFiles, setGlobalFiles } = useGlobalFiles();

  const {
    runFFmpeg,
    loading: ffmpegLoading,
    processing: ffmpegProcessing,
    progress: ffmpegProgress,
    error: ffmpegError,
  } = useFFmpeg();

  // Check FFmpeg support and banner visibility
  useEffect(() => {
    setFfmpegSupported(isFFmpegSupported());

    if (cift.converter === 'ffmpeg') {
      const bannerSeen = sessionStorage.getItem('prizma_ffmpeg_banner_seen');
      if (!bannerSeen) {
        setShowInfoBanner(true);
      }
    }
  }, [cift.converter]);

  // Set default option values
  useEffect(() => {
    if (cift.secenekler) {
      const defaults: Record<string, string | number | boolean> = {};
      cift.secenekler.forEach((opt) => {
        defaults[opt.id] = opt.default;
      });
      setOptions(defaults);
    }
  }, [cift.secenekler]);

  const handleOptionChange = (id: string, value: string | number | boolean) => {
    setOptions((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFiles = useCallback((selectedFiles: File[]) => {
    setLocalError(null);
    setResults([]);
    
    // Simple extension check
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      // Allow all for files-to-zip, otherwise validate
      if (cift.fromExt === '*') return true;
      if (ext === cift.fromExt.toLowerCase()) return true;
      if (cift.fromExt === 'jpg' && ext === 'jpeg') return true;
      return false;
    });

    if (validFiles.length === 0) {
      setLocalError(`Lütfen yalnızca .${cift.fromExt} uzantılı dosyalar yükleyin.`);
      setFiles([]);
      return;
    }

    setFiles(validFiles);
  }, [cift.fromExt]);

  // Handle Global Files (from Universal Converter)
  useEffect(() => {
    if (globalFiles && globalFiles.length > 0) {
      handleFiles(globalFiles);
      setGlobalFiles([]); // Clear context so they don't persist on subsequent visits
    }
  }, [globalFiles, handleFiles, setGlobalFiles]);

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setLocalError(null);
    setLocalProgress(0);
    setLocalConverting(false);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLocalError(null);
    setResults([]);

    // 1. FFmpeg Converter Dispatch
    if (cift.converter === 'ffmpeg') {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      const opts = {
        bitrate: options['bitrate'] as string | undefined,
        crf: options['crf'] !== undefined ? Number(options['crf']) : undefined,
        startTime: options['baslangic'] !== undefined ? Number(options['baslangic']) : undefined,
        duration: options['sure'] !== undefined ? Number(options['sure']) : undefined,
        fps: options['fps'] !== undefined ? Number(options['fps']) : undefined,
      };

      try {
        let convertResult;
        const outputFilename = `output.${cift.toExt}`;
        if (cift.slug === 'ses-kirpma') {
          const start = Number(options['baslangic'] ?? 0);
          const end = Number(options['bitis'] ?? 30);
          const args = getClipArgs(ext, start, end);
          convertResult = await runFFmpeg(file, outputFilename, args);
        } else {
          const args = getFFmpegArgs(ext, cift.toExt, opts);
          convertResult = await runFFmpeg(file, outputFilename, args);
        }

        if (convertResult) {
          // Track vercel analytics event
          try {
            const va = (window as unknown as { va?: (name: string, data: Record<string, unknown>) => void }).va;
            if (va) {
              va('conversion_completed', { donusum: cift.slug, success: true, fileSizeMB: file.size / (1024 * 1024) });
            }
          } catch {}

          setResults([
            {
              blob: convertResult,
              filename: file.name.replace(/\.[^.]+$/, '') + '.' + cift.toExt,
              originalSize: file.size,
              convertedSize: convertResult.size,
            },
          ]);
        }
      } catch (err) {
        setLocalError((err as Error).message || 'Dönüştürme sırasında hata oluştu.');
      }
      return;
    }

    // 2. Client side library conversions
    setLocalConverting(true);
    setLocalProgress(10);

    try {
      let finalResults: ResultItem[] = [];

      switch (cift.converter) {
        case 'canvas': {
          setLocalProgress(30);
          for (const file of files) {
            const res = await convertViaCanvas(
              file,
              cift.toExt as 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp',
              options['quality'] !== undefined ? Number(options['quality']) / 100 : 0.92
            );
            finalResults.push(res);
          }
          setLocalProgress(90);
          break;
        }
        case 'heic2any': {
          setLocalProgress(30);
          for (const file of files) {
            const res = await convertHEIC(file, cift.toExt as 'jpg' | 'png' | 'webp');
            finalResults.push({
              blob: res.blob,
              filename: res.filename,
              originalSize: res.originalSize,
              convertedSize: res.convertedSize,
            });
          }
          setLocalProgress(90);
          break;
        }
        case 'subsrt': {
          setLocalProgress(30);
          for (const file of files) {
            const res = await convertSubtitle(file, cift.toExt);
            finalResults.push({
              blob: res.blob,
              filename: res.filename,
              originalSize: res.originalSize,
              convertedSize: res.convertedSize,
            });
          }
          setLocalProgress(90);
          break;
        }
        case 'pdf-lib': {
          setLocalProgress(35);
          if (cift.slug === 'images-to-pdf') {
            const res = await imagesToPDF(files, (options['sayfa'] as 'A4' | 'Letter' | 'auto') || 'A4');
            finalResults.push(res);
          } else if (cift.slug === 'pdf-to-images') {
            const images = await pdfToImages(files[0], 1.5);
            finalResults = images.map((img) => ({
              blob: img.blob,
              filename: img.filename,
              originalSize: img.originalSize,
              convertedSize: img.convertedSize,
              width: img.width,
              height: img.height,
            }));
          } else if (cift.slug === 'merge-pdf') {
            const res = await mergePDFs(files, 'birlestirilmis.pdf');
            finalResults.push({
              blob: res.blob,
              filename: res.filename,
              originalSize: files.reduce((acc, f) => acc + f.size, 0),
              convertedSize: res.blob.size,
            });
          } else if (cift.slug === 'split-pdf') {
            const docs = await splitPDF(files[0]);
            finalResults = docs.map((doc) => ({
              blob: doc.blob,
              filename: doc.filename,
              originalSize: files[0].size / docs.length,
              convertedSize: doc.blob.size,
            }));
          } else if (cift.slug === 'text-to-pdf') {
            for (const file of files) {
              const res = await textToPDF(file);
              finalResults.push({
                blob: res.blob,
                filename: res.filename,
                originalSize: file.size,
                convertedSize: res.blob.size,
              });
            }
          } else if (cift.slug === 'word-to-pdf') {
            for (const file of files) {
              const htmlDoc = await docxToHTML(file);
              const mockFile = new File([htmlDoc.blob], file.name.replace(/\.docx?$/i, '.html'), { type: 'text/html' });
              const res = await textToPDF(mockFile, file.name.replace(/\.docx?$/i, '.pdf'));
              finalResults.push({
                blob: res.blob,
                filename: res.filename,
                originalSize: file.size,
                convertedSize: res.blob.size,
              });
            }
          }
          setLocalProgress(90);
          break;
        }
        case 'mammoth': {
          setLocalProgress(40);
          for (const file of files) {
            const res = await docxToHTML(file);
            finalResults.push({
              blob: res.blob,
              filename: res.filename,
              originalSize: file.size,
              convertedSize: res.blob.size,
            });
          }
          setLocalProgress(90);
          break;
        }
        case 'sheetjs': {
          setLocalProgress(40);
          if (cift.slug === 'excel-to-csv') {
            for (const file of files) {
              const res = await excelToCSV(file);
              finalResults.push({
                blob: res.blob,
                filename: res.filename,
                originalSize: file.size,
                convertedSize: res.blob.size,
              });
            }
          } else if (cift.slug === 'csv-to-excel') {
            for (const file of files) {
              const res = await csvToExcel(file);
              finalResults.push({
                blob: res.blob,
                filename: res.filename,
                originalSize: file.size,
                convertedSize: res.blob.size,
              });
            }
          }
          setLocalProgress(90);
          break;
        }
        case 'jszip': {
          setLocalProgress(40);
          if (cift.slug === 'files-to-zip') {
            const zipBlob = await filesToZip(files, 'prizma-arsiv.zip');
            finalResults.push({
              blob: zipBlob,
              filename: 'prizma-arsiv.zip',
              originalSize: files.reduce((acc, f) => acc + f.size, 0),
              convertedSize: zipBlob.size,
            });
          } else if (cift.slug === 'zip-ac') {
            const entries = await extractZip(files[0]);
            finalResults = entries.map((entry) => ({
              blob: entry.blob,
              filename: entry.name,
              originalSize: files[0].size / entries.length,
              convertedSize: entry.blob.size,
            }));
          }
          setLocalProgress(90);
          break;
        }
        default:
          throw new Error('Dönüştürücü bulunamadı.');
      }

      // Track Vercel analytics
      try {
        const va = (window as unknown as { va?: (name: string, data: Record<string, unknown>) => void }).va;
        if (va) {
          va('conversion_completed', { donusum: cift.slug, success: true, fileSizeMB: files[0].size / (1024 * 1024) });
        }
      } catch {}

      setLocalProgress(100);
      setResults(finalResults);
    } catch (err) {
      setLocalError((err as Error).message || 'Dönüştürme sırasında hata oluştu.');
      
      // Track Vercel analytics error
      try {
        const va = (window as unknown as { va?: (name: string, data: Record<string, unknown>) => void }).va;
        if (va) {
          va('conversion_completed', { donusum: cift.slug, success: false, fileSizeMB: files[0]?.size / (1024 * 1024) || 0 });
        }
      } catch {}
    } finally {
      setLocalConverting(false);
    }
  };

  const handleDismissBanner = () => {
    setShowInfoBanner(false);
    sessionStorage.setItem('prizma_ffmpeg_banner_seen', 'true');
  };

  // Compute status
  const isConverting = ffmpegProcessing || localConverting;
  const isLoadingFfmpeg = ffmpegLoading;
  const progressValue = ffmpegProcessing ? ffmpegProgress : localProgress;
  const activeError = ffmpegError || localError;

  const color = getFormatRenk(cift.to);
  const relatedConversions = getIlgiliDonusumler(cift, 6);

  return (
    <div className="flex flex-col gap-12 py-12 px-4 max-w-5xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <section className="flex flex-col items-center text-center gap-4 pt-6">
        <div className="flex items-center gap-3 md:gap-5 justify-center">
          <FormatBadge format={cift.from} size="lg" />
          <svg className="w-6 h-6 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <FormatBadge format={cift.to} size="lg" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-[#e8e8f4] to-[#5a5a7a] bg-clip-text text-transparent mt-2">
          {baslik}
        </h1>
        
        <p className="text-[#5a5a7a] font-medium max-w-xl">
          {aciklama}
        </p>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-[#5a5a7a] bg-[#0d0d18] border border-[#1c1c2e] px-4 py-1.5 rounded-full mt-2 font-semibold">
          <span>🔒</span> {dict.security.shieldText}
        </div>
      </section>

      {/* FFmpeg Support check / warning */}
      {cift.converter === 'ffmpeg' && !ffmpegSupported ? (
        <div className="p-6 rounded-2xl border border-[#ff4d6d]/30 bg-[#ff4d6d]/5 text-center flex flex-col gap-3 max-w-xl mx-auto w-full">
          <span className="text-3xl">⚠️</span>
          <h3 className="font-bold text-[#ff4d6d] text-lg">Tarayıcınız Bu Dönüşümü Desteklemiyor</h3>
          <p className="text-sm text-[#5a5a7a] leading-relaxed">
            Bu dönüşüm için gerekli olan SharedArrayBuffer özelliği tarayıcınızda etkin değil. Chrome, Firefox veya Edge kullanmanızı öneririz.
          </p>
          <p className="text-xs text-[#5a5a7a] bg-[#06060c] p-3 rounded-lg font-mono leading-relaxed mt-2 text-left">
            iOS / Safari için: Ayarlar &gt; Safari &gt; Gelişmiş &gt; Deneysel Özellikler altından SharedArrayBuffer&apos;ı etkinleştirebilirsiniz.
          </p>
        </div>
      ) : (
        <>
          {/* FFmpeg loader session banner */}
          {showInfoBanner && (
            <div className="p-4 rounded-xl border border-[#4d9fff]/20 bg-[#4d9fff]/5 text-sm flex items-center justify-between gap-4 max-w-xl mx-auto w-full animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">ℹ️</span>
                <p className="text-[#5a5a7a] leading-normal text-xs">
                  Bu dönüşüm ilk kullanımda ~25MB boyutunda FFmpeg dönüştürme dosyaları indirir. Sonraki dönüşümleriniz cihaz önbelleği sayesinde anında gerçekleşir.
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                className="text-xs text-[#4d9fff] hover:underline font-bold flex-shrink-0"
              >
                Anladım
              </button>
            </div>
          )}

          {/* Options Panel (rendered only if cift.secenekler exists & files are loaded) */}
          {cift.secenekler && files.length > 0 && results.length === 0 && !isConverting && !isLoadingFfmpeg && (
            <div className="p-6 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] max-w-xl mx-auto w-full flex flex-col gap-5 animate-fade-in">
              <h3 className="font-bold text-sm text-[#e8e8f4] border-b border-[#1c1c2e] pb-2">Dönüştürme Ayarları</h3>
              {cift.secenekler.map((opt) => {
                const optLabel = opt.label[lang as 'en'|'tr'] || opt.label['en'];
                return (
                  <div key={opt.id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#e8e8f4]">{optLabel}</span>
                      <span className="text-[#5a5a7a] font-mono">
                        {options[opt.id] ?? opt.default}
                        {opt.unit}
                      </span>
                    </div>
                  
                  {opt.type === 'range' && (
                    <input
                      type="range"
                      min={opt.min}
                      max={opt.max}
                      step={opt.step || 1}
                      value={(options[opt.id] as number) || (opt.default as number)}
                      onChange={(e) => handleOptionChange(opt.id, Number(e.target.value))}
                    />
                  )}

                  {opt.type === 'select' && opt.options && (
                      <select
                        value={(options[opt.id] as string) || (opt.default as string)}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="w-full bg-[#06060c] text-[#e8e8f4] text-xs font-semibold"
                      >
                        {opt.options.map((o) => {
                          return (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Area: DropZone -> Progress -> DownloadCard */}
          <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
            {/* Error Message */}
            {activeError && (
              <div className="p-4 rounded-xl border border-[#ff4d6d]/20 bg-[#ff4d6d]/5 text-xs text-[#ff4d6d] font-semibold text-center animate-fade-in">
                ⚠️ Hata: {activeError}
              </div>
            )}

            {/* DropZone/File list (only visible when not converted and not active) */}
            {results.length === 0 && !isConverting && !isLoadingFfmpeg && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <DropZone
                  accept={cift.fromExt === '*' ? '*' : `.${cift.fromExt}`}
                  multiple={!!cift.cokluDosya}
                  onFiles={handleFiles}
                  label={`${cift.from} dosyasını sürükleyin veya seçin`}
                />
                
                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-[#5a5a7a] font-mono border-b border-[#1c1c2e] pb-1.5 px-1">
                      <span>Seçilen Dosyalar ({files.length})</span>
                      <button onClick={handleReset} className="hover:text-[#ff4d6d] transition-colors">
                        Temizle
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5">
                      {files.map((file, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#0d0d18] border border-[#1c1c2e] rounded-xl font-mono text-[#e8e8f4]">
                          <span className="truncate max-w-[70%]">{file.name}</span>
                          <span className="text-[#5a5a7a] flex-shrink-0">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleConvert}
                      className="btn-primary w-full mt-2"
                    >
                      Dönüştür
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading/Converting States */}
            {(isConverting || isLoadingFfmpeg) && (
              <div className="p-10 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col items-center justify-center gap-6 text-center shadow-xl animate-fade-in">
                {isLoadingFfmpeg ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-2 border-t-[#4d9fff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-[#e8e8f4]">Dönüştürme Motoru Yükleniyor...</h4>
                      <p className="text-xs text-[#5a5a7a]">Dönüştürücü kütüphaneler kuruluyor, bu işlem 3-5 saniye sürebilir.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ProgressRing progress={progressValue} size={90} />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-[#e8e8f4]">Dosyalar Dönüştürülüyor</h4>
                      <p className="text-xs text-[#5a5a7a] font-mono">Lütfen bu sayfayı kapatmayın.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results Screen */}
            {results.length > 0 && (
              <DownloadCard results={results} onReset={handleReset} />
            )}
          </div>
        </>
      )}

      {/* Ad slot below conversion */}
      <AdSlot format="responsive" className="my-4" />

      {/* Related Grid */}
      {relatedConversions.length > 0 && (
        <RelatedGrid items={relatedConversions} title="Diğer Popüler Dönüşümler" lang={lang} />
      )}

      {/* Accordion SSS */}
      <section className="flex flex-col gap-5 max-w-2xl mx-auto w-full pt-6">
        <h2 className="text-xl md:text-2xl font-bold text-center">Sıkça Sorulan Sorular</h2>
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h4 className="font-bold text-[#e8e8f4] text-sm">
              {cift.from}&apos;den {cift.to}&apos;ye dönüşüm nasıl yapılır?
            </h4>
            <p className="text-xs text-[#5a5a7a] leading-relaxed">
              Tek yapmanız gereken {cift.from} dosyanızı yukarıdaki yükleme alanına sürüklemek ve &apos;Dönüştür&apos; butonuna tıklamaktır. İşlem tarayıcınızda yerel olarak gerçekleşir ve saniyeler içinde tamamlanır. Ardından dönüştürülen dosyayı cihazınıza indirebilirsiniz.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h4 className="font-bold text-[#e8e8f4] text-sm">
              Dosyalarım dönüştürücüye yüklendiğinde gizli kalıyor mu?
            </h4>
            <p className="text-xs text-[#5a5a7a] leading-relaxed">
              Evet, tamamen. PRİZMA sıfır sunucu mimarisiyle çalışır. Yani yüklediğiniz dosyalar hiçbir sunucuya transfer edilmez; tüm işlem kendi cihazınızın tarayıcısında, belleğinde gerçekleşir. Bu yüzden dosyalarınız %100 güvendedir ve gizlidir.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h4 className="font-bold text-[#e8e8f4] text-sm">
              Bu dönüşüm işlemi için ödeme yapmam gerekiyor mu?
            </h4>
            <p className="text-xs text-[#5a5a7a] leading-relaxed">
              Hayır, platformumuzdaki tüm dönüşüm araçları tamamen ücretsizdir ve herhangi bir kayıt veya üyelik gerektirmeden sınırsızca kullanılabilir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
