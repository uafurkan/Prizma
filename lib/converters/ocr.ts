// tesseract.js loaded dynamically – runs fully client-side, no files ever leave the browser
import { PDFDocument, StandardFonts } from 'pdf-lib';

export interface OcrProgressData {
  status: 'loading' | 'recognizing' | 'building';
  page?: number;
  totalPages?: number;
  progress?: number; // 0-1 within the current stage
}

export interface OcrResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  convertedSize: number;
}

// Strip characters the embedded standard font (WinAnsi) can't encode, so a single
// unsupported glyph (e.g. some Cyrillic/CJK OCR noise) doesn't abort the whole page.
function toWinAnsiSafe(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, '');
}

export async function pdfToSearchablePDF(
  file: File,
  lang: string = 'eng',
  onProgress?: (data: OcrProgressData) => void
): Promise<OcrResult> {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }

  const { createWorker } = await import('tesseract.js');

  onProgress?.({ status: 'loading', progress: 0 });

  const arrayBuf = await file.arrayBuffer();
  const srcPdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
  const totalPages = srcPdf.numPages;

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.({ status: 'recognizing', progress: m.progress });
      }
    },
  });

  const outPdf = await PDFDocument.create();
  const font = await outPdf.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= totalPages; i++) {
    const page = await srcPdf.getPage(i);
    const renderViewport = page.getViewport({ scale: 2 });
    const pointViewport = page.getViewport({ scale: 1 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(renderViewport.width);
    canvas.height = Math.floor(renderViewport.height);
    const ctx = canvas.getContext('2d')!;
    await page.render({
      canvasContext: ctx,
      viewport: renderViewport,
      canvas,
    } as import('pdfjs-dist/types/src/display/api').RenderParameters).promise;

    const { data } = await worker.recognize(canvas, {}, { text: true, blocks: true });

    const pngBytes = await new Promise<Uint8Array>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, 'image/png');
    });
    const embeddedImage = await outPdf.embedPng(pngBytes as Uint8Array<ArrayBuffer>);

    const pdfPage = outPdf.addPage([pointViewport.width, pointViewport.height]);
    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: pointViewport.width,
      height: pointViewport.height,
    });

    // Canvas pixels -> PDF points (canvas was rendered at 2x the point size)
    const toPt = pointViewport.width / canvas.width;

    const words = (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.flatMap((line) => line.words)
      )
    );

    for (const word of words) {
      const text = toWinAnsiSafe(word.text ?? '').trim();
      if (!text) continue;

      const { x0, y0, y1 } = word.bbox;
      const boxHeightPt = (y1 - y0) * toPt;
      if (boxHeightPt <= 0) continue;

      const fontSize = Math.max(4, boxHeightPt * 0.85);
      const xPt = x0 * toPt;
      const yPt = pointViewport.height - y1 * toPt;

      try {
        pdfPage.drawText(text, {
          x: xPt,
          y: yPt,
          size: fontSize,
          font,
          opacity: 0, // invisible but selectable/searchable text layer over the page image
        });
      } catch {
        // Skip words the standard font can't render rather than aborting the page.
      }
    }

    onProgress?.({ status: 'building', page: i, totalPages });
  }

  await worker.terminate();

  const pdfBytes = await outPdf.save();
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const filename = file.name.replace(/\.pdf$/i, '') + '_ocr.pdf';

  return {
    blob,
    filename,
    originalSize: file.size,
    convertedSize: blob.size,
  };
}
