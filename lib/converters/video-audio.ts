/**
 * FFmpeg argument builder for video & audio conversions.
 *
 * These functions produce the args array that should be passed to
 * `useFFmpeg().runFFmpeg(file, outputName, args)`.
 * The `-i inputName` and output filename are appended by the hook itself,
 * so only the "middle" args are returned here.
 */

/* ---------- Codec / format mappings ---------- */

const VIDEO_CODECS: Record<string, string[]> = {
  mp4: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'],
  webm: ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '128k'],
  avi: ['-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'mp3', '-b:a', '192k'],
  mov: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k'],
  mkv: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k'],
  flv: ['-c:v', 'flv1', '-q:v', '5', '-c:a', 'mp3', '-b:a', '128k'],
  wmv: ['-c:v', 'wmv2', '-q:v', '5', '-c:a', 'wmav2', '-b:a', '128k'],
}

const AUDIO_CODECS: Record<string, string[]> = {
  mp3: ['-c:a', 'libmp3lame', '-q:a', '2'],
  wav: ['-c:a', 'pcm_s16le'],
  ogg: ['-c:a', 'libvorbis', '-q:a', '4'],
  aac: ['-c:a', 'aac', '-b:a', '192k'],
  flac: ['-c:a', 'flac'],
  m4a: ['-c:a', 'aac', '-b:a', '192k'],
  wma: ['-c:a', 'wmav2', '-b:a', '192k'],
  opus: ['-c:a', 'libopus', '-b:a', '128k'],
}

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'gif'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'])

function isVideo(ext: string): boolean {
  return VIDEO_EXTENSIONS.has(ext.toLowerCase())
}

function isAudio(ext: string): boolean {
  return AUDIO_EXTENSIONS.has(ext.toLowerCase())
}

export function normalizeExt(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, '')
  if (e === 'jpeg') return 'jpg'
  return e
}

/* ========================================================================== */
/*  getFFmpegArgs                                                             */
/* ========================================================================== */

export interface ConvertOptions {
  /** Audio bitrate, e.g. '192k' */
  audioBitrate?: string
  /** Video quality (CRF), lower = better, e.g. 23 */
  videoCRF?: number
  /** Scale filter, e.g. '1280:720' or '640:-1' */
  scale?: string
  /** Frames per second for GIF output */
  fps?: number
}

/**
 * Build FFmpeg arguments for converting between any supported combination:
 * - video → video
 * - video → audio (extraction)
 * - audio → audio
 * - video → gif (with palette generation)
 * - gif → video
 */
export function getFFmpegArgs(
  inputExt: string,
  outputExt: string,
  opts: ConvertOptions = {}
): string[] {
  const inExt = normalizeExt(inputExt)
  const outExt = normalizeExt(outputExt)
  const args: string[] = []

  /* ---- MP4 → GIF (palette-based for quality) ---- */
  if (isVideo(inExt) && outExt === 'gif') {
    const fps = opts.fps ?? 10
    const scale = opts.scale ?? '480:-1'
    args.push(
      '-vf',
      `fps=${fps},scale=${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop', '0'
    )
    return args
  }

  /* ---- GIF → MP4 ---- */
  if (inExt === 'gif' && isVideo(outExt)) {
    args.push(
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', String(opts.videoCRF ?? 23),
      '-an'  // GIFs have no audio
    )
    return args
  }

  /* ---- Video → Audio extraction ---- */
  if (isVideo(inExt) && isAudio(outExt)) {
    args.push('-vn') // drop video
    const codecArgs = AUDIO_CODECS[outExt]
    if (codecArgs) args.push(...codecArgs)
    if (opts.audioBitrate) {
      // Override default bitrate
      const bIdx = args.indexOf('-b:a')
      if (bIdx !== -1) {
        args[bIdx + 1] = opts.audioBitrate
      } else {
        args.push('-b:a', opts.audioBitrate)
      }
    }
    return args
  }

  /* ---- Video → Video ---- */
  if (isVideo(inExt) && isVideo(outExt)) {
    const codecArgs = VIDEO_CODECS[outExt]
    if (codecArgs) args.push(...codecArgs)

    if (opts.videoCRF != null) {
      const crfIdx = args.indexOf('-crf')
      if (crfIdx !== -1) {
        args[crfIdx + 1] = String(opts.videoCRF)
      }
    }
    if (opts.audioBitrate) {
      const bIdx = args.indexOf('-b:a')
      if (bIdx !== -1) {
        args[bIdx + 1] = opts.audioBitrate
      }
    }
    if (opts.scale) {
      args.push('-vf', `scale=${opts.scale}`)
    }
    return args
  }

  /* ---- Audio → Audio ---- */
  if (isAudio(inExt) && isAudio(outExt)) {
    const codecArgs = AUDIO_CODECS[outExt]
    if (codecArgs) args.push(...codecArgs)
    if (opts.audioBitrate) {
      const bIdx = args.indexOf('-b:a')
      if (bIdx !== -1) {
        args[bIdx + 1] = opts.audioBitrate
      } else {
        args.push('-b:a', opts.audioBitrate)
      }
    }
    return args
  }

  // Fallback: let FFmpeg figure it out
  return args
}

/* ========================================================================== */
/*  getClipArgs – trim a section from audio/video                             */
/* ========================================================================== */

/**
 * Returns FFmpeg args for clipping between `start` and `end` timestamps.
 * Timestamps are in seconds (can be fractional) or "HH:MM:SS.mmm" strings.
 * The codec is set to copy for speed when the output format matches input.
 */
export function getClipArgs(
  ext: string,
  start: number | string,
  end: number | string
): string[] {
  const normExt = normalizeExt(ext)
  const args: string[] = []

  // Seek to start
  args.push('-ss', String(start))

  // Duration or end
  if (typeof start === 'number' && typeof end === 'number') {
    const duration = end - start
    if (duration <= 0) throw new Error('End time must be after start time')
    args.push('-t', String(duration))
  } else {
    args.push('-to', String(end))
  }

  // Use stream copy when possible (fast, lossless)
  if (isVideo(normExt) && normExt !== 'gif') {
    args.push('-c', 'copy', '-avoid_negative_ts', 'make_zero')
  } else if (isAudio(normExt)) {
    args.push('-c', 'copy')
  } else if (normExt === 'gif') {
    // GIF can't be stream-copied, re-encode
    args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0')
  }

  return args
}
