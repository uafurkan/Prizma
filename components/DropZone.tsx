'use client';

import { useCallback, useState, useRef } from 'react';

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
}

export default function DropZone({ accept, multiple = false, onFiles, label }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
        dragOver
          ? 'border-[#4d9fff] bg-[#4d9fff]/10 shadow-[0_0_40px_rgba(77,159,255,0.2)]'
          : 'border-[#1c1c2e] hover:border-[#5a5a7a]/60 bg-[#0d0d18]/50 hover:bg-[#12121e]/50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
        {/* Upload icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragOver
              ? 'bg-[#4d9fff]/20 scale-110'
              : 'bg-[#12121e] group-hover:bg-[#1c1c2e]'
          }`}
        >
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${
              dragOver ? 'text-[#4d9fff]' : 'text-[#5a5a7a] group-hover:text-[#e8e8f4]'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[#e8e8f4] font-semibold font-sans text-lg">
            {label || 'Dosyanızı sürükleyin veya tıklayın'}
          </p>
          <p className="text-[#5a5a7a] text-sm mt-1">
            {multiple ? 'Birden fazla dosya seçebilirsiniz' : 'veya dosya seçmek için tıklayın'}
          </p>
        </div>
      </div>
    </div>
  );
}
