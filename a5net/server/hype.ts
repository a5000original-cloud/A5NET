import Posts from '../tables/posts.table'

const HALF_LIFE_HOURS = 42

export function computeHype(post: typeof Posts.T, nowMs: number): number {
  const created = post.publishedAt instanceof Date ? post.publishedAt.getTime() : new Date(post.publishedAt).getTime()
  const ageHours = Math.max(0, (nowMs - created) / 3600000)
  const decay = Math.max(0.12, Math.pow(0.5, ageHours / HALF_LIFE_HOURS))
  const duration = Math.max(5, post.durationSec || 0)
  const completion = post.views > 0 ? Math.min(1.4, post.watchSeconds / (post.views * duration)) : 0
  const raw =
    post.likes * 3.2 +
    post.commentsCount * 5.4 +
    post.views * 0.7 +
    completion * 26 -
    post.dislikes * 2.1
  return Math.max(0, Math.round(raw * decay * 10) / 10)
}

export async function refreshHype(ctx: app.Ctx, postId: string): Promise<void> {
  const post = await Posts.findById(ctx, postId)
  if (!post) return
  const hype = computeHype(post, Date.now())
  if (Math.abs(post.hypeScore - hype) < 0.05) return
  await Posts.update(ctx, { id: postId, hypeScore: hype })
}
