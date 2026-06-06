'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalFiles } from '@/components/FileProvider';
import { DONUSUM_DATA, getFormatRenk, getTranslatedFormat, getDonusumPath } from '@/lib/donusum-data';
import { getDictionary } from '@/dictionaries';

export default function UniversalConverter({ lang }: { lang: string }) {
  const dict = getDictionary(lang);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [detectedExt, setDetectedExt] = useState<string>('');
  const [sourceFormat, setSourceFormat] = useState<string>('detect');
  const [targetSlug, setTargetSlug] = useState<string>('');
  const [showSizeWarning, setShowSizeWarning] = useState<boolean>(false);
  
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setGlobalFiles } = useGlobalFiles();

  // Extract all unique source formats except quick ones
  const allSourceFormats = useMemo(() => {
    const formats = new Set<string>();
    DONUSUM_DATA.forEach(d => {
      if (d.fromExt && d.fromExt !== '*') {
        formats.add(d.fromExt.toLowerCase());
      }
    });
    const exclude = ['jpg', 'png', 'mp4', 'pdf'];
    return Array.from(formats)
      .filter(f => !exclude.includes(f))
      .sort();
  }, []);

  const activeSource = files.length > 0 ? detectedExt : (sourceFormat === 'detect' ? '' : sourceFormat);

  const availablePairs = activeSource 
    ? DONUSUM_DATA.filter(d => 
        d.fromExt.toLowerCase() === activeSource || 
        (d.fromExt === '*' && files.length > 1)
      )
    : [];

  const targetTabs = useMemo(() => {
    return availablePairs.map(p => ({
      slug: p.slug,
      ext: p.toExt.toLowerCase(),
      label: p.to.toUpperCase(),
    }));
  }, [availablePairs]);

  const selectSourceFormat = (format: string) => {
    setSourceFormat(format);
    
    // Clear files if they are incompatible with the selected format
    if (files.length > 0) {
      const ext = files[0].name.split('.').pop()?.toLowerCase() || '';
      let normalizedExt = ext;
      if (ext === 'jpeg') normalizedExt = 'jpg';
      
      if (format !== 'detect' && normalizedExt !== format) {
        setFiles([]);
        setDetectedExt('');
        setTargetSlug('');
        setShowSizeWarning(false);
      }
    } else {
      // If no files are loaded, reset targetSlug if it's not compatible with the new source format
      const compatiblePairs = DONUSUM_DATA.filter(d => d.fromExt.toLowerCase() === format);
      const stillValid = compatiblePairs.some(p => p.slug === targetSlug);
      if (!stillValid) {
        setTargetSlug('');
      }
    }
  };

  const handleFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    // Check if any file is over 1GB (1024 * 1024 * 1024 bytes)
    const hasLargeFile = newFiles.some(f => f.size > 1024 * 1024 * 1024);
    setShowSizeWarning(hasLargeFile);
    
    const ext = newFiles[0].name.split('.').pop()?.toLowerCase() || '';
    let normalizedExt = ext;
    if (ext === 'jpeg') normalizedExt = 'jpg';
    
    setFiles(newFiles);
    setDetectedExt(normalizedExt);

    // If specific format is selected and doesn't match the file, auto-update the selector
    if (sourceFormat !== 'detect' && sourceFormat !== normalizedExt) {
      setSourceFormat(normalizedExt);
    }

    // Direct redirection if targetSlug is pre-selected and valid for the new file
    const matchingPair = DONUSUM_DATA.find(d => d.slug === targetSlug);
    const isValidForFile = matchingPair && (
      matchingPair.fromExt.toLowerCase() === normalizedExt || 
      (matchingPair.fromExt === '*' && newFiles.length > 1)
    );

    if (isValidForFile) {
      setGlobalFiles(newFiles);
      router.push(getDonusumPath(lang, targetSlug));
    } else {
      // Reset targetSlug if it is no longer valid for the uploaded file
      const isValid = DONUSUM_DATA.some(d => d.slug === targetSlug && d.fromExt.toLowerCase() === normalizedExt);
      if (!isValid) {
        setTargetSlug('');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const onConvertClick = () => {
    if (!targetSlug || files.length === 0) return;
    setGlobalFiles(files);
    router.push(getDonusumPath(lang, targetSlug));
  };

  const isSourceInDropdown = sourceFormat !== 'detect' && !['jpg', 'png', 'mp4', 'pdf'].includes(sourceFormat);
  const isTargetInDropdown = targetTabs.slice(3).some(t => t.slug === targetSlug);
  const activeTargetLabel = targetTabs.find(t => t.slug === targetSlug)?.label || '';

  return (
    <div className="flex flex-col md:flex-row items-stretch w-full max-w-4xl mx-auto gap-4 relative animate-fade-in">
      {/* Middle Arrow Icon (absolute on desktop, hidden on mobile) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 bg-surface2 rounded-full border-4 border-background text-muted">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>

      {/* LEFT PANEL: Source */}
      <div className="flex-1 bg-surface border border-border rounded-3xl p-6 flex flex-col relative overflow-hidden transition-all shadow-xl">
        {/* LEFT PANEL HEADER / TOOLBAR */}
        <div className="flex items-center border-b border-border -mx-6 px-6 pb-3 mb-4 overflow-x-auto scrollbar-none gap-1">
          {/* Detect Format Tab */}
          <button
            onClick={() => selectSourceFormat('detect')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              sourceFormat === 'detect'
                ? 'bg-prism-b/10 text-prism-b border border-prism-b/30'
                : 'text-muted hover:text-foreground hover:bg-surface2'
            }`}
          >
            {sourceFormat === 'detect' && detectedExt
              ? `${detectedExt.toUpperCase()} (${lang === 'tr' ? 'Algılandı' : 'Detected'})`
              : (lang === 'tr' ? 'Dosya Türünü Algıla' : 'Detect Format')}
          </button>

          {/* Quick Source Tabs */}
          {['jpg', 'png', 'mp4', 'pdf'].map((ext) => (
            <button
              key={ext}
              onClick={() => selectSourceFormat(ext)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                sourceFormat === ext
                  ? 'bg-prism-b/10 text-prism-b border border-prism-b/30'
                  : 'text-muted hover:text-foreground hover:bg-surface2'
              }`}
            >
              {ext.toUpperCase()}
            </button>
          ))}

          {/* Source Dropdown for remaining formats */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                isSourceInDropdown
                  ? 'bg-prism-b/10 text-prism-b border border-prism-b/30'
                  : 'text-muted hover:text-foreground hover:bg-surface2'
              }`}
            >
              <span>{isSourceInDropdown ? sourceFormat.toUpperCase() : (lang === 'tr' ? 'Diğer' : 'Other')}</span>
              <svg className={`w-3 h-3 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSourceDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSourceDropdown(false)} />
                <div className="absolute left-0 mt-2 z-40 bg-surface2 border border-border rounded-xl shadow-2xl p-2 w-72 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    {allSourceFormats.map((ext) => (
                      <button
                        key={ext}
                        onClick={() => {
                          selectSourceFormat(ext);
                          setShowSourceDropdown(false);
                        }}
                        className={`px-2 py-2.5 text-[10px] font-black rounded-lg transition-all text-center uppercase ${
                          sourceFormat === ext
                            ? 'bg-prism-b/10 text-prism-b border border-prism-b/20'
                            : 'text-muted hover:text-foreground hover:bg-surface'
                        }`}
                      >
                        {ext}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        
        {files.length === 0 ? (
          <div 
            className={`flex-1 min-h-[180px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-prism-b bg-prism-b/5' : 'border-border hover:border-muted hover:bg-surface2'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-foreground font-bold">{dict.common.dropFilesHere}</p>
            <p className="text-xs text-muted">{dict.common.orClickToSelect}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-6 bg-background rounded-2xl border border-border">
             <div className="w-20 h-20 rounded-2xl bg-surface2 border border-border flex items-center justify-center relative shadow-inner">
                <span className="text-xs font-black text-foreground absolute bottom-3 uppercase tracking-wider">{detectedExt}</span>
                <svg className="w-8 h-8 text-muted absolute top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
             <div>
                <p className="font-bold text-foreground truncate max-w-[200px] mx-auto text-sm">{files[0].name}</p>
                {files.length > 1 && (
                  <p className="text-xs text-prism-b font-bold mt-1">{dict.common.andMore.replace('{count}', (files.length - 1).toString())}</p>
                )}
             </div>
             {showSizeWarning && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 text-left">
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
                onClick={() => { setFiles([]); setDetectedExt(''); setTargetSlug(''); setShowSizeWarning(false); }}
                className="text-xs text-prism-r hover:text-white transition-colors bg-prism-r/10 px-4 py-2 rounded-lg font-bold mt-2"
             >
                {dict.common.changeFile}
             </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Target */}
      <div className="flex-1 bg-surface border border-border rounded-3xl p-6 flex flex-col relative transition-all shadow-xl">
        {/* RIGHT PANEL HEADER / TOOLBAR */}
        <div className="flex items-center border-b border-border -mx-6 px-6 pb-3 mb-4 overflow-x-auto scrollbar-none">
          {activeSource === '' ? (
            <div className="text-xs font-bold text-muted py-1.5">
              {lang === 'tr' ? 'Hedef Format' : 'Target Format'}
            </div>
          ) : (
            <div className="flex items-center gap-1 w-full">
              {/* Target Tabs */}
              {targetTabs.slice(0, 3).map((tab) => (
                <button
                  key={tab.slug}
                  onClick={() => setTargetSlug(tab.slug)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    targetSlug === tab.slug
                      ? 'bg-prism-b/10 text-prism-b border border-prism-b/30'
                      : 'text-muted hover:text-foreground hover:bg-surface2'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {/* Target Dropdown for remaining formats */}
              {targetTabs.length > 3 && (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      isTargetInDropdown
                        ? 'bg-prism-b/10 text-prism-b border border-prism-b/30'
                        : 'text-muted hover:text-foreground hover:bg-surface2'
                    }`}
                  >
                    <span>{isTargetInDropdown ? activeTargetLabel : (lang === 'tr' ? 'Diğer' : 'Other')}</span>
                    <svg className={`w-3 h-3 transition-transform ${showTargetDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showTargetDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowTargetDropdown(false)} />
                      <div className="absolute left-0 mt-2 z-40 bg-surface2 border border-border rounded-xl shadow-2xl p-2 w-44 max-h-48 overflow-y-auto">
                        <div className="flex flex-col gap-1">
                          {targetTabs.slice(3).map((tab) => (
                            <button
                              key={tab.slug}
                              onClick={() => {
                                setTargetSlug(tab.slug);
                                setShowTargetDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                                targetSlug === tab.slug
                                  ? 'bg-prism-b/10 text-prism-b'
                                  : 'text-muted hover:text-foreground hover:bg-surface'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {files.length === 0 ? (
          activeSource === '' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted min-h-[180px]">
              <svg className="w-8 h-8 opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-xs font-medium text-center px-4">
                {lang === 'tr'
                  ? 'Dosya türünü seçin veya sol tarafa bir dosya yükleyin'
                  : 'Select a format or upload a file on the left'}
              </p>
            </div>
          ) : !targetSlug ? (
            <div className="flex-1 flex flex-col justify-center min-h-[180px]">
              <p className="text-xs font-bold text-foreground mb-3">{dict.common.selectTargetFormat}</p>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-1">
                {availablePairs.map((pair) => (
                  <button
                    key={pair.slug}
                    onClick={() => setTargetSlug(pair.slug)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-border hover:border-muted hover:bg-surface2 bg-background transition-all"
                  >
                    <span 
                      className="text-sm font-black px-2 py-1 rounded-md font-mono"
                      style={{ 
                        color: getFormatRenk(pair.to), 
                        backgroundColor: `color-mix(in srgb, ${getFormatRenk(pair.to)} 25%, transparent)` 
                      }}
                    >
                      {getTranslatedFormat(pair.to, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between h-full min-h-[180px]">
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black px-3 py-1.5 rounded-lg font-mono bg-prism-b/15 text-prism-b border border-prism-b/20">
                    {activeSource.toUpperCase()}
                  </span>
                  <svg className="w-5 h-5 text-muted animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span className="text-sm font-black px-3 py-1.5 rounded-lg font-mono bg-prism-g/15 text-prism-g border border-prism-g/20">
                    {targetTabs.find(t => t.slug === targetSlug)?.label || ''}
                  </span>
                </div>
                <p className="text-xs text-muted text-center px-4 max-w-xs">
                  {lang === 'tr'
                    ? 'Dönüşümü tamamlamak için kaynak dosyanızı seçin.'
                    : 'Select your source file to complete the conversion.'}
                </p>
              </div>
              
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-prism-b to-prism-p text-white hover:shadow-[0_0_20px_rgba(77,159,255,0.3)] hover:opacity-90"
              >
                {lang === 'tr' ? 'Dönüştürülecek Dosyayı Seç' : 'Select File to Convert'}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )
        ) : availablePairs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center bg-prism-r/5 border border-prism-r/20 rounded-2xl min-h-[180px]">
            <span className="text-3xl mb-1">⚠️</span>
            <p className="text-sm text-prism-r font-bold">{dict.common.unsupportedFormat}</p>
            <p className="text-xs text-muted">{dict.common.noConversionFound.replace('{ext}', detectedExt)}</p>
          </div>
        ) : !targetSlug ? (
          <div className="flex-1 flex flex-col justify-center min-h-[180px]">
            <p className="text-xs font-bold text-foreground mb-3">{dict.common.selectTargetFormat}</p>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-1">
              {availablePairs.map((pair) => (
                <button
                  key={pair.slug}
                  onClick={() => setTargetSlug(pair.slug)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-border hover:border-muted hover:bg-surface2 bg-background transition-all"
                >
                  <span 
                    className="text-sm font-black px-2 py-1 rounded-md font-mono"
                    style={{ 
                      color: getFormatRenk(pair.to), 
                      backgroundColor: `color-mix(in srgb, ${getFormatRenk(pair.to)} 25%, transparent)` 
                    }}
                  >
                    {getTranslatedFormat(pair.to, lang)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between min-h-[180px]">
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <p className="text-sm font-bold text-foreground mb-2">
                {lang === 'tr' ? 'Dönüşüm Hazır' : 'Conversion Ready'}
              </p>
              <div className="flex items-center gap-3 bg-surface2/50 border border-border px-4 py-2 rounded-xl">
                <span className="text-xs font-mono font-bold text-muted">{activeSource.toUpperCase()}</span>
                <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-mono font-bold text-prism-b">{targetTabs.find(t => t.slug === targetSlug)?.label || ''}</span>
              </div>
            </div>
            
            <button
              onClick={onConvertClick}
              className="mt-4 w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-prism-b to-prism-p text-white hover:shadow-[0_0_20px_rgba(77,159,255,0.3)] hover:opacity-90"
            >
              {dict.common.convert}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
