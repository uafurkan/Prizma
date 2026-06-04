import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const FFMPEG_CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

let ffmpegInstance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null

export interface FFmpegProgress {
  progress: number
  time: number
}

export async function getFFmpeg(
  onProgress?: (p: FFmpegProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    if (onProgress) ffmpegInstance.on('progress', onProgress)
    return ffmpegInstance
  }
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    const ffmpeg = new FFmpeg()
    const coreURL = await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, 'text/javascript')
    const wasmURL = await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm')
    await ffmpeg.load({ coreURL, wasmURL })
    if (onProgress) ffmpeg.on('progress', onProgress)
    ffmpegInstance = ffmpeg
    loadingPromise = null
    return ffmpeg
  })()
  return loadingPromise
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export function removeProgressListener(handler: (p: FFmpegProgress) => void) {
  if (ffmpegInstance) {
    ffmpegInstance.off('progress', handler)
  }
}

export function isFFmpegSupported(): boolean {
  try {
    const sab = new SharedArrayBuffer(1)
    return sab.byteLength === 1
  } catch {
    return false
  }
}
