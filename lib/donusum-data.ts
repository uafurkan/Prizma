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
  | 'subsrt';

export interface Secenek {
  id: string;
  label: string;
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
  baslik: string;
  aciklama: string;
  populer: boolean;
  secenekler?: Secenek[];
  cokluDosya?: boolean;
  ffmpegArgs?: string[];
}

export type KategoriSlug = 'goruntu' | 'video' | 'ses' | 'belge' | 'arsiv' | 'altyazi';

export interface Kategori {
  slug: KategoriSlug;
  baslik: string;
  aciklama: string;
  ikon: string;
  renk: string;
}

export const KATEGORILER: Kategori[] = [
  {
    slug: 'goruntu',
    baslik: 'Görüntü',
    aciklama: 'JPG, PNG, WebP, SVG, HEIC ve daha fazla görüntü formatı arasında dönüştürme yapın.',
    ikon: '🖼️',
    renk: '#ff4d6d',
  },
  {
    slug: 'video',
    baslik: 'Video',
    aciklama: 'MP4, WebM, AVI, MOV ve diğer video formatlarını dönüştürün.',
    ikon: '🎬',
    renk: '#ff8c42',
  },
  {
    slug: 'ses',
    baslik: 'Ses',
    aciklama: 'MP3, WAV, OGG, AAC ve diğer ses formatları arasında dönüştürme.',
    ikon: '🎵',
    renk: '#ffd166',
  },
  {
    slug: 'belge',
    baslik: 'Belge',
    aciklama: 'PDF, DOCX, TXT, CSV ve diğer belge formatlarını dönüştürün.',
    ikon: '📄',
    renk: '#06d6a0',
  },
  {
    slug: 'arsiv',
    baslik: 'Arşiv',
    aciklama: 'ZIP arşivleri oluşturun ve çıkartın.',
    ikon: '📦',
    renk: '#4d9fff',
  },
  {
    slug: 'altyazi',
    baslik: 'Altyazı',
    aciklama: 'SRT, VTT, ASS, SUB ve diğer altyazı formatları arasında dönüştürme yapın.',
    ikon: '💬',
    renk: '#b56cff',
  },
];

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
    baslik: 'JPG → PNG Dönüştürücü',
    aciklama: 'JPG dosyalarınızı şeffaf arka plan destekli PNG formatına dönüştürün. Kalite kaybı olmadan, tamamen tarayıcıda.',
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
    baslik: 'PNG → JPG Dönüştürücü',
    aciklama: 'PNG dosyalarınızı küçük boyutlu JPG formatına dönüştürün. Kaliteyi ayarlayarak dosya boyutunu optimize edin.',
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: 'Kalite',
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
    baslik: 'JPG → WebP Dönüştürücü',
    aciklama: 'JPG dosyalarınızı modern WebP formatına dönüştürün. Daha küçük boyut, aynı kalite.',
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: 'Kalite',
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
    baslik: 'PNG → WebP Dönüştürücü',
    aciklama: 'PNG görüntülerinizi WebP formatına dönüştürün. Şeffaflık korunur, boyut küçülür.',
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: 'Kalite',
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
    baslik: 'WebP → PNG Dönüştürücü',
    aciklama: 'WebP görüntülerinizi yaygın PNG formatına dönüştürün.',
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
    baslik: 'WebP → JPG Dönüştürücü',
    aciklama: 'WebP görüntülerinizi JPG formatına dönüştürün.',
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: 'Kalite',
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
    baslik: 'HEIC → JPG Dönüştürücü',
    aciklama: 'iPhone HEIC fotoğraflarınızı JPG formatına dönüştürün. Her yerde açılabilir hale getirin.',
    populer: true,
    secenekler: [
      {
        id: 'quality',
        label: 'Kalite',
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
    baslik: 'HEIC → PNG Dönüştürücü',
    aciklama: 'iPhone HEIC fotoğraflarınızı şeffaf PNG formatına dönüştürün.',
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
    baslik: 'SVG → PNG Dönüştürücü',
    aciklama: 'Vektör SVG dosyalarınızı piksel tabanlı PNG formatına dönüştürün.',
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
    baslik: 'BMP → PNG Dönüştürücü',
    aciklama: 'BMP dosyalarınızı sıkıştırılmış PNG formatına dönüştürün.',
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
    baslik: 'GIF → PNG Dönüştürücü',
    aciklama: 'GIF dosyalarının ilk karesini PNG formatına dönüştürün.',
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
    baslik: 'MP4 → WebM Dönüştürücü',
    aciklama: 'MP4 videolarınızı açık kaynak WebM formatına dönüştürün. Web için optimize.',
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
    baslik: 'WebM → MP4 Dönüştürücü',
    aciklama: 'WebM videolarınızı yaygın MP4 formatına dönüştürün.',
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
    baslik: 'AVI → MP4 Dönüştürücü',
    aciklama: 'Eski AVI videolarınızı modern MP4 formatına dönüştürün.',
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
    baslik: 'MOV → MP4 Dönüştürücü',
    aciklama: 'Apple MOV videolarınızı MP4 formatına dönüştürün. Her cihazda oynatın.',
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
    baslik: 'MP4 → GIF Dönüştürücü',
    aciklama: 'Video kliplerinizi animasyonlu GIF dosyalarına dönüştürün.',
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
    baslik: 'MKV → MP4 Dönüştürücü',
    aciklama: 'MKV videolarınızı uyumlu MP4 formatına dönüştürün.',
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
    baslik: 'MP3 → WAV Dönüştürücü',
    aciklama: 'MP3 dosyalarınızı kayıpsız WAV formatına dönüştürün.',
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
    baslik: 'WAV → MP3 Dönüştürücü',
    aciklama: 'Büyük WAV dosyalarınızı küçük MP3 formatına sıkıştırın.',
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
    baslik: 'MP4 → MP3 Dönüştürücü',
    aciklama: 'Videolardan ses çıkartın. MP4 dosyanızın ses kısmını MP3 olarak kaydedin.',
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
    baslik: 'OGG → MP3 Dönüştürücü',
    aciklama: 'OGG ses dosyalarınızı yaygın MP3 formatına dönüştürün.',
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
    baslik: 'MP3 → OGG Dönüştürücü',
    aciklama: 'MP3 dosyalarınızı açık kaynak OGG formatına dönüştürün.',
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
    baslik: 'WebM → MP3 Dönüştürücü',
    aciklama: 'WebM videolarından ses çıkartın ve MP3 olarak kaydedin.',
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
    baslik: 'FLAC → MP3 Dönüştürücü',
    aciklama: 'Kayıpsız FLAC dosyalarınızı MP3 formatına dönüştürün.',
    populer: false,
    ffmpegArgs: ['-acodec', 'libmp3lame', '-b:a', '320k'],
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
    baslik: 'Görselleri PDF\'ye Dönüştür',
    aciklama: 'JPG veya PNG görsellerinizi tek bir PDF dosyasında birleştirin.',
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
    baslik: 'PDF → Görsel Dönüştürücü',
    aciklama: 'PDF sayfalarınızı ayrı PNG görsellerine dönüştürün.',
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
    baslik: 'PDF Birleştirici',
    aciklama: 'Birden fazla PDF dosyasını tek bir PDF\'de birleştirin.',
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
    baslik: 'PDF Bölücü',
    aciklama: 'PDF dosyanızı sayfa sayfa ayrı dosyalara bölün.',
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
    baslik: 'Metin → PDF Dönüştürücü',
    aciklama: 'Metin dosyalarınızı profesyonel PDF belgelerine dönüştürün.',
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
    baslik: 'DOCX → HTML Dönüştürücü',
    aciklama: 'Word belgelerinizi temiz HTML koduna dönüştürün.',
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
    baslik: 'Excel → CSV Dönüştürücü',
    aciklama: 'Excel tablolarınızı CSV formatına dönüştürün.',
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
    baslik: 'CSV → Excel Dönüştürücü',
    aciklama: 'CSV dosyalarınızı Excel formatına dönüştürün.',
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
    baslik: 'Dosyaları ZIP\'le',
    aciklama: 'Birden fazla dosyayı tek bir ZIP arşivinde sıkıştırın.',
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
    baslik: 'ZIP Çıkart',
    aciklama: 'ZIP arşivlerini çıkartın ve dosyalarınıza erişin.',
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
    baslik: 'SRT → VTT Dönüştürücü',
    aciklama: 'SRT altyazı dosyalarınızı HTML5 uyumlu WebVTT (VTT) formatına dönüştürün.',
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
    baslik: 'VTT → SRT Dönüştürücü',
    aciklama: 'VTT altyazılarınızı en yaygın format olan SRT\'ye dönüştürün.',
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
    baslik: 'SRT → ASS Dönüştürücü',
    aciklama: 'SRT dosyalarınızı gelişmiş stil desteği olan ASS formatına dönüştürün.',
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
    baslik: 'ASS → SRT Dönüştürücü',
    aciklama: 'ASS dosyalarınızı standart SRT formatına dönüştürün.',
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
    baslik: 'SUB → SRT Dönüştürücü',
    aciklama: 'Eski SUB altyazılarınızı yaygın SRT formatına dönüştürün.',
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
    JPG: '#ff4d6d',
    JPEG: '#ff4d6d',
    PNG: '#4d9fff',
    WebP: '#06d6a0',
    HEIC: '#b56cff',
    SVG: '#ff8c42',
    BMP: '#ffd166',
    GIF: '#ff8c42',
    MP4: '#ff4d6d',
    WebM: '#06d6a0',
    AVI: '#ffd166',
    MOV: '#b56cff',
    MKV: '#4d9fff',
    MP3: '#ff8c42',
    WAV: '#4d9fff',
    OGG: '#06d6a0',
    FLAC: '#b56cff',
    AAC: '#ffd166',
    PDF: '#ff4d6d',
    DOCX: '#4d9fff',
    HTML: '#ff8c42',
    TXT: '#e8e8f4',
    CSV: '#06d6a0',
    Excel: '#06d6a0',
    XLSX: '#06d6a0',
    ZIP: '#ffd166',
    Görseller: '#b56cff',
    Dosyalar: '#4d9fff',
    SRT: '#ff4d6d',
    VTT: '#06d6a0',
    ASS: '#b56cff',
    SUB: '#ffd166',
  };
  return map[format] || '#e8e8f4';
}
