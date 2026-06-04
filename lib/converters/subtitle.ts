export interface SubtitleConversionResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  convertedSize: number;
}

export async function convertSubtitle(
  file: File,
  targetExt: string
): Promise<SubtitleConversionResult> {
  const subsrt = (await import('subsrt-ts')).default;
  const text = await file.text();
  const targetFormat = targetExt.toLowerCase();

  // Parse original content and build new format
  // subsrt-ts automatically detects the source format when parsing
  const captions = subsrt.parse(text);
  const convertedContent = subsrt.build(captions, { format: targetFormat });

  const blob = new Blob([convertedContent], { type: 'text/plain;charset=utf-8' });
  const filename = file.name.replace(/\.[^/.]+$/, '') + '.' + targetExt;

  return {
    blob,
    filename,
    originalSize: file.size,
    convertedSize: blob.size,
  };
}
