import JSZip from 'jszip'

export interface ArchiveEntry {
  name: string
  blob: Blob
}

/* ========================================================================== */
/*  filesToZip – multiple files → ZIP with DEFLATE compression                */
/* ========================================================================== */

export async function filesToZip(
  files: File[] | ArchiveEntry[],
  outputName = 'archive.zip'
): Promise<Blob> {
  const zip = new JSZip()

  for (const file of files) {
    if (file instanceof File) {
      zip.file(file.name, file.arrayBuffer())
    } else {
      zip.file(file.name, file.blob.arrayBuffer())
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  // Attach the desired name via a new Blob (the name is used downstream)
  return new File([blob], outputName, { type: 'application/zip' })
}

/* ========================================================================== */
/*  extractZip – ZIP → array of { name, blob }                               */
/* ========================================================================== */

export async function extractZip(file: File): Promise<ArchiveEntry[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const entries: ArchiveEntry[] = []

  const fileEntries = Object.entries(zip.files).filter(
    ([, entry]) => !entry.dir
  )

  for (const [name, entry] of fileEntries) {
    const data = await entry.async('blob')
    entries.push({ name, blob: data })
  }

  return entries
}
