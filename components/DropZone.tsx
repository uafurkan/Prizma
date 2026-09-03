'use client';

import { useCallback, useState, useRef } from 'react';
import type { Dictionary } from '@/dictionaries';

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  dict?: Dictionary;
}

export default function DropZone({ accept, multiple = false, onFiles, label, dict }: DropZoneProps) {
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
          ? 'border-prism-b bg-prism-b/10 shadow-[0_0_40px_rgba(77,159,255,0.2)]'
          : 'border-border hover:border-muted/60 bg-surface/50 hover:bg-surface2/50'
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
              ? 'bg-prism-b/20 scale-110'
              : 'bg-surface2 group-hover:bg-border'
          }`}
        >
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${
              dragOver ? 'text-prism-b' : 'text-muted group-hover:text-foreground'
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
          <p className="text-foreground font-semibold font-sans text-lg">
            {label || dict?.common?.dropFilesHere}
          </p>
          <p className="text-muted text-sm mt-1">
            {multiple ? dict?.common?.multipleFiles : dict?.common?.orClickToSelect}
          </p>
        </div>
      </div>
    </div>
  );
}
