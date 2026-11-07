export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  if (!items.length) throw new Error('pick: empty list')
  return items[Math.floor(rng() * items.length)] as T
}

export function pickMany<T>(rng: () => number, items: readonly T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []
  while (pool.length && result.length < count) {
    const index = Math.floor(rng() * pool.length)
    const [item] = pool.splice(index, 1)
    if (item !== undefined) result.push(item)
  }
  return result
}

export function between(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function weighted<T>(rng: () => number, entries: Array<{ value: T; weight: number }>): T {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0)
  if (total <= 0) return entries[0]!.value
  let cursor = rng() * total
  for (const entry of entries) {
    cursor -= Math.max(0, entry.weight)
    if (cursor <= 0) return entry.value
  }
  return entries[entries.length - 1]!.value
}
