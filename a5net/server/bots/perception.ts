import Posts from '../../tables/posts.table'
import Profiles from '../../tables/profiles.table'
import Edges from '../../tables/edges.table'
import type { ViewerSocial } from '../social'
import { cosine, postVector } from '../vec'
import { hashSeed } from '../rng'
import type { LocalPost } from './local'

export interface Perception {
  items: LocalPost[]
  authorInterests: Map<string, string[]>
  authorNames: Map<string, string>
  likeCounts: Map<string, number>
}

export async function perceive(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  social: ViewerSocial,
): Promise<Perception> {
  const rows = await Posts.findAll(ctx, { limit: 100, order: [{ publishedAt: 'desc' }, { id: 'asc' }] })
  const nowMs = Date.now()
  const scored = rows
    .filter(post => post.authorId !== profile.id)
    .map(post => {
      const created = post.publishedAt instanceof Date ? post.publishedAt.getTime() : new Date(post.publishedAt).getTime()
      const ageHours = Math.max(0, (nowMs - created) / 3600000)
      const affinity = Math.max(0, cosine(profile.interestVector, postVector(post.title, post.body, post.topics)))
      const friend = social.friendIds.has(post.authorId) ? 0.5 : social.followingIds.has(post.authorId) ? 0.28 : 0
      const recency = Math.exp(-ageHours / 30)
      const hype = Math.min(1, post.hypeScore / 70)
      const discovery = (hashSeed(post.id + profile.id) % 1000) / 1000
      return {
        post,
        affinity,
        score: recency * 0.8 + affinity * 1.6 + friend + hype * 0.35 + discovery * 0.55,
      }
    })
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, 8)
  const extraPool = scored.slice(8)
  if (extraPool.length && Math.random() < 0.35) {
    top.push(extraPool[Math.floor(Math.random() * extraPool.length)]!)
  }

  const authorIds = [...new Set(top.map(entry => entry.post.authorId))]
  const authors = authorIds.length
    ? await Profiles.findAll(ctx, { where: { id: authorIds }, limit: authorIds.length })
    : []
  const authorMap = new Map(authors.map(author => [author.id, author]))
  const likes = await Edges.findAll(ctx, {
    where: { fromId: profile.id, kind: 'like' },
    limit: 500,
  })
  const likeCounts = new Map<string, number>()
  for (const edge of likes) {
    likeCounts.set(edge.toId, (likeCounts.get(edge.toId) ?? 0) + 1)
  }

  return {
    items: top.map(entry => ({
      id: entry.post.id,
      authorId: entry.post.authorId,
      kind: entry.post.kind,
      title: entry.post.title,
      body: entry.post.body,
      topics: entry.post.topics,
      durationSec: entry.post.durationSec,
      hypeScore: entry.post.hypeScore,
    })),
    authorInterests: new Map(authors.map(author => [author.id, author.interests])),
    authorNames: new Map(authors.map(author => [author.id, author.name])),
    likeCounts,
  }
}
