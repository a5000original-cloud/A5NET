import { topicAncestors, topicById } from './taxonomy'

const DIMS = 64

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function addDim(vec: number[], key: string, weight: number, signed: boolean): void {
  const h = hashString(key)
  const idx = h % DIMS
  const sign = signed ? (h & 0x80000000 ? -1 : 1) : 1
  vec[idx] = (vec[idx] ?? 0) + sign * weight
}

export function normalizeVector(vec: number[]): number[] {
  const length = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0))
  if (!length) return vec.map(() => 0)
  return vec.map(value => Math.round((value / length) * 10000) / 10000)
}

export function embedTopics(topicIds: string[]): number[] {
  const vec = new Array<number>(DIMS).fill(0)
  for (const id of topicIds) {
    const chain = topicAncestors(id)
    chain.forEach((ancestor, depth) => {
      const weight = depth === 0 ? 1 : depth === 1 ? 0.45 : 0.18
      addDim(vec, `topic:${ancestor}`, weight, false)
      addDim(vec, `topic2:${ancestor}`, weight * 0.5, true)
    })
  }
  return normalizeVector(vec)
}

export function embedText(text: string, topicIds: string[] = []): number[] {
  const vec = new Array<number>(DIMS).fill(0)
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 90)
  for (const word of words) {
    addDim(vec, `word:${word}`, 0.55, true)
  }
  for (const id of topicIds) {
    const chain = topicAncestors(id)
    chain.forEach((ancestor, depth) => {
      addDim(vec, `topic:${ancestor}`, depth === 0 ? 1.2 : 0.4, false)
    })
  }
  return normalizeVector(vec)
}

export function cosine(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length)
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < length; i += 1) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  if (!setA.size || !setB.size) return 0
  let intersection = 0
  for (const value of setA) {
    if (setB.has(value)) intersection += 1
  }
  return intersection / (setA.size + setB.size - intersection)
}

export function postVector(title: string, body: string, topics: string[]): number[] {
  return embedText(`${title} ${body} ${topics.map(topicById).map(topic => topic.label).join(' ')}`, topics)
}
