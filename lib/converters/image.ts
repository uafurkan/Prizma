export interface ConversionResult {
  blob: Blob
  filename: string
  originalSize: number
  convertedSize: number
  width?: number
  height?: number
}

/* ---------- MIME helpers ---------- */

const FORMAT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  bmp: 'image/bmp',
}

function mimeForFormat(ext: string): string {
  return FORMAT_MIME[ext.toLowerCase()] ?? 'image/png'
}

function replaceExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}.${ext}`
}

/* ---------- loadImage ---------- */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      },
      mime,
      quality
    )
  })
}

/* ========================================================================== */
/*  convertViaCanvas – JPG / PNG / WEBP / AVIF / GIF / BMP via Canvas API     */
/* ========================================================================== */

export async function convertViaCanvas(
  file: File,
  targetFormat: string,
  quality = 0.92
): Promise<ConversionResult> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const mime = mimeForFormat(targetFormat)
    const blob = await canvasToBlob(canvas, mime, quality)

    return {
      blob,
      filename: replaceExt(file.name, targetFormat),
      originalSize: file.size,
      convertedSize: blob.size,
      width: canvas.width,
      height: canvas.height,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/* ========================================================================== */
/*  convertSVGtoRaster – SVG → PNG / JPG with 2× scaling                     */
/* ========================================================================== */

export async function convertSVGtoRaster(
  file: File,
  targetFormat: 'png' | 'jpg' | 'jpeg' = 'png',
  scale = 2
): Promise<ConversionResult> {
  const svgText = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgEl = doc.documentElement

  // Try to read the intrinsic size from the SVG attributes or viewBox
  let w = parseFloat(svgEl.getAttribute('width') || '0')
  let h = parseFloat(svgEl.getAttribute('height') || '0')
  if ((!w || !h) && svgEl.getAttribute('viewBox')) {
    const parts = svgEl.getAttribute('viewBox')!.split(/[\s,]+/).map(Number)
    if (parts.length === 4) {
      w = w || parts[2]
      h = h || parts[3]
    }
  }
  w = w || 300
  h = h || 150

  const scaledW = Math.round(w * scale)
  const scaledH = Math.round(h * scale)

  const blob64 = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob64)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = scaledW
    canvas.height = scaledH
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, scaledW, scaledH)

    const mime = mimeForFormat(targetFormat)
    const outBlob = await canvasToBlob(canvas, mime, 0.92)

    return {
      blob: outBlob,
      filename: replaceExt(file.name, targetFormat),
      originalSize: file.size,
      convertedSize: outBlob.size,
      width: scaledW,
      height: scaledH,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/* ========================================================================== */
/*  convertHEIC – HEIC → JPG / PNG / WEBP via heic2any                       */
/* ========================================================================== */

export async function convertHEIC(
  file: File,
  targetFormat: 'jpg' | 'jpeg' | 'png' | 'webp' = 'jpg',
  quality = 0.92
): Promise<ConversionResult> {
  const heic2any = (await import('heic2any')).default

  const toType = targetFormat === 'jpg' ? 'image/jpeg' : mimeForFormat(targetFormat)

  const result = await heic2any({
    blob: file,
    toType,
    quality,
  })

  const blob = Array.isArray(result) ? result[0] : result

  // Read dimensions from the converted blob
  const url = URL.createObjectURL(blob)
  let width: number | undefined
  let height: number | undefined
  try {
    const img = await loadImage(url)
    width = img.naturalWidth
    height = img.naturalHeight
  } catch {
    // dimensions are optional
  } finally {
    URL.revokeObjectURL(url)
  }

  return {
    blob,
    filename: replaceExt(file.name, targetFormat === 'jpg' ? 'jpg' : targetFormat),
    originalSize: file.size,
    convertedSize: blob.size,
    width,
    height,
  }
}

/* ========================================================================== */
/*  imagesToPDF – Multiple images → single PDF via pdf-lib                    */
/* ========================================================================== */

export async function imagesToPDF(
  files: File[],
  outputName = 'images.pdf'
): Promise<ConversionResult> {
  const { PDFDocument } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  let totalOriginalSize = 0

  for (const file of files) {
    totalOriginalSize += file.size
    const bytes = new Uint8Array(await file.arrayBuffer())
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    let embeddedImage
    if (ext === 'png') {
      embeddedImage = await pdfDoc.embedPng(bytes)
    } else if (['jpg', 'jpeg'].includes(ext)) {
      embeddedImage = await pdfDoc.embedJpg(bytes)
    } else {
      // For other formats (webp, bmp, gif, avif, heic, svg…),
      // convert to PNG via canvas first, then embed
      const pngResult = await convertViaCanvas(file, 'png')
      const pngBytes = new Uint8Array(await pngResult.blob.arrayBuffer())
      embeddedImage = await pdfDoc.embedPng(pngBytes)
    }

    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height])
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })

  return {
    blob,
    filename: outputName,
    originalSize: totalOriginalSize,
    convertedSize: blob.size,
  }
}

/* ========================================================================== */
/*  pdfToImages – PDF pages → individual PNG images via pdfjs-dist            */
/* ========================================================================== */

export async function pdfToImages(
  file: File,
  scale = 2,
  outputExt: 'png' | 'jpg' = 'png'
): Promise<ConversionResult[]> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set up the worker – use the bundled worker from pdfjs-dist
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }

  const arrayBuf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
  const results: ConversionResult[] = []
  const baseName = file.name.replace(/\.pdf$/i, '')

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx, viewport, canvas } as import('pdfjs-dist/types/src/display/api').RenderParameters).promise

    const mime = outputExt === 'jpg' ? 'image/jpeg' : 'image/png'
    const blob = await canvasToBlob(canvas, mime)

    results.push({
      blob,
      filename: `${baseName}_page_${i}.${outputExt}`,
      originalSize: file.size,
      convertedSize: blob.size,
      width: canvas.width,
      height: canvas.height,
    })
  }

  return results
}
