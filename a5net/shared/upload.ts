// @shared
import { getOriginalUrl, obtainStorageFilePutUrl } from '@app/storage'

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadResult {
  hash: string
  url: string
}

function postWithProgress(
  ctx: app.Ctx,
  url: string,
  file: Blob,
  filename: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('Filedata', file, filename)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.onprogress = event => {
      if (!onProgress) return
      const total = event.lengthComputable ? event.total : file.size
      onProgress({
        loaded: event.loaded,
        total,
        percent: total > 0 ? Math.min(100, Math.round((event.loaded / total) * 100)) : 0,
      })
    }
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`upload failed: HTTP ${xhr.status}`))
        return
      }
      const hash = xhr.responseText.trim()
      if (!hash) {
        reject(new Error('upload failed: empty hash'))
        return
      }
      resolve(hash)
    }
    xhr.onerror = () => reject(new Error('upload failed: network'))
    xhr.ontimeout = () => reject(new Error('upload failed: timeout'))
    xhr.send(form)
  })
}

export async function uploadFile(
  ctx: app.Ctx,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const putUrl = await obtainStorageFilePutUrl(ctx, { protected: false })
  const hash = await postWithProgress(ctx, putUrl, file, file.name, onProgress)
  return { hash, url: getOriginalUrl(ctx, hash) }
}

export async function uploadBlob(
  ctx: app.Ctx,
  blob: Blob,
  filename: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  const putUrl = await obtainStorageFilePutUrl(ctx, { protected: false })
  const hash = await postWithProgress(ctx, putUrl, blob, filename, onProgress)
  return { hash, url: getOriginalUrl(ctx, hash) }
}

export interface MediaMeta {
  duration: number
  width: number
  height: number
}

export function readMediaMeta(file: File): Promise<MediaMeta> {
  return new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const element = isVideo ? document.createElement('video') : document.createElement('audio')
    element.preload = 'metadata'
    const finish = (meta: MediaMeta) => {
      URL.revokeObjectURL(objectUrl)
      resolve(meta)
    }
    const timer = window.setTimeout(() => finish({ duration: 0, width: 0, height: 0 }), 8000)
    element.onloadedmetadata = () => {
      window.clearTimeout(timer)
      const video = element as HTMLVideoElement
      finish({
        duration: Number.isFinite(element.duration) ? element.duration : 0,
        width: Number(video.videoWidth ?? 0),
        height: Number(video.videoHeight ?? 0),
      })
    }
    element.onerror = () => {
      window.clearTimeout(timer)
      finish({ duration: 0, width: 0, height: 0 })
    }
    element.src = objectUrl
  })
}

export function captureVideoFrame(file: File, atSeconds = 1, maxWidth = 1280): Promise<Blob | null> {
  return new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    let settled = false
    const finish = (blob: Blob | null) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(objectUrl)
      resolve(blob)
    }
    const timer = window.setTimeout(() => finish(null), 12000)
    video.onloadedmetadata = () => {
      const target = Math.min(Math.max(0.1, atSeconds), Math.max(0.1, (video.duration || 2) * 0.25))
      video.currentTime = target
    }
    video.onseeked = () => {
      try {
        const width = video.videoWidth || 1280
        const height = video.videoHeight || 720
        const scale = Math.min(1, maxWidth / width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        const context = canvas.getContext('2d')
        if (!context) {
          finish(null)
          return
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          window.clearTimeout(timer)
          finish(blob)
        }, 'image/jpeg', 0.82)
      } catch {
        finish(null)
      }
    }
    video.onerror = () => {
      window.clearTimeout(timer)
      finish(null)
    }
    video.src = objectUrl
  })
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 Б'
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}

export function formatLongDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
  return `${minutes}:${String(rest).padStart(2, '0')}`
}
