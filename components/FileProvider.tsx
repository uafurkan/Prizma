'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FileContextType {
  globalFiles: File[];
  setGlobalFiles: (files: File[]) => void;
}

const FileContext = createContext<FileContextType>({
  globalFiles: [],
  setGlobalFiles: () => {},
});

export function FileProvider({ children }: { children: ReactNode }) {
  const [globalFiles, setGlobalFiles] = useState<File[]>([]);

  return (
    <FileContext.Provider value={{ globalFiles, setGlobalFiles }}>
      {children}
    </FileContext.Provider>
  );
}

export function useGlobalFiles() {
  return useContext(FileContext);
}
