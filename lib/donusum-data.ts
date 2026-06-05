// lib/donusum-data.ts
// Tüm dönüşüm çiftleri ve kategori verileri

export type ConverterType =
  | 'canvas'
  | 'heic2any'
  | 'ffmpeg'
  | 'pdf-lib'
  | 'mammoth'
  | 'sheetjs'
  | 'jszip'
  | 'subsrt'
  | 'whisper';

export interface Secenek {
  id: string;
  label: { en: string; tr: string };
  type: 'range' | 'select' | 'checkbox';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  unit?: string;
}

export interface DonusumCift {
  slug: string;
  from: string;
  to: string;
  fromExt: string;
  toExt: string;
  kategori: KategoriSlug;
  converter: ConverterType;
  baslik: { en: string; tr: string };
  aciklama: { en: string; tr: string };
  populer: boolean;
  secenekler?: Secenek[];
  cokluDosya?: boolean;
  ffmpegArgs?: string[];
}

export type KategoriSlug = 'goruntu' | 'video' | 'ses' | 'belge' | 'arsiv' | 'altyazi';

export interface Kategori {
  slug: KategoriSlug;
  baslik: { en: string; tr: string };
  aciklama: { en: string; tr: string };
  ikon: string;
  renk: string;
}

export const KATEGORILER: Kategori[] = [
  {
    slug: 'goruntu',
    baslik: { en: 'Image', tr: 'Görüntü' },
    aciklama: { en: 'Convert between JPG, PNG, WebP, SVG, HEIC and more image formats.', tr: 'JPG, PNG, WebP, SVG, HEIC ve daha fazla görüntü formatı arasında dönüştürme yapın.' },
    ikon: '🖼️',
    renk: '#ff4d6d',
  },
  {
    slug: 'video',
    baslik: { en: 'Video', tr: 'Video' },
    aciklama: { en: 'Convert MP4, WebM, AVI, MOV and other video formats.', tr: 'MP4, WebM, AVI, MOV ve diğer video formatlarını dönüştürün.' },
    ikon: '🎬',
    renk: '#ff8c42',
  },
  {
    slug: 'ses',
    baslik: { en: 'Audio', tr: 'Ses' },
    aciklama: { en: 'Convert between MP3, WAV, OGG, AAC and other audio formats.', tr: 'MP3, WAV, OGG, AAC ve diğer ses formatları arasında dönüştürme.' },
    ikon: '🎵',
    renk: '#ffd166',
  },
  {
    slug: 'belge',
    baslik: { en: 'Document', tr: 'Belge' },
    aciklama: { en: 'Convert PDF, DOCX, TXT, CSV and other document formats.', tr: 'PDF, DOCX, TXT, CSV ve diğer belge formatlarını dönüştürün.' },
    ikon: '📄',
    renk: '#06d6a0',
  },
  {
    slug: 'arsiv',
    baslik: { en: 'Archive', tr: 'Arşiv' },
    aciklama: { en: 'Create and extract ZIP archives.', tr: 'ZIP arşivleri oluşturun ve çıkartın.' },
    ikon: '📦',
    renk: '#4d9fff',
  },
  {
    slug: 'altyazi',
    baslik: { en: 'Subtitle', tr: 'Altyazı' },
    aciklama: { en: 'Convert SRT, VTT, SUB subtitle files.', tr: 'SRT, VTT, SUB altyazı dosyalarını dönüştürün.' },
    ikon: '📝',
    renk: '#ffb703',
  },
];

export function getCategoryPath(lang: string, catSlug: string): string {
  if (lang === 'tr') return `/tr/kategori/${catSlug}`;
  const enMap: Record<string, string> = {
    'goruntu': 'image',
    'video': 'video',
    'ses': 'audio',
    'belge': 'document',
    'arsiv': 'archive',
    'altyazi': 'subtitle'
  };
  return `/en/category/${enMap[catSlug] || catSlug}`;
}

export function getDonusumPath(lang: string, slug: string): string {
  const tool = DONUSUM_DATA.find(d => d.slug === slug);
  if (!tool) return `/${lang}/${slug}`; // Fallback if tool not found

  const catPath = getCategoryPath(lang, tool.kategori);
  return `${catPath}/${slug}`;
}

export function getTranslatedPath(pathname: string, currentLang: string, targetLang: string): string {
  if (currentLang === targetLang) return pathname;

  const enMap: Record<string, string> = {
    'goruntu': 'image',
    'video': 'video',
    'ses': 'audio',
    'belge': 'document',
    'arsiv': 'archive',
    'altyazi': 'subtitle'
  };
  
  const trMap: Record<string, string> = Object.entries(enMap).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

  let newPath = pathname;

  if (currentLang === 'tr' && targetLang === 'en') {
    // /tr/kategori/goruntu/jpg-to-png → /en/category/image/jpg-to-png
    // /tr/kategori/goruntu → /en/category/image
    newPath = newPath.replace('/tr/', '/en/');
    newPath = newPath.replace('/kategori/', '/category/');
    for (const [trSlug, enSlug] of Object.entries(enMap)) {
      // Replace category slug segment (not the tool slug at the end)
      newPath = newPath.replace(`/category/${trSlug}`, `/category/${enSlug}`);
    }
  } else if (currentLang === 'en' && targetLang === 'tr') {
    // /en/category/image/jpg-to-png → /tr/kategori/goruntu/jpg-to-png
    // /en/category/image → /tr/kategori/goruntu
    newPath = newPath.replace('/en/', '/tr/');
    newPath = newPath.replace('/category/', '/kategori/');
    for (const [enSlug, trSlug] of Object.entries(trMap)) {
      newPath = newPath.replace(`/kategori/${enSlug}`, `/kategori/${trSlug}`);
    }
  }

  if (newPath === pathname) {
    newPath = pathname.replace(`/${currentLang}`, `/${targetLang}`);
  }

  return newPath;
}

export function getTranslatedFormat(format: string, lang: string): string {
  if (lang === 'tr') return format;
  const enMap: Record<string, string> = {
    'Görseller': 'Images',
    'Dosyalar': 'Files',
  };
  return enMap[format] || format;
}

export const DONUSUM_DATA: DonusumCift[] = [
  // ===== GÖRÜNTÜ =====
  {
    slug: 'jpg-to-png',
    from: 'JPG',
    to: 'PNG',
    fromExt: 'jpg',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'JPG → PNG Converter', tr: 'JPG → PNG Dönüştürücü' },
    aciklama: { en: 'Convert your JPG files to PNG format with transparent background support. Lossless quality, entirely in your browser.', tr: 'JPG dosyalarınızı şeffaf arka plan destekli PNG formatına dönüştürün. Kalite kaybı olmadan, tamamen tarayıcıda.' },
    populer: true,
  },
  {
    slug: 'png-to-jpg',
    from: 'PNG',
    to: 'JPG',
    fromExt: 'png',
    toExt: 'jpg',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'PNG → JPG Converter', tr: 'PNG → JPG Dönüştürücü' },
    aciklama: { en: 'Convert your PNG files to smaller-sized JPG format. Optimize file size by adjusting the quality.', tr: 'PNG dosyalarınızı küçük boyutlu JPG formatına dönüştürün. Kaliteyi ayarlayarak dosya boyutunu optimize edin.' },
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: { en: 'Quality', tr: 'Kalite' },
        type: 'range',
        default: 92,
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    slug: 'jpg-to-webp',
    from: 'JPG',
    to: 'WebP',
    fromExt: 'jpg',
    toExt: 'webp',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'JPG → WebP Converter', tr: 'JPG → WebP Dönüştürücü' },
    aciklama: { en: 'Convert your JPG files to modern WebP format. Smaller size, same quality.', tr: 'JPG dosyalarınızı modern WebP formatına dönüştürün. Daha küçük boyut, aynı kalite.' },
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: { en: 'Quality', tr: 'Kalite' },
        type: 'range',
        default: 85,
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    slug: 'png-to-webp',
    from: 'PNG',
    to: 'WebP',
    fromExt: 'png',
    toExt: 'webp',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'PNG → WebP Converter', tr: 'PNG → WebP Dönüştürücü' },
    aciklama: { en: 'Convert your PNG images to WebP format. Transparency is preserved, size is reduced.', tr: 'PNG görüntülerinizi WebP formatına dönüştürün. Şeffaflık korunur, boyut küçülür.' },
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: { en: 'Quality', tr: 'Kalite' },
        type: 'range',
        default: 85,
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    slug: 'webp-to-png',
    from: 'WebP',
    to: 'PNG',
    fromExt: 'webp',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'WebP → PNG Converter', tr: 'WebP → PNG Dönüştürücü' },
    aciklama: { en: 'Convert your WebP images to the common PNG format.', tr: 'WebP görüntülerinizi yaygın PNG formatına dönüştürün.' },
    populer: true,
  },
  {
    slug: 'webp-to-jpg',
    from: 'WebP',
    to: 'JPG',
    fromExt: 'webp',
    toExt: 'jpg',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'WebP → JPG Converter', tr: 'WebP → JPG Dönüştürücü' },
    aciklama: { en: 'Convert your WebP images to JPG format.', tr: 'WebP görüntülerinizi JPG formatına dönüştürün.' },
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: { en: 'Quality', tr: 'Kalite' },
        type: 'range',
        default: 92,
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    slug: 'heic-to-jpg',
    from: 'HEIC',
    to: 'JPG',
    fromExt: 'heic',
    toExt: 'jpg',
    kategori: 'goruntu',
    converter: 'heic2any',
    baslik: { en: 'HEIC → JPG Converter', tr: 'HEIC → JPG Dönüştürücü' },
    aciklama: { en: 'Convert your iPhone HEIC photos to JPG format. Make them viewable everywhere.', tr: 'iPhone HEIC fotoğraflarınızı JPG formatına dönüştürün. Her yerde açılabilir hale getirin.' },
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: { en: 'Quality', tr: 'Kalite' },
        type: 'range',
        default: 92,
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    slug: 'heic-to-png',
    from: 'HEIC',
    to: 'PNG',
    fromExt: 'heic',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'heic2any',
    baslik: { en: 'HEIC → PNG Converter', tr: 'HEIC → PNG Dönüştürücü' },
    aciklama: { en: 'Convert your iPhone HEIC photos to transparent PNG format.', tr: 'iPhone HEIC fotoğraflarınızı şeffaf PNG formatına dönüştürün.' },
    populer: true,
  },
  {
    slug: 'svg-to-png',
    from: 'SVG',
    to: 'PNG',
    fromExt: 'svg',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'SVG → PNG Converter', tr: 'SVG → PNG Dönüştürücü' },
    aciklama: { en: 'Convert your vector SVG files to pixel-based PNG format.', tr: 'Vektör SVG dosyalarınızı piksel tabanlı PNG formatına dönüştürün.' },
    populer: false,
  },
  {
    slug: 'bmp-to-png',
    from: 'BMP',
    to: 'PNG',
    fromExt: 'bmp',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'BMP → PNG Converter', tr: 'BMP → PNG Dönüştürücü' },
    aciklama: { en: 'Convert your BMP files to compressed PNG format.', tr: 'BMP dosyalarınızı sıkıştırılmış PNG formatına dönüştürün.' },
    populer: false,
  },
  {
    slug: 'gif-to-png',
    from: 'GIF',
    to: 'PNG',
    fromExt: 'gif',
    toExt: 'png',
    kategori: 'goruntu',
    converter: 'canvas',
    baslik: { en: 'GIF → PNG Converter', tr: 'GIF → PNG Dönüştürücü' },
    aciklama: { en: 'Convert the first frame of your GIF files to PNG format.', tr: 'GIF dosyalarının ilk karesini PNG formatına dönüştürün.' },
    populer: false,
  },

  // ===== VİDEO =====
  {
    slug: 'mp4-to-webm',
    from: 'MP4',
    to: 'WebM',
    fromExt: 'mp4',
    toExt: 'webm',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'MP4 → WebM Converter', tr: 'MP4 → WebM Dönüştürücü' },
    aciklama: { en: 'Convert your MP4 videos to open-source WebM format. Optimized for the web.', tr: 'MP4 videolarınızı açık kaynak WebM formatına dönüştürün. Web için optimize.' },
    populer: true,
    ffmpegArgs: ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus'],
  },
  {
    slug: 'webm-to-mp4',
    from: 'WebM',
    to: 'MP4',
    fromExt: 'webm',
    toExt: 'mp4',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'WebM → MP4 Converter', tr: 'WebM → MP4 Dönüştürücü' },
    aciklama: { en: 'Convert your WebM videos to the common MP4 format.', tr: 'WebM videolarınızı yaygın MP4 formatına dönüştürün.' },
    populer: true,
    ffmpegArgs: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac'],
  },
  {
    slug: 'avi-to-mp4',
    from: 'AVI',
    to: 'MP4',
    fromExt: 'avi',
    toExt: 'mp4',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'AVI → MP4 Converter', tr: 'AVI → MP4 Dönüştürücü' },
    aciklama: { en: 'Convert your old AVI videos to modern MP4 format.', tr: 'Eski AVI videolarınızı modern MP4 formatına dönüştürün.' },
    populer: false,
    ffmpegArgs: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac'],
  },
  {
    slug: 'mov-to-mp4',
    from: 'MOV',
    to: 'MP4',
    fromExt: 'mov',
    toExt: 'mp4',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'MOV → MP4 Converter', tr: 'MOV → MP4 Dönüştürücü' },
    aciklama: { en: 'Convert your Apple MOV videos to MP4 format. Play on any device.', tr: 'Apple MOV videolarınızı MP4 formatına dönüştürün. Her cihazda oynatın.' },
    populer: true,
    ffmpegArgs: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac'],
  },
  {
    slug: 'mp4-to-gif',
    from: 'MP4',
    to: 'GIF',
    fromExt: 'mp4',
    toExt: 'gif',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'MP4 → GIF Converter', tr: 'MP4 → GIF Dönüştürücü' },
    aciklama: { en: 'Convert your video clips to animated GIF files.', tr: 'Video kliplerinizi animasyonlu GIF dosyalarına dönüştürün.' },
    populer: true,
    ffmpegArgs: ['-vf', 'fps=15,scale=480:-1:flags=lanczos', '-loop', '0'],
  },
  {
    slug: 'mkv-to-mp4',
    from: 'MKV',
    to: 'MP4',
    fromExt: 'mkv',
    toExt: 'mp4',
    kategori: 'video',
    converter: 'ffmpeg',
    baslik: { en: 'MKV → MP4 Converter', tr: 'MKV → MP4 Dönüştürücü' },
    aciklama: { en: 'Convert your MKV videos to compatible MP4 format.', tr: 'MKV videolarınızı uyumlu MP4 formatına dönüştürün.' },
    populer: false,
    ffmpegArgs: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac'],
  },

  // ===== SES =====
  {
    slug: 'mp3-to-wav',
    from: 'MP3',
    to: 'WAV',
    fromExt: 'mp3',
    toExt: 'wav',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'MP3 → WAV Converter', tr: 'MP3 → WAV Dönüştürücü' },
    aciklama: { en: 'Convert your MP3 files to lossless WAV format.', tr: 'MP3 dosyalarınızı kayıpsız WAV formatına dönüştürün.' },
    populer: true,
    ffmpegArgs: ['-acodec', 'pcm_s16le'],
  },
  {
    slug: 'wav-to-mp3',
    from: 'WAV',
    to: 'MP3',
    fromExt: 'wav',
    toExt: 'mp3',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'WAV → MP3 Converter', tr: 'WAV → MP3 Dönüştürücü' },
    aciklama: { en: 'Compress your large WAV files to small MP3 format.', tr: 'Büyük WAV dosyalarınızı küçük MP3 formatına sıkıştırın.' },
    populer: true,
    ffmpegArgs: ['-acodec', 'libmp3lame', '-b:a', '192k'],
  },
  {
    slug: 'mp4-to-mp3',
    from: 'MP4',
    to: 'MP3',
    fromExt: 'mp4',
    toExt: 'mp3',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'MP4 → MP3 Converter', tr: 'MP4 → MP3 Dönüştürücü' },
    aciklama: { en: 'Extract audio from videos. Save the audio part of your MP4 file as MP3.', tr: 'Videolardan ses çıkartın. MP4 dosyanızın ses kısmını MP3 olarak kaydedin.' },
    populer: true,
    ffmpegArgs: ['-vn', '-acodec', 'libmp3lame', '-b:a', '192k'],
  },
  {
    slug: 'ogg-to-mp3',
    from: 'OGG',
    to: 'MP3',
    fromExt: 'ogg',
    toExt: 'mp3',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'OGG → MP3 Converter', tr: 'OGG → MP3 Dönüştürücü' },
    aciklama: { en: 'Convert your OGG audio files to the common MP3 format.', tr: 'OGG ses dosyalarınızı yaygın MP3 formatına dönüştürün.' },
    populer: false,
    ffmpegArgs: ['-acodec', 'libmp3lame', '-b:a', '192k'],
  },
  {
    slug: 'mp3-to-ogg',
    from: 'MP3',
    to: 'OGG',
    fromExt: 'mp3',
    toExt: 'ogg',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'MP3 → OGG Converter', tr: 'MP3 → OGG Dönüştürücü' },
    aciklama: { en: 'Convert your MP3 files to open-source OGG format.', tr: 'MP3 dosyalarınızı açık kaynak OGG formatına dönüştürün.' },
    populer: false,
    ffmpegArgs: ['-acodec', 'libvorbis', '-b:a', '192k'],
  },
  {
    slug: 'webm-to-mp3',
    from: 'WebM',
    to: 'MP3',
    fromExt: 'webm',
    toExt: 'mp3',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'WebM → MP3 Converter', tr: 'WebM → MP3 Dönüştürücü' },
    aciklama: { en: 'Extract audio from WebM videos and save it as MP3.', tr: 'WebM videolarından ses çıkartın ve MP3 olarak kaydedin.' },
    populer: false,
    ffmpegArgs: ['-vn', '-acodec', 'libmp3lame', '-b:a', '192k'],
  },
  {
    slug: 'flac-to-mp3',
    from: 'FLAC',
    to: 'MP3',
    fromExt: 'flac',
    toExt: 'mp3',
    kategori: 'ses',
    converter: 'ffmpeg',
    baslik: { en: 'FLAC → MP3 Converter', tr: 'FLAC → MP3 Dönüştürücü' },
    aciklama: { en: 'Convert your lossless FLAC files to MP3 format.', tr: 'Kayıpsız FLAC dosyalarınızı MP3 formatına dönüştürün.' },
    populer: false,
    ffmpegArgs: ['-acodec', 'libmp3lame', '-b:a', '320k'],
  },

  {
    slug: 'mp3-to-txt',
    from: 'MP3',
    to: 'TXT',
    fromExt: 'mp3',
    toExt: 'txt',
    kategori: 'ses',
    converter: 'whisper',
    baslik: { en: 'MP3 → TXT (Speech to Text)', tr: 'MP3 → TXT (Sesi Yazıya Dök)' },
    aciklama: { en: 'Transcribe your MP3 audio files to text using AI directly in your browser.', tr: 'MP3 ses dosyalarınızı tarayıcınızda yapay zeka ile yazıya dökün.' },
    populer: true,
    secenekler: [
      {
        id: 'language',
        label: { en: 'Audio Language', tr: 'Ses Dili' },
        type: 'select',
        default: 'turkish',
        options: [
          { value: 'turkish', label: 'Türkçe' },
          { value: 'english', label: 'English' },
          { value: 'auto', label: 'Auto Detect' }
        ]
      }
    ]
  },
  {
    slug: 'wav-to-txt',
    from: 'WAV',
    to: 'TXT',
    fromExt: 'wav',
    toExt: 'txt',
    kategori: 'ses',
    converter: 'whisper',
    baslik: { en: 'WAV → TXT (Speech to Text)', tr: 'WAV → TXT (Sesi Yazıya Dök)' },
    aciklama: { en: 'Transcribe your WAV audio files to text using AI directly in your browser.', tr: 'WAV ses dosyalarınızı tarayıcınızda yapay zeka ile yazıya dökün.' },
    populer: false,
    secenekler: [
      {
        id: 'language',
        label: { en: 'Audio Language', tr: 'Ses Dili' },
        type: 'select',
        default: 'turkish',
        options: [
          { value: 'turkish', label: 'Türkçe' },
          { value: 'english', label: 'English' },
          { value: 'auto', label: 'Auto Detect' }
        ]
      }
    ]
  },
  {
    slug: 'ogg-to-txt',
    from: 'OGG',
    to: 'TXT',
    fromExt: 'ogg',
    toExt: 'txt',
    kategori: 'ses',
    converter: 'whisper',
    baslik: { en: 'OGG → TXT (Speech to Text)', tr: 'OGG → TXT (Sesi Yazıya Dök)' },
    aciklama: { en: 'Transcribe your OGG audio files to text using AI.', tr: 'OGG ses dosyalarınızı yapay zeka ile yazıya dökün.' },
    populer: false,
    secenekler: [
      {
        id: 'language',
        label: { en: 'Audio Language', tr: 'Ses Dili' },
        type: 'select',
        default: 'turkish',
        options: [
          { value: 'turkish', label: 'Türkçe' },
          { value: 'english', label: 'English' },
          { value: 'auto', label: 'Auto Detect' }
        ]
      }
    ]
  },
  {
    slug: 'm4a-to-txt',
    from: 'M4A',
    to: 'TXT',
    fromExt: 'm4a',
    toExt: 'txt',
    kategori: 'ses',
    converter: 'whisper',
    baslik: { en: 'M4A → TXT (Speech to Text)', tr: 'M4A → TXT (Sesi Yazıya Dök)' },
    aciklama: { en: 'Transcribe your M4A audio files to text using AI.', tr: 'M4A ses dosyalarınızı yapay zeka ile yazıya dökün.' },
    populer: false,
    secenekler: [
      {
        id: 'language',
        label: { en: 'Audio Language', tr: 'Ses Dili' },
        type: 'select',
        default: 'turkish',
        options: [
          { value: 'turkish', label: 'Türkçe' },
          { value: 'english', label: 'English' },
          { value: 'auto', label: 'Auto Detect' }
        ]
      }
    ]
  },

  // ===== BELGE =====
  {
    slug: 'images-to-pdf',
    from: 'Görseller',
    to: 'PDF',
    fromExt: 'jpg',
    toExt: 'pdf',
    kategori: 'belge',
    converter: 'pdf-lib',
    baslik: { en: 'Convert Images to PDF', tr: 'Görselleri PDF\'ye Dönüştür' },
    aciklama: { en: 'Combine your JPG or PNG images into a single PDF file.', tr: 'JPG veya PNG görsellerinizi tek bir PDF dosyasında birleştirin.' },
    populer: true,
    cokluDosya: true,
  },
  {
    slug: 'pdf-to-images',
    from: 'PDF',
    to: 'Görseller',
    fromExt: 'pdf',
    toExt: 'png',
    kategori: 'belge',
    converter: 'pdf-lib',
    baslik: { en: 'PDF → Image Converter', tr: 'PDF → Görsel Dönüştürücü' },
    aciklama: { en: 'Convert your PDF pages to separate PNG images.', tr: 'PDF sayfalarınızı ayrı PNG görsellerine dönüştürün.' },
    populer: false,
  },
  {
    slug: 'merge-pdf',
    from: 'PDF',
    to: 'PDF',
    fromExt: 'pdf',
    toExt: 'pdf',
    kategori: 'belge',
    converter: 'pdf-lib',
    baslik: { en: 'PDF Merger', tr: 'PDF Birleştirici' },
    aciklama: { en: 'Merge multiple PDF files into a single PDF.', tr: 'Birden fazla PDF dosyasını tek bir PDF\'de birleştirin.' },
    populer: true,
    cokluDosya: true,
  },
  {
    slug: 'split-pdf',
    from: 'PDF',
    to: 'PDF',
    fromExt: 'pdf',
    toExt: 'pdf',
    kategori: 'belge',
    converter: 'pdf-lib',
    baslik: { en: 'PDF Splitter', tr: 'PDF Bölücü' },
    aciklama: { en: 'Split your PDF file into separate pages.', tr: 'PDF dosyanızı sayfa sayfa ayrı dosyalara bölün.' },
    populer: false,
  },
  {
    slug: 'text-to-pdf',
    from: 'TXT',
    to: 'PDF',
    fromExt: 'txt',
    toExt: 'pdf',
    kategori: 'belge',
    converter: 'pdf-lib',
    baslik: { en: 'Text → PDF Converter', tr: 'Metin → PDF Dönüştürücü' },
    aciklama: { en: 'Convert your text files to professional PDF documents.', tr: 'Metin dosyalarınızı profesyonel PDF belgelerine dönüştürün.' },
    populer: false,
  },
  {
    slug: 'docx-to-html',
    from: 'DOCX',
    to: 'HTML',
    fromExt: 'docx',
    toExt: 'html',
    kategori: 'belge',
    converter: 'mammoth',
    baslik: { en: 'DOCX → HTML Converter', tr: 'DOCX → HTML Dönüştürücü' },
    aciklama: { en: 'Convert your Word documents to clean HTML code.', tr: 'Word belgelerinizi temiz HTML koduna dönüştürün.' },
    populer: false,
  },
  {
    slug: 'excel-to-csv',
    from: 'Excel',
    to: 'CSV',
    fromExt: 'xlsx',
    toExt: 'csv',
    kategori: 'belge',
    converter: 'sheetjs',
    baslik: { en: 'Excel → CSV Converter', tr: 'Excel → CSV Dönüştürücü' },
    aciklama: { en: 'Convert your Excel spreadsheets to CSV format.', tr: 'Excel tablolarınızı CSV formatına dönüştürün.' },
    populer: false,
  },
  {
    slug: 'csv-to-excel',
    from: 'CSV',
    to: 'Excel',
    fromExt: 'csv',
    toExt: 'xlsx',
    kategori: 'belge',
    converter: 'sheetjs',
    baslik: { en: 'CSV → Excel Converter', tr: 'CSV → Excel Dönüştürücü' },
    aciklama: { en: 'Convert your CSV files to Excel format.', tr: 'CSV dosyalarınızı Excel formatına dönüştürün.' },
    populer: false,
  },

  // ===== ARŞİV =====
  {
    slug: 'files-to-zip',
    from: 'Dosyalar',
    to: 'ZIP',
    fromExt: '*',
    toExt: 'zip',
    kategori: 'arsiv',
    converter: 'jszip',
    baslik: { en: 'Zip Files', tr: 'Dosyaları ZIP\'le' },
    aciklama: { en: 'Compress multiple files into a single ZIP archive.', tr: 'Birden fazla dosyayı tek bir ZIP arşivinde sıkıştırın.' },
    populer: false,
    cokluDosya: true,
  },
  {
    slug: 'extract-zip',
    from: 'ZIP',
    to: 'Dosyalar',
    fromExt: 'zip',
    toExt: '*',
    kategori: 'arsiv',
    converter: 'jszip',
    baslik: { en: 'Extract ZIP', tr: 'ZIP Çıkart' },
    aciklama: { en: 'Extract ZIP archives and access your files.', tr: 'ZIP arşivlerini çıkartın ve dosyalarınıza erişin.' },
    populer: false,
  },

  // ===== ALTYAZI =====
  {
    slug: 'srt-to-vtt',
    from: 'SRT',
    to: 'VTT',
    fromExt: 'srt',
    toExt: 'vtt',
    kategori: 'altyazi',
    converter: 'subsrt',
    baslik: { en: 'SRT → VTT Converter', tr: 'SRT → VTT Dönüştürücü' },
    aciklama: { en: 'Convert your SRT subtitle files to HTML5-compatible WebVTT (VTT) format.', tr: 'SRT altyazı dosyalarınızı HTML5 uyumlu WebVTT (VTT) formatına dönüştürün.' },
    populer: true,
  },
  {
    slug: 'vtt-to-srt',
    from: 'VTT',
    to: 'SRT',
    fromExt: 'vtt',
    toExt: 'srt',
    kategori: 'altyazi',
    converter: 'subsrt',
    baslik: { en: 'VTT → SRT Converter', tr: 'VTT → SRT Dönüştürücü' },
    aciklama: { en: 'Convert your VTT subtitles to the most common format, SRT.', tr: 'VTT altyazılarınızı en yaygın format olan SRT\'ye dönüştürün.' },
    populer: true,
  },
  {
    slug: 'srt-to-ass',
    from: 'SRT',
    to: 'ASS',
    fromExt: 'srt',
    toExt: 'ass',
    kategori: 'altyazi',
    converter: 'subsrt',
    baslik: { en: 'SRT → ASS Converter', tr: 'SRT → ASS Dönüştürücü' },
    aciklama: { en: 'Convert your SRT files to ASS format with advanced styling support.', tr: 'SRT dosyalarınızı gelişmiş stil desteği olan ASS formatına dönüştürün.' },
    populer: false,
  },
  {
    slug: 'ass-to-srt',
    from: 'ASS',
    to: 'SRT',
    fromExt: 'ass',
    toExt: 'srt',
    kategori: 'altyazi',
    converter: 'subsrt',
    baslik: { en: 'ASS → SRT Converter', tr: 'ASS → SRT Dönüştürücü' },
    aciklama: { en: 'Convert your ASS files to standard SRT format.', tr: 'ASS dosyalarınızı standart SRT formatına dönüştürün.' },
    populer: false,
  },
  {
    slug: 'sub-to-srt',
    from: 'SUB',
    to: 'SRT',
    fromExt: 'sub',
    toExt: 'srt',
    kategori: 'altyazi',
    converter: 'subsrt',
    baslik: { en: 'SUB → SRT Converter', tr: 'SUB → SRT Dönüştürücü' },
    aciklama: { en: 'Convert your old SUB subtitles to the common SRT format.', tr: 'Eski SUB altyazılarınızı yaygın SRT formatına dönüştürün.' },
    populer: false,
  },
];

// Yardımcı fonksiyonlar
export function getDonusumBySlug(slug: string): DonusumCift | undefined {
  return DONUSUM_DATA.find((d) => d.slug === slug);
}

export function getDonusumlerByKategori(kategori: KategoriSlug): DonusumCift[] {
  return DONUSUM_DATA.filter((d) => d.kategori === kategori);
}

export function getKategoriBySlug(slug: string): Kategori | undefined {
  return KATEGORILER.find((k) => k.slug === slug);
}

export function getPopulerDonusumler(): DonusumCift[] {
  return DONUSUM_DATA.filter((d) => d.populer);
}

export function getIlgiliDonusumler(current: DonusumCift, limit = 6): DonusumCift[] {
  return DONUSUM_DATA.filter(
    (d) =>
      d.slug !== current.slug &&
      (d.kategori === current.kategori ||
        d.fromExt === current.fromExt ||
        d.toExt === current.toExt)
  ).slice(0, limit);
}

// Format renkleri
export function getFormatRenk(format: string): string {
  const map: Record<string, string> = {
    JPG: 'var(--r)',
    JPEG: 'var(--r)',
    PNG: 'var(--b)',
    WebP: 'var(--g)',
    HEIC: 'var(--p)',
    SVG: 'var(--o)',
    BMP: 'var(--y)',
    GIF: 'var(--o)',
    MP4: 'var(--r)',
    WebM: 'var(--g)',
    AVI: 'var(--y)',
    MOV: 'var(--p)',
    MKV: 'var(--b)',
    MP3: 'var(--o)',
    WAV: 'var(--b)',
    OGG: 'var(--g)',
    FLAC: 'var(--p)',
    AAC: 'var(--y)',
    PDF: 'var(--r)',
    DOCX: 'var(--b)',
    HTML: 'var(--o)',
    TXT: 'var(--muted)',
    M4A: 'var(--b)',
    CSV: 'var(--g)',
    Excel: 'var(--g)',
    XLSX: 'var(--g)',
    ZIP: 'var(--y)',
    Görseller: 'var(--p)',
    Dosyalar: 'var(--b)',
    SRT: 'var(--r)',
    VTT: 'var(--g)',
    ASS: 'var(--p)',
    SUB: 'var(--y)',
  };
  return map[format] || 'var(--muted)';
}
