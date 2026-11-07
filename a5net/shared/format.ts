// @shared

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'A5'
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + second).toUpperCase()
}

export function avatarBackground(hue: number, accent: number): string {
  const h1 = ((hue % 360) + 360) % 360
  const h2 = ((accent % 360) + 360) % 360
  return `radial-gradient(120% 120% at 20% 15%, hsl(${h1} 62% 46%) 0%, hsl(${h1} 48% 22%) 42%, hsl(${h2} 55% 14%) 100%)`
}

export function coverBackground(hue: number): string {
  const h = ((hue % 360) + 360) % 360
  return `radial-gradient(90% 120% at 15% 10%, hsl(${h} 40% 22%) 0%, hsl(${(h + 28) % 360} 34% 12%) 48%, #0a0c0a 100%)`
}

export function timeAgo(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diff = Math.max(0, nowMs - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} ч`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} дн`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} нед`
  const months = Math.floor(days / 30)
  return `${months} мес`
}

export function formatCount(n: number): string {
  if (n < 1000) return String(Math.round(n))
  if (n < 10000) return (n / 1000).toFixed(1).replace('.0', '') + ' тыс'
  if (n < 1000000) return Math.round(n / 1000) + ' тыс'
  return (n / 1000000).toFixed(1).replace('.0', '') + ' млн'
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last > 1 && last < 5) return few
  if (last === 1) return one
  return many
}

export function hypeLabel(level: number): string {
  if (level >= 0.75) return 'набирает'
  if (level >= 0.45) return 'ровный'
  if (level >= 0.2) return 'тихий'
  return 'новое'
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function mediaCover(coverUrl: string | null | undefined, mediaUrl: string | null | undefined): string {
  if (coverUrl) return coverUrl
  if (mediaUrl && mediaUrl.includes('/get/')) return `${mediaUrl.replace('/get/', '/thumbnail/')}/s/800x`
  return ''
}

export function trackArtist(body: string, fallback: string): string {
  const first = body.split('.')[0]?.trim() ?? ''
  return first && first.length <= 48 ? first : fallback
}
