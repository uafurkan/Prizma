'use client';

import { useState, useEffect } from 'react';
import { downloadBlob, downloadAll } from '@/lib/download';
import type { Dictionary } from '@/dictionaries';
import { DocumentIcon, TranscriptionIcon, AudioIcon, VideoIcon, PackageIcon, EyeIcon, CheckIcon } from '@/components/icons';
import type { IconProps } from '@/components/icons';

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
  dict?: Dictionary;
  lang?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DownloadCard({ results, onReset, dict }: DownloadCardProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [textPreviews, setTextPreviews] = useState<Record<number, string>>({});
  const [docxPreviews, setDocxPreviews] = useState<Record<number, string>>({});
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [prevResults, setPrevResults] = useState(results);

  // Reset editable filenames when a new batch of results arrives
  // (adjust state during render, not in an effect)
  if (results !== prevResults) {
    setPrevResults(results);
    setFileNames(results.map((r) => r.filename));
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generates object URLs (with cleanup) for thumbnails/previews, so this
  // must stay an effect rather than a render-time state adjustment.
  useEffect(() => {

    // Generate thumbnails for image blobs
    const urls = results.map((r) => {
      if (r.blob.type.startsWith('image/')) {
        return URL.createObjectURL(r.blob);
      }
      return '';
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThumbnails(urls);

    const generatedUrls: string[] = [];
    const urlMap: Record<number, string> = {};

    // Generate previews
    results.forEach((r, idx) => {
      const ext = r.filename.split('.').pop()?.toLowerCase() || '';
      const isTxt = ext === 'txt' || r.blob.type === 'text/plain';
      const isDocx = ext === 'docx';
      const isPdf = ext === 'pdf' || r.blob.type === 'application/pdf';
      const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'wma'].includes(ext) || r.blob.type.startsWith('audio/');
      const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv', 'wmv'].includes(ext) || r.blob.type.startsWith('video/');

      if (isTxt) {
        r.blob.text().then((text) => {
          setTextPreviews((prev) => ({
            ...prev,
            [idx]: text,
          }));
        });
      } else if (isDocx) {
        Promise.all([import('mammoth'), import('dompurify')]).then(([mammoth, DOMPurify]) => {
          r.blob.arrayBuffer().then((buf) => {
            mammoth.convertToHtml({ arrayBuffer: buf }).then((res) => {
              setDocxPreviews((prev) => ({
                ...prev,
                [idx]: DOMPurify.default.sanitize(res.value),
              }));
            });
          });
        });
      } else if (isPdf || isAudio || isVideo) {
        const url = URL.createObjectURL(r.blob);
        generatedUrls.push(url);
        urlMap[idx] = url;
      }
    });

    setBlobUrls(urlMap);

    return () => {
      // Clean up object URLs on unmount
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      generatedUrls.forEach((url) => {
        URL.revokeObjectURL(url);
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
    const zipName = 'prizma-converted-files.zip';
    await downloadAll(filesToDownload, zipName);
  };

  const isSingle = results.length === 1;

  if (isSingle) {
    const r = results[0];
    const name = fileNames[0] || r.filename;
    const thumb = thumbnails[0];
    const ratio = r.originalSize > 0 ? (r.convertedSize / r.originalSize) * 100 : 0;
    const isSmaller = r.convertedSize < r.originalSize;
    const diffPercentage = Math.abs(100 - ratio).toFixed(0);

    const ext = r.filename.split('.').pop()?.toLowerCase() || '';
    const isTxt = ext === 'txt' || r.blob.type === 'text/plain';
    const isDocx = ext === 'docx';
    const isPdf = ext === 'pdf' || r.blob.type === 'application/pdf';
    const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'wma'].includes(ext) || r.blob.type.startsWith('audio/');
    const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv', 'wmv'].includes(ext) || r.blob.type.startsWith('video/');

    let Icon: (props: IconProps) => React.JSX.Element = DocumentIcon;
    if (isTxt) Icon = TranscriptionIcon;
    else if (isPdf) Icon = DocumentIcon;
    else if (isDocx) Icon = DocumentIcon;
    else if (isAudio) Icon = AudioIcon;
    else if (isVideo) Icon = VideoIcon;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 flex flex-col gap-6 animate-fade-in w-full">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-prism-g/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Thumbnail / Icon */}
          <div className="w-24 h-24 rounded-xl border border-border bg-background flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="Önizleme" className="object-cover w-full h-full" />
            ) : (
              <Icon className="w-9 h-9 text-muted" />
            )}
          </div>

          <div className="flex-1 w-full flex flex-col gap-3">
            {/* Editable Filename */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted font-mono">{dict?.common?.fileName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleRename(0, e.target.value)}
                className="w-full bg-background border border-border hover:border-muted/50 text-foreground px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-prism-b font-mono"
              />
            </div>

            {/* Size Comparison */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted">{formatFileSize(r.originalSize)}</span>
              <span className="text-muted">→</span>
              <span className={isSmaller ? 'text-prism-g font-bold' : 'text-prism-r font-bold'}>
                {formatFileSize(r.convertedSize)}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] ${
                  isSmaller ? 'bg-prism-g/15 text-prism-g' : 'bg-prism-r/15 text-prism-r'
                }`}
              >
                {isSmaller ? `%${diffPercentage} ${dict?.common?.smaller}` : `%${diffPercentage} ${dict?.common?.larger}`}
              </span>
            </div>
          </div>
        </div>

        {/* Text Preview Box */}
        {isTxt && textPreviews[0] !== undefined && (
          <div className="flex flex-col gap-2 border border-border bg-background/50 rounded-xl p-4 shadow-inner w-full">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-xs font-bold text-muted flex items-center gap-1.5 select-none">
                <TranscriptionIcon className="w-3.5 h-3.5" /> {'Text Preview'}
              </span>
              <button
                onClick={() => handleCopyText(textPreviews[0])}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface hover:bg-surface2 border border-border text-foreground transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-prism-g animate-pulse" strokeWidth={3} />
                    <span className="text-prism-g">{'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>{'Copy'}</span>
                  </>
                )}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans select-text pr-1 pt-1.5">
              {textPreviews[0] || ('Loading text...')}
            </div>
          </div>
        )}

        {/* DOCX Preview Box */}
        {isDocx && docxPreviews[0] !== undefined && (
          <div className="flex flex-col gap-2 border border-border bg-background/50 rounded-xl p-4 shadow-inner w-full">
            <span className="text-xs font-bold text-muted flex items-center gap-1.5 select-none border-b border-border pb-2">
              <DocumentIcon className="w-3.5 h-3.5" /> {'Document Preview'}
            </span>
            <div 
              className="max-h-64 overflow-y-auto text-xs leading-relaxed text-foreground/80 rounded-xl border border-border/60 bg-background p-4 select-text font-sans docx-preview-content"
              dangerouslySetInnerHTML={{ __html: docxPreviews[0] }}
            />
          </div>
        )}

        {/* PDF Preview Box */}
        {isPdf && blobUrls[0] && (
          <div className="flex flex-col gap-2 border border-border bg-background/50 rounded-xl p-4 shadow-inner w-full">
            <span className="text-xs font-bold text-muted flex items-center gap-1.5 select-none">
              <DocumentIcon className="w-3.5 h-3.5" /> {'PDF Preview'}
            </span>
            <iframe src={`${blobUrls[0]}#toolbar=0`} className="w-full h-80 rounded-xl mt-1 border border-border/85" />
          </div>
        )}

        {/* Audio Player Box */}
        {isAudio && blobUrls[0] && (
          <div className="flex flex-col gap-2 border border-border bg-background/50 rounded-xl p-4 shadow-inner w-full">
            <span className="text-xs font-bold text-muted flex items-center gap-1.5 select-none">
              <AudioIcon className="w-3.5 h-3.5" /> {'Audio Preview'}
            </span>
            <audio controls src={blobUrls[0]} className="w-full mt-1 focus:outline-none" />
          </div>
        )}

        {/* Video Player Box */}
        {isVideo && blobUrls[0] && (
          <div className="flex flex-col gap-2 border border-border bg-background/50 rounded-xl p-4 shadow-inner w-full">
            <span className="text-xs font-bold text-muted flex items-center gap-1.5 select-none">
              <VideoIcon className="w-3.5 h-3.5" /> {'Video Preview'}
            </span>
            <video controls src={blobUrls[0]} className="w-full max-h-72 rounded-xl mt-1 border border-border bg-black" />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleDownloadSingle(0)}
            className="flex-1 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {dict?.common?.downloadFile}
          </button>
          <button
            onClick={onReset}
            className="btn-secondary"
          >
            {dict?.common?.newConversion}
          </button>
        </div>
      </div>
    );
  }

  // Multiple files
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="font-bold text-foreground">{dict?.common?.convertedFiles} ({results.length})</h3>
        <button
          onClick={handleDownloadAllZip}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-prism-g/15 text-prism-g hover:bg-prism-g/25 flex items-center gap-1.5"
        >
          <PackageIcon className="w-3.5 h-3.5" /> {dict?.common?.downloadAllZip}
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
        {results.map((r, i) => {
          const ext = r.filename.split('.').pop()?.toLowerCase() || '';
          const isTxt = ext === 'txt' || r.blob.type === 'text/plain';
          const isDocx = ext === 'docx';
          const isPdf = ext === 'pdf' || r.blob.type === 'application/pdf';
          const isAudio = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'wma'].includes(ext) || r.blob.type.startsWith('audio/');
          const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv', 'wmv'].includes(ext) || r.blob.type.startsWith('video/');
          const isPreviewable = isTxt || isDocx || isPdf || isAudio || isVideo;

          return (
            <div key={i} className="flex flex-col gap-1 bg-background border border-border rounded-xl p-3 hover:border-muted/30 transition-all w-full">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <input
                    type="text"
                    value={fileNames[i] || r.filename}
                    onChange={(e) => handleRename(i, e.target.value)}
                    className="bg-transparent border-none text-foreground font-semibold text-sm outline-none focus:bg-surface2 px-1 py-0.5 rounded w-full font-mono"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                    <span>{formatFileSize(r.originalSize)}</span>
                    <span>→</span>
                    <span className={r.convertedSize < r.originalSize ? 'text-prism-g' : 'text-prism-r'}>
                      {formatFileSize(r.convertedSize)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle Preview Button for previewable files */}
                  {isPreviewable && (
                    <button
                      onClick={() => setActivePreviewIndex(activePreviewIndex === i ? null : i)}
                      className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer select-none ${
                        activePreviewIndex === i 
                          ? 'bg-prism-b/15 border-prism-b text-prism-b' 
                          : 'bg-surface2 border-border text-muted hover:text-prism-b hover:border-prism-b/30'
                      }`}
                      title={'Preview'}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDownloadSingle(i)}
                    className="p-2 rounded-lg bg-surface2 border border-border text-muted hover:text-prism-g hover:border-prism-g/30 transition-colors cursor-pointer"
                    title={dict?.common?.downloadFile}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Collapsible Text Preview for this file */}
              {activePreviewIndex === i && (
                <div className="mt-2 flex flex-col gap-2 border border-border/60 bg-surface/50 rounded-lg p-2.5 shadow-inner w-full animate-fade-in text-left">
                  {/* TXT Preview */}
                  {isTxt && textPreviews[i] !== undefined && (
                    <>
                      <div className="flex justify-between items-center border-b border-border pb-1">
                        <span className="text-[10px] font-bold text-muted select-none flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" /> {'Preview'}
                        </span>
                        <button
                          onClick={() => handleCopyText(textPreviews[i])}
                          className="text-[9px] font-bold px-2 py-0.5 rounded bg-surface2 hover:bg-background border border-border text-foreground transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          {copied ? (
                            <span className="text-prism-g">{'Copied!'}</span>
                          ) : (
                            <span>{'Copy'}</span>
                          )}
                        </button>
                      </div>
                      <div className="max-h-36 overflow-y-auto text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans select-text pr-1 pt-1">
                        {textPreviews[i]}
                      </div>
                    </>
                  )}

                  {/* DOCX Preview */}
                  {isDocx && docxPreviews[i] !== undefined && (
                    <>
                      <span className="text-[10px] font-bold text-muted select-none border-b border-border pb-1 flex items-center gap-1">
                        <DocumentIcon className="w-3 h-3" /> {'Document Preview'}
                      </span>
                      <div 
                        className="max-h-48 overflow-y-auto text-[10px] leading-relaxed text-foreground/85 rounded border border-border/60 bg-background p-2.5 select-text font-sans docx-preview-content"
                        dangerouslySetInnerHTML={{ __html: docxPreviews[i] }}
                      />
                    </>
                  )}

                  {/* PDF Preview */}
                  {isPdf && blobUrls[i] && (
                    <>
                      <span className="text-[10px] font-bold text-muted select-none border-b border-border pb-1 flex items-center gap-1">
                        <DocumentIcon className="w-3 h-3" /> {'PDF Preview'}
                      </span>
                      <iframe src={`${blobUrls[i]}#toolbar=0`} className="w-full h-64 rounded mt-1 border border-border/70" />
                    </>
                  )}

                  {/* Audio Preview */}
                  {isAudio && blobUrls[i] && (
                    <>
                      <span className="text-[10px] font-bold text-muted select-none border-b border-border pb-1 flex items-center gap-1">
                        <AudioIcon className="w-3 h-3" /> {'Audio Preview'}
                      </span>
                      <audio controls src={blobUrls[i]} className="w-full mt-1 focus:outline-none" />
                    </>
                  )}

                  {/* Video Preview */}
                  {isVideo && blobUrls[i] && (
                    <>
                      <span className="text-[10px] font-bold text-muted select-none border-b border-border pb-1 flex items-center gap-1">
                        <VideoIcon className="w-3 h-3" /> {'Video Preview'}
                      </span>
                      <video controls src={blobUrls[i]} className="w-full max-h-48 rounded mt-1 border border-border bg-black" />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-border flex justify-end">
        <button
          onClick={onReset}
          className="btn-secondary w-full sm:w-auto"
        >
          {dict?.common?.startNewConversion}
        </button>
      </div>
    </div>
  );
}
