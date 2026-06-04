'use client'

import { useState, useCallback, useRef } from 'react'
import { getFFmpeg, fileToUint8Array, removeProgressListener, type FFmpegProgress } from './ffmpeg-loader'

const MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  wma: 'audio/x-ms-wma',
  opus: 'audio/opus',
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

export function getMimeForFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return MIME_MAP[ext] ?? 'application/octet-stream'
}

export interface UseFFmpegReturn {
  loading: boolean
  processing: boolean
  progress: number
  error: string | null
  runFFmpeg: (
    inputFile: File,
    outputFileName: string,
    ffmpegArgs: string[]
  ) => Promise<Blob | null>
}

export function useFFmpeg(): UseFFmpegReturn {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const progressHandlerRef = useRef<((p: FFmpegProgress) => void) | null>(null)

  const runFFmpeg = useCallback(
    async (
      inputFile: File,
      outputFileName: string,
      ffmpegArgs: string[]
    ): Promise<Blob | null> => {
      setError(null)
      setProgress(0)

      try {
        setLoading(true)

        const progressHandler = (p: FFmpegProgress) => {
          const pct = Math.round(Math.min(Math.max(p.progress * 100, 0), 100))
          setProgress(pct)
        }
        progressHandlerRef.current = progressHandler

        const ffmpeg = await getFFmpeg(progressHandler)
        setLoading(false)
        setProcessing(true)

        const inputData = await fileToUint8Array(inputFile)
        const inputName = `input_${Date.now()}_${inputFile.name}`

        await ffmpeg.writeFile(inputName, inputData)

        const exitCode = await ffmpeg.exec([
          '-i', inputName,
          ...ffmpegArgs,
          outputFileName,
        ])

        if (exitCode !== 0) {
          throw new Error(`FFmpeg exited with code ${exitCode}`)
        }

        const outputData = await ffmpeg.readFile(outputFileName)

        // Clean up virtual filesystem
        await ffmpeg.deleteFile(inputName).catch(() => {})
        await ffmpeg.deleteFile(outputFileName).catch(() => {})

        const mime = getMimeForFilename(outputFileName)
        let blobPart: BlobPart
        if (outputData instanceof Uint8Array) {
          blobPart = outputData as any
        } else {
          blobPart = new TextEncoder().encode(outputData as string) as any
        }
        const blob = new Blob([blobPart], { type: mime })

        setProgress(100)
        return blob
      } catch (err) {
        const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
        setError(message)
        return null
      } finally {
        setProcessing(false)
        setLoading(false)
        if (progressHandlerRef.current) {
          removeProgressListener(progressHandlerRef.current)
          progressHandlerRef.current = null
        }
      }
    },
    []
  )

  return { loading, processing, progress, error, runFFmpeg }
}
