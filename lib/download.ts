import { filesToZip } from './converters/archive'

/* ========================================================================== */
/*  downloadBlob – create a temporary <a> element, click, and revoke          */
/* ========================================================================== */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  // Append to body so it works in Firefox
  document.body.appendChild(a)
  a.click()

  // Clean up after a short delay to allow the download to start
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

/* ========================================================================== */
/*  downloadAll – single file → direct download, multiple → pack as ZIP       */
/* ========================================================================== */

export interface DownloadableFile {
  blob: Blob
  filename: string
}

export async function downloadAll(
  files: DownloadableFile[],
  zipName = 'prizma-output.zip'
): Promise<void> {
  if (files.length === 0) return

  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].filename)
    return
  }

  // Multiple files → bundle into a ZIP
  const archiveEntries = files.map((f) => ({
    name: f.filename,
    blob: f.blob,
  }))

  const zipBlob = await filesToZip(archiveEntries, zipName)
  downloadBlob(zipBlob, zipName)
}
