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
import { convertSpeechToText } from '@/lib/converters/speech-to-text';
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
  const [showSizeWarning, setShowSizeWarning] = useState(false);
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
      setLocalError(dict.convertPage.onlyExtFiles.replace('{ext}', cift.fromExt));
      setFiles([]);
      return;
    }

    const hasTooLargeFile = validFiles.some(f => f.size >= 2 * 1024 * 1024 * 1024);
    if (hasTooLargeFile) {
      setLocalError(dict.convertPage.maxFileSizeError);
      setFiles([]);
      return;
    }

    const hasLargeFile = validFiles.some(f => f.size > 1024 * 1024 * 1024);
    setShowSizeWarning(hasLargeFile);

    setFiles(validFiles);
  }, [cift.fromExt, dict.convertPage.onlyExtFiles, dict.convertPage.maxFileSizeError]);

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
    setShowSizeWarning(false);
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
        setLocalError((err as Error).message || dict.convertPage.conversionError);
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
        case 'whisper': {
          setLocalProgress(5);
          for (const file of files) {
            const langOption = options['language'] ? String(options['language']) : 'turkish';
            const res = await convertSpeechToText(
              file,
              { language: langOption },
              (data) => {
                if (data.status === 'progress' && data.progress) {
                  // Downloading model progress (5% to 50%)
                  setLocalProgress(5 + (data.progress * 0.45));
                } else if (data.status === 'ready') {
                  setLocalProgress(50);
                } else if (data.status === 'decoding') {
                  setLocalProgress(60);
                } else if (data.status === 'inferencing') {
                  setLocalProgress(75);
                }
              }
            );
            finalResults.push(res);
          }
          setLocalProgress(95);
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
          } else if (cift.slug === 'word-to-pdf' || cift.slug === 'docx-to-pdf') {
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
          } else if (cift.slug === 'zip-ac' || cift.slug === 'extract-zip') {
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
          throw new Error(dict.convertPage.conversionError);
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
      setLocalError((err as Error).message || dict.convertPage.conversionError);
      
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
          <FormatBadge format={cift.from} size="lg" lang={lang} />
          <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <FormatBadge format={cift.to} size="lg" lang={lang} />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent mt-2">
          {baslik}
        </h1>
        
        <p className="text-muted font-medium max-w-xl">
          {aciklama}
        </p>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted bg-surface border border-border px-4 py-1.5 rounded-full mt-2 font-semibold">
          <span>🔒</span> {dict.security.shieldText}
        </div>
      </section>

      {/* FFmpeg Support check / warning */}
      {cift.converter === 'ffmpeg' && !ffmpegSupported ? (
        <div className="p-6 rounded-2xl border border-prism-r/30 bg-prism-r/5 text-center flex flex-col gap-3 max-w-xl mx-auto w-full">
          <span className="text-3xl">⚠️</span>
          <h3 className="font-bold text-prism-r text-lg">{dict.convertPage.browserNotSupported}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {dict.convertPage.sabDesc}
          </p>
          <p className="text-xs text-muted bg-background p-3 rounded-lg font-mono leading-relaxed mt-2 text-left">
            {dict.convertPage.safariDesc}
          </p>
        </div>
      ) : (
        <>
          {/* FFmpeg loader session banner */}
          {showInfoBanner && (
            <div className="p-4 rounded-xl border border-prism-b/20 bg-prism-b/5 text-sm flex items-center justify-between gap-4 max-w-xl mx-auto w-full animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">ℹ️</span>
                <p className="text-muted leading-normal text-xs">
                  {dict.convertPage.ffmpegBannerText}
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                className="text-xs text-prism-b hover:underline font-bold flex-shrink-0"
              >
                {dict.convertPage.gotIt}
              </button>
            </div>
          )}

          {/* Options Panel (rendered only if cift.secenekler exists & files are loaded) */}
          {cift.secenekler && files.length > 0 && results.length === 0 && !isConverting && !isLoadingFfmpeg && (
            <div className="p-6 rounded-2xl border border-border bg-surface max-w-xl mx-auto w-full flex flex-col gap-5 animate-fade-in">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">{dict.convertPage.conversionSettings}</h3>
              {cift.secenekler.map((opt) => {
                const optLabel = opt.label[lang as 'en'|'tr'] || opt.label['en'];
                return (
                  <div key={opt.id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">{optLabel}</span>
                      <span className="text-muted font-mono">
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
                        className="w-full bg-background text-foreground text-xs font-semibold"
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
              <div className="p-4 rounded-xl border border-prism-r/20 bg-prism-r/5 text-xs text-prism-r font-semibold text-center animate-fade-in">
                {dict.convertPage.error} {activeError}
              </div>
            )}

            {/* DropZone/File list (only visible when not converted and not active) */}
            {results.length === 0 && !isConverting && !isLoadingFfmpeg && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <DropZone
                  accept={cift.fromExt === '*' ? '*' : `.${cift.fromExt}`}
                  multiple={!!cift.cokluDosya}
                  onFiles={handleFiles}
                  label={dict.common.dropFilesHere}
                  dict={dict}
                />
                
                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-muted font-mono border-b border-border pb-1.5 px-1">
                      <span>{dict.convertPage.selectedFiles} ({files.length})</span>
                      <button onClick={handleReset} className="hover:text-prism-r transition-colors">
                        {dict.convertPage.clear}
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5">
                      {files.map((file, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-surface border border-border rounded-xl font-mono text-foreground">
                          <span className="truncate max-w-[70%]">{file.name}</span>
                          <span className="text-muted flex-shrink-0">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {showSizeWarning && (
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-xs text-amber-950 dark:text-amber-300">
                          <p className="font-bold mb-0.5">{dict.convertPage?.largeFileWarningTitle || 'Large File Warning'}</p>
                          <p>{dict.convertPage?.largeFileWarningDesc || 'You selected a file larger than 1GB. Web browsers have limited processing memory. If the conversion fails, try a smaller file.'}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleConvert}
                      className="btn-primary w-full mt-2"
                    >
                      {dict.convertPage.convertBtn}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading/Converting States */}
            {(isConverting || isLoadingFfmpeg) && (
              <div className="p-10 rounded-2xl border border-border bg-surface flex flex-col items-center justify-center gap-6 text-center shadow-xl animate-fade-in">
                {isLoadingFfmpeg ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-2 border-t-prism-b border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-foreground">{dict.convertPage.engineLoading}</h4>
                      <p className="text-xs text-muted">{dict.convertPage.engineDesc}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ProgressRing progress={progressValue} size={90} />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-foreground">{dict.convertPage.convertingFiles}</h4>
                      <p className="text-xs text-muted font-mono">{dict.convertPage.doNotClose}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results Screen */}
            {results.length > 0 && (
              <DownloadCard results={results} onReset={handleReset} dict={dict} />
            )}
          </div>
        </>
      )}

      {/* Ad slot below conversion */}
      <AdSlot format="responsive" className="my-4" />

      {/* Related Grid */}
      {relatedConversions.length > 0 && (
        <RelatedGrid items={relatedConversions} title={dict.common.otherPopularConversions} lang={lang} dict={dict} />
      )}

      {/* Accordion SSS */}
      <section className="flex flex-col gap-5 max-w-2xl mx-auto w-full pt-6">
        <h2 className="text-xl md:text-2xl font-bold text-center">{dict.common.faq}</h2>
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <h4 className="font-bold text-foreground text-sm">
              {dict.convertPage.faq1Title.replace('{from}', cift.from).replace('{to}', cift.to)}
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              {dict.convertPage.faq1Desc.replace('{from}', cift.from)}
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <h4 className="font-bold text-foreground text-sm">
              {dict.convertPage.faq2Title}
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              {dict.convertPage.faq2Desc}
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-2">
            <h4 className="font-bold text-foreground text-sm">
              {dict.convertPage.faq3Title}
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              {dict.convertPage.faq3Desc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
