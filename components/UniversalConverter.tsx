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

  const [sourceSearch, setSourceSearch] = useState('');

  // Extract all unique source formats
  const allSourceFormats = useMemo(() => {
    const formats = new Set<string>();
    DONUSUM_DATA.forEach(d => {
      if (d.fromExt && d.fromExt !== '*') {
        formats.add(d.fromExt.toLowerCase());
      }
    });
    return Array.from(formats).sort();
  }, []);

  const filteredSourceFormats = useMemo(() => {
    if (!sourceSearch) return allSourceFormats;
    return allSourceFormats.filter(ext => ext.includes(sourceSearch.toLowerCase()));
  }, [allSourceFormats, sourceSearch]);

  const activeSource = files.length > 0 ? detectedExt : (sourceFormat === 'detect' ? '' : sourceFormat);

  const availablePairs = activeSource 
    ? DONUSUM_DATA.filter(d => 
        d.fromExt.toLowerCase() === activeSource || 
        (d.fromExt === '*' && files.length > 1)
      )
    : [];

  const targetTabs = useMemo(() => {
    // Check if there are duplicate toExt/to values in availablePairs
    const counts: Record<string, number> = {};
    availablePairs.forEach(p => {
      const key = p.toExt.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });

    return availablePairs.map(p => {
      const ext = p.toExt.toLowerCase();
      const hasDuplicate = counts[ext] > 1;
      
      // If there are duplicate targets for the same extension (like pdf -> pdf split, merge),
      // we show the localized short title (e.g. 'PDF Birleştir', 'PDF Böl') or the full title.
      // Let's use the short version or first two words of baslik
      let label = getTranslatedFormat(p.to, lang).toUpperCase();
      if (hasDuplicate) {
        label = p.baslik[lang as 'tr' | 'en'] || p.baslik.tr;
      }

      return {
        slug: p.slug,
        ext,
        label,
      };
    });
  }, [availablePairs, lang]);

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


  return (
    <div className="flex flex-col md:flex-row items-stretch w-full max-w-4xl mx-auto gap-4 relative animate-fade-in">
      {/* Middle Arrow Icon (absolute on desktop, hidden on mobile) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 bg-surface2 rounded-full border-4 border-background text-muted">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>

      {/* LEFT PANEL: Source */}
      <div className="flex-1 bg-surface border border-border rounded-3xl p-6 flex flex-col relative transition-all shadow-xl">
        {/* Source Selector Button */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className="w-full border border-border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer bg-surface2/50 hover:bg-surface2 hover:border-muted/50 transition-colors text-sm font-semibold text-foreground text-left"
          >
            <span>
              {files.length > 0
                ? sourceFormat === 'detect'
                  ? `${detectedExt.toUpperCase()} (${lang === 'tr' ? 'Algılandı' : 'Detected'})`
                  : sourceFormat.toUpperCase()
                : sourceFormat === 'detect'
                ? (lang === 'tr' ? 'Dosya Türünü Algıla' : 'Detect Format')
                : sourceFormat.toUpperCase()}
            </span>
            <svg className={`w-4 h-4 text-muted transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSourceDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setShowSourceDropdown(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 right-0 mt-2 z-40 bg-surface2 border border-border rounded-2xl shadow-2xl p-4 flex flex-col gap-3 max-h-80">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder={lang === 'tr' ? 'Format ara...' : 'Search format...'}
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-prism-b"
                />
                
                <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-2 scrollbar-none">
                  {/* Detect Format option */}
                  {(!sourceSearch || (lang === 'tr' ? 'algıla' : 'detect').includes(sourceSearch.toLowerCase())) && (
                    <button
                      onClick={() => {
                        selectSourceFormat('detect');
                        setShowSourceDropdown(false);
                        setSourceSearch('');
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${
                        sourceFormat === 'detect'
                          ? 'bg-prism-b/10 text-prism-b'
                          : 'text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <span>{lang === 'tr' ? 'Dosya Türünü Algıla' : 'Detect Format'}</span>
                      {sourceFormat === 'detect' && <span className="text-xs">✓</span>}
                    </button>
                  )}
                  
                  {/* Grid of other formats */}
                  <div className="grid grid-cols-4 gap-1">
                    {filteredSourceFormats.map((ext) => (
                      <button
                        key={ext}
                        onClick={() => {
                          selectSourceFormat(ext);
                          setShowSourceDropdown(false);
                          setSourceSearch('');
                        }}
                        className={`px-2 py-2.5 text-[10px] font-black rounded-lg transition-colors text-center uppercase ${
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
              </div>
            </>
          )}
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
                <div className="mt-2 p-3 bg-prism-o/5 border border-prism-o/20 rounded-lg flex items-start gap-3 text-left">
                  <svg className="w-5 h-5 text-prism-o shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-xs text-foreground">
                    <p className="font-bold mb-0.5">{dict.convertPage?.largeFileWarningTitle || 'Large File Warning'}</p>
                    <p className="text-muted leading-relaxed">{dict.convertPage?.largeFileWarningDesc || 'You selected a file larger than 1GB. Web browsers have limited processing memory. If the conversion fails, try a smaller file.'}</p>
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
        {/* Target Selector Button */}
        <div className="relative mb-4">
          <button
            disabled={activeSource === ''}
            onClick={() => setShowTargetDropdown(!showTargetDropdown)}
            className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between transition-colors text-sm font-semibold text-left ${
              activeSource === ''
                ? 'border-border bg-surface2/20 text-muted cursor-not-allowed'
                : 'border-border bg-surface2/50 hover:bg-surface2 hover:border-muted/50 text-foreground cursor-pointer'
            }`}
          >
            <span>
              {activeSource === ''
                ? (lang === 'tr' ? 'Hedef Format' : 'Target Format')
                : targetSlug
                ? (targetTabs.find(t => t.slug === targetSlug)?.label || '')
                : (lang === 'tr' ? 'Hedef Format Seçin' : 'Select Target Format')}
            </span>
            <svg className={`w-4 h-4 text-muted transition-transform ${showTargetDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTargetDropdown && activeSource !== '' && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setShowTargetDropdown(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 right-0 mt-2 z-40 bg-surface2 border border-border rounded-2xl shadow-2xl p-3 max-h-60 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {targetTabs.map((tab) => (
                    <button
                      key={tab.slug}
                      onClick={() => {
                        setTargetSlug(tab.slug);
                        setShowTargetDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${
                        targetSlug === tab.slug
                          ? 'bg-prism-b/10 text-prism-b'
                          : 'text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {targetSlug === tab.slug && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </>
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
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-2">
                {availablePairs.map((pair) => {
                  const label = targetTabs.find(t => t.slug === pair.slug)?.label || getTranslatedFormat(pair.to, lang);
                  return (
                    <button
                      key={pair.slug}
                      onClick={() => setTargetSlug(pair.slug)}
                      className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-border hover:border-muted hover:bg-surface2 bg-background transition-all"
                    >
                      <span 
                        className="text-xs font-black px-2 py-1 rounded-md text-center break-words max-w-full"
                        style={{ 
                          color: getFormatRenk(pair.to), 
                          backgroundColor: `color-mix(in srgb, ${getFormatRenk(pair.to)} 25%, transparent)` 
                        }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
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
            <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-2">
              {availablePairs.map((pair) => {
                const label = targetTabs.find(t => t.slug === pair.slug)?.label || getTranslatedFormat(pair.to, lang);
                return (
                  <button
                    key={pair.slug}
                    onClick={() => setTargetSlug(pair.slug)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-border hover:border-muted hover:bg-surface2 bg-background transition-all"
                  >
                    <span 
                      className="text-xs font-black px-2 py-1 rounded-md text-center break-words max-w-full"
                      style={{ 
                        color: getFormatRenk(pair.to), 
                        backgroundColor: `color-mix(in srgb, ${getFormatRenk(pair.to)} 25%, transparent)` 
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
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
