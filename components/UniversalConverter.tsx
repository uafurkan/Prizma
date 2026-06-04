'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalFiles } from '@/components/FileProvider';
import { DONUSUM_DATA, getFormatRenk } from '@/lib/donusum-data';

export default function UniversalConverter() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [detectedExt, setDetectedExt] = useState<string>('');
  const [targetSlug, setTargetSlug] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setGlobalFiles } = useGlobalFiles();

  const handleFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setFiles(newFiles);
    
    const ext = newFiles[0].name.split('.').pop()?.toLowerCase() || '';
    let normalizedExt = ext;
    if (ext === 'jpeg') normalizedExt = 'jpg';
    
    setDetectedExt(normalizedExt);
    setTargetSlug(''); 
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
    router.push(`/${targetSlug}`);
  };

  const availablePairs = detectedExt 
    ? DONUSUM_DATA.filter(d => d.fromExt.toLowerCase() === detectedExt || d.fromExt === '*')
    : [];

  return (
    <div className="flex flex-col md:flex-row items-stretch w-full max-w-4xl mx-auto gap-4 relative animate-fade-in">
      {/* Middle Arrow Icon (absolute on desktop, hidden on mobile) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 bg-[#12121e] rounded-full border-4 border-[#06060c] text-[#5a5a7a]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>

      {/* LEFT PANEL: Source */}
      <div className="flex-1 bg-[#0d0d18] border border-[#1c1c2e] rounded-3xl p-6 flex flex-col relative overflow-hidden transition-all shadow-xl">
        <h3 className="text-sm font-bold text-[#5a5a7a] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>📄</span> Kaynak Dosya
        </h3>
        
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
              dragActive ? 'border-[#4d9fff] bg-[#4d9fff]/5' : 'border-[#1c1c2e] hover:border-[#5a5a7a] hover:bg-[#12121e]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-[#1c1c2e] flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-[#e8e8f4] font-bold">Dosyaları buraya sürükleyin</p>
            <p className="text-xs text-[#5a5a7a]">veya seçmek için tıklayın</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-6 bg-[#06060c] rounded-2xl border border-[#1c1c2e]">
             <div className="w-20 h-20 rounded-2xl bg-[#12121e] border border-[#1c1c2e] flex items-center justify-center relative shadow-inner">
                <span className="text-xs font-black text-[#e8e8f4] absolute bottom-3 uppercase tracking-wider">{detectedExt}</span>
                <svg className="w-8 h-8 text-[#5a5a7a] absolute top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
             <div>
               <p className="font-bold text-[#e8e8f4] truncate max-w-[200px] mx-auto text-sm">{files[0].name}</p>
               {files.length > 1 && (
                 <p className="text-xs text-[#4d9fff] font-bold mt-1">ve {files.length - 1} dosya daha</p>
               )}
             </div>
             <button 
                onClick={() => { setFiles([]); setDetectedExt(''); setTargetSlug(''); }}
                className="text-xs text-[#ff4d6d] hover:text-white transition-colors bg-[#ff4d6d]/10 px-4 py-2 rounded-lg font-bold mt-2"
             >
                Dosyayı Değiştir
             </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Target */}
      <div className="flex-1 bg-[#0d0d18] border border-[#1c1c2e] rounded-3xl p-6 flex flex-col relative transition-all shadow-xl">
        <h3 className="text-sm font-bold text-[#5a5a7a] mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>🎯</span> Hedef Format
        </h3>
        
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#5a5a7a] min-h-[180px]">
            <svg className="w-8 h-8 opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Önce sol tarafa bir dosya yükleyin</p>
          </div>
        ) : availablePairs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center bg-[#ff4d6d]/5 border border-[#ff4d6d]/20 rounded-2xl">
            <span className="text-3xl mb-1">⚠️</span>
            <p className="text-sm text-[#ff4d6d] font-bold">Desteklenmeyen Format</p>
            <p className="text-xs text-[#5a5a7a]">.{detectedExt} dosyası için bir dönüşüm bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <p className="text-xs font-bold text-[#e8e8f4] mb-3">Dönüştürülecek formatı seçin:</p>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-1">
                {availablePairs.map((pair) => (
                  <button
                    key={pair.slug}
                    onClick={() => setTargetSlug(pair.slug)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border transition-all ${
                      targetSlug === pair.slug 
                        ? 'border-[#4d9fff] bg-[#4d9fff]/10 shadow-[0_0_15px_rgba(77,159,255,0.15)]' 
                        : 'border-[#1c1c2e] hover:border-[#5a5a7a] hover:bg-[#12121e] bg-[#06060c]'
                    }`}
                  >
                    <span 
                      className="text-sm font-black px-2 py-1 rounded-md font-mono"
                      style={{ 
                        color: getFormatRenk(pair.to), 
                        backgroundColor: targetSlug === pair.slug ? 'transparent' : `${getFormatRenk(pair.to)}15` 
                      }}
                    >
                      {pair.to}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              disabled={!targetSlug}
              onClick={onConvertClick}
              className={`mt-4 w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                targetSlug 
                  ? 'bg-gradient-to-r from-[#4d9fff] to-[#b56cff] text-white hover:shadow-[0_0_20px_rgba(77,159,255,0.3)] hover:opacity-90' 
                  : 'bg-[#1c1c2e] text-[#5a5a7a] cursor-not-allowed'
              }`}
            >
              Hemen Dönüştür
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
