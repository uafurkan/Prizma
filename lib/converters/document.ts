// pdf-lib, xlsx, mammoth loaded dynamically
export interface DocConversionResult {
  blob: Blob
  filename: string
}

/* ---------- Helpers ---------- */

function replaceExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}.${ext}`
}

/**
 * Word-wraps text to fit within `maxWidth` using a given font and fontSize.
 * Returns an array of lines ready to be rendered.
 */
function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  fontSize: number,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('')
      continue
    }
    const words = paragraph.split(/\s+/)
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)
      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
  }

  return lines
}

/* ========================================================================== */
/*  docxToHTML – DOCX → HTML via mammoth                                      */
/* ========================================================================== */

export async function docxToHTML(file: File): Promise<DocConversionResult> {
  const mammoth = await import('mammoth')
  const arrayBuf = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuf })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace(/\.docx?$/i, '')}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    td, th { border: 1px solid #ccc; padding: 0.5rem; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return {
    blob,
    filename: replaceExt(file.name, 'html'),
  }
}

/* ========================================================================== */
/*  textToPDF – HTML / TXT / MD → PDF via pdf-lib with word-wrap pagination   */
/* ========================================================================== */

export async function textToPDF(
  file: File,
  outputName?: string
): Promise<DocConversionResult> {
  const text = await file.text()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'txt'

  // Strip HTML tags for HTML files, keeping text content
  let plainText: string
  if (ext === 'html' || ext === 'htm') {
    // Use DOMParser when in browser to extract text from HTML
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      plainText = doc.body.textContent ?? text
    } else {
      // Fallback: strip tags with regex
      plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    }
  } else {
    plainText = text
  }

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 12
  const margin = 50
  const pageWidth = 595.28 // A4
  const pageHeight = 841.89
  const usableWidth = pageWidth - margin * 2
  const lineHeight = fontSize * 1.4

  const lines = wrapText(plainText, font, fontSize, usableWidth)

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    if (line !== '') {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
    }
    y -= lineHeight
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })

  return {
    blob,
    filename: outputName ?? replaceExt(file.name, 'pdf'),
  }
}

/* ========================================================================== */
/*  mergePDFs – combine multiple PDFs into one                                */
/* ========================================================================== */

export async function mergePDFs(
  files: File[],
  outputName = 'merged.pdf'
): Promise<DocConversionResult> {
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const donor = await PDFDocument.load(bytes)
    const indices = donor.getPageIndices()
    const copiedPages = await merged.copyPages(donor, indices)
    for (const page of copiedPages) {
      merged.addPage(page)
    }
  }

  const pdfBytes = await merged.save()
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })

  return { blob, filename: outputName }
}

/* ========================================================================== */
/*  splitPDF – split a single PDF into individual page PDFs                   */
/* ========================================================================== */

export async function splitPDF(
  file: File
): Promise<DocConversionResult[]> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { PDFDocument } = await import('pdf-lib')
  const source = await PDFDocument.load(bytes)
  const results: DocConversionResult[] = []
  const baseName = file.name.replace(/\.pdf$/i, '')

  for (let i = 0; i < source.getPageCount(); i++) {
    const singleDoc = await PDFDocument.create()
    const [copiedPage] = await singleDoc.copyPages(source, [i])
    singleDoc.addPage(copiedPage)

    const singleBytes = await singleDoc.save()
    const blob = new Blob([singleBytes as any], { type: 'application/pdf' })

    results.push({
      blob,
      filename: `${baseName}_page_${i + 1}.pdf`,
    })
  }

  return results
}

/* ========================================================================== */
/*  excelToCSV – XLSX/XLS → CSV via xlsx (SheetJS)                            */
/* ========================================================================== */

export async function excelToCSV(
  file: File,
  sheetIndex = 0
): Promise<DocConversionResult> {
  const XLSX = await import('xlsx')
  const arrayBuf = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuf, { type: 'array' })

  const sheetName = workbook.SheetNames[sheetIndex]
  if (!sheetName) {
    throw new Error(`Sheet index ${sheetIndex} not found in workbook`)
  }

  const sheet = workbook.Sheets[sheetName]
  const csv = XLSX.utils.sheet_to_csv(sheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  return {
    blob,
    filename: replaceExt(file.name, 'csv'),
  }
}

/* ========================================================================== */
/*  csvToExcel – CSV → XLSX via xlsx (SheetJS)                                */
/* ========================================================================== */

export async function csvToExcel(
  file: File,
  outputName?: string
): Promise<DocConversionResult> {
  const XLSX = await import('xlsx')
  const text = await file.text()

  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet(
    text.split('\n').map((row) => row.split(','))
  )
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')

  const wbOut = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbOut], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  return {
    blob,
    filename: outputName ?? replaceExt(file.name, 'xlsx'),
  }
}

/* ========================================================================== */
/*  pdfToDocx – Extract text from PDF and convert to DOCX via docx/pdfjs      */
/* ========================================================================== */

export async function pdfToDocx(
  file: File,
  outputName?: string
): Promise<DocConversionResult> {
  const pdfjsLib = await import('pdfjs-dist')

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }

  const { Document, Packer, Paragraph, TextRun } = await import('docx')

  const arrayBuf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise
  
  const paragraphs: import('docx').Paragraph[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    let lastY = -1
    let lineStr = ''

    for (const item of textContent.items) {
      if ('str' in item && 'transform' in item) {
        const y = Math.round(item.transform[5])
        if (lastY === -1) lastY = y

        if (Math.abs(y - lastY) > 5) {
          if (lineStr.trim()) {
            paragraphs.push(new Paragraph({ text: lineStr }))
          }
          lineStr = item.str
        } else {
          lineStr += item.str
        }
        lastY = y
      }
    }
    if (lineStr.trim()) {
      paragraphs.push(new Paragraph({ text: lineStr }))
    }
    
    if (i < pdf.numPages) {
       paragraphs.push(new Paragraph({ text: '' })) // Empty paragraph to separate pages
    }
  }

  const doc = new Document({
    sections: [{
      children: paragraphs.length > 0 ? paragraphs : [new Paragraph("No text could be extracted from this PDF. It may be an image-based scanned document.")],
    }],
  })

  const docBlob = await Packer.toBlob(doc)

  return {
    blob: docBlob,
    filename: outputName ?? replaceExt(file.name, 'docx'),
  }
}

